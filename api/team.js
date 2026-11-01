// GET  /api/team  -> { ok, bride, groom }  (tally of Team Bride / Team Groom picks)
// POST /api/team  { side: "bride"|"groom", visitorId: uuid, invite?: token, name?: string }
// Saves the guest's pick (one per device, and one per personal invitation).
import {
  sendJson, isSameOrigin, supabaseConfig, rpc, findInvitation, cleanName,
  UUID_PATTERN, TOKEN_PATTERN,
} from "./_shared/supabase.js";

const MAX_BODY_LENGTH = 2000;
const SIDES = ["bride", "groom"];
const BAD = { ok: false, message: "Invalid team pick." };

const shape = (data) => ({ bride: Number(data?.bride) || 0, groom: Number(data?.groom) || 0 });

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) return sendJson(res, 405, { ok: false, message: "Method not allowed." });
  if (!isSameOrigin(req)) return sendJson(res, 403, { ok: false, message: "Request origin not allowed." });

  const cfg = supabaseConfig();
  if (!cfg) return sendJson(res, 503, { ok: false, message: "Team picks are not configured yet." });

  try {
    if (req.method === "GET") return sendJson(res, 200, { ok: true, ...shape(await rpc(cfg, "team_totals", {})) });

    const raw = req.body;
    const str = typeof raw === "string" ? raw : JSON.stringify(raw ?? "");
    if (str.length > MAX_BODY_LENGTH) return sendJson(res, 400, BAD);
    let body;
    try { body = typeof raw === "object" && raw !== null ? raw : JSON.parse(raw); } catch { return sendJson(res, 400, BAD); }
    if (!body || typeof body !== "object") return sendJson(res, 400, BAD);

    const side = body.side;
    const visitorId = typeof body.visitorId === "string" ? body.visitorId.toLowerCase() : "";
    if (!SIDES.includes(side) || !UUID_PATTERN.test(visitorId)) return sendJson(res, 400, BAD);

    // A stale or unknown invite link still counts the pick, just without linking it.
    let invitation = null;
    const token = typeof body.invite === "string" ? body.invite : "";
    if (token && TOKEN_PATTERN.test(token)) invitation = await findInvitation(cfg, token).catch(() => null);

    const name = cleanName(body.name) || invitation?.guest?.display_name || null;
    const totals = await rpc(cfg, "submit_team_pick", {
      p_visitor_id: visitorId,
      p_invitation_id: invitation?.id || null,
      p_name: name,
      p_side: side,
    });
    return sendJson(res, 200, { ok: true, side, ...shape(totals) });
  } catch {
    return sendJson(res, 502, { ok: false, message: "We couldn't save your pick just now." });
  }
}
