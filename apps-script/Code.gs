const RSVP_LEGACY_HEADERS = [
  "Timestamp",
  "Submission ID",
  "Guest name",
  "Email",
  "Attendance",
  "Guest count",
  "Wishes",
];
const RSVP_EVENT_HEADERS = [
  "Wedding attendance",
  "Wedding guest count",
  "Reception attendance",
  "Reception guest count",
];
const RSVP_WISH_HEADERS = ["Public photo URL", "Photo metadata", "Wish approval"];
const RSVP_HEADERS = [...RSVP_LEGACY_HEADERS, ...RSVP_EVENT_HEADERS, ...RSVP_WISH_HEADERS];
const RSVP_MAX_GUESTS = 10;
const RSVP_MAX_NAME_LENGTH = 120;
const RSVP_MAX_EMAIL_LENGTH = 254;
const RSVP_MAX_WISHES_LENGTH = 1000;
const RSVP_MAX_PHOTO_METADATA_LENGTH = 300;
const RSVP_PHOTO_HOST = "res.cloudinary.com";

function doPost(event) {
  try {
    const request = JSON.parse(event.postData.contents);
    if (!request || typeof request !== "object" || Array.isArray(request)) {
      throw invalid_("Invalid RSVP request.");
    }
    const properties = PropertiesService.getScriptProperties();
    const expectedSecret = properties.getProperty("RSVP_SHARED_SECRET");
    if (!expectedSecret || expectedSecret.length < 32) {
      return output_({
        ok: false,
        error: "not_configured",
        message: "The RSVP service is not configured yet.",
      });
    }
    if (!sameSecret_(request.secret, expectedSecret)) {
      return output_({ ok: false, error: "unauthorized", message: "The RSVP request could not be authorized." });
    }

    if (request.action === "total") {
      return output_({ ok: true, ...confirmedTotals_(getSheet_()) });
    }
    if (request.action === "approved_wishes") {
      return output_({ ok: true, wishes: approvedWishes_(getSheet_()) });
    }
    if (request.action !== "submit") {
      return output_({ ok: false, error: "invalid_request", message: "Invalid RSVP request." });
    }

    const submission = validateSubmission_(request);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getSheet_();
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        const ids = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
        if (ids.some((row) => row[0] === submission.submissionId)) {
          return output_({
            ok: true,
            duplicate: true,
            ...confirmedTotals_(sheet),
          });
        }
      }

      sheet.appendRow([
        new Date(),
        submission.submissionId,
        safeCell_(submission.name),
        safeCell_(submission.email),
        "",
        "",
        safeCell_(submission.wishes),
        submission.weddingAttendance,
        submission.weddingGuestCount,
        submission.receptionAttendance,
        submission.receptionGuestCount,
        submission.photoUrl,
        safeCell_(submission.photoMetadata),
        "",
      ]);
      return output_({
        ok: true,
        duplicate: false,
        ...confirmedTotals_(sheet),
      });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    if (error && error.name === "InvalidRsvpError") {
      return output_({ ok: false, error: "invalid_request", message: error.message });
    }
    if (error && error.name === "ConfigurationError") {
      return output_({
        ok: false,
        error: "not_configured",
        message: "The RSVP service is not configured yet.",
      });
    }
    if (error instanceof SyntaxError) {
      return output_({ ok: false, error: "invalid_request", message: "Invalid RSVP request." });
    }
    return output_({
      ok: false,
      error: "service_unavailable",
      message: "The RSVP service is temporarily unavailable.",
    });
  }
}

function validateSubmission_(request) {
  const name = typeof request.name === "string" ? request.name.trim() : "";
  const rawEmail = request.email === undefined || request.email === null ? "" : request.email;
  const rawWishes = request.wishes === undefined || request.wishes === null ? "" : request.wishes;
  const rawPhotoUrl = request.photoUrl === undefined || request.photoUrl === null ? "" : request.photoUrl;
  const rawPhotoMetadata = request.photoMetadata === undefined || request.photoMetadata === null ? "" : request.photoMetadata;
  if (typeof rawEmail !== "string" || typeof rawWishes !== "string" || typeof rawPhotoUrl !== "string" || typeof rawPhotoMetadata !== "string") {
    throw invalid_("Please enter valid RSVP details.");
  }
  const email = rawEmail.trim();
  const wishes = rawWishes.trim();
  const photoUrl = validatePhotoUrl_(rawPhotoUrl.trim());
  const photoMetadata = rawPhotoMetadata.trim();
  const submissionId = request.submissionId;

  if (!name || name.length > RSVP_MAX_NAME_LENGTH || /[\u0000-\u001f\u007f]/.test(name)) {
    throw invalid_("Please enter a valid name (up to 120 characters).");
  }
  if (
    email.length > RSVP_MAX_EMAIL_LENGTH ||
    (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  ) {
    throw invalid_("Please enter a valid email address.");
  }
  if (wishes.length > RSVP_MAX_WISHES_LENGTH) {
    throw invalid_("Wishes must be 1,000 characters or fewer.");
  }
  if (photoMetadata.length > RSVP_MAX_PHOTO_METADATA_LENGTH || /[\u0000-\u001f\u007f]/.test(photoMetadata)) {
    throw invalid_("Photo details are invalid.");
  }
  if (
    typeof submissionId !== "string" ||
    !/^[a-f0-9-]{36}$/i.test(submissionId)
  ) {
    throw invalid_("Please retry your submission.");
  }

  const weddingGuestCount = validateEvent_(
    request.weddingAttendance,
    request.weddingGuestCount,
    "wedding",
  );
  const receptionGuestCount = validateEvent_(
    request.receptionAttendance,
    request.receptionGuestCount,
    "reception",
  );
  return {
    name,
    email,
    wishes,
    photoUrl,
    photoMetadata,
    weddingAttendance: request.weddingAttendance,
    weddingGuestCount,
    receptionAttendance: request.receptionAttendance,
    receptionGuestCount,
    submissionId,
  };
}

function validatePhotoUrl_(value) {
  if (!value) return "";
  let url;
  try { url = new URL(value); } catch (_) { throw invalid_("The photo URL is invalid."); }
  if (value.length > 2048 || url.protocol !== "https:" || url.hostname !== RSVP_PHOTO_HOST || !/^\/[^?#]+\.(jpg|jpeg|png|webp)$/i.test(url.pathname)) {
    throw invalid_("The photo URL is not an approved image URL.");
  }
  return url.toString();
}

function approvedWishes_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const rows = sheet.getRange(2, 3, lastRow - 1, 12).getValues();
  return rows.filter((row) => row[11] === "APPROVED" && String(row[4] || "").trim())
    .map((row) => ({
      displayName: String(row[0] || "").trim().slice(0, RSVP_MAX_NAME_LENGTH),
      wish: String(row[4] || "").trim().slice(0, RSVP_MAX_WISHES_LENGTH),
      photoUrl: safePublicPhotoUrl_(row[9]),
    }))
    .filter((item) => item.displayName && item.wish)
    .slice(-100);
}

function safePublicPhotoUrl_(value) {
  try { return validatePhotoUrl_(String(value || "")); } catch (_) { return ""; }
}

function validateEvent_(attendance, rawGuestCount, eventName) {
  if (!["attending", "declined"].includes(attendance)) {
    throw invalid_("Choose an attendance response for " + eventName + ".");
  }
  const guestCount = Number(rawGuestCount);
  if (attendance === "declined") {
    if (guestCount !== 0) throw invalid_("Guest count must be zero when not attending.");
    return 0;
  }
  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > RSVP_MAX_GUESTS) {
    throw invalid_("Choose between 1 and 10 attending guests for " + eventName + ".");
  }
  return guestCount;
}

function confirmedTotals_(sheet) {
  const lastRow = sheet.getLastRow();
  const totals = { weddingTotalConfirmed: 0, receptionTotalConfirmed: 0 };
  if (lastRow < 2) return totals;
  sheet.getRange(2, 8, lastRow - 1, 4).getValues().forEach((row) => {
    const weddingCount = Number(row[1]);
    if (
      row[0] === "attending" &&
      Number.isInteger(weddingCount) &&
      weddingCount > 0 &&
      weddingCount <= RSVP_MAX_GUESTS
    ) {
      totals.weddingTotalConfirmed += weddingCount;
    }
    const receptionCount = Number(row[3]);
    if (
      row[2] === "attending" &&
      Number.isInteger(receptionCount) &&
      receptionCount > 0 &&
      receptionCount <= RSVP_MAX_GUESTS
    ) {
      totals.receptionTotalConfirmed += receptionCount;
    }
  });
  return totals;
}

function getSheet_() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty("RSVP_SPREADSHEET_ID");
  const sheetName = properties.getProperty("RSVP_SHEET_NAME") || "Responses";
  if (!spreadsheetId) {
    const error = new Error("RSVP spreadsheet is not configured.");
    error.name = "ConfigurationError";
    throw error;
  }
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) sheet = spreadsheet.insertSheet(sheetName);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, RSVP_HEADERS.length).setValues([RSVP_HEADERS]);
    sheet.setFrozenRows(1);
    return sheet;
  }
  const currentHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), RSVP_LEGACY_HEADERS.length))
    .getValues()[0];
  if (RSVP_LEGACY_HEADERS.some((header, index) => currentHeaders[index] !== header)) {
    const error = new Error("The RSVP sheet headers do not match the existing schema.");
    error.name = "ConfigurationError";
    throw error;
  }
  [...RSVP_EVENT_HEADERS, ...RSVP_WISH_HEADERS].forEach((header, index) => {
    const currentHeader = currentHeaders[RSVP_LEGACY_HEADERS.length + index];
    if (currentHeader && currentHeader !== header) {
      const error = new Error("The RSVP sheet event columns do not match the expected schema.");
      error.name = "ConfigurationError";
      throw error;
    }
  });
  sheet.getRange(1, RSVP_LEGACY_HEADERS.length + 1, 1, RSVP_EVENT_HEADERS.length + RSVP_WISH_HEADERS.length)
    .setValues([[...RSVP_EVENT_HEADERS, ...RSVP_WISH_HEADERS]]);
  return sheet;
}

function sameSecret_(candidate, expected) {
  if (typeof candidate !== "string" || candidate.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= candidate.charCodeAt(index) ^ expected.charCodeAt(index);
  }
  return difference === 0;
}

function safeCell_(value) {
  return /^[=+\-@\t\r]/.test(value) ? "'" + value : value;
}

function invalid_(message) {
  const error = new Error(message);
  error.name = "InvalidRsvpError";
  return error;
}

function output_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
