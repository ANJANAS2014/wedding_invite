import { supabaseConfig, supabaseRequest, signPhotoUrls } from "./_shared/supabase.js";

const MAX_BODY_LENGTH = 1000;
const PHOTO_HOST = "res.cloudinary.com";

function safePhotoUrl(value) {
  try {
    const url = new URL(value);
    return value.length <= 2048 && url.protocol === "https:" && url.hostname === PHOTO_HOST && /^\/[^?#]+\.(jpg|jpeg|png|webp)$/i.test(url.pathname) ? url.toString() : "";
  } catch { return ""; }
}

export async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, wishes: [] });
  }

  const cfg = supabaseConfig();
  if (cfg) {
    // Only wishes approved in the Guest Tracker are public; only first name, wish text and a short-lived photo link are returned.
    try {
      const rows = await supabaseRequest(cfg, "/rest/v1/rsvp_responses?wish_approved=eq.true&wishes=not.is.null&select=submitted_name,wishes,rsvp_photos(storage_path)&order=updated_at.desc&limit=60");
      const list = Array.isArray(rows) ? rows : [];
      const photoOf = (row) => { const p = Array.isArray(row.rsvp_photos) ? row.rsvp_photos[0] : row.rsvp_photos; return p?.storage_path || ""; };
      const signed = await signPhotoUrls(cfg, list.map(photoOf), 6 * 3600).catch(() => ({}));
      const wishes = list.map((row) => ({
        displayName: String(row.submitted_name || "").trim().split(/\s+/)[0].slice(0, 60),
        wish: String(row.wishes || "").trim().slice(0, 1000),
        photoUrl: signed[photoOf(row)] || "",
      })).filter((item) => item.displayName && item.wish);
      return res.status(200).json({ ok: true, wishes });
    } catch { return res.status(502).json({ ok: false, wishes: [] }); }
  }

  const scriptUrl = process.env.APPS_SCRIPT_URL;
  const secret = process.env.RSVP_SHARED_SECRET;
  let endpoint;
  try { endpoint = new URL(scriptUrl); } catch { return res.status(503).json({ ok: false, wishes: [] }); }
  if (!secret || secret.length < 32 || endpoint.protocol !== "https:" || endpoint.hostname !== "script.google.com") {
    return res.status(503).json({ ok: false, wishes: [] });
  }
  try {
    const upstream = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ action: "approved_wishes", secret }), redirect: "follow" });
    const result = await upstream.json();
    if (!upstream.ok || result?.ok !== true || !Array.isArray(result.wishes)) return res.status(502).json({ ok: false, wishes: [] });
    const wishes = result.wishes.slice(0, 100).map((item) => ({
      displayName: typeof item.displayName === "string" ? item.displayName.trim().slice(0, 120) : "",
      wish: typeof item.wish === "string" ? item.wish.trim().slice(0, 1000) : "",
      photoUrl: safePhotoUrl(item.photoUrl || ""),
    })).filter((item) => item.displayName && item.wish);
    const body = JSON.stringify({ ok: true, wishes });
    if (body.length > MAX_BODY_LENGTH * 100) return res.status(502).json({ ok: false, wishes: [] });
    return res.status(200).json({ ok: true, wishes });
  } catch { return res.status(502).json({ ok: false, wishes: [] }); }
}
