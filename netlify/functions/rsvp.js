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

exports.handler = async (event) => {
  if (!["GET", "POST"].includes(event.httpMethod)) {
    return jsonResponse(405, { ok: false, message: "Method not allowed." });
  }
  if (!isSameOrigin(event)) {
    return jsonResponse(403, { ok: false, message: "Request origin not allowed." });
  }

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
      request = {
        action: "submit",
        name: body.name,
        email: body.email,
        attendance: body.attendance,
        guestCount: body.guestCount,
        wishes: body.wishes,
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
    if (!Number.isSafeInteger(result.totalConfirmed) || result.totalConfirmed < 0) {
      return jsonResponse(502, { ok: false, message: "The RSVP service returned an invalid total." });
    }
    return jsonResponse(200, {
      ok: true,
      totalConfirmed: result.totalConfirmed,
      ...(result.duplicate === true ? { duplicate: true } : {}),
    });
  } catch {
    return jsonResponse(502, {
      ok: false,
      message: "The RSVP service is temporarily unavailable.",
    });
  }
};
