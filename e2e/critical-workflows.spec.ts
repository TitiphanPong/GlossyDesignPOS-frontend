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

test('fails closed without leaking login credentials before hydration', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const requestedUrls: string[] = [];
  page.on('request', request => requestedUrls.push(request.url()));

  await page.goto(`${baseURL}/login?redirectTo=/home/quick-sale`);
  await page.getByLabel('ชื่อผู้ใช้').fill('pre-hydration-user');
  await page.locator('#login-password').fill('pre-hydration-secret');

  await page.locator('form').evaluate((form: HTMLFormElement) => form.submit());
  await page.waitForTimeout(500);

  expect(new URL(page.url()).pathname).toBe('/login');
  expect(page.url()).not.toContain('pre-hydration-user');
  expect(page.url()).not.toContain('pre-hydration-secret');
  expect(requestedUrls.every(url => !url.includes('pre-hydration-user') && !url.includes('pre-hydration-secret'))).toBe(true);

  await context.close();
});

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
  await paymentDialog.getByRole('button', { name: /โอนเงิน \/ PromptPay/ }).click();
  await expect(paymentDialog.getByText('Glossy E2E', { exact: true })).toBeVisible();
  await expect(paymentDialog.getByText('PromptPay ••••5678', { exact: true })).toBeVisible();
  await paymentDialog.getByRole('button', { name: /เงินสด/ }).click();
  await paymentDialog.getByRole('button', { name: 'พอดี' }).click();
  await paymentDialog.getByRole('button', { name: /ยืนยันการขาย/ }).click();

  await expect(page.getByRole('heading', { name: 'ขายสำเร็จ' })).toBeVisible();
  await expect(page.getByText('ORD-E2E-0001', { exact: true })).toBeVisible();
});

test('shows the same configured PromptPay profile on the customer display', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'pendingOrder',
      JSON.stringify({
        orderNumber: 'ORD-E2E-PROMPTPAY',
        customerName: 'E2E Customer',
        total: 100,
        grandTotal: 100,
        remainingTotal: 100,
        payment: 'promptpay',
        status: 'awaiting_payment',
        cart: [{ name: 'E2E Print', qty: 1, totalPrice: 100, fullPayment: true }],
      }),
    );
  });

  await page.goto('/customer');
  await expect(page.getByText('Glossy E2E', { exact: true })).toBeVisible();
  await expect(page.getByText('PromptPay ••••5678', { exact: true })).toBeVisible();
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
