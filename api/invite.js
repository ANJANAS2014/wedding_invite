// GET /api/invite?token=...  ->  { ok, name, language }
// Returns only the invited guest's display name and language; nothing else about the guest or other guests.
const { jsonResponse: _unused, isSameOrigin, supabaseConfig, supabaseRequest, findInvitation, TOKEN_PATTERN } = require("./_shared/supabase");

function jsonResponse(res, statusCode, body) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.status(statusCode).json(body);
}

function isSameOriginReq(req) {
  const origin = req.headers?.origin;
  const host = req.headers?.host;
  if (!origin || !host) return true;
  try {
    return new URL(origin).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") return jsonResponse(res, 405, { ok: false });
  if (!isSameOriginReq(req)) return jsonResponse(res, 403, { ok: false });
  const cfg = supabaseConfig();
  if (!cfg) return jsonResponse(res, 503, { ok: false, reason: "not_configured" });
  const token = req.query?.token || "";
  if (!TOKEN_PATTERN.test(token)) return jsonResponse(res, 404, { ok: false, reason: "invalid" });
  try {
    const invitation = await findInvitation(cfg, token);
    if (!invitation?.guest) return jsonResponse(res, 404, { ok: false, reason: "invalid" });
    const now = new Date().toISOString();
    // Best effort: record that the link was opened (never blocks the guest).
    supabaseRequest(cfg, `/rest/v1/invitations?id=eq.${invitation.id}`, { method: "PATCH", body: { last_opened_at: now }, prefer: "return=minimal" }).catch(() => {});
    return jsonResponse(res, 200, { ok: true, name: invitation.guest.display_name, language: invitation.guest.language || "en" });
  } catch {
    return jsonResponse(res, 502, { ok: false, reason: "unavailable" });
  }
}
