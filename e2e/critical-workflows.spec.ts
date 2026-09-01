import { expect, test, type Page } from '@playwright/test';

async function loginAsCashier(page: Page, target = '/home/quick-sale') {
  const sessionCheck = page.waitForResponse(
    response => response.url().endsWith('/api/admin/session') && response.request().method() === 'GET'
  );
  await page.goto(target);
  await expect(page).toHaveURL(url => url.pathname === '/login' && url.searchParams.get('redirectTo') === target);
  await sessionCheck;
  await page.getByLabel('ชื่อผู้ใช้').fill('cashier');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('e2e-password');
  const loginResponse = page.waitForResponse(
    response => response.url().endsWith('/api/admin/session') && response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  expect((await loginResponse).status()).toBe(200);
  await expect(page).toHaveURL(url => `${url.pathname}${url.search}` === target, { timeout: 30_000 });
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

test('opens Quick Sale V2 through a service family and uses an explicit published mapping', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAsCashier(page, '/home/quick-sale-v2');

  await expect(page.getByText('Quick Sale V2 · ทดลอง', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'รายการอื่น / กำหนดราคาเอง' })).toHaveCount(0);
  await page.getByRole('button', { name: /งานเอกสาร/ }).click();

  const configurator = page.getByRole('dialog').filter({ hasText: 'เลือกตัวเลือกให้ครบแล้วกดเพิ่มลงรายการหนึ่งครั้ง' });
  await expect(configurator).toBeVisible();
  await expect(configurator.getByText('E2E A4 Print', { exact: true })).toBeVisible();
  await expect(configurator.getByText('฿25.00 / ชิ้น', { exact: true })).toBeVisible();

  await configurator.getByText('Copy', { exact: true }).click();
  await configurator.getByText('A3', { exact: true }).click();
  await expect(configurator.getByText('ตัวเลือกนี้ยังไม่ได้ผูก SKU ใน Settings V2 จึงยังเพิ่มลงรายการไม่ได้', { exact: true })).toBeVisible();
  await expect(configurator.getByRole('button', { name: /เพิ่มลงรายการ/ })).toBeDisabled();
  await configurator.getByText('A4', { exact: true }).click();
  await expect(configurator.getByText('E2E A4 Copy', { exact: true })).toBeVisible();
  await configurator.getByText('Print', { exact: true }).click();
  await expect(configurator.getByText('E2E A4 Print', { exact: true })).toBeVisible();
  await expect(configurator.getByRole('button', { name: /เพิ่มลงรายการ/ })).toBeEnabled();
  await configurator.getByRole('button', { name: /เพิ่มลงรายการ/ }).click();

  await expect(configurator).toBeHidden();
  await expect(page.getByRole('button', { name: /ชำระเงิน/ })).toBeEnabled();

  await page.getByRole('button', { name: 'แก้ไข E2E A4 Print' }).click();
  await expect(configurator).toBeVisible();
  await expect(configurator.getByText('PRINT · A4 · ขาวดำ · 1 ชิ้น', { exact: true })).toBeVisible();
  await configurator.getByRole('button', { name: '5', exact: true }).click();
  await expect(configurator.getByText('฿125.00', { exact: true })).toBeVisible();
  await configurator.getByRole('button', { name: /เพิ่มลงรายการ/ }).click();

  await expect(configurator).toBeHidden();
  await expect(page.getByRole('spinbutton', { name: 'จำนวน E2E A4 Print' })).toHaveValue('5');

  await page.getByRole('button', { name: /งานเอกสาร/ }).click();
  await expect(configurator).toBeVisible();
  await configurator.getByText('Copy', { exact: true }).click();
  await expect(configurator.getByText('E2E A4 Copy', { exact: true })).toBeVisible();
  await expect(configurator.getByText('฿15.00 / ชิ้น', { exact: true })).toBeVisible();
  await configurator.getByRole('button', { name: /เพิ่มลงรายการ/ }).click();

  await expect(configurator).toBeHidden();
  await expect(page.getByRole('spinbutton', { name: 'จำนวน E2E A4 Print' })).toHaveValue('5');
  await expect(page.getByRole('spinbutton', { name: 'จำนวน E2E A4 Copy' })).toHaveValue('1');

  await page.getByRole('button', { name: /ชำระเงิน/ }).click();
  const paymentDialog = page.getByRole('dialog').filter({ hasText: 'ดำเนินการรับชำระรายการขายหน้าร้าน' });
  await expect(paymentDialog).toBeVisible();
  await paymentDialog.getByRole('button', { name: /โอนเงิน \/ PromptPay/ }).click();
  await expect(paymentDialog.getByText('Glossy E2E', { exact: true })).toBeVisible();
  await expect(paymentDialog.getByText('PromptPay ••••5678', { exact: true })).toBeVisible();
  await paymentDialog.getByRole('button', { name: /ยืนยันว่าชำระเงินแล้ว/ }).click();

  await expect(page.getByRole('heading', { name: 'ขายสำเร็จ' })).toBeVisible();
  await expect(page.getByText('ORD-E2E-0001', { exact: true })).toBeVisible();

  const orderResponse = await page.request.get('/api/backend/e2e/last-order');
  expect(orderResponse.ok()).toBe(true);
  const orderPayload = await orderResponse.json();
  expect(orderPayload).toMatchObject({
    cart: [
      { quickProductId: 'product-e2e-1', quantity: 5 },
      { quickProductId: 'product-e2e-2', quantity: 1 },
    ],
    initialPayment: {
      method: 'promptpay',
      amount: 140,
      receivedAmount: 140,
    },
  });
});

test('keeps Quick Sale V2 Scan on its explicit published mapping through checkout', async ({ page }) => {
  await loginAsCashier(page, '/home/quick-sale-v2');

  await page.getByRole('button', { name: /งานเอกสาร/ }).click();
  const configurator = page.getByRole('dialog').filter({ hasText: 'เลือกตัวเลือกให้ครบแล้วกดเพิ่มลงรายการหนึ่งครั้ง' });
  await configurator.getByText('Scan', { exact: true }).click();
  await expect(configurator.getByText('E2E A4 Scan', { exact: true })).toBeVisible();
  await expect(configurator.getByText('฿8.00 / ชิ้น', { exact: true })).toBeVisible();
  await expect(configurator.getByText('SCAN · A4 · ขาวดำ · 1 ชิ้น', { exact: true })).toBeVisible();
  await configurator.getByRole('button', { name: /เพิ่มลงรายการ/ }).click();
  await expect(configurator).toBeHidden();
  await expect(page.getByRole('spinbutton', { name: 'จำนวน E2E A4 Scan' })).toHaveValue('1');

  await page.getByRole('button', { name: /ชำระเงิน/ }).click();
  const paymentDialog = page.getByRole('dialog').filter({ hasText: 'ดำเนินการรับชำระรายการขายหน้าร้าน' });
  await paymentDialog.getByRole('button', { name: 'พอดี' }).click();
  await paymentDialog.getByRole('button', { name: /ยืนยันการขาย/ }).click();
  await expect(page.getByRole('heading', { name: 'ขายสำเร็จ' })).toBeVisible();

  const orderResponse = await page.request.get('/api/backend/e2e/last-order');
  expect(orderResponse.ok()).toBe(true);
  const orderPayload = await orderResponse.json();
  expect(orderPayload).toMatchObject({
    cart: [{ quickProductId: 'product-e2e-a4-scan', quantity: 1 }],
    initialPayment: {
      method: 'cash',
      amount: 8,
      receivedAmount: 8,
    },
  });
});

test('removes a configured Quick Sale V2 item from cart before checkout', async ({ page }) => {
  await loginAsCashier(page, '/home/quick-sale-v2');

  await page.getByRole('button', { name: /งานเอกสาร/ }).click();
  const configurator = page.getByRole('dialog').filter({ hasText: 'เลือกตัวเลือกให้ครบแล้วกดเพิ่มลงรายการหนึ่งครั้ง' });
  await expect(configurator.getByText('E2E A4 Print', { exact: true })).toBeVisible();
  await configurator.getByRole('button', { name: /เพิ่มลงรายการ/ }).click();
  await expect(configurator).toBeHidden();

  const checkoutButton = page.getByRole('button', { name: /ชำระเงิน/ });
  await expect(page.getByRole('spinbutton', { name: 'จำนวน E2E A4 Print' })).toHaveValue('1');
  await expect(checkoutButton).toBeEnabled();

  await page.getByRole('button', { name: 'ลบ E2E A4 Print' }).click();
  await expect(page.getByRole('spinbutton', { name: 'จำนวน E2E A4 Print' })).toHaveCount(0);
  await expect(checkoutButton).toBeDisabled();
});

test('keeps Quick Sale V2 A4/A3 color and quantity presets on explicit SKU mappings', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAsCashier(page, '/home/quick-sale-v2');

  await page.getByRole('button', { name: /งานเอกสาร/ }).click();
  const configurator = page.getByRole('dialog').filter({ hasText: 'เลือกตัวเลือกให้ครบแล้วกดเพิ่มลงรายการหนึ่งครั้ง' });
  await expect(configurator).toBeVisible();
  await configurator.getByText('สี', { exact: true }).click();
  await expect(configurator.getByText('E2E A4 Color', { exact: true })).toBeVisible();
  await configurator.getByRole('button', { name: '50', exact: true }).click();
  await expect(configurator.getByText('PRINT · A4 · สี · 50 ชิ้น', { exact: true })).toBeVisible();
  await expect(configurator.getByText('฿600.00', { exact: true })).toBeVisible();
  await configurator.getByRole('button', { name: /เพิ่มลงรายการ/ }).click();
  await expect(configurator).toBeHidden();
  await expect(page.getByRole('spinbutton', { name: 'จำนวน E2E A4 Color' })).toHaveValue('50');

  await page.getByRole('button', { name: /งานเอกสาร/ }).click();
  await expect(configurator).toBeVisible();
  await configurator.getByText('A3', { exact: true }).click();
  await configurator.getByText('สี', { exact: true }).click();
  await expect(configurator.getByText('E2E A3 Color', { exact: true })).toBeVisible();
  await expect(configurator.getByText('PRINT · A3 · สี · 1 ชิ้น', { exact: true })).toBeVisible();
  await expect(configurator.getByText('฿25.00', { exact: true })).toBeVisible();
  await configurator.getByRole('button', { name: /เพิ่มลงรายการ/ }).click();
  await expect(configurator).toBeHidden();

  await page.getByRole('button', { name: /ชำระเงิน/ }).click();
  const paymentDialog = page.getByRole('dialog').filter({ hasText: 'ดำเนินการรับชำระรายการขายหน้าร้าน' });
  await paymentDialog.getByRole('button', { name: /โอนเงิน \/ PromptPay/ }).click();
  await paymentDialog.getByRole('button', { name: /ยืนยันว่าชำระเงินแล้ว/ }).click();
  await expect(page.getByRole('heading', { name: 'ขายสำเร็จ' })).toBeVisible();

  const orderResponse = await page.request.get('/api/backend/e2e/last-order');
  expect(orderResponse.ok()).toBe(true);
  const orderPayload = await orderResponse.json();
  expect(orderPayload).toMatchObject({
    cart: [
      { quickProductId: 'product-e2e-a4-color', quantity: 50 },
      { quickProductId: 'product-e2e-a3-color', quantity: 1 },
    ],
    initialPayment: {
      method: 'promptpay',
      amount: 625,
      receivedAmount: 625,
    },
  });
});

test('keeps Quick Sale V2 tax-invoice checkout on the shared authoritative VAT contract', async ({ page }) => {
  await loginAsCashier(page, '/home/quick-sale-v2');

  await page.getByRole('button', { name: /งานเอกสาร/ }).click();
  const configurator = page.getByRole('dialog').filter({ hasText: 'เลือกตัวเลือกให้ครบแล้วกดเพิ่มลงรายการหนึ่งครั้ง' });
  await configurator.getByRole('button', { name: /เพิ่มลงรายการ/ }).click();
  await expect(configurator).toBeHidden();

  await page.getByRole('button', { name: /ชำระเงิน/ }).click();
  const paymentDialog = page.getByRole('dialog').filter({ hasText: 'ดำเนินการรับชำระรายการขายหน้าร้าน' });
  await expect(paymentDialog).toBeVisible();

  const customerSearch = paymentDialog.getByLabel('ค้นหาลูกค้าเดิม');
  await customerSearch.fill('บริษัท E2E');
  await page.getByRole('option', { name: /บริษัท E2E จำกัด/ }).click();
  await paymentDialog.getByRole('button', { name: /ใบกำกับภาษี/ }).click();
  await expect(paymentDialog.getByText('VAT 7%', { exact: true })).toBeVisible();
  await paymentDialog.getByRole('button', { name: 'พอดี' }).click();
  await paymentDialog.getByRole('button', { name: /ยืนยันการขาย/ }).click();

  await expect(page.getByRole('heading', { name: 'ขายสำเร็จ' })).toBeVisible();

  const orderResponse = await page.request.get('/api/backend/e2e/last-order');
  expect(orderResponse.ok()).toBe(true);
  const orderPayload = await orderResponse.json();
  expect(orderPayload).toMatchObject({
    customerId: '64b0000000000000000000cc',
    taxId: '0105555555555',
    address: '99 ถนนสุขุมวิท กรุงเทพฯ',
    taxInvoice: 'yes',
    cart: [{ quickProductId: 'product-e2e-1', quantity: 1 }],
    initialPayment: {
      method: 'cash',
      amount: 26.75,
      receivedAmount: 26.75,
    },
  });
});

test('keeps Quick Sale V2 backdated checkout on the shared sale-date audit contract', async ({ page }) => {
  test.setTimeout(60_000);
  await loginAsCashier(page, '/home/quick-sale-v2');

  await page.getByRole('button', { name: /งานเอกสาร/ }).click();
  const configurator = page.getByRole('dialog').filter({ hasText: 'เลือกตัวเลือกให้ครบแล้วกดเพิ่มลงรายการหนึ่งครั้ง' });
  await expect(configurator.getByText('E2E A4 Print', { exact: true })).toBeVisible();
  await expect(configurator.getByRole('button', { name: /เพิ่มลงรายการ/ })).toBeEnabled();
  await configurator.getByRole('button', { name: /เพิ่มลงรายการ/ }).click();
  await expect(configurator).toBeHidden();

  await page.getByRole('button', { name: /ชำระเงิน/ }).click();
  const paymentDialog = page.getByRole('dialog').filter({ hasText: 'ดำเนินการรับชำระรายการขายหน้าร้าน' });
  await expect(paymentDialog).toBeVisible();
  await paymentDialog.getByRole('button', { name: 'ลงรายการย้อนหลัง' }).click();
  await expect(paymentDialog.getByText('รายละเอียดการขายย้อนหลัง', { exact: true })).toBeVisible();

  const backdatedAt = new Date();
  backdatedAt.setDate(backdatedAt.getDate() - 1);
  const pad = (value: number) => String(value).padStart(2, '0');
  const backdatedInput = `${pad(backdatedAt.getDate())}/${pad(backdatedAt.getMonth() + 1)}/${backdatedAt.getFullYear()} 10:00`;
  await paymentDialog.getByRole('group', { name: 'วันที่และเวลาที่เกิดการขาย' }).locator('input').fill(backdatedInput, { force: true });
  await paymentDialog.getByLabel('เหตุผลที่ลงรายการย้อนหลัง').fill('รายการขายตกหล่น E2E');
  await paymentDialog.getByRole('button', { name: 'พอดี' }).click();
  await paymentDialog.getByRole('button', { name: /ยืนยันการขาย/ }).click();

  await expect(page.getByRole('heading', { name: 'ขายสำเร็จ' })).toBeVisible();

  const orderResponse = await page.request.get('/api/backend/e2e/last-order');
  expect(orderResponse.ok()).toBe(true);
  const orderPayload = await orderResponse.json();
  expect(orderPayload).toMatchObject({
    entryMode: 'backdated',
    backdatedReason: 'รายการขายตกหล่น E2E',
    cart: [{ quickProductId: 'product-e2e-1', quantity: 1 }],
    initialPayment: {
      method: 'cash',
      amount: 25,
      receivedAmount: 25,
    },
  });
  expect(typeof orderPayload.saleDate).toBe('string');
  expect(Number.isNaN(Date.parse(orderPayload.saleDate))).toBe(false);
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

test('links an existing customer to quick sale and mirrors the same snapshot to customer display', async ({ page }) => {
  await loginAsCashier(page);

  await page.getByRole('button', { name: /E2E A4 Print/ }).click();
  await page.getByRole('button', { name: /ชำระเงิน/ }).click();

  const paymentDialog = page.getByRole('dialog').filter({ hasText: 'ดำเนินการรับชำระรายการขายหน้าร้าน' });
  const customerSearch = paymentDialog.getByLabel('ค้นหาลูกค้าเดิม');
  await customerSearch.fill('บริษัท E2E');
  await page.getByRole('option', { name: /บริษัท E2E จำกัด/ }).click();
  await expect(paymentDialog.getByText('บริษัท E2E จำกัด', { exact: true }).first()).toBeVisible();

  await expect
    .poll(() =>
      page.evaluate(() => {
        const raw = localStorage.getItem('pendingOrder');
        return raw ? (JSON.parse(raw) as { customerId?: string }).customerId : undefined;
      })
    )
    .toBe('64b0000000000000000000cc');

  const pendingSnapshot = await page.evaluate(() => JSON.parse(localStorage.getItem('pendingOrder') || '{}'));
  expect(pendingSnapshot).toMatchObject({
    customerId: '64b0000000000000000000cc',
    customerName: 'บริษัท E2E จำกัด',
    phoneNumber: '0812345678',
    taxId: '0105555555555',
    address: '99 ถนนสุขุมวิท กรุงเทพฯ',
  });

  await paymentDialog.getByRole('button', { name: 'พอดี' }).click();
  await paymentDialog.getByRole('button', { name: /ยืนยันการขาย/ }).click();
  await expect(page.getByRole('heading', { name: 'ขายสำเร็จ' })).toBeVisible();

  const orderResponse = await page.request.get('/api/backend/e2e/last-order');
  expect(orderResponse.ok()).toBe(true);
  const orderPayload = await orderResponse.json();
  expect(orderPayload).toMatchObject({
    customerId: '64b0000000000000000000cc',
    customerName: 'บริษัท E2E จำกัด',
    phoneNumber: '0812345678',
    taxId: '0105555555555',
    address: '99 ถนนสุขุมวิท กรุงเทพฯ',
  });
});

test('creates a customer from quick sale and auto-selects the new profile', async ({ page }) => {
  await loginAsCashier(page);

  await page.getByRole('button', { name: /E2E A4 Print/ }).click();
  await page.getByRole('button', { name: /ชำระเงิน/ }).click();

  const paymentDialog = page.getByRole('dialog').filter({ hasText: 'ดำเนินการรับชำระรายการขายหน้าร้าน' });
  await paymentDialog.getByRole('button', { name: 'เพิ่มลูกค้าใหม่' }).click();

  const createDialog = page.getByRole('dialog').filter({ hasText: 'บันทึกโปรไฟล์สำหรับใช้ซ้ำตอนขายครั้งถัดไป' });
  await expect(createDialog).toBeVisible();
  await createDialog.getByLabel('ชื่อลูกค้า').fill('ลูกค้าใหม่ E2E');
  await createDialog.getByRole('textbox', { name: 'เบอร์โทรศัพท์หลัก', exact: true }).fill('0899999999');
  await createDialog.getByLabel('เลขประจำตัวผู้เสียภาษี').fill('0105666666666');
  await createDialog.getByRole('textbox', { name: 'ที่อยู่', exact: true }).fill('88 ถนนพระราม 9 กรุงเทพฯ');
  await createDialog.getByRole('button', { name: 'บันทึกลูกค้า' }).click();

  await expect(createDialog).toBeHidden();
  await expect(paymentDialog.getByText('ลูกค้าใหม่ E2E', { exact: true }).first()).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const raw = localStorage.getItem('pendingOrder');
        return raw ? (JSON.parse(raw) as { customerId?: string }).customerId : undefined;
      })
    )
    .toBe('64b0000000000000000000dd');
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

test('advances a normal production job through legal stages to ready', async ({ page }) => {
  await loginAsCashier(page, '/home/production');

  await expect(page.getByText('Production Board', { exact: true })).toBeVisible();
  await expect(page.getByText('PJ-20260829-E2E00001', { exact: true })).toBeVisible();
  await expect(page.getByText('พิมพ์นามบัตร E2E 100 ใบ', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'ไปขั้น คิว' }).click();
  await expect(page.getByRole('button', { name: 'ไปขั้น ผลิต' })).toBeVisible();
  await page.getByRole('button', { name: 'ไปขั้น ผลิต' }).click();
  await expect(page.getByRole('button', { name: 'ไปขั้น QC' })).toBeVisible();
  await page.getByRole('button', { name: 'ไปขั้น QC' }).click();
  await expect(page.getByRole('button', { name: 'ไปขั้น พร้อม' })).toBeVisible();
  await page.getByRole('button', { name: 'ไปขั้น พร้อม' }).click();

  await expect(page.getByText('พร้อมส่งมอบ', { exact: true }).first()).toBeVisible();
  await page.getByText('PJ-20260829-E2E00001', { exact: true }).click();
  await expect(page.getByText('Job Ticket', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'เปิด Order หลัก' })).toBeVisible();
});

test('creates a production job from an existing Order and opens its Job Ticket', async ({ page }) => {
  await loginAsCashier(page, '/home/production');

  await page.getByRole('button', { name: 'สร้าง Production Job' }).click();
  const dialog = page.getByRole('dialog').filter({ hasText: 'สร้าง Production Job' });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('ค้นหา Order').fill('ORD-E2E');
  await dialog.getByRole('button', { name: 'ค้นหา' }).click();
  await dialog.getByRole('combobox', { name: /^Order/ }).click();
  await page.getByRole('option', { name: /ORD-E2E-0001/ }).click();
  await dialog.getByLabel('รายละเอียดงานผลิต').fill('ผลิตสติ๊กเกอร์ E2E');
  await dialog.getByLabel('ความเร่งด่วน').click();
  await page.getByRole('option', { name: 'Rush' }).click();
  await dialog.getByRole('button', { name: 'สร้าง Job' }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText('PJ-20260830-E2ECREATE', { exact: true })).toBeVisible();
  await expect(page.getByText('Job Ticket', { exact: true })).toBeVisible();
  await expect(page.getByText('ผลิตสติ๊กเกอร์ E2E', { exact: true }).first()).toBeVisible();
});

test('loads Production Board results beyond the first 50 rows without hiding the total', async ({ page }) => {
  await loginAsCashier(page, '/home/production');

  const search = page.getByPlaceholder('ค้นหาเลข Job, Order, ชื่อลูกค้า หรืองาน');
  await search.fill('PAGING-E2E');
  await expect(page.getByText('แสดง 50 จาก 51 งานที่ตรงตัวกรอง', { exact: true })).toBeVisible();
  const loadMore = page.getByRole('button', { name: 'โหลดเพิ่ม (50/51)' });
  await expect(loadMore).toBeVisible();
  await loadMore.click();

  await expect(page.getByText('PJ-PAGING-051', { exact: true })).toBeVisible();
  await expect(page.getByText('แสดง 51 จาก 51 งานที่ตรงตัวกรอง', { exact: true })).toBeVisible();
  await expect(loadMore).toBeHidden();
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
