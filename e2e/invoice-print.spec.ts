import { expect, test, type Page } from '@playwright/test';

const printTarget = '/print/invoice/order-e2e-1?documentType=tax-invoice';

async function loginForInvoice(page: Page) {
  await page.goto(`/login?redirectTo=${encodeURIComponent(printTarget)}`);
  await expect(page).toHaveURL(url => url.pathname === '/login' && url.searchParams.get('redirectTo') === printTarget);
  await page.getByLabel('ชื่อผู้ใช้').fill('cashier');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('e2e-password');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await expect(page).toHaveURL(url => `${url.pathname}${url.search}` === printTarget);
}

test('renders the tax invoice content on the default A4 landscape print page', async ({ page }, testInfo) => {
  await loginForInvoice(page);

  const documentSheet = page.locator('.invoice-document-sheet');
  await expect(documentSheet).toBeVisible();
  await expect(documentSheet.getByText('ลูกค้า Invoice E2E').first()).toBeVisible();

  await page.emulateMedia({ media: 'print' });

  await expect(page.locator('.print-toolbar')).toBeHidden();
  await expect(page.locator('.print-document-stage')).toHaveCSS('display', 'flex');
  await expect(documentSheet).toBeVisible();

  const pdf = await page.pdf({
    preferCSSPageSize: true,
    printBackground: true,
  });
  expect(pdf.byteLength).toBeGreaterThan(20_000);
  await testInfo.attach('invoice-a4-landscape.pdf', {
    body: pdf,
    contentType: 'application/pdf',
  });
});
