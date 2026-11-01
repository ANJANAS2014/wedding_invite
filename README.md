# Lalith & Anjana · Wedding Invitation

React 18 + TypeScript + Vite wedding invitation with South Indian artwork, a lotus-curtain opening, background music, multilingual personal greetings (English, Tamil, Malayalam), an RSVP form with photo upload, a wishes wall, and a host Guest Tracker. Serverless functions in `api/` (Vercel) talk to Supabase, or to the legacy Google Apps Script backend when Supabase isn't configured.

- Feature walkthrough and manual testing: [`TESTING.md`](TESTING.md)
- Where images live: [`IMAGE_MAP.md`](IMAGE_MAP.md)
- Database / environment setup: [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md)
- Refactor audit and known gaps: [`docs/REFACTOR_AUDIT.md`](docs/REFACTOR_AUDIT.md)

## Quick start

```bash
npm install          # Node 18+; .npmrc sets legacy-peer-deps (see "Dependencies")
npm run dev          # http://localhost:3000 (also on your LAN for phone testing)
npm run build        # type-check (tsc) + production build into dist/
npm run preview      # serve the production build on :3000
npm run lint         # type-check only
npm run test:e2e     # Playwright: builds, serves on :3001, runs tests/
```

First time only, for the tests: `npx playwright install chromium`.

Useful URLs:

- `/?to=Priya&lang=ta` greets a guest by name (`lang` = `en`, `ta` or `ml`).
- `/?tracker=1` opens the Guest Tracker.
- `/?now=2026-11-29T10:00` previews the event-day banner.

## Project structure

```
src/
├── main.tsx                 Entry: global CSS, then <App/>
├── app/
│   ├── App.tsx              Composition: cover → curtain → sections → overlays
│   ├── App.css              #main shell (hidden until body.opened)
│   └── lazySections.ts      Code-split sections/modals + idle prefetch
├── components/
│   ├── <Feature>/           One folder per feature (see list below)
│   │   ├── Feature.tsx      Main component (imports its own Feature.css)
│   │   ├── Feature.css      Styles for this feature only
│   │   └── SubPart.tsx      Feature-only sub-components / helpers, if needed
│   └── shared/
│       ├── MandalaDivider/  Gold line–mandala–line ornament
│       └── Modal/           Shared modal foundation (portal, scroll lock, Esc, focus trap)
├── hooks/                   Reusable hooks (useNow, useScrollLock, useFocusTrap,
│                            useInvitationParams, useInvitationOpening, useWishes, …)
├── services/                Everything that leaves the component:
│   ├── api.ts               /api routes + fetch helpers
│   ├── rsvpService.ts       RSVP validation, submission, local copy
│   ├── photoUploadService.ts  Signed-URL photo upload
│   ├── wishesService.ts     Wishes loading/merging, likes storage
│   ├── guestTrackerStore.ts Local Guest Tracker data
│   └── storage.ts           All localStorage/sessionStorage keys + safe access
├── data/
│   ├── weddingData.ts       Names, story, images, gallery, translations
│   ├── events.ts            Wedding & reception details (single source of truth)
│   └── sampleWishes.ts      Sample postcards (localhost / no wishes yet)
├── utils/                   Pure helpers: countdown, calendar, chime, haptics, invite links, text
├── types/                   Shared TypeScript types
└── styles/
    ├── variables.css        Design tokens (colours, fonts, image URLs)
    ├── global.css           Base elements + shared utilities (.sec, .eyebrow, .div, .btn)
    └── animations.css       Keyframes shared by more than one component
api/                         Vercel serverless functions (server-side secrets only)
├── _shared/supabase.js      Supabase REST helpers, sendJson, isSameOrigin
├── rsvp.js  rsvp-photo.js  wishes.js  invite.js  admin-guests.js
supabase/                    SQL schema + security policies
public/                      Static assets served as-is (images/, audio/, icons/)
tests/                       Playwright specs (playwright.config.ts at the root)
```

The feature folders are TempleDoors (landing page), CoverHero, FallingPetals, MusicPlayer, EventDayNotice, EventsSection, CoupleSection, OurStoryAndFilmstripSection, RsvpSection, WishesWall, LightboxModal, GuestTrackerModal and Footer.

## Where things belong

| You are adding… | Put it in… |
|---|---|
| A new visible section or widget | `src/components/<Feature>/<Feature>.tsx` + `<Feature>.css`, then mount it in `src/app/App.tsx` (below the fold: add a loader to `lazySections.ts`) |
| Styles for one feature | That feature's CSS file, with selectors scoped to the feature's root id/class |
| A colour, font or image URL used in several places | `src/styles/variables.css` |
| A keyframe used by 2+ components | `src/styles/animations.css` (single-use keyframes stay with the component) |
| Text or content (names, venues, story, translations) | `src/data/` (`events.ts` for anything about the two celebrations) |
| A `fetch` to `/api/*`, upload or storage access | `src/services/` (never call `fetch` or `localStorage` from components) |
| Reusable React state/effect logic | `src/hooks/` |
| A pure function with no React | `src/utils/` |
| A type used by more than one feature | `src/types/index.ts` |
| A modal or overlay | Wrap the content in `<Modal>` from `components/shared/Modal` and give it your own `id`/`className` for styling |
| Server logic or secrets | `api/` (Supabase service key only ever lives in server env vars) |

### Adding a feature without touching unrelated code

1. Create `src/components/MyFeature/MyFeature.tsx` and `MyFeature.css`, and import the CSS at the top of the component.
2. Put any content in `src/data/`, API or storage calls in a `src/services/` module, and shared state logic in a hook.
3. Render it from `src/app/App.tsx`. For below-the-fold features, add one loader line to `src/app/lazySections.ts`. It gets lazy-loaded and prefetched automatically.
4. Reuse `.sec`, `.eyebrow`, `.btn` and `<MandalaDivider/>` for consistent headings. Don't restyle them globally.
5. Run `npm run lint`, `npm run build` and `npm run test:e2e`, and add a spec in `tests/` for the new flow.

## Backend and environment

Environment variables (Vercel project settings; see `.env.example` and `SUPABASE_SETUP.md`):

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PHOTO_BUCKET`: Supabase mode.
- `APPS_SCRIPT_URL`, `RSVP_SHARED_SECRET`: legacy Google Apps Script mode, used when Supabase isn't set.
- `ADMIN_PASSWORD`: protects `api/admin-guests.js`.

| Endpoint | Used by the site |
|---|---|
| `POST /api/rsvp` | Yes. RSVP form (`rsvpService`) |
| `POST /api/rsvp-photo` | Yes. Photo upload (`photoUploadService`) |
| `GET /api/wishes` | Yes. Wishes wall (`wishesService`) |
| `GET /api/invite` | **Not yet**. `?i=` tokens are only format-checked in the browser |
| `POST /api/admin-guests` | **Not yet**. The Guest Tracker is still a browser-only (localStorage) demo |

Wish likes are stored only in the guest's browser; there is no likes endpoint. See `docs/REFACTOR_AUDIT.md` §6 for the full list of incomplete integrations.

## Dependencies

- Runtime: `react` and `react-dom` 18.
- Dev: `vite` 8, `@vitejs/plugin-react` 4, `typescript` 5, `@playwright/test`.
- `@vitejs/plugin-react@4` declares peer support only up to Vite 7. That is why `.npmrc` sets `legacy-peer-deps=true`. Upgrading the plugin to a Vite-8-compatible major would remove the need for it.
- After pulling, run `npm install` so `node_modules` matches `package-lock.json`.
- `dist/` is generated by `npm run build`. Vercel builds it itself, so it doesn't need to be edited by hand.
