import { expect, test, type Page } from '@playwright/test';

const artworkPath = '/artwork-poc';
const outputPath = 'test-results/artwork-poc/glossy-print-files-1080x1350.png';

async function loginForArtwork(page: Page) {
  await page.goto(artworkPath);
  await expect(page).toHaveURL(url => url.pathname === '/login' && url.searchParams.get('redirectTo') === artworkPath);
  await page.getByLabel('ชื่อผู้ใช้').fill('cashier');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('e2e-password');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await expect(page).toHaveURL(url => url.pathname === artworkPath);
}

test('redirects anonymous Artwork POC access through the admin login boundary', async ({ page }) => {
  await page.goto(artworkPath);
  await expect(page).toHaveURL(url => url.pathname === '/login' && url.searchParams.get('redirectTo') === artworkPath);
  await expect(page.locator('[data-artwork-canvas="true"]')).toHaveCount(0);
});

test('renders the deterministic premium artwork at exactly 1080x1350', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 1500 });
  await loginForArtwork(page);
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
  await loginForArtwork(page);
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
