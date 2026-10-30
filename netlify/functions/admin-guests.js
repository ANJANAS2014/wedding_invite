// POST /.netlify/functions/admin-guests   (header: x-admin-key: <ADMIN_PASSWORD>)
// Guest Tracker API. Every action requires the admin password and runs server-side with the Supabase service key.
const crypto = require("node:crypto");
const {
  jsonResponse, isSameOrigin, supabaseConfig, supabaseRequest, SupabaseError,
  newInvitationToken, cleanName, cleanText, signPhotoUrls, LANGUAGES, UUID_PATTERN,
} = require("./_shared/supabase");

const MAX_BODY = 4000;
const one = (value) => (Array.isArray(value) ? value[0] || null : value || null);
const nameKey = (name) => name.normalize("NFKC").toLocaleLowerCase("en-IN").replace(/\s+/g, " ").trim();

function authorised(event) {
  const expected = process.env.ADMIN_PASSWORD || "";
  const given = event.headers?.["x-admin-key"] || event.headers?.["X-Admin-Key"] || "";
  if (expected.length < 12 || !given) return false;
  const a = crypto.createHash("sha256").update(String(given)).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

function shapeResponse(response, photoUrls) {
  if (!response) return null;
  const events = {};
  (response.rsvp_event_responses || []).forEach((item) => { events[item.event_code] = { attending: item.attending, guestCount: item.guest_count }; });
  const photo = one(response.rsvp_photos);
  return {
    id: response.id,
    name: response.submitted_name,
    wishes: response.wishes || "",
    wishApproved: !!response.wish_approved,
    wedding: events.wedding || null,
    reception: events.reception || null,
    photoUrl: photo ? photoUrls[photo.storage_path] || "" : "",
    submittedAt: response.created_at,
    updatedAt: response.updated_at,
    revision: response.revision || 1,
  };
}

const RESPONSE_SELECT = "id,submitted_name,wishes,wish_approved,created_at,updated_at,revision,rsvp_event_responses(event_code,attending,guest_count),rsvp_photos(storage_path)";

async function listGuests(cfg) {
  const guests = await supabaseRequest(cfg, `/rest/v1/guests?select=id,display_name,language,phone,created_at,invitations(id,token,status,sent_at,last_opened_at,created_at,rsvp_responses(${RESPONSE_SELECT}))&order=created_at.desc&limit=1000`);
  const unlinked = await supabaseRequest(cfg, `/rest/v1/rsvp_responses?invitation_id=is.null&select=${RESPONSE_SELECT}&order=created_at.desc&limit=500`);
  const photoPaths = [];
  const collect = (r) => { const p = one(r?.rsvp_photos); if (p) photoPaths.push(p.storage_path); };
  (guests || []).forEach((g) => collect(one(one(g.invitations)?.rsvp_responses)));
  (unlinked || []).forEach(collect);
  const photoUrls = await signPhotoUrls(cfg, photoPaths.slice(0, 300)).catch(() => ({}));
  return {
    guests: (guests || []).map((g) => {
      const invitation = one(g.invitations);
      const response = shapeResponse(one(invitation?.rsvp_responses), photoUrls);
      return {
        id: g.id,
        name: g.display_name,
        language: g.language,
        phone: g.phone || "",
        createdAt: g.created_at,
        invitation: invitation ? { id: invitation.id, token: invitation.token, sentAt: invitation.sent_at, lastOpenedAt: invitation.last_opened_at } : null,
        status: response ? "rsvp_received" : invitation?.status === "sent" ? "sent" : "created",
        response,
      };
    }),
    unlinked: (unlinked || []).map((r) => shapeResponse(r, photoUrls)),
  };
}

async function createGuest(cfg, body) {
  const name = cleanName(body.name).slice(0, 80);
  if (!name) return jsonResponse(400, { ok: false, message: "Please enter the guest's name." });
  const language = LANGUAGES.includes(body.language) ? body.language : "en";
  const phone = cleanText(body.phone, 20).replace(/[^\d+]/g, "");
  if (phone && !/^\+?\d{6,15}$/.test(phone)) return jsonResponse(400, { ok: false, message: "Please enter the WhatsApp number with country code, digits only (e.g. 919876543210)." });
  let guest;
  try {
    [guest] = await supabaseRequest(cfg, "/rest/v1/guests", {
      method: "POST", prefer: "return=representation",
      body: { display_name: name, name_key: nameKey(name), language, phone: phone || null },
    });
  } catch (error) {
    if (error instanceof SupabaseError && error.status === 409) return jsonResponse(409, { ok: false, message: `${name} is already on your guest list.` });
    throw error;
  }
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await supabaseRequest(cfg, "/rest/v1/invitations", { method: "POST", prefer: "return=minimal", body: { guest_id: guest.id, token: newInvitationToken() } });
      return jsonResponse(201, { ok: true, guestId: guest.id });
    } catch (error) {
      if (!(error instanceof SupabaseError && error.status === 409)) throw error; // retry only on a (very unlikely) token collision
    }
  }
  throw new Error("token_generation_failed");
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return jsonResponse(405, { ok: false, message: "Method not allowed." });
  if (!isSameOrigin(event)) return jsonResponse(403, { ok: false, message: "Request origin not allowed." });
  if (!authorised(event)) return jsonResponse(401, { ok: false, message: "Incorrect admin password." });
  const cfg = supabaseConfig();
  if (!cfg) return jsonResponse(503, { ok: false, message: "The guest database isn't connected yet. Add the Supabase settings in Netlify (see SUPABASE_SETUP.md)." });
  if (typeof event.body !== "string" || event.body.length > MAX_BODY) return jsonResponse(400, { ok: false, message: "Invalid request." });
  let body;
  try { body = JSON.parse(event.body); } catch { return jsonResponse(400, { ok: false, message: "Invalid request." }); }
  const id = String(body?.id || "");
  try {
    switch (body?.action) {
      case "list":
        return jsonResponse(200, { ok: true, ...(await listGuests(cfg)) });
      case "create":
        return await createGuest(cfg, body);
      case "markSent":
        if (!UUID_PATTERN.test(id)) break;
        await supabaseRequest(cfg, `/rest/v1/invitations?id=eq.${id}&status=eq.created`, { method: "PATCH", prefer: "return=minimal", body: { status: "sent", sent_at: new Date().toISOString() } });
        return jsonResponse(200, { ok: true });
      case "setLanguage":
        if (!UUID_PATTERN.test(id) || !LANGUAGES.includes(body.language)) break;
        await supabaseRequest(cfg, `/rest/v1/guests?id=eq.${id}`, { method: "PATCH", prefer: "return=minimal", body: { language: body.language } });
        return jsonResponse(200, { ok: true });
      case "approveWish":
        if (!UUID_PATTERN.test(id)) break;
        await supabaseRequest(cfg, `/rest/v1/rsvp_responses?id=eq.${id}`, { method: "PATCH", prefer: "return=minimal", body: { wish_approved: body.approved === true } });
        return jsonResponse(200, { ok: true });
      case "deleteGuest":
        if (!UUID_PATTERN.test(id)) break;
        await supabaseRequest(cfg, `/rest/v1/guests?id=eq.${id}`, { method: "DELETE", prefer: "return=minimal" });
        return jsonResponse(200, { ok: true });
      default:
        break;
    }
    return jsonResponse(400, { ok: false, message: "Invalid request." });
  } catch {
    return jsonResponse(502, { ok: false, message: "The guest database didn't respond. Please try again." });
  }
};
