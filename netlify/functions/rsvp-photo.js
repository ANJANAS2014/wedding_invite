// POST /.netlify/functions/rsvp-photo  { submissionId, contentType, size }
// Validates the photo on the server and returns a one-time signed upload URL for the private Supabase bucket.
// The browser never receives a storage key; the bucket also enforces type and 5 MB size limits.
const crypto = require("node:crypto");
const { jsonResponse, isSameOrigin, supabaseConfig, supabaseRequest, PHOTO_TYPES, PHOTO_MAX_BYTES, UUID_PATTERN } = require("./_shared/supabase");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return jsonResponse(405, { ok: false, message: "Method not allowed." });
  if (!isSameOrigin(event)) return jsonResponse(403, { ok: false, message: "Request origin not allowed." });
  const cfg = supabaseConfig();
  if (!cfg) return jsonResponse(503, { ok: false, message: "Photo sharing isn't available yet. Your RSVP can still be sent without a photo." });
  let body;
  try { body = JSON.parse(event.body || ""); } catch { return jsonResponse(400, { ok: false, message: "Invalid photo request." }); }
  const submissionId = String(body?.submissionId || "").toLowerCase();
  const extension = PHOTO_TYPES[body?.contentType];
  const size = Number(body?.size);
  if (!UUID_PATTERN.test(submissionId)) return jsonResponse(400, { ok: false, message: "Invalid photo request." });
  if (!extension) return jsonResponse(400, { ok: false, message: "Please choose a JPG, PNG or WebP photo." });
  if (!Number.isInteger(size) || size <= 0 || size > PHOTO_MAX_BYTES) return jsonResponse(400, { ok: false, message: "Please choose a photo up to 5 MB." });
  const path = `rsvp/${submissionId}/${crypto.randomBytes(16).toString("hex")}.${extension}`;
  try {
    const signed = await supabaseRequest(cfg, `/storage/v1/object/upload/sign/${encodeURIComponent(cfg.bucket)}/${path}`, { method: "POST", body: {} });
    if (typeof signed?.url !== "string") throw new Error("no_url");
    return jsonResponse(200, { ok: true, path, uploadUrl: cfg.url + "/storage/v1" + signed.url });
  } catch {
    return jsonResponse(502, { ok: false, message: "The photo couldn't be prepared for upload. Your RSVP can still be sent without it." });
  }
};
