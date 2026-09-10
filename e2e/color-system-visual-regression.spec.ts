import { expect, test, type Page, type TestInfo } from '@playwright/test';

const LIGHT_TOKEN_EXPECTATIONS = {
  '--glossy-brand-ink': '#111318',
  '--glossy-brand-paper': '#F7F4ED',
  '--glossy-brand-cyan': '#00A9CE',
  '--glossy-action-primary': '#007F96',
  '--glossy-surface-page': '#FBFAF6',
  '--glossy-text-primary': '#111318',
} as const;

const DISPLAY_TOKEN_EXPECTATIONS = {
  '--glossy-display-shell': '#111318',
  '--glossy-display-shell-deep': '#080A0D',
  '--glossy-display-text-primary': '#FFFFFF',
  '--glossy-display-cyan': '#00A9CE',
  '--glossy-display-success': '#67D391',
} as const;

async function loginAsCashier(page: Page, target = '/home') {
  const sessionCheck = page.waitForResponse(
    response =>
      response.url().endsWith('/api/admin/session') &&
      response.request().method() === 'GET',
  );

  await page.goto(target);
  await expect(page).toHaveURL(
    url => url.pathname === '/login' && url.searchParams.get('redirectTo') === target,
  );
  await sessionCheck;

  await page.getByLabel('ชื่อผู้ใช้').fill('cashier');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('e2e-password');

  const loginResponse = page.waitForResponse(
    response =>
      response.url().endsWith('/api/admin/session') &&
      response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  expect((await loginResponse).status()).toBe(200);
  await expect(page).toHaveURL(
    url => `${url.pathname}${url.search}` === target,
    { timeout: 30_000 },
  );
}

async function expectCssVariables(
  page: Page,
  expectations: Readonly<Record<string, string>>,
) {
  const actual = await page.evaluate(variableNames => {
    const style = getComputedStyle(document.documentElement);
    return Object.fromEntries(
      variableNames.map(name => [name, style.getPropertyValue(name).trim()]),
    );
  }, Object.keys(expectations));

  expect(actual).toEqual(expectations);
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

async function capture(page: Page, testInfo: TestInfo, name: string) {
  const path = testInfo.outputPath(`${name}.png`);
  await page.screenshot({ path, fullPage: true, animations: 'disabled' });
  await testInfo.attach(name, { path, contentType: 'image/png' });
}

test.describe('P2-41 representative color-system visual regression', () => {
  test.setTimeout(90_000);
  test('public light surfaces keep the approved Glossy tokens and responsive canvas', async ({ page }, testInfo) => {
    const surfaces = [
      { path: '/landing', name: 'landing' },
      { path: '/login', name: 'login' },
      { path: '/upload', name: 'upload' },
    ];

    await page.setViewportSize({ width: 1440, height: 1000 });
    for (const surface of surfaces) {
      await page.goto(surface.path);
      await expect(page.locator('body')).toBeVisible();
      await expectCssVariables(page, LIGHT_TOKEN_EXPECTATIONS);
      await expectNoHorizontalOverflow(page);
      await capture(page, testInfo, `${surface.name}-desktop`);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    for (const surface of surfaces) {
      await page.goto(surface.path);
      await expect(page.locator('body')).toBeVisible();
      await expectCssVariables(page, LIGHT_TOKEN_EXPECTATIONS);
      await expectNoHorizontalOverflow(page);
      await capture(page, testInfo, `${surface.name}-mobile`);
    }
  });

  test('authenticated application surfaces retain one semantic color identity without horizontal overflow', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await loginAsCashier(page, '/home');
    await expectCssVariables(page, LIGHT_TOKEN_EXPECTATIONS);

    const routes = [
      { path: '/home', name: 'dashboard' },
      { path: '/home/orders', name: 'orders' },
      { path: '/home/quotations', name: 'quotations' },
      { path: '/home/reports/tax-invoices', name: 'tax-invoice-report' },
      { path: '/home/quick-sale', name: 'quick-sale' },
    ];

    for (const route of routes) {
      await page.goto(route.path);
      await expect(page).toHaveURL(url => url.pathname === route.path);
      await expect(page.locator('body')).toBeVisible();
      await expectCssVariables(page, LIGHT_TOKEN_EXPECTATIONS);
      await expectNoHorizontalOverflow(page);
      await capture(page, testInfo, `${route.name}-desktop`);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of [routes[0], routes[1], routes[4]]) {
      await page.goto(route.path);
      await expect(page).toHaveURL(url => url.pathname === route.path);
      await expectNoHorizontalOverflow(page);
      await capture(page, testInfo, `${route.name}-mobile`);
    }
  });

  test('customer display retains the approved dark expression at counter and TV sizes', async ({ page }, testInfo) => {
    for (const viewport of [
      { width: 1280, height: 720, name: 'counter' },
      { width: 1920, height: 1080, name: 'tv' },
    ]) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/customer-display');
      await expect(page.locator('body')).toBeVisible();
      await expectCssVariables(page, DISPLAY_TOKEN_EXPECTATIONS);
      await expectNoHorizontalOverflow(page);
      await capture(page, testInfo, `customer-display-${viewport.name}`);
    }
  });
});
