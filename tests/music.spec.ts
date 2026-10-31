import { test, expect } from '@playwright/test';

test.describe('Music mute/unmute', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true });

  test('toggle mute button works on mobile', async ({ page }) => {
    await page.goto('http://localhost:3001');

    const muteBtn = page.locator('#mu');
    await expect(muteBtn).toBeVisible();

    // Click to mute
    await muteBtn.click();
    await expect(muteBtn).toHaveClass(/off/);

    // Click to unmute
    await muteBtn.click();
    await expect(muteBtn).not.toHaveClass(/off/);
  });
});

test.describe('Wishes Wall on desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('marquee scrolls when enough cards', async ({ page }) => {
    await page.goto('http://localhost:3001');

    const rail = page.locator('.wishes-rail-viewport');
    const track = page.locator('.wishes-rail-track');

    if ((await rail.count()) > 0) {
      await expect(track).toHaveCSS('animation', /scrollWishesMarquee/);
    } else {
      // Static grid is fine too
      const cards = page.locator('.postcard-card');
      await expect(cards.first()).toBeVisible();
    }
  });
});
