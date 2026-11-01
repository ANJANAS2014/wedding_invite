// GET /i?to=<name>&lang=<en|ta|ml>[&i=<token>]   and   GET /i/<token>
// Serves the normal SPA index.html, but with a personalised link preview
// (og:title / og:description) so WhatsApp shows "Dear <name>, ..." for each guest.
// If anything fails, it redirects to the plain site with the same query, so guests never see an error.
import fs from "node:fs";
import path from "node:path";
import { supabaseConfig, findInvitation, TOKEN_PATTERN } from "./_shared/supabase.js";

const SITE = (process.env.SITE_URL || "https://lalith-weds-anjana.vercel.app").replace(/\/+$/, "");
const OG_IMAGE = `${SITE}/images/share/og-cover.jpg`;

const COPY = {
  en: {
    title: (n) => `Dear ${n}, you're invited 💐`,
    desc: "Lalith & Anjana's wedding · 29 November 2026 · Reception · 6 December 2026. Tap to open your personal invitation.",
  },
  ta: {
    title: (n) => `அன்புள்ள ${n}, உங்களை அன்புடன் அழைக்கிறோம் 💐`,
    desc: "லலித் & அஞ்சனா திருமணம் · நவம்பர் 29, 2026 · வரவேற்பு · டிசம்பர் 6, 2026. உங்கள் அழைப்பிதழைத் திறக்கவும்.",
  },
  ml: {
    title: (n) => `പ്രിയപ്പെട്ട ${n}, സ്നേഹപൂർവ്വം ക്ഷണിക്കുന്നു 💐`,
    desc: "ലളിത് & അഞ്ജന വിവാഹം · നവംബർ 29, 2026 · സൽക്കാരം · ഡിസംബർ 6, 2026. നിങ്ങളുടെ ക്ഷണക്കത്ത് തുറക്കുക.",
  },
};

let cachedHtml = null;

const one = (v) => (Array.isArray(v) ? v[0] : v) || "";
const cleanName = (v) => String(v).replace(/[^\p{L}\p{M}\s&.,'-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 60);
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function setMeta(html, attr, key, value) {
  const re = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*/?>`, "i");
  const tag = `<meta ${attr}="${key}" content="${esc(value)}">`;
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `  ${tag}\n</head>`);
}

async function loadIndexHtml() {
  if (cachedHtml) return cachedHtml;
  // Prefer the index.html built with this same deployment (bundled via vercel.json includeFiles).
  for (const file of [path.join(process.cwd(), "dist", "index.html"), path.join(process.cwd(), "index.html")]) {
    try {
      const html = fs.readFileSync(file, "utf8");
      if (html.includes("<div id=\"root\">") && html.includes("/assets/")) return (cachedHtml = html);
    } catch { /* try next */ }
  }
  const r = await fetch(`${SITE}/index.html`, { headers: { "user-agent": "invite-share-preview" } });
  if (!r.ok) throw new Error("index_fetch_failed");
  const html = await r.text();
  if (!html.includes("<div id=\"root\">")) throw new Error("index_unexpected");
  cachedHtml = html;
  return html;
}

export default async function handler(req, res) {
  const q = req.query || {};
  let name = cleanName(one(q.to));
  let lang = ["en", "ta", "ml"].includes(one(q.lang)) ? one(q.lang) : "en";
  const token = one(q.i) || one(q.token);

  // Token-only links (/i/<token>): look the guest up so the preview still carries their name.
  if (!name && token && TOKEN_PATTERN.test(token)) {
    try {
      const cfg = supabaseConfig();
      const inv = cfg ? await findInvitation(cfg, token) : null;
      if (inv?.guest) {
        name = cleanName(inv.guest.display_name || "");
        if (["en", "ta", "ml"].includes(inv.guest.language)) lang = inv.guest.language;
      }
    } catch { /* fall through to generic preview */ }
  }

  const params = new URLSearchParams();
  if (token) params.set("i", token);
  if (name) params.set("to", name);
  if (lang !== "en") params.set("lang", lang);
  const qs = params.toString();

  try {
    let html = await loadIndexHtml();
    if (name) {
      const c = COPY[lang] || COPY.en;
      const title = c.title(name);
      html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(title)}</title>`);
      html = setMeta(html, "property", "og:title", title);
      html = setMeta(html, "property", "og:description", c.desc);
      html = setMeta(html, "name", "description", c.desc);
    }
    html = setMeta(html, "property", "og:url", `${SITE}/i${qs ? "?" + qs : ""}`);
    html = setMeta(html, "property", "og:image", OG_IMAGE);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.status(200).send(html);
  } catch {
    res.setHeader("Cache-Control", "no-store");
    res.redirect(302, `/${qs ? "?" + qs : ""}`);
  }
}
