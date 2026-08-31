import { expect, test } from '@playwright/test';

const outputPath = 'test-results/artwork-poc/glossy-print-files-1080x1350.png';

test('renders the deterministic premium artwork at exactly 1080x1350', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 1500 });
  await page.goto('/artwork-poc');
  await page.evaluate(() => document.fonts.ready);

  const artwork = page.locator('[data-artwork-canvas="true"]');
  await expect(artwork).toBeVisible();
  await expect(artwork).toHaveAttribute('data-artwork-ready', 'true');
  await expect(artwork.locator('[data-visual-provider]')).toHaveAttribute('data-visual-provider', 'local-placeholder');

  const box = await artwork.boundingBox();
  expect(box?.width).toBe(1080);
  expect(box?.height).toBe(1350);
  await artwork.screenshot({ path: outputPath });
});

test('reflows the artwork for a 390px mobile viewport without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/artwork-poc');
  await page.evaluate(() => document.fonts.ready);

  const artwork = page.locator('[data-artwork-canvas="true"]');
  await expect(artwork).toBeVisible();

  const artworkBox = await artwork.boundingBox();
  expect(artworkBox?.width).toBeLessThanOrEqual(366);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  const columns = artwork.locator('section > div');
  await expect(columns).toHaveCount(2);
  const firstColumn = await columns.nth(0).boundingBox();
  const secondColumn = await columns.nth(1).boundingBox();
  expect(secondColumn?.y).toBeGreaterThan((firstColumn?.y ?? 0) + (firstColumn?.height ?? 0) - 1);
});
