# Wedding Invitation App — Operating & Testing Guide

This guide covers running the app on desktop and mobile, operating every feature, testing with browser DevTools, and running Playwright tests.

---

## 1. Prerequisites

- **Node.js** (v18+ recommended)
- Dependencies installed once:

```powershell
npm install
```

---

## 2. Running the app

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Vite dev server (`--host 0.0.0.0 --port 3000`). Hot-reloads on save. |
| `npm run build` | Type-checks (`tsc`) and builds the production bundle into `dist/`. |
| `npm run preview` | Serves the **production** build locally on port 3000. |
| `npm run lint` | Type-checks only, without emitting (`tsc --noEmit`). |

> **Note:** if port 3000 is already in use (e.g. another dev server running), Vite automatically picks the next free port (3001, 3002…) and prints the URL in the terminal. Use the URL it prints.

### Desktop

```powershell
npm run dev
```

Open the printed URL in Chrome/Edge — usually **http://localhost:3000**.

### Mobile (real phone, same Wi-Fi)

Because the dev server binds to `0.0.0.0`, it is reachable on your LAN:

1. Find the **Network** URL in the dev-server output, e.g. `http://192.168.1.11:3001/`.
2. On your phone (same Wi-Fi), open that URL in the browser.
3. Real touch behaviour works here: haptics, swipe-scrolling the wishes rail, tap-pausing the marquee.

If the phone cannot connect, allow Node.js through **Windows Defender Firewall** for private networks.

### Production test on mobile (recommended before sending invites)

```powershell
npm run build
npm run preview
```

Then open the printed URL from your phone. This tests exactly what guests receive — fonts, animations and lazy-loaded chunks included.

---

## 3. How to operate the app (feature walkthrough)

### 3.1 Cover page (CoverHero)

The first thing every guest sees — full-screen cover with garland, brass lamps, the couple's portrait, live countdown and **Open Invitation**.

- Tap **Open Invitation** → temple bell chime plays, the lotus curtain closes over the cover, then parts to reveal the invitation.
- Guest name from the `?to=` URL param is shown as a personalised greeting.
- The countdown ticks down to the wedding date automatically.

### 3.2 Lotus curtain (LotusCurtain)

States: `idle → closing → parting`. Purely animated; nothing to operate manually. Users with `prefers-reduced-motion` enabled skip straight to the invitation.

### 3.3 Sections (in scroll order)

1. **InvitationIntroSection** — family blessing and headings.
2. **EventsSection** — Muhurtham (29 Nov 2026) and Reception (6 Dec 2026) cards with **Map** / **Calendar** actions and countdown chips. The next upcoming event is highlighted with a "Next celebration" badge.
3. **CoupleSection** — bride & groom cards with portraits and vows.
4. **OurStoryAndFilmstripSection** — expandable "Our Story" story block (Read more/less) + auto-scrolling 35mm filmstrip. Tap any frame to open the **LightboxModal** (‹ › arrows, ✕ close).
5. **RsvpSection** — see 3.4.
6. **WishesWall** — see 3.5.
7. **Footer** — monogram and couple names.

### 3.4 RSVP form (RsvpSection)

1. Enter your name (pre-filled from `?to=` if present).
2. For each event (Wedding / Reception): tap **Yes, will be there** → a guest stepper appears (1–10).
3. Optionally write wishes (with emoji picker) and attach a photo — an inline thumbnail preview appears immediately; tap **remove** to delete it.
4. **Send RSVP** → success panel summarises your answers, with a preview of the photo you shared.

**URL params:**

| Param | Purpose |
|---|---|
| `?to=GuestName` | Personalises greeting + pre-fills RSVP name |
| `?i=<token>` | Invitation token (validated format) |
| `?lang=ta` / `?lang=ml` | Tamil / Malayalam UI language |
| `?tracker=1` or `?links=1` | Opens the admin **GuestTrackerModal** |

**Admin tracker:** open `http://localhost:3000/?tracker=1` to see all RSVP responses, attendance counts, and copyable preview links.

### 3.5 Wishes wall (WishesWall)

- With **3+ wishes**: an auto-scrolling marquee rail. Hover (desktop) or touch (mobile) pauses it. The **pause/play** button in the section header stops it entirely.
- With **1–2 wishes**: a centered grid instead.
- Each postcard shows the guest's uploaded photo (falls back to an initials monogram), their wish, and a **♥ like** button with live count.
- A stamp badge on each card shows **29 NOV** / **06 DEC** if that guest RSVP'd as attending (♥ seal when both).
- Tap a postcard → enlarged modal with photo, full wish, author, date, and a large like button.
- After a successful RSVP the wall refreshes automatically to show the new wish.

### 3.6 Music player (MusicPlayer)

Floating gold button, bottom-left. Tap to toggle background music. Animated equalizer bars = playing; strike-through = muted. Mute state persists in `localStorage` (`inv-mute`).

### 3.7 Event-day notice (EventDayNotice)

On the wedding day a dismissible banner appears at the top with a **Directions** button. Hidden on other days.

---

## 4. Testing in the browser (desktop → mobile view)

### 4.1 Device emulation (Chrome / Edge)

1. Run `npm run dev` and open the URL.
2. Press **Ctrl + Shift + M** (or F12 → device toolbar icon).
3. Choose a preset (iPhone SE, Galaxy S20…) or set custom width.
4. Test these widths — the app has dedicated breakpoints at each:

| Width | Check |
|---|---|
| 320 / 360 px | Small-phone layouts of the cover, postcards, RSVP |
| 390 / 430 px | iPhone / Pixel sizes |
| 768 px | Tablet — event cards stack to one column |
| 1024 / 1440 px | Desktop — story & reels side-by-side (≥1024px) |

5. Use **Responsive** mode and drag handles to sweep breakpoints visually.
6. Use **Rotate** to test landscape — the cover has a short-landscape safeguard (≤740px height).
7. Set network throttling to **Fast 3G** to test lazy-loaded sections and image loading.

**Re-testing the cover:** once opened, the cover hides (`body.opened #hero`). Clear site data (DevTools → Application → Storage → Clear site data) or refresh to see it again.

### 4.2 Quick health checks (paste in the console)

Horizontal overflow at any width:

```js
[...document.querySelectorAll('*')].filter(
  el => el.scrollWidth > document.documentElement.clientWidth && getComputedStyle(el).overflow !== 'hidden'
)
```

- Console must show **no errors**.
- Every image should load (Network tab → filter Img — no 404s).

### 4.3 Real-device testing

Open the **Network** URL from §2 on your phone. Verify:

- Haptic feedback on tap/open (Android).
- Swiping the wishes rail; tap pauses the marquee.
- Music toggle works (mobile autoplay policies allow audio only after a user gesture — the button click counts).
- The curtain animation is smooth (GPU-bound: lamps, mandala, petals).

---

## 5. Playwright tests

`@playwright/test` is already a devDependency.

### 5.1 One-time setup

```powershell
npx playwright install chromium
```

### 5.2 No config file exists yet — create one

There is currently no `playwright.config.ts` in the repo. Create it at the project root:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 390, height: 844 }, // mobile-first, iPhone 12-ish
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'small-mobile', use: { viewport: { width: 320, height: 568 } } },
  ],
});
```

### 5.3 Example smoke test

Create `tests/smoke.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('cover loads and invitation opens', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#hero')).toBeVisible();
  await expect(page.getByText(/open invitation/i)).toBeVisible();

  // Open the invitation
  await page.getByRole('button', { name: /open invitation/i }).click();
  await expect(page.locator('#main')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('#hero')).toBeHidden();
});

test('events section shows both events', async ({ page }) => {
  await page.goto('/?to=Test+Guest');
  await page.getByRole('button', { name: /open invitation/i }).click();
  await expect(page.getByText(/muhurtham/i)).toBeVisible();
  await expect(page.getByText(/reception/i)).toBeVisible();
  await expect(page.getByText(/Test Guest/i).first()).toBeVisible();
});

test('RSVP form validation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /open invitation/i }).click();
  await page.locator('#rsvp').scrollIntoViewIfNeeded();
  // Try to submit with no event selected
  await page.getByRole('button', { name: /send rsvp/i }).click();
  await expect(page.getByText(/select at least one celebration/i)).toBeVisible();
});
```

### 5.4 Running tests

```powershell
npx playwright test                 # all projects (mobile + desktop + small-mobile)
npx playwright test --project=mobile
npx playwright test tests/smoke.spec.ts
npx playwright test --headed        # watch the browser
npx playwright test --ui            # interactive UI mode
npx playwright show-report          # after a run
```

> If port 3000 is busy, `reuseExistingServer: true` reuses the running dev server; otherwise Playwright starts a fresh one.

### 5.5 What to automate

- Cover → open invitation → curtain → main visible
- Guest personalisation via `?to=`
- Event cards, countdown, map links present
- RSVP toggles, steppers, validation error, success panel
- Wishes wall renders (marquee or grid), like button increments
- Enlarged postcard modal opens/closes
- Lightbox opens from filmstrip, prev/next/close work
- Music toggle button toggles `.off` class
- No console errors on load (page.on('console') listener)

---

## 6. Troubleshooting

| Symptom | Fix |
|---|---|
| Port already in use | Vite auto-switches to 3001 etc. — use the printed URL. |
| Phone can't reach the LAN URL | Allow Node.js in Windows Firewall (private networks); confirm same Wi-Fi. |
| Cover reappears unexpectedly | Refresh resets `isOpened` — it is not persisted by design. |
| Wishes wall empty | Wishes come from submitted RSVPs — submit one first, or check the backend/Sheet endpoint. |
| Photos not showing | Network tab → 404s. Check `public/images/` paths and `WEDDING_IMAGES` in `src/data/weddingData.ts`. |
| Build fails | Run `npm run lint` — it's the same `tsc` check and will show the exact file/line. |
| Animations feel off | Check whether the OS/browser has **reduced motion** enabled — several animations intentionally disable then. |

---

## 7. Quick reference — file map

```text
index.html                 static shell, font + image preloads
src/main.tsx               entry point; loads shared CSS then mounts App
src/App.tsx                orchestrator: open state, curtain, URL params, lightbox
src/styles/
  variables.css            design tokens (--maroon, --gold, fonts, image URLs)
  global.css               body/html defaults, .sec/.eyebrow/.div/.btn utilities
  animations.css           keyframes shared across components
src/data/weddingData.ts    all content: names, events, gallery photos
src/utils/haptics.ts       vibration helpers
src/components/<Name>/     each component + its own CSS (see README/§3 above)
tests/                     Playwright specs (create per §5.3)
playwright.config.ts       Playwright config (create per §5.2)
```
