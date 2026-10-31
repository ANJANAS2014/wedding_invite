# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\music.spec.ts >> Wishes Wall on desktop >> marquee scrolls when enough cards
- Location: tests\music.spec.ts:25:3

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/
Call log:
  - navigating to "http://localhost:3001/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Music mute/unmute', () => {
  4  |   test.use({ viewport: { width: 390, height: 844 }, isMobile: true });
  5  | 
  6  |   test('toggle mute button works on mobile', async ({ page }) => {
  7  |     await page.goto('http://localhost:3001');
  8  | 
  9  |     const muteBtn = page.locator('#mu');
  10 |     await expect(muteBtn).toBeVisible();
  11 | 
  12 |     // Click to mute
  13 |     await muteBtn.click();
  14 |     await expect(muteBtn).toHaveClass(/off/);
  15 | 
  16 |     // Click to unmute
  17 |     await muteBtn.click();
  18 |     await expect(muteBtn).not.toHaveClass(/off/);
  19 |   });
  20 | });
  21 | 
  22 | test.describe('Wishes Wall on desktop', () => {
  23 |   test.use({ viewport: { width: 1280, height: 800 } });
  24 | 
  25 |   test('marquee scrolls when enough cards', async ({ page }) => {
> 26 |     await page.goto('http://localhost:3001');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3001/
  27 | 
  28 |     const rail = page.locator('.wishes-rail-viewport');
  29 |     const track = page.locator('.wishes-rail-track');
  30 | 
  31 |     if ((await rail.count()) > 0) {
  32 |       await expect(track).toHaveCSS('animation', /scrollWishesMarquee/);
  33 |     } else {
  34 |       // Static grid is fine too
  35 |       const cards = page.locator('.postcard-card');
  36 |       await expect(cards.first()).toBeVisible();
  37 |     }
  38 |   });
  39 | });
  40 | 
```