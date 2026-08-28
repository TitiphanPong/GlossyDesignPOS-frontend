import { expect, test, type Page } from '@playwright/test';

async function loginAsCashier(page: Page, target = '/home/quick-sale') {
  await page.goto(target);
  await expect(page).toHaveURL(url => url.pathname === '/login' && url.searchParams.get('redirectTo') === target);
  await page.waitForLoadState('networkidle');
  await page.getByLabel('ชื่อผู้ใช้').fill('cashier');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('e2e-password');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await expect(page).toHaveURL(url => `${url.pathname}${url.search}` === target);
}

test('protects cashier routes and restores the requested route after login', async ({ page }) => {
  await loginAsCashier(page);
  await expect(page.getByText('Quick Sale', { exact: true }).first()).toBeVisible();
});

test('completes a cashier quick-sale checkout against controlled test data', async ({ page }) => {
  await loginAsCashier(page);

  await expect(page.getByRole('button', { name: /E2E A4 Print/ })).toBeVisible();
  await page.getByRole('button', { name: /E2E A4 Print/ }).click();
  await page.getByRole('button', { name: /ชำระเงิน/ }).click();

  const paymentDialog = page.getByRole('dialog').filter({ hasText: 'ดำเนินการรับชำระรายการขายหน้าร้าน' });
  await expect(paymentDialog).toBeVisible();
  await paymentDialog.getByRole('button', { name: 'พอดี' }).click();
  await paymentDialog.getByRole('button', { name: /ยืนยันการขาย/ }).click();

  await expect(page.getByRole('heading', { name: 'ขายสำเร็จ' })).toBeVisible();
  await expect(page.getByText('ORD-E2E-0001', { exact: true })).toBeVisible();
});

test('keeps anonymous upload public and sends a multipart file through the BFF', async ({ page }) => {
  await page.goto('/upload');

  await expect(page).toHaveURL(/\/upload$/);
  await expect(page.getByText('Glossy Design', { exact: true }).first()).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles({
    name: 'smoke.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n% Glossy E2E smoke\n'),
  });

  await page.getByRole('button', { name: /^ส่งไฟล์$/ }).click();
  await expect(page.getByRole('heading', { name: 'ส่งไฟล์สำเร็จ!' })).toBeVisible();
  await expect(page.getByText('อัปโหลดสำเร็จ 1 ไฟล์')).toBeVisible();
});
