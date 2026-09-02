import { expect, test, type Page } from '@playwright/test';

const quotationId = '64b0000000000000000000ee';

async function login(page: Page, target: string) {
  await page.goto(target);
  await expect(page).toHaveURL(
    url => url.pathname === '/login' && url.searchParams.get('redirectTo') === target,
  );
  await page.waitForLoadState('networkidle');
  await page.getByLabel('ชื่อผู้ใช้').fill('cashier');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('e2e-password');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await expect(page).toHaveURL(url => `${url.pathname}${url.search}` === target);
}

test('creates, sends, approves, converts, retries idempotently, stays terminal, and prints a real quotation DOM', async ({
  page,
}) => {
  await login(page, '/home/quotations');

  const createResponse = await page.request.post('/api/backend/quotations', {
    data: {
      customerSnapshot: { customerName: 'ลูกค้า Quotation E2E' },
      items: [
        {
          productId: 'catalog-product-e2e-1',
          variantId: 'catalog-variant-e2e-1',
          productCode: 'E2E-QT-A4',
          typeCode: 'print',
          quantity: 1,
          unit: 'แผ่น',
        },
      ],
      validUntil: '2026-12-31',
      subject: 'งานพิมพ์ Quotation E2E',
    },
  });
  expect(createResponse.status()).toBe(201);
  const created = (await createResponse.json()) as {
    _id: string;
    version: number;
    status: string;
    quotationNumber?: string;
  };
  expect(created).toMatchObject({ _id: quotationId, version: 0, status: 'DRAFT' });
  expect(created.quotationNumber).toBeUndefined();

  const sendResponse = await page.request.post(
    `/api/backend/quotations/${quotationId}/send`,
    { data: { version: created.version } },
  );
  expect(sendResponse.ok()).toBe(true);

  await page.goto(`/home/quotations/${quotationId}`);
  await expect(page.getByText('QT-202609-0001', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('รอตอบรับ', { exact: true }).first()).toBeVisible();

  await page.getByRole('button', { name: 'บันทึกการอนุมัติ' }).click();
  const approvalDialog = page.getByRole('dialog').filter({ hasText: 'บันทึกการอนุมัติจากลูกค้า' });
  await expect(approvalDialog).toBeVisible();
  await approvalDialog.getByLabel('หมายเหตุการยืนยันจากลูกค้า').fill('ลูกค้ายืนยันทางโทรศัพท์');
  await approvalDialog.getByRole('button', { name: 'ยืนยัน' }).click();
  await expect(approvalDialog).toBeHidden();
  await expect(page.getByText('อนุมัติแล้ว', { exact: true }).first()).toBeVisible();

  await page.getByRole('button', { name: 'สร้าง Order จากใบเสนอราคา' }).click();
  const conversionDialog = page.getByRole('dialog').filter({ hasText: 'สร้าง Order จากใบเสนอราคา' });
  await expect(conversionDialog).toBeVisible();
  const conversionResponsePromise = page.waitForResponse(
    response =>
      response.request().method() === 'POST' &&
      response.url().includes(`/quotations/${quotationId}/convert-to-order`),
  );
  await conversionDialog.getByRole('button', { name: 'ยืนยันสร้าง Order' }).click();
  const conversionResponse = await conversionResponsePromise;
  expect(conversionResponse.ok()).toBe(true);
  const converted = (await conversionResponse.json()) as {
    quotation: { version: number; status: string; convertedOrderId?: string };
    order: { _id: string; quotationNumber?: string; quotationRevision?: number };
    replayed: boolean;
  };
  expect(converted.replayed).toBe(false);
  expect(converted.quotation.status).toBe('CONVERTED');
  expect(converted.quotation.convertedOrderId).toBe(converted.order._id);
  expect(converted.order).toMatchObject({
    quotationNumber: 'QT-202609-0001',
    quotationRevision: 0,
  });

  const retry = await page.request.post(
    `/api/backend/quotations/${quotationId}/convert-to-order`,
    {
      data: { version: converted.quotation.version },
      headers: { 'Idempotency-Key': 'quotation-e2e-retry' },
    },
  );
  expect(retry.ok()).toBe(true);
  const retried = (await retry.json()) as {
    order: { _id: string };
    replayed: boolean;
  };
  expect(retried.replayed).toBe(true);
  expect(retried.order._id).toBe(converted.order._id);

  const reviseAfterConversion = await page.request.post(
    `/api/backend/quotations/${quotationId}/revise`,
    { data: { version: converted.quotation.version, reason: 'must remain terminal' } },
  );
  expect(reviseAfterConversion.status()).toBe(400);

  await page.goto(`/print/quotation/${quotationId}`);
  await expect(page.getByText('ใบเสนอราคา', { exact: true })).toBeVisible();
  await expect(page.getByText('QT-202609-0001', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('ลูกค้า Quotation E2E', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('E2E Quotation Print', { exact: true }).first()).toBeVisible();

  const sheet = page.locator('.quotation-a4-sheet');
  await expect(sheet).toBeVisible();
  const screenBox = await sheet.boundingBox();
  expect(screenBox?.width ?? 0).toBeGreaterThan(0);
  expect(screenBox?.height ?? 0).toBeGreaterThan(0);

  await page.emulateMedia({ media: 'print' });
  await expect(sheet).toBeVisible();
  await expect(page.locator('.quotation-print-toolbar')).toBeHidden();
  const printDisplay = await sheet.evaluate(element => getComputedStyle(element).display);
  expect(printDisplay).not.toBe('none');
});

test('keeps the quotation list usable at a 360px mobile viewport without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await login(page, '/home/quotations');

  const createResponse = await page.request.post('/api/backend/quotations', {
    data: {
      customerSnapshot: { customerName: 'ลูกค้า Mobile Quotation E2E' },
      items: [
        {
          productId: 'catalog-product-e2e-1',
          variantId: 'catalog-variant-e2e-1',
          quantity: 1,
          unit: 'แผ่น',
        },
      ],
      validUntil: '2026-12-31',
    },
  });
  expect(createResponse.status()).toBe(201);
  await page.reload();

  await expect(page.getByText('ลูกค้า Mobile Quotation E2E', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'รายละเอียด' })).toBeVisible();
  const hasOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(hasOverflow).toBe(false);
});
