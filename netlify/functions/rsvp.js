const {
  jsonResponse: sharedJson, supabaseConfig, rpc, findInvitation, cleanText, cleanName,
  UUID_PATTERN, MAX_GUESTS_PER_EVENT, TOKEN_PATTERN,
} = require("./_shared/supabase");

const MAX_BODY_LENGTH = 12000;

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
    body: JSON.stringify(body),
  };
}

function isSameOrigin(event) {
  const origin = event.headers?.origin;
  const host = event.headers?.host;
  if (!origin || !host) return true;
  try {
    return new URL(origin).host.toLowerCase() === host.toLowerCase();
  } catch {
    return false;
  }
}

function statusForBackendError(error) {
  if (error === "invalid_request") return 400;
  if (error === "unauthorized") return 401;
  if (error === "not_configured") return 503;
  return 502;
}

// ---- Supabase path (active once SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in Netlify) ----
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

async function handleSupabase(event, cfg) {
  try {
    if (event.httpMethod === "GET") return sharedJson(200, { ok: true, ...(await totals(cfg)) });
    if (typeof event.body !== "string" || event.body.length > MAX_BODY_LENGTH) {
      return sharedJson(400, { ok: false, message: "Invalid RSVP submission." });
    }
    let body;
    try { body = JSON.parse(event.body); } catch { return sharedJson(400, { ok: false, message: "Invalid RSVP submission." }); }
    if (!body || typeof body !== "object") return sharedJson(400, { ok: false, message: "Invalid RSVP submission." });
    if (typeof body.website === "string" && body.website.trim()) return sharedJson(400, { ok: false, message: "Invalid RSVP submission." });
    const { errors, value } = validateRsvp(body);
    if (Object.keys(errors).length) {
      return sharedJson(400, { ok: false, message: Object.values(errors)[0], fields: errors });
    }
    let invitationId = null;
    if (value.token) {
      const invitation = await findInvitation(cfg, value.token);
      if (!invitation) {
        return sharedJson(400, { ok: false, message: "This invitation link isn't valid any more. Please contact Lalith & Anjana for a new one.", fields: { invite: "invalid" } });
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
    return sharedJson(200, {
      ok: true,
      ...(await totals(cfg)),
      ...(result?.duplicate ? { duplicate: true } : {}),
      ...(result?.updated ? { updated: true } : {}),
    });
  } catch {
    // Never forward database details to guests.
    return sharedJson(502, { ok: false, message: "We couldn't save your response just now. Please try again in a moment." });
  }
}

exports.handler = async (event) => {
  if (!["GET", "POST"].includes(event.httpMethod)) {
    return jsonResponse(405, { ok: false, message: "Method not allowed." });
  }
  if (!isSameOrigin(event)) {
    return jsonResponse(403, { ok: false, message: "Request origin not allowed." });
  }

  const cfg = supabaseConfig();
  if (cfg) return handleSupabase(event, cfg);

  const scriptUrl = process.env.APPS_SCRIPT_URL;
  const secret = process.env.RSVP_SHARED_SECRET;
  if (!scriptUrl || !secret || secret.length < 32) {
    return jsonResponse(503, {
      ok: false,
      message: "The RSVP service is not configured yet.",
    });
  }

  let endpoint;
  try {
    endpoint = new URL(scriptUrl);
  } catch {
    return jsonResponse(503, { ok: false, message: "The RSVP service is misconfigured." });
  }
  if (endpoint.protocol !== "https:" || endpoint.hostname !== "script.google.com") {
    return jsonResponse(503, { ok: false, message: "The RSVP service is misconfigured." });
  }

  let request;
  if (event.httpMethod === "GET") {
    request = { action: "total" };
  } else {
    if (typeof event.body !== "string" || event.body.length > MAX_BODY_LENGTH) {
      return jsonResponse(400, { ok: false, message: "Invalid RSVP submission." });
    }
    try {
      const body = JSON.parse(event.body);
      if (body && typeof body.website === "string" && body.website.trim()) {
        return jsonResponse(400, { ok: false, message: "Invalid RSVP submission." });
      }
      request = {
        action: "submit",
        name: body.name,
        weddingAttendance: body.weddingAttendance,
        weddingGuestCount: body.weddingGuestCount,
        receptionAttendance: body.receptionAttendance,
        receptionGuestCount: body.receptionGuestCount,
        wishes: body.wishes,
        photoUrl: body.photoUrl,
        photoMetadata: body.photoMetadata,
        submissionId: body.submissionId,
      };
    } catch {
      return jsonResponse(400, { ok: false, message: "Invalid RSVP submission." });
    }
  }

  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...request, secret }),
      redirect: "follow",
    });
    const result = await upstream.json();
    if (!upstream.ok || result?.ok !== true) {
      return jsonResponse(
        statusForBackendError(result?.error),
        { ok: false, message: result?.message || "The RSVP service could not complete your request." },
      );
    }
    if (
      !Number.isSafeInteger(result.weddingTotalConfirmed) ||
      result.weddingTotalConfirmed < 0 ||
      !Number.isSafeInteger(result.receptionTotalConfirmed) ||
      result.receptionTotalConfirmed < 0
    ) {
      return jsonResponse(502, { ok: false, message: "The RSVP service returned invalid totals." });
    }
    const totalConfirmed = result.weddingTotalConfirmed + result.receptionTotalConfirmed;
    if (!Number.isSafeInteger(totalConfirmed)) {
      return jsonResponse(502, { ok: false, message: "The RSVP service returned invalid totals." });
    }
    return jsonResponse(200, {
      ok: true,
      weddingTotalConfirmed: result.weddingTotalConfirmed,
      receptionTotalConfirmed: result.receptionTotalConfirmed,
      totalConfirmed,
      ...(result.duplicate === true ? { duplicate: true } : {}),
    });
  } catch {
    return jsonResponse(502, {
      ok: false,
      message: "The RSVP service is temporarily unavailable.",
    });
  }
};
