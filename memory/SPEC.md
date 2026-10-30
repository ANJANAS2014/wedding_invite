# Lalith & Anjana — Wedding Invitation (static site)

- Static, no-build site: `index.html` + `css/base.css` (all live styles; later rules override earlier ones) + `js/main.js` (renders everything into `#app`) + `data/*.js` (content, theme, image map).
- RSVP/wishes use Netlify Functions (`/.netlify/functions/*`) backed by Google Apps Script; they are NOT available in the Emergent preview (404 there is expected).
- Emergent preview shim: `frontend/package.json` `yarn dev` serves `/app` with `python3 -m http.server` on port 3000. Not part of the deployed site.

## Cover (#hero) — restored "Image 1" atmosphere (commit 8357f17 reference)
Layers inside `.cover-scene` (bottom → top): ivory/champagne radial base, `.cover-landscape` (Kerala/TN scene, 30% opacity, desaturated, masked to side band), `.cover-light` (warm glow + vignette), `.cover-garland` (p18w desktop / p18 mobile, gentle skew sway), `.cover-altar--left/right` (p19 mirrored), `.cover-floor`, `.cover-tint` (soft-light champagne unifier), grain, thali-chain SVG (subtle), `.cover-sparkle` rising gold motes.
Content `.cv`: refined couple cutout (`wedding-couple-cutout-refined.webp`) with halo glow + slow mandala ring + soft-light warm wash, full names "Lalith & Anjana" (Cormorant Garamond, deep maroon), date, gold "Open Invitation" button (`#op`).
Falling petals: restored original `.pt` body-wide fixed petals (11 mobile / 18 desktop), blush/pink/rose/muted-gold, fall + independent drift/flutter, negative delays for seamless loop, pointer-events none, skipped under prefers-reduced-motion.

## Additions (iteration 2)
- Lamp flicker: `.cover-lamps--desktop/--mobile` inside `.cover-garland`, glows positioned via `LAMP_FLAMES` (% of garland art) in js/main.js; `lamp-flicker` keyframes; static under reduced motion.
- Lotus-petal curtain: `openWithCurtain()` (js/main.js) bound to `#op`. Panels close ~0.46s, `pg(1)` at 560ms, part over 1s, removed at 1.7s; music starts synchronously on tap. Reduced motion → opens instantly.
- After opening: 1/3 of petals remain (`.pt:nth-child(3n+1)`), at 70% opacity and 72% size.
- Share preview: `assets/images/wedding-hero-couple-trees.jpg` is used for OG/Twitter metadata in index.html.

## Additions (iteration 3)
- Personal greeting: `?to=Name` → `GUEST_NAME` (sanitised, max 60 chars, escaped) → `.cover-greeting` "Dear <b>Name</b>, with love we invite you" between couple and names. Link maker: `/links.html` (standalone, noindex; name, optional "& Family", optional WhatsApp number, editable message, Send on WhatsApp / Copy / Preview).
- Add to Calendar: `.cal-btn` beside Google Maps in each event card → Google Calendar template URL (ctz Asia/Kolkata, venue + map link in details). Google only (user choice).
- Curtain chime: `playChime()` Web Audio synthesised temple bell (two strikes), scheduled in the tap at +0.56s (curtain parting); skipped when muted; separate AudioContext from music.
- Cover countdown: `#cover-cd` days/hours/minutes to the wedding (EVS()[0].s), updated by `tick()` via `coverCountdown()`; hidden after the wedding starts.

## Iteration 4 — Guest management, Supabase-ready backend, compact sections
- Personal invitations: `?i=<32-char token>` → `invite` function → name + language (en/ta/ml) → cover greeting, Open button, #fam invitation text (Tamil/Malayalam Unicode, Noto Serif Tamil/Malayalam loaded on demand), RSVP name prefill + "Replying to the invitation for X · Not you?" chip. Legacy `?to=Name&lang=ta` quick links still work (no tracking).
- RSVP ("Will you be celebrating with us?"): name, wedding + reception accept/decline independently, per-event guest count 1–10, wishes (optional), photo (optional, JPG/PNG/WebP ≤5 MB via `rsvp-photo` signed upload URL to private bucket). Idempotent submissionId; resubmission from a personal link updates the answer. Success → thanks panel with summary + "Change my response". Friendly errors only.
- Backend: `netlify/functions/{rsvp,rsvp-photo,invite,wishes,admin-guests}.js`, helpers in `_shared/supabase.js` (REST via fetch, no deps). Supabase active only when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY set; otherwise legacy Apps Script path. Admin = `ADMIN_PASSWORD` header `x-admin-key`.
- DB: `supabase/01_schema.sql` (events, guests, invitations, rsvp_responses, rsvp_event_responses, rsvp_photos, submit_rsvp(), rsvp_totals(), guest_tracker view), `supabase/02_security.sql` (RLS on, no public policies/grants, private guest-photos bucket). Docs: SUPABASE_SETUP.md, .env.example.
- links.html: Guest Tracker tab (login, add guest w/ language + phone, stats, search/filter by status, copy/WhatsApp (marks Sent), RSVP details, approve wish, remove) + Quick link tab.
- Event-day notice: fixed banner "The wedding/reception is happening now!" + Google Maps directions, only on the IST calendar date (test with `?now=2026-11-29T10:00`). All countdowns use IST (`ist()`).
- Reel: manual prev/next restarts autoplay timer (no longer pauses forever), re-measures when it becomes visible (was stuck at 0 width inside hidden #main), ResizeObserver, arrow keys.
- Compact layout: couple cards (arch portraits 180–210px desktop, 140–165px mobile, horizontal cards on mobile), event photos 150–200px cover-cropped, smaller headings; #s1 text on soft ivory ground for contrast.
- Tests: `node --test tests/*.test.js` (legacy Sheets tests + tests/supabase-functions.test.js with mocked Supabase).
