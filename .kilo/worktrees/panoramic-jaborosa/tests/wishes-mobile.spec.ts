import { test, expect } from '@playwright/test';

test.describe('Wishes Wall on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true });

  test.beforeEach(async ({ page }) => {
    // Serve the built app locally
    await page.goto('http://localhost:3001');
    // Open the invitation to reveal the wishes wall
    await page.locator('#op').click();
    // Wait for the curtain to part and main content to appear
    await page.waitForTimeout(1800);
  });

  test('wishes marquee scrolls on mobile', async ({ page }) => {
    // Wait for wishes wall section to render
    const wishesSection = page.locator('#wishes');
    await expect(wishesSection).toBeVisible();

    // If the auto-scroll rail is present, check the track is animating
    const rail = page.locator('.wishes-rail-viewport');
    const track = page.locator('.wishes-rail-track');

    if ((await rail.count()) > 0) {
      // The track should have a marquee-distance set (non-zero) and an animation
      await expect(track).toHaveCSS('animation', /scrollWishesMarquee/);
      const distance = await track.evaluate((el) =>
        getComputedStyle(el).getPropertyValue('--marquee-distance')
      );
      expect(distance.trim()).not.toBe('0px');
      expect(distance.trim()).not.toBe('');
    } else {
      // Static grid: cards should be present
      const cards = page.locator('.postcard-card');
      await expect(cards.first()).toBeVisible();
    }
  });

  test('wishes card click opens modal with full content', async ({ page }) => {
    const card = page.locator('.postcard-card').first();
    await expect(card).toBeVisible();

    await card.click();

    const modal = page.locator('.postcard-modal-overlay');
    await expect(modal).toBeVisible();

    // Modal should show the wish text, author name, and either photo or monogram
    await expect(page.locator('.modal-wish-text')).toBeVisible();
    await expect(page.locator('.modal-author-name')).toBeVisible();

    // Close button should exist and work
    const closeBtn = page.locator('.modal-close-btn');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(modal).toBeHidden();
  });
});
