const MAX_BODY_LENGTH = 1000;
const PHOTO_HOST = "res.cloudinary.com";

function jsonResponse(statusCode, body) {
  return { statusCode, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=60", "X-Content-Type-Options": "nosniff" }, body: JSON.stringify(body) };
}

function safePhotoUrl(value) {
  try {
    const url = new URL(value);
    return value.length <= 2048 && url.protocol === "https:" && url.hostname === PHOTO_HOST && /^\/[^?#]+\.(jpg|jpeg|png|webp)$/i.test(url.pathname) ? url.toString() : "";
  } catch { return ""; }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return jsonResponse(405, { ok: false, wishes: [] });
  const scriptUrl = process.env.APPS_SCRIPT_URL;
  const secret = process.env.RSVP_SHARED_SECRET;
  let endpoint;
  try { endpoint = new URL(scriptUrl); } catch { return jsonResponse(503, { ok: false, wishes: [] }); }
  if (!secret || secret.length < 32 || endpoint.protocol !== "https:" || endpoint.hostname !== "script.google.com") {
    return jsonResponse(503, { ok: false, wishes: [] });
  }
  try {
    const upstream = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ action: "approved_wishes", secret }), redirect: "follow" });
    const result = await upstream.json();
    if (!upstream.ok || result?.ok !== true || !Array.isArray(result.wishes)) return jsonResponse(502, { ok: false, wishes: [] });
    const wishes = result.wishes.slice(0, 100).map((item) => ({
      displayName: typeof item.displayName === "string" ? item.displayName.trim().slice(0, 120) : "",
      wish: typeof item.wish === "string" ? item.wish.trim().slice(0, 1000) : "",
      photoUrl: safePhotoUrl(item.photoUrl || ""),
    })).filter((item) => item.displayName && item.wish);
    const body = JSON.stringify({ ok: true, wishes });
    if (body.length > MAX_BODY_LENGTH * 100) return jsonResponse(502, { ok: false, wishes: [] });
    return jsonResponse(200, { ok: true, wishes });
  } catch { return jsonResponse(502, { ok: false, wishes: [] }); }
};
