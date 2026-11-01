import { test, expect } from '@playwright/test';

// Core guest journey: cover → open → sections → RSVP → wishes → overlays.
// Uses reduced motion so the curtain opens instantly and marquees stand still.
test.use({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });

test.beforeEach(async ({ page }) => {
  await page.goto('/?to=Priya');
  await expect(page.locator('#cover-greeting')).toContainText('Priya');
  await page.locator('#op').click();
  await expect(page.locator('#main')).toBeVisible();
});

test('RSVP validates, submits and refreshes the wishes wall', async ({ page }) => {
  await page.locator('#rsvp-name').fill('');
  await page.locator('.rsvp-submit-btn').click();
  await expect(page.locator('.rsvp-error-alert')).toContainText('name');

  await page.locator('#rsvp-name').fill('Playwright Guest');
  await page.locator('.rsvp-attend-toggle').first().click();
  await page.getByRole('button', { name: 'Increase wedding guests' }).click();
  await page.locator('#rsvp-wishes').fill('Congratulations from the e2e suite!');
  await page.locator('.rsvp-submit-btn').click();

  await expect(page.locator('.rsvp-confirmation-panel')).toContainText('Attending · 2 guests');
  await expect(page.locator('#wishes')).toContainText('Congratulations from the e2e suite!');
});

test('filmstrip opens the lightbox; arrows and Escape work', async ({ page }) => {
  await page.locator('.film-frame').first().click();
  const img = page.locator('#lb img');
  await expect(img).toBeVisible();
  const first = await img.getAttribute('src');
  await page.keyboard.press('ArrowRight');
  await expect(img).not.toHaveAttribute('src', first ?? '');
  await page.keyboard.press('Escape');
  await expect(page.locator('#lb')).toHaveCount(0);
});

test('wish likes toggle and persist locally', async ({ page }) => {
  const like = page.locator('#wishes .postcard-like-btn').first();
  const before = await like.getAttribute('aria-label');
  await like.click();
  await expect(like).toHaveClass(/liked/);
  expect(await like.getAttribute('aria-label')).not.toBe(before);
  const stored = await page.evaluate(() => localStorage.getItem('wedding_wish_likes_v1'));
  expect(stored).toContain('true');
});

test('guest tracker opens from ?tracker=1 and closes with Escape', async ({ page }) => {
  await page.goto('/?tracker=1');
  const title = page.getByText('Guest Tracker & Link Maker');
  await expect(title).toBeVisible();
  await page.getByRole('tab', { name: 'Quick Link Generator' }).click();
  await page.getByPlaceholder('Guest name (e.g. Priya)').fill('Meena');
  await expect(page.getByText(/\?to=Meena&lang=en/)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(title).toHaveCount(0);
});
