import { expect, test, type Page } from '@playwright/test';

const reportTarget = '/home/reports/tax-invoices';

async function loginForReport(page: Page) {
  await page.goto(`/login?redirectTo=${encodeURIComponent(reportTarget)}`);
  await page.getByLabel('ชื่อผู้ใช้').fill('cashier');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('e2e-password');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await expect(page).toHaveURL(url => url.pathname === reportTarget);
}

test('defaults to previous Bangkok month, changes period, and downloads the whole selected month', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-09-06T10:00:00.000Z'));
  await loginForReport(page);

  await expect(page.getByText('ใบกำกับภาษีรายเดือน', { exact: true }).last()).toBeVisible();
  await expect(page.getByText('งวดรายงาน สิงหาคม 2569')).toBeVisible();
  await expect(page.getByText('อัปเดตล่าสุด 06/09/2026 23:00', { exact: true })).toBeVisible();
  await expect(page.getByText('วันอาทิตย์ที่ 6 กันยายน พ.ศ. 2569', { exact: true })).toBeVisible();
  await expect(page.getByText('INV-202608-001-001').filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByText('INV-202607-001-099').filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'สาขา', exact: true })).toHaveCount(0);
  await expect(page.getByText(/ปุ่มดาวน์โหลดทุกปุ่มส่งออก/)).toContainText('ทั้งเดือนที่เลือก');

  const search = page.getByPlaceholder('ค้นหาเลขใบกำกับ เลขที่งาน ลูกค้า หรือเลขผู้เสียภาษี');
  await search.fill('ไม่มีรายการนี้');
  await expect(page.getByText('ไม่พบเอกสารที่ตรงกับคำค้น').filter({ visible: true }).first()).toBeVisible();

  const excelDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'ดาวน์โหลด Excel' }).click();
  const excel = await excelDownload;
  expect(excel.suggestedFilename()).toContain('202608');

  await page.getByRole('button', { name: 'ล้างคำค้นหา', exact: true }).click();
  await expect(search).toHaveValue('');
  await page.getByRole('combobox', { name: 'เดือน', exact: true }).click();
  await page.getByRole('option', { name: 'กันยายน' }).click();
  await expect(page.getByText('งวดรายงาน กันยายน 2569')).toBeVisible();
  await expect(page.getByText('INV-202609-001-001').filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByText('ไม่พบการยกเลิกใบกำกับจากงวดก่อน').filter({ visible: true }).first()).toBeVisible();

  const summaryDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'ดาวน์โหลด PDF สรุป' }).click();
  const summary = await summaryDownload;
  expect(summary.suggestedFilename()).toContain('202609');

  await page.getByRole('button', { name: 'ดาวน์โหลดใบกำกับทั้งเดือน' }).click();
  const invoiceFormatDialog = page.getByRole('dialog', { name: 'เลือกรูปแบบใบกำกับภาษี' });
  await expect(invoiceFormatDialog).toBeVisible();
  await expect(invoiceFormatDialog.getByRole('radio', { name: /แบบใหม่ — A4 เต็มหน้า/ })).toBeChecked();

  const invoicesDownload = page.waitForEvent('download');
  await invoiceFormatDialog.getByRole('button', { name: 'ดาวน์โหลดทั้งเดือน' }).click();
  const invoices = await invoicesDownload;
  expect(invoices.suggestedFilename()).toContain('202609');

  await page.getByRole('button', { name: 'ดาวน์โหลดใบกำกับทั้งเดือน' }).click();
  await expect(invoiceFormatDialog).toBeVisible();
  await invoiceFormatDialog.getByRole('radio', { name: /แบบเก่า — สำเนา \/ ต้นฉบับ/ }).check();

  const legacyInvoicesDownload = page.waitForEvent('download');
  await invoiceFormatDialog.getByRole('button', { name: 'ดาวน์โหลดทั้งเดือน' }).click();
  const legacyInvoices = await legacyInvoicesDownload;
  expect(legacyInvoices.suggestedFilename()).toContain('2026-09');
  expect(legacyInvoices.suggestedFilename()).toContain('legacy');
});

for (const width of [360, 1024, 1600]) {
  test(`keeps report controls accessible and order numbers on one line at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.clock.setFixedTime(new Date('2026-09-06T10:00:00.000Z'));
    await loginForReport(page);
    await expect(page.getByText('INV-202608-001-001').filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'เดือน', exact: true })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'ปี พ.ศ.', exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'ค้นหาเลขใบกำกับ เลขที่งาน ลูกค้า หรือเลขผู้เสียภาษี' })).toBeVisible();

    for (const table of await page.getByRole('table').all()) {
      const headers = await table.getByRole('columnheader').allTextContents();
      const orderIndex = headers.indexOf('เลขที่งาน');
      expect(orderIndex).toBeGreaterThanOrEqual(0);
      const orderCell = table.locator('tbody tr').first().getByRole('cell').nth(orderIndex);
      await expect(orderCell.locator('p')).toHaveCSS('white-space', 'nowrap');
      const fits = await orderCell.locator('p').evaluate(element => element.scrollWidth <= element.clientWidth);
      expect(fits).toBe(true);
    }

    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`tax-report-${width}.png`), fullPage: true });
  });
}

test('requires authentication for report page and backend report data', async ({ page, request }) => {
  const response = await request.get('/api/backend/reports/tax-invoices?period=202608');
  expect(response.status()).toBe(401);

  await page.goto(reportTarget);
  await expect(page).toHaveURL(url => url.pathname === '/login' && url.searchParams.get('redirectTo') === reportTarget);
});
