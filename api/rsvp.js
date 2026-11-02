import {
  sendJson, isSameOrigin, supabaseConfig, rpc, findInvitation, cleanText, cleanName,
  UUID_PATTERN, MAX_GUESTS_PER_EVENT, TOKEN_PATTERN,
} from "./_shared/supabase.js";

const MAX_BODY_LENGTH = 12000;

function validateRsvp(body) {
  const errors = {};
  const name = cleanName(body.name);
  if (!name) errors.name = "Please enter your name.";
  const events = {};
  for (const eventName of ["wedding", "reception"]) {
    const attendance = body[`${eventName}Attendance`];
    const count = Number(body[`${eventName}GuestCount`]);
    if (attendance !== "attending" && attendance !== "declined") {
      errors[eventName] = `Please choose whether you can join the ${eventName}.`;
      continue;
    }
    const attending = attendance === "attending";
    if (attending && (!Number.isInteger(count) || count < 1 || count > MAX_GUESTS_PER_EVENT)) {
      errors[eventName] = `Please choose between 1 and ${MAX_GUESTS_PER_EVENT} guests for the ${eventName}.`;
      continue;
    }
    events[eventName] = { attending, count: attending ? count : 0 };
  }
  const wishes = cleanText(typeof body.wishes === "string" ? body.wishes.replace(/\r\n?/g, "\n") : "", 1000);
  const submissionId = typeof body.submissionId === "string" ? body.submissionId.toLowerCase() : "";
  if (!UUID_PATTERN.test(submissionId)) errors.form = "Please refresh the page and try again.";
  let photo = null;
  if (body.photoPath !== undefined && body.photoPath !== null && body.photoPath !== "") {
    const match = typeof body.photoPath === "string" && body.photoPath.match(/^rsvp\/([0-9a-f-]{36})\/[0-9a-f]{32}\.(jpg|png|webp)$/);
    const types = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
    if (!match || match[1] !== submissionId) errors.photo = "The photo could not be attached. Please choose it again.";
    else photo = { path: body.photoPath, type: types[match[2]], size: Math.max(0, Math.min(5 * 1024 * 1024, Number(body.photoSize) || 0)) };
  }
  const token = typeof body.invite === "string" && body.invite ? body.invite : "";
  if (token && !TOKEN_PATTERN.test(token)) errors.invite = "This invitation link isn't valid. Please open the link you received again.";
  return { errors, value: { name, events, wishes, submissionId, photo, token } };
}

async function totals(cfg) {
  const data = await rpc(cfg, "rsvp_totals", {});
  const wedding = Number(data?.wedding) || 0;
  const reception = Number(data?.reception) || 0;
  return { weddingTotalConfirmed: wedding, receptionTotalConfirmed: reception, totalConfirmed: wedding + reception };
}

async function handleSupabase(req, res, cfg) {
  try {
    if (req.method === "GET") return sendJson(res, 200, { ok: true, ...(await totals(cfg)) });
    const rawBody = req.body;
    const bodyStr = typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody);
    if (bodyStr.length > MAX_BODY_LENGTH) {
      return sendJson(res, 400, { ok: false, message: "Invalid RSVP submission." });
    }
    let body;
    try { body = typeof rawBody === "object" ? rawBody : JSON.parse(rawBody); } catch { return sendJson(res, 400, { ok: false, message: "Invalid RSVP submission." }); }
    if (!body || typeof body !== "object") return sendJson(res, 400, { ok: false, message: "Invalid RSVP submission." });
    if (typeof body.website === "string" && body.website.trim()) return sendJson(res, 400, { ok: false, message: "Invalid RSVP submission." });
    const { errors, value } = validateRsvp(body);
    if (Object.keys(errors).length) {
      return sendJson(res, 400, { ok: false, message: Object.values(errors)[0], fields: errors });
    }
    let invitationId = null;
    if (value.token) {
      const invitation = await findInvitation(cfg, value.token);
      if (!invitation) {
        return sendJson(res, 400, { ok: false, message: "This invitation link isn't valid any more. Please contact Lalith & Anjana for a new one.", fields: { invite: "invalid" } });
      }
      invitationId = invitation.id;
    }
    const result = await rpc(cfg, "submit_rsvp", {
      p_invitation_id: invitationId,
      p_submission_id: value.submissionId,
      p_name: value.name,
      p_wishes: value.wishes,
      p_wedding_attending: value.events.wedding.attending,
      p_wedding_count: value.events.wedding.count,
      p_reception_attending: value.events.reception.attending,
      p_reception_count: value.events.reception.count,
      p_photo_path: value.photo?.path || null,
      p_photo_type: value.photo?.type || null,
      p_photo_size: value.photo?.size || null,
    });
    res.status(200).json({
      ok: true,
      ...(result?.duplicate ? { duplicate: true } : {}),
      ...(result?.updated ? { updated: true } : {}),
    });
  } catch {
    // Never forward database details to guests.
    sendJson(res, 502, { ok: false, message: "We couldn't save your response just now. Please try again in a moment." });
  }
}

export default async function handler(req, res) {
  if (!["GET", "POST"].includes(req.method)) {
    return sendJson(res, 405, { ok: false, message: "Method not allowed." });
  }
  if (!isSameOrigin(req)) {
    return sendJson(res, 403, { ok: false, message: "Request origin not allowed." });
  }

  const cfg = supabaseConfig();
  if (!cfg) return sendJson(res, 503, { ok: false, message: "The RSVP service is not configured yet." });
  return handleSupabase(req, res, cfg);
}
