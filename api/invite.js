// GET /api/invite?token=...  ->  { ok, name, language }
// Returns only the invited guest's display name and language; nothing else about the guest or other guests.
import { sendJson, isSameOrigin, supabaseConfig, supabaseRequest, findInvitation, TOKEN_PATTERN } from "./_shared/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return sendJson(res, 405, { ok: false });
  if (!isSameOrigin(req)) return sendJson(res, 403, { ok: false });
  const cfg = supabaseConfig();
  if (!cfg) return sendJson(res, 503, { ok: false, reason: "not_configured" });
  const token = req.query?.token || "";
  if (!TOKEN_PATTERN.test(token)) return sendJson(res, 404, { ok: false, reason: "invalid" });
  try {
    const invitation = await findInvitation(cfg, token);
    if (!invitation?.guest) return sendJson(res, 404, { ok: false, reason: "invalid" });
    const now = new Date().toISOString();
    // Best effort: record that the link was opened (never blocks the guest).
    supabaseRequest(cfg, `/rest/v1/invitations?id=eq.${invitation.id}`, { method: "PATCH", body: { last_opened_at: now }, prefer: "return=minimal" }).catch(() => {});
    return sendJson(res, 200, { ok: true, name: invitation.guest.display_name, language: invitation.guest.language || "en" });
  } catch {
    return sendJson(res, 502, { ok: false, reason: "unavailable" });
  }
}
