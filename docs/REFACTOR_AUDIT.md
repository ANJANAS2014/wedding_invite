# Refactor audit (Phase 1)

Audit date: 1 Nov 2026. Taken from `main` at `e5224c1`, before any refactoring.

## 1. Architecture (before)

- **Frontend**: React 18 + TypeScript + Vite single-page app. `src/main.tsx` imports the global styles and renders `src/App.tsx`.
- `App.tsx` (≈300 lines) does a lot: it parses the URL (`?to`, `?i`, `?lang`, `?tracker`, `?links`), runs the curtain state machine, plays the Web Audio temple-bell chime, calls haptics, lazy-loads and prefetches the sections, renders an inline footer and holds the lightbox, tracker and wishes-refresh state.
- **Eager components**: CoverHero, LotusCurtain, MusicPlayer, InvitationIntroSection, FallingPetals.
- **Lazy components** (`React.lazy`, prefetched when the browser is idle): EventDayNotice, EventsSection, CoupleSection, OurStoryAndFilmstripSection, RsvpSection, WishesWall, LightboxModal, GuestTrackerModal. Each of these import paths appears twice in App.tsx (once for `lazy` and once for the prefetch).
- **Backend**: Vercel serverless functions in `api/*.js` (`rsvp`, `rsvp-photo`, `wishes`, `invite`, `admin-guests`) plus `api/_shared/supabase.js`. They use Supabase REST through `fetch` when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set, and fall back to Google Apps Script (`APPS_SCRIPT_URL` + `RSVP_SHARED_SECRET`) otherwise.
- **Database**: `supabase/01_schema.sql` and `02_security.sql` (RLS on, no public grants, private photo bucket).
- **Static assets**: everything lives in `public/` (images, audio, icons), referenced by absolute `/images/...` paths in `weddingData.ts`, in `variables.css` and in `index.html` preloads.

## 2. Component relationships

| Component | Depends on |
|---|---|
| CoverHero | weddingData (content, images), utils/haptics; inline countdown logic |
| EventsSection | weddingData; inline events array; second copy of the countdown logic; Google Calendar URL builder |
| EventDayNotice | hard-coded venues, addresses and times (they repeat weddingData) |
| CoupleSection, InvitationIntroSection | weddingData |
| OurStoryAndFilmstripSection | weddingData (`UNIFIED_MEMORIES_WITH_EXTRAS`) |
| LightboxModal | weddingData; index state owned by App |
| RsvpSection | `fetch('/api/rsvp-photo')`, signed upload `PUT`, `fetch('/api/rsvp')`, localStorage `wedding_rsvps_v2` |
| WishesWall | `fetch('/api/wishes')`, localStorage (`wedding_rsvps_v2`, `wedding_user_wishes_v1`, `wedding_wish_likes_v1`), built-in sample postcards |
| GuestTrackerModal | weddingData `LANG_MAPPINGS`; **imports the `RsvpRecord` type from the RsvpSection component**; localStorage only |
| MusicPlayer | `/audio/background-music.mp3`, localStorage `inv-mute` (App's chime reads the same key) |

**Circular dependencies: none found.** The only component-to-component import is a type import (GuestTrackerModal → RsvpSection).

## 3. CSS imports and dependencies

- `main.tsx` imports `styles/variables.css`, `styles/global.css` and `styles/animations.css`. Every component imports its own stylesheet, except:
  - `Footer.css` is imported by App.tsx because the footer is inline JSX, and there is no Footer component.
  - GuestTrackerModal has no stylesheet: about 27 KB of inline styles. It also depends on `.rsvp-input`, which lives in RsvpSection.css (a cross-component dependency).
- Rules that live in the wrong file:
  - `InvitationIntroSection.css` holds the App-level `#main` rules.
  - `CoverHero.css` holds the `#mu` and `#mh` (MusicPlayer) positioning rules for the cover state.
- Shared animations are already centralised (`invitation-arrive`, `cover-arrive`, `fadeInPanel`).
- Unused CSS (verified with a selector-vs-source scan and a manual check of dynamic class names):
  - `OurStoryAndFilmstripSection/GalleryScrapbook.css`: the **whole file** (scrapbook gallery, old `#couple .story-reel`).
  - `StoryReelsLayout.css`: the `.story-reels-*`, `.our-reels-*`, `.reels-*` and `.reel-*` blocks (old reels UI). Only the `.our-story-editorial` and `.story-*` rules are used.
  - `WishesWall.css`: the legacy `.wishes-wall`, `.wishes-rail`, `.wishes-track*`, `.wish-card*`, `.wishes-nav-*` rules and `@keyframes wishes-scroll` (old wall design).
  - `FallingPetals.css`: `.pt--gold` (only blush, rose and pink tones are generated).
- Class names in the markup with no CSS behind them: `rv`, `in`, `carousel-card`, `cover-intro-complete`, and the body class `lightbox-open`.
- `index.html` loads 7 Google Font families. Only **Cormorant Garamond, Jost and Playfair Display** are used. Cinzel, Great Vibes, Lora and Marcellus are unused.

## 4. Duplicate code and repeated logic

- The gold mandala divider SVG is copy-pasted in 7 places.
- The countdown maths is written twice (CoverHero and EventsSection).
- Event facts are written twice (the EventsSection array and EventDayNotice).
- The `'en' | 'ta' | 'ml'` union is repeated in 6+ places, and the localStorage keys are repeated as string literals in 3 files.
- The wedding and reception RSVP cards are near-identical JSX blocks.
- The greeting and Open-button translations are duplicated: `LANG_MAPPINGS.greet` and `.open` vs `CoverHero.getGreeting` and `getOpenBtnText`. `greet` returns an HTML string that is never used.
- Three modal implementations: the WishesWall postcard modal, LightboxModal and GuestTrackerModal. Each handles Escape, backdrop and scroll in its own way:
  - LightboxModal: no scroll lock.
  - GuestTrackerModal: no Escape key and no scroll lock.
  - None of them manages focus or uses a portal.
- `api/`: `jsonResponse(res, …)` and `isSameOriginReq` are copy-pasted into 4 handlers, even though `_shared/supabase.js` already exports an equivalent `isSameOrigin`.

## 5. Dead and unreachable code

- `weddingData.ts`:
  - `EventItem`, `GALLERY_DIMENSIONS`, `WEDDING_CONTENT.bless/inv2/shloka/weddingDate/weddingEnd/receptionDate/receptionEnd`, `LANG_MAPPINGS.*.greet/open` and the `WEDDING_IMAGES` keys `p11, p15–p19, p18w, wedding_procession` are never read in TS. The CSS variables reference those files by path.
  - `UNIFIED_MEMORIES_WITH_EXTRAS` is a plain copy of `UNIFIED_MEMORIES`.
- Root scripts:
  - `split_css.py` and `update_main.py` are one-off migration scripts that point at the removed `src/styles/invitation.css`. Running `update_main.py` now would overwrite `main.tsx`.
  - `vite.err` is a stale log.

## 6. API and Supabase integration status

- **No Supabase client or keys in the frontend.** Only the serverless functions read `SUPABASE_SERVICE_ROLE_KEY`. There is no `src/supabase/` folder.
- `api/rsvp.js` **bug**: the Supabase `GET` branch calls an undefined `sharedJson(...)`. It throws, gets caught and returns 502. The frontend never calls `GET /api/rsvp`.
- **Not wired to the frontend (incomplete integrations):**
  - `api/admin-guests.js`: GuestTrackerModal is a localStorage-only demo. It accepts any password and never calls the admin API.
  - `api/invite.js`: `?i=<token>` is only validated client-side. The guest name comes from `?to=`, not from the database.
  - Wish likes are stored only in the guest's browser. There is no backend endpoint or column for likes.
- RSVP submission always shows "Thank you" even if `/api/rsvp` fails. It is stored in localStorage as a fallback. This is existing behaviour, kept as is.
- Sample postcards appear on localhost **and in production whenever there are no wishes**, so the "No wishes yet" empty state can't be reached. This is existing behaviour, kept as is.
- `netlify.toml` points at `netlify/functions`, which doesn't exist. Deployment is Vercel (`vercel.json`, `api/`). Likely obsolete, but reported rather than removed.

## 7. Tests and build status (before)

- `tests/music.spec.ts` and `tests/wishes-mobile.spec.ts` hard-code `http://localhost:3001`. There is **no `playwright.config.ts`** and no `test` script.
- The local `node_modules` doesn't match the lockfile:
  - Installed: vite **5.4.21**, Windows-only esbuild binary.
  - `package.json` / lock: vite **8.3.5** (rolldown).
  - `npm install` is needed on the dev machine.
- `@vitejs/plugin-react@4.7.0` declares peer `vite ^4–^7`. That is why `.npmrc` sets `legacy-peer-deps=true`.
- Baseline, measured in the refactor sandbox:
  - `tsc --noEmit`: **pass**.
  - Existing Playwright specs: **4/4 pass**.
  - Custom functional checks: **71/71 pass**.
  - These ran against a bundle built with esbuild because the npm registry was unreachable from the sandbox, so `vite build` itself could not run there.
- `dist/` (generated output) is committed to git. `test-results/` exists.

## 8. Migration plan

1. Add `app/` (App, lazy-section registry, App.css), `types/`, `services/`, `hooks/`, `components/shared/`.
2. Extract the footer, mandala divider, countdown, event data, chime, URL params and curtain-opening hooks.
3. Move the RSVP, wishes, photo-upload and guest-tracker storage logic into services. Split the large components into feature-local sub-components.
4. Build a shared `Modal` (portal, scroll lock, Escape, focus trap and restore, safe areas) and move the three modals onto it while keeping their existing class names and visuals.
5. Clean up the CSS: remove the verified-dead blocks and files, move misplaced rules, and replace the tracker's inline styles with `GuestTrackerModal.css`.
6. De-duplicate the `api/` helpers and fix the `sharedJson` bug.
7. Add `playwright.config.ts` and an end-to-end invitation-flow spec, then update the README and docs.
8. Verify after each phase: typecheck, bundle, Playwright, and a screenshot diff at 320–1440 px.

## 9. Status after the refactor

**Resolved:**

- App, sections, hooks, services, types and shared UI are now modular (see README "Project structure").
- The mandala divider, countdown, event data, storage keys, modal behaviour and API helpers are de-duplicated.
- Dead CSS, the two abandoned scripts, `vite.err` and the four unused fonts were removed.
- The `api/rsvp.js` GET bug is fixed.
- All three modals now use `components/shared/Modal`: portal, iOS-safe scroll lock with scroll restore, Escape, focus trap and restore, safe-area padding.
- `playwright.config.ts` was added, plus `npm run test:e2e` and `tests/invitation-flow.spec.ts`.

**Behaviour changes that came with the refactor (all deliberate):**

- The lightbox and Guest Tracker now lock background scroll. The Guest Tracker now closes on Escape.
- Countdowns render on the first paint instead of appearing a moment later.
- At 320 px the lightbox and wish modal now sit correctly in the viewport (because they are portalled and body-locked).

**Still open (not changed, by design or because it needs a decision):**

- The Guest Tracker is localStorage-only and accepts any password. `api/admin-guests.js` and `api/invite.js` are not called from the frontend.
- Wish likes are per-browser only. There is no backend likes column or endpoint.
- RSVP shows success even when `/api/rsvp` fails (it keeps a local copy).
- Sample postcards show in production when there are no wishes.
- `netlify.toml` points at a `netlify/functions` folder that doesn't exist (the site deploys on Vercel).
- `dist/` and `test-results/` are tracked in git (`test-results/` is now in `.gitignore`).
- `memory/SPEC.md` describes the earlier static-site version.
- `public/images/couple/groom-studio-portrait.jpg` isn't displayed anywhere.
- `@vitejs/plugin-react@4` vs `vite@8` peer conflict (needs `legacy-peer-deps`).
- Local `node_modules` needs `npm install` to match the lockfile.
- Empty class hooks `rv`/`in` were removed from section markup. `#s2:after` is an empty decorative pseudo-element (kept).
