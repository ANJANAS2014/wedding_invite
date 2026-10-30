// GET /.netlify/functions/invite?token=...  ->  { ok, name, language }
// Returns only the invited guest's display name and language; nothing else about the guest or other guests.
const { jsonResponse, isSameOrigin, supabaseConfig, supabaseRequest, findInvitation, TOKEN_PATTERN } = require("./_shared/supabase");

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return jsonResponse(405, { ok: false });
  if (!isSameOrigin(event)) return jsonResponse(403, { ok: false });
  const cfg = supabaseConfig();
  if (!cfg) return jsonResponse(503, { ok: false, reason: "not_configured" });
  const token = event.queryStringParameters?.token || "";
  if (!TOKEN_PATTERN.test(token)) return jsonResponse(404, { ok: false, reason: "invalid" });
  try {
    const invitation = await findInvitation(cfg, token);
    if (!invitation?.guest) return jsonResponse(404, { ok: false, reason: "invalid" });
    const now = new Date().toISOString();
    // Best effort: record that the link was opened (never blocks the guest).
    supabaseRequest(cfg, `/rest/v1/invitations?id=eq.${invitation.id}`, { method: "PATCH", body: { last_opened_at: now }, prefer: "return=minimal" }).catch(() => {});
    return jsonResponse(200, { ok: true, name: invitation.guest.display_name, language: invitation.guest.language || "en" });
  } catch {
    return jsonResponse(502, { ok: false, reason: "unavailable" });
  }
};
