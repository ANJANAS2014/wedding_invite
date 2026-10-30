// Shared helpers for the Supabase-backed Netlify Functions.
// The service-role/secret key is read from Netlify environment variables only and never sent to the browser.
const crypto = require("node:crypto");

const PHOTO_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const MAX_GUESTS_PER_EVENT = 10;
const LANGUAGES = ["en", "ta", "ml"];
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{32}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function jsonResponse(statusCode, body, cache = "no-store") {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cache,
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

// Returns null when Supabase is not configured, so callers can fall back to the legacy Apps Script flow.
function supabaseConfig() {
  const rawUrl = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!rawUrl || !key || rawUrl.includes("YOUR-PROJECT") || key.includes("YOUR-")) return null;
  let url;
  try { url = new URL(rawUrl); } catch { return null; }
  if (url.protocol !== "https:") return null;
  return { url: url.origin, key, bucket: process.env.SUPABASE_PHOTO_BUCKET || "guest-photos" };
}

class SupabaseError extends Error {
  constructor(status, data) {
    super("supabase_error");
    this.status = status;
    this.code = data?.code || "";
  }
}

async function supabaseRequest(cfg, path, { method = "GET", body, prefer, headers = {} } = {}) {
  const auth = cfg.key.startsWith("eyJ") ? { Authorization: `Bearer ${cfg.key}` } : {};
  const response = await fetch(cfg.url + path, {
    method,
    headers: {
      apikey: cfg.key,
      ...auth,
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(prefer ? { Prefer: prefer } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!response.ok) throw new SupabaseError(response.status, data);
  return data;
}

const rpc = (cfg, name, args) => supabaseRequest(cfg, `/rest/v1/rpc/${name}`, { method: "POST", body: args });

function newInvitationToken() {
  return crypto.randomBytes(24).toString("base64url"); // 192 bits, 32 URL-safe characters
}

function cleanText(value, max) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").replace(/[ \t]+/g, " ").trim().slice(0, max);
}

function cleanName(value) {
  return cleanText(value, 120).replace(/\s+/g, " ");
}

async function findInvitation(cfg, token) {
  if (!TOKEN_PATTERN.test(token || "")) return null;
  const rows = await supabaseRequest(
    cfg,
    `/rest/v1/invitations?token=eq.${encodeURIComponent(token)}&revoked_at=is.null&select=id,guest:guests(display_name,language)&limit=1`,
  );
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

async function signPhotoUrls(cfg, paths, expiresIn = 3600) {
  const unique = [...new Set(paths.filter(Boolean))];
  if (!unique.length) return {};
  const signed = await supabaseRequest(cfg, `/storage/v1/object/sign/${encodeURIComponent(cfg.bucket)}`, {
    method: "POST",
    body: { expiresIn, paths: unique },
  });
  const map = {};
  (Array.isArray(signed) ? signed : []).forEach((item) => {
    if (item?.path && typeof item.signedURL === "string") map[item.path] = cfg.url + "/storage/v1" + item.signedURL;
  });
  return map;
}

module.exports = {
  PHOTO_TYPES, PHOTO_MAX_BYTES, MAX_GUESTS_PER_EVENT, LANGUAGES, TOKEN_PATTERN, UUID_PATTERN,
  jsonResponse, isSameOrigin, supabaseConfig, supabaseRequest, rpc, SupabaseError,
  newInvitationToken, cleanText, cleanName, findInvitation, signPhotoUrls,
};
