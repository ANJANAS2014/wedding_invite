import { test, expect } from '@playwright/test';

const WIDTHS = [360, 375, 390, 414, 430];

test('wish modal opens with visible content at mobile widths', async ({ page }) => {
  test.setTimeout(120_000);

  // Seed a wish with a long message to test scrolling/clipping
  await page.addInitScript(() => {
    localStorage.setItem('wedding_rsvps_v2', JSON.stringify([{
      name: 'Test Guest With A Very Long Name',
      wishes: 'This is a deliberately long wish message. '.repeat(12),
      weddingAttending: true,
      receptionAttending: true,
      submittedAt: new Date().toISOString()
    }]));
  });

  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 800 });
    await page.goto('/');
    const openBtn = page.getByRole('button', { name: /open invitation/i });
    if (await openBtn.count()) {
      await openBtn.click();
      await page.waitForTimeout(2200);
    }
    await page.locator('#wishes').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const card = page.locator('.postcard-card').first();
    if (!(await card.count())) { console.log(`${w}: no wish cards`); continue; }
    await card.click();
    await page.waitForTimeout(400);

    // Modal must be a direct child of body (portal check)
    const isPortaled = await page.evaluate(() => {
      const m = document.querySelector('.postcard-modal-overlay');
      return !!m && m.parentElement === document.body;
    });

    const box = await page.locator('.postcard-modal-card').boundingBox();
    const vp = page.viewportSize()!;
    const closeVisible = await page.locator('.modal-close-btn').isVisible();

    const fits = box && box.y >= 0 && box.y + box.height <= vp.height && box.x >= 0 && box.x + box.width <= vp.width;
    console.log(`${w}px: portaled=${isPortaled} fits=${fits} closeBtn=${closeVisible} box=${JSON.stringify(box)}`);

    expect(isPortaled, 'modal should be portaled to body').toBeTruthy();
    expect(closeVisible, 'close button visible').toBeTruthy();
    expect(fits, `modal fits in ${w}px viewport`).toBeTruthy();

    await page.screenshot({ path: `test-results/modal-${w}.png` });
    await page.locator('.modal-close-btn').click();
    await page.waitForTimeout(300);

    // Background scroll restored
    const scrollable = await page.evaluate(() => {
      window.scrollTo(0, 400);
      return window.scrollY > 100;
    });
    expect(scrollable, 'background scroll restored after close').toBeTruthy();
  }
});

test('lightbox opens from filmstrip', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: /open invitation/i }).click();
  await page.waitForTimeout(2200);
  const frame = page.getByRole('button', { name: /view photo/i }).first();
  await frame.dispatchEvent('click');
  await page.waitForSelector('#lb img', { state: 'visible', timeout: 10_000 });
  const portaled = await page.evaluate(() => {
    const m = document.querySelector('#lb');
    return !!m && m.parentElement === document.body;
  });
  const visible = await page.locator('#lb img').isVisible();
  console.log(`lightbox: portaled=${portaled} imgVisible=${visible}`);
  expect(portaled).toBeTruthy();
  expect(visible).toBeTruthy();
  await page.screenshot({ path: 'test-results/lightbox-390.png' });
});
