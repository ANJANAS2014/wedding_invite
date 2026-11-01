import { test } from '@playwright/test';

const WIDTHS = [320, 360, 375, 390, 414, 430, 768, 1024, 1440];

test('capture wishes wall at all widths', async ({ page }) => {
  test.setTimeout(120_000);
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto('/?to=Test+Guest');
    const openBtn = page.getByRole('button', { name: /open invitation/i });
    if (await openBtn.count()) {
      await openBtn.click();
      await page.waitForTimeout(2500); // curtain animation
    }
    await page.locator('#wishes').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `test-results/wishes-${w}.png`, fullPage: false });
    // overflow check
    const overflow = await page.evaluate(() =>
      [...document.querySelectorAll('*')].filter(
        (el) => el.scrollWidth > document.documentElement.clientWidth + 1 &&
          getComputedStyle(el).overflowX !== 'hidden' &&
          getComputedStyle(el).overflowX !== 'auto'
      ).map((el) => el.className).slice(0, 5)
    );
    console.log(`width ${w}: overflow elements: ${JSON.stringify(overflow)}`);
  }
});
