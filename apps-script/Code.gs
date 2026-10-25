const RSVP_HEADERS = [
  "Timestamp",
  "Submission ID",
  "Guest name",
  "Email",
  "Attendance",
  "Guest count",
  "Wishes",
];
const RSVP_MAX_GUESTS = 10;
const RSVP_MAX_NAME_LENGTH = 120;
const RSVP_MAX_EMAIL_LENGTH = 254;
const RSVP_MAX_WISHES_LENGTH = 1000;

function doPost(event) {
  try {
    const request = JSON.parse(event.postData.contents);
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
      return output_({ ok: true, totalConfirmed: totalConfirmed_(getSheet_()) });
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
            totalConfirmed: totalConfirmed_(sheet),
          });
        }
      }

      sheet.appendRow([
        new Date(),
        submission.submissionId,
        safeCell_(submission.name),
        safeCell_(submission.email),
        submission.attendance,
        submission.guestCount,
        safeCell_(submission.wishes),
      ]);
      return output_({
        ok: true,
        duplicate: false,
        totalConfirmed: totalConfirmed_(sheet),
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
  if (typeof rawEmail !== "string" || typeof rawWishes !== "string") {
    throw invalid_("Please enter a valid email address and wishes.");
  }
  const email = rawEmail.trim();
  const wishes = rawWishes.trim();
  const attendance = request.attendance;
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
  if (!["attending", "declined", "wishes_only"].includes(attendance)) {
    throw invalid_("Choose an attendance response.");
  }
  if (attendance === "wishes_only" && !wishes) {
    throw invalid_("Please include your wishes.");
  }
  if (
    typeof submissionId !== "string" ||
    !/^[a-f0-9-]{36}$/i.test(submissionId)
  ) {
    throw invalid_("Please retry your submission.");
  }

  let guestCount = 0;
  if (attendance === "attending") {
    guestCount = Number(request.guestCount);
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > RSVP_MAX_GUESTS) {
      throw invalid_("Choose between 1 and 10 attending guests.");
    }
  }
  return { name, email, attendance, guestCount, wishes, submissionId };
}

function totalConfirmed_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  return sheet
    .getRange(2, 5, lastRow - 1, 2)
    .getValues()
    .reduce((total, row) => {
      const count = Number(row[1]);
      return row[0] === "attending" && Number.isInteger(count) && count > 0
        ? total + count
        : total;
    }, 0);
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
    sheet.appendRow(RSVP_HEADERS);
    sheet.setFrozenRows(1);
  }
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
