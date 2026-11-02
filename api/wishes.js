import { supabaseConfig, supabaseRequest, signPhotoUrls } from "./_shared/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, wishes: [] });
  }

  res.setHeader("Cache-Control", "no-store");

  const cfg = supabaseConfig();
  if (cfg) {
    // Every submitted wish is public by default (first name, wish text, attendance and a short-lived photo link).
    // Set WISHES_REQUIRE_APPROVAL=true to show only wishes with wish_approved = true (moderation mode).
    const requireApproval = String(process.env.WISHES_REQUIRE_APPROVAL || "").trim().toLowerCase() === "true";
    const approvalFilter = requireApproval ? "wish_approved=eq.true&" : "";
    try {
      const rows = await supabaseRequest(cfg, `/rest/v1/rsvp_responses?${approvalFilter}or=(wishes=not.is.null,rsvp_photos.storage_path=not.is.null)&select=id,submitted_name,wishes,created_at,updated_at,rsvp_photos(storage_path),rsvp_event_responses(attending,event_code)&order=updated_at.desc&limit=200`);
      const all = Array.isArray(rows) ? rows : [];
      // A guest who re-sends the same wish from the general link creates a new row each time; keep only the newest copy.
      const seen = new Set();
      const list = all.filter((row) => {
        const key = `${String(row.submitted_name || "").trim().toLowerCase()}|${String(row.wishes || "").trim().toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).slice(0, 100);
      const photoOf = (row) => { const p = Array.isArray(row.rsvp_photos) ? row.rsvp_photos[0] : row.rsvp_photos; return p?.storage_path || ""; };
      const signed = await signPhotoUrls(cfg, list.map(photoOf), 6 * 3600).catch(() => ({}));
      const wishes = list.map((row) => {
        const events = Array.isArray(row.rsvp_event_responses) ? row.rsvp_event_responses : [];
        return {
          id: String(row.id || ""),
          displayName: String(row.submitted_name || "").trim().split(/\s+/)[0].slice(0, 60),
          wish: String(row.wishes || "").trim().slice(0, 1000),
          photoUrl: signed[photoOf(row)] || "",
          submittedAt: row.created_at || row.updated_at || "",
          weddingAttending: events.some((e) => e.event_code === 'wedding' && e.attending),
          receptionAttending: events.some((e) => e.event_code === 'reception' && e.attending)
        };
      }).filter((item) => item.id && item.displayName && (item.wish || item.photoUrl));
      return res.status(200).json({ ok: true, wishes });
    } catch { return res.status(502).json({ ok: false, wishes: [] }); }
  }

  return res.status(503).json({ ok: false, wishes: [] });
}
