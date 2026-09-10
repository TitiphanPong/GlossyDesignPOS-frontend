import { expect, test, type Page } from '@playwright/test';
import fixture from '../test/fixtures/action-center.snapshot.json';
import type { Notification } from '../src/lib/useNotifications';

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(done => {
    resolve = done;
  });
  return { promise, resolve };
}

async function mockQueue(page: Page, initial: Notification[]) {
  const state = {
    items: structuredClone(initial),
    gets: 0,
    patches: [] as { notificationIds: string[]; action: string; snoozeMinutes?: number }[],
    failGet: false,
    failPatch: false,
    holdGet: null as ReturnType<typeof deferred> | null,
    holdPatch: null as ReturnType<typeof deferred> | null,
  };
  await page.route('**/api/backend/notifications/action-center**', async route => {
    if (route.request().method() === 'PATCH') {
      const body = route.request().postDataJSON() as (typeof state.patches)[number];
      state.patches.push(body);
      if (state.holdPatch) await state.holdPatch.promise;
      if (state.failPatch) return route.fulfill({ status: 500, json: { message: 'mutation failure' } });
      state.items = state.items.map(item =>
        body.notificationIds.includes(item._id) ? { ...item, attentionState: body.action === 'acknowledge' ? 'acknowledged' : body.action === 'snooze' ? 'snoozed' : 'new' } : item
      );
      return route.fulfill({ json: { updated: body.notificationIds.length } });
    }
    state.gets += 1;
    const items = structuredClone(state.items);
    if (state.holdGet) {
      const hold = state.holdGet;
      state.holdGet = null;
      await hold.promise;
    }
    if (state.failGet) return route.fulfill({ status: 500, json: { message: 'snapshot failure' } });
    return route.fulfill({
      json: {
        items,
        summary: {
          total: items.length,
          attention: items.filter(x => x.attentionState === 'new').length,
          acknowledged: items.filter(x => x.attentionState === 'acknowledged').length,
          snoozed: items.filter(x => x.attentionState === 'snoozed').length,
          critical: items.filter(x => x.priority === 'critical').length,
          outstandingAmount: items.filter(x => x.type === 'payment_outstanding').reduce((sum, x) => sum + Math.round((x.amount ?? 0) * 100), 0) / 100,
          filesWaiting: items.filter(x => x.type === 'upload_review_required').length,
        },
      },
    });
  });
  return state;
}

async function login(page: Page, target = '/home/action-center') {
  await page.goto(target);
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel('ชื่อผู้ใช้').fill('cashier');
  await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('e2e-password');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
  await expect(page).toHaveURL(url => url.pathname === target.split('?')[0], { timeout: 30_000 });
}

const fixtureItems = fixture.items as Notification[];
const manyItems = (count: number): Notification[] =>
  Array.from({ length: count }, (_, index) => ({
    ...fixtureItems[1],
    _id: index.toString(16).padStart(24, '0'),
    title: 'รายการไฟล์ ' + String(index).padStart(4, '0'),
    entityId: 'upload-' + index,
    relatedUploadId: 'upload-' + index,
    customerName: index === count - 1 ? 'ลูกค้าปลายรายการ' : 'ลูกค้าทดสอบ',
  }));
const bell = (page: Page) => page.getByRole('button', { name: 'เปิดการแจ้งเตือนงานที่ต้องจัดการ' });

for (const width of [1440, 768, 390, 520]) {
  test('drawer layout, individual rows, keyboard and filter handoff at ' + width, async ({ page }, testInfo) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: 1000 });
    await mockQueue(page, manyItems(101));
    await login(page);
    await expect(page.getByRole('article')).toHaveCount(25);
    await bell(page).focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'ศูนย์งาน', exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('article')).toHaveCount(10);
    await expect(dialog.getByText('ยังมีอีก 91 รายการ')).toBeVisible();
    const box = await dialog.boundingBox();
    expect(Math.round(box!.width)).toBe(width < 600 ? width : 480);
    expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath('drawer-' + width + '.png'), fullPage: true });
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(bell(page)).toBeFocused();
    await bell(page).click();
    await dialog.getByLabel('ค้นหางาน เลขงาน หรือลูกค้า').fill('ลูกค้าปลายรายการ');
    await expect(dialog.getByRole('article')).toHaveCount(1);
    await dialog.getByRole('link', { name: 'เปิดศูนย์งานทั้งหมด' }).click();
    await expect(page).toHaveURL(/q=/);
    await expect(page.getByRole('article')).toHaveCount(1);
    await page.screenshot({ path: testInfo.outputPath('page-' + width + '.png'), fullPage: true });
  });
}

test('all 1000 records searchable; batch selection is current-page only; URL back and clamp', async ({ page }) => {
  test.setTimeout(90_000);
  const state = await mockQueue(page, manyItems(1000));
  await login(page, '/home/action-center?page=40');
  await expect(page.getByRole('article')).toHaveCount(25);
  await expect(page.getByRole('article').last()).toContainText('รายการไฟล์ 0999');
  await page.getByRole('checkbox', { name: 'เลือกรายการทั้งหมดในหน้านี้' }).check();
  await page.getByRole('button', { name: 'รับทราบที่เลือก', exact: true }).click();
  await expect.poll(() => state.patches.length).toBe(1);
  expect(state.patches[0].notificationIds).toHaveLength(25);
  expect(state.patches[0].notificationIds).toEqual(
    manyItems(1000)
      .slice(975)
      .map(x => x._id)
  );
  await expect(page).toHaveURL(/page=39/);
  await page.getByLabel('สถานะส่วนตัว').click();
  await page.getByRole('option', { name: 'ค้างทั้งหมด', exact: true }).click();
  await expect(page).toHaveURL(/state=all/);
  await page.getByLabel('ค้นหางาน เลขงาน หรือลูกค้า').fill('ลูกค้าปลายรายการ');
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('article')).toContainText('0999');
  await page.goBack();
  await expect(page.getByLabel('ค้นหางาน เลขงาน หรือลูกค้า')).toHaveValue('');
  await expect(page.getByRole('article')).toHaveCount(25);
});

test('critical personal state changes only new count; shared pending, post-PATCH GET and breakpoint continuity', async ({ page }) => {
  const item = { ...fixtureItems[0], attentionState: 'new' as const };
  const state = await mockQueue(page, [item]);
  await login(page, '/home/action-center?state=all');
  await expect(page.getByRole('article')).toHaveCount(1);
  const oldGet = deferred();
  state.holdGet = oldGet;
  const gets = state.gets;
  await page.getByRole('button', { name: 'อัปเดตข้อมูล', exact: true }).click();
  await expect.poll(() => state.gets).toBe(gets + 1);
  await bell(page).click();
  const dialog = page.getByRole('dialog', { name: 'ศูนย์งาน', exact: true });
  await dialog.getByRole('button', { name: 'จัดการสถานะ ' + item.title }).click();
  const patch = deferred();
  state.holdPatch = patch;
  await page.getByRole('menuitem', { name: 'รับทราบ', exact: true }).click();
  await expect.poll(() => state.patches.length).toBe(1);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'จัดการสถานะ ' + item.title })).toBeDisabled();
  patch.resolve();
  oldGet.resolve();
  await expect.poll(() => state.gets).toBeGreaterThan(gets + 1);
  await expect(page.getByRole('article')).toContainText('รับทราบแล้ว');
  await expect(page.getByText('ค้างทั้งหมด', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('main').getByText('งานวิกฤต', { exact: true }).locator('..')).toContainText('1');
  await expect(page.getByRole('main').getByText('ยอดเงินค้าง', { exact: true }).locator('..')).toContainText('100.25');
  const afterMutation = state.gets;
  await page.setViewportSize({ width: 390, height: 844 });
  await bell(page).click();
  await expect(page.getByRole('dialog').getByRole('article')).toHaveCount(0);
  expect(state.gets).toBeLessThanOrEqual(afterMutation + 1);
  expect(state.patches).toEqual([{ notificationIds: [item._id], action: 'acknowledge' }]);
});

test('initial error is not empty; stale refresh and mutation errors keep work visible with retry', async ({ page }) => {
  const state = await mockQueue(page, [fixtureItems[1]]);
  state.failGet = true;
  await login(page);
  await expect(page.getByRole('main').getByRole('alert')).toContainText('โหลดศูนย์งานไม่สำเร็จ');
  await expect(page.getByText('ไม่มีงานตามตัวกรองนี้')).toHaveCount(0);
  state.failGet = false;
  await page.getByRole('button', { name: 'ลองใหม่', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(1);
  state.failGet = true;
  await page.getByRole('button', { name: 'อัปเดตข้อมูล', exact: true }).click();
  await expect(page.getByRole('main').getByRole('alert')).toContainText('กำลังแสดงข้อมูลล่าสุด');
  await expect(page.getByRole('article')).toHaveCount(1);
  state.failPatch = true;
  await page.getByRole('button', { name: 'จัดการสถานะ ' + fixtureItems[1].title }).click();
  await page.getByRole('menuitem', { name: 'พักเตือน 1 ชั่วโมง', exact: true }).click();
  await expect(page.getByText(/บันทึกสถานะไม่สำเร็จ/)).toBeVisible();
  expect(state.patches[0].snoozeMinutes).toBe(60);
});

test('shared serialized contract has real workflow links and opening does not acknowledge', async ({ page }) => {
  const state = await mockQueue(page, fixtureItems);
  await login(page, '/home/action-center?state=all');
  await expect(page.getByRole('article')).toHaveCount(5);
  const expected = [
    '/home/orders?focus=64b000000000000000000010&action=payment',
    '/home/storage?focus=upload-a',
    '/home/production?active=true&focus=64b000000000000000000011',
    '/home/orders?focus=64b000000000000000000012',
    '/home/stock?focus=64b000000000000000000013',
  ];
  for (let i = 0; i < fixtureItems.length; i++) await expect(page.getByRole('article', { name: fixtureItems[i].title }).getByRole('link')).toHaveAttribute('href', expected[i]);
  await page.getByRole('article', { name: fixtureItems[4].title }).getByRole('link').click();
  await expect(page).toHaveURL(/\/home\/stock\?focus=/);
  expect(state.patches).toHaveLength(0);
});

test('per-ID failure survives another mutation; committed PATCH with failed GET keeps stale data until retry', async ({ page }) => {
  const [a, b] = manyItems(2);
  const state = await mockQueue(page, [a, b]);
  await login(page, '/home/action-center?state=all');
  await expect(page.getByRole('article')).toHaveCount(2);
  state.failPatch = true;
  await page
    .getByRole('article', { name: a.title, exact: true })
    .getByRole('button', { name: 'จัดการสถานะ ' + a.title })
    .click();
  await page.getByRole('menuitem', { name: 'รับทราบ', exact: true }).click();
  const errorA = page.getByRole('main').getByRole('alert').filter({ hasText: a.title });
  await expect(errorA).toBeVisible();
  state.failPatch = false;
  const hold = deferred();
  state.holdPatch = hold;
  await page
    .getByRole('article', { name: b.title, exact: true })
    .getByRole('button', { name: 'จัดการสถานะ ' + b.title })
    .click();
  await page.getByRole('menuitem', { name: 'รับทราบ', exact: true }).click();
  await expect.poll(() => state.patches.length).toBe(2);
  await expect(errorA).toBeVisible();
  state.failGet = true;
  hold.resolve();
  await expect(page.getByRole('main').getByRole('alert').filter({ hasText: 'กำลังแสดงข้อมูลล่าสุด' })).toBeVisible();
  await expect(errorA).toBeVisible();
  await expect(page.getByRole('article', { name: b.title, exact: true })).toContainText('ใหม่');
  state.failGet = false;
  await page.getByRole('button', { name: 'ลองใหม่', exact: true }).click();
  await expect(page.getByRole('article', { name: b.title, exact: true })).toContainText('รับทราบแล้ว');
  await expect(errorA).toBeVisible();
});

test('an open drawer survives breakpoint changes and returns keyboard focus to the current bell', async ({ page }) => {
  const state = await mockQueue(page, fixtureItems);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page);
  await expect(page.getByRole('article')).toHaveCount(3);
  await bell(page).click();
  const dialog = page.getByRole('dialog', { name: 'ศูนย์งาน', exact: true });
  await expect(dialog).toBeVisible();
  const gets = state.gets;
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('article')).toHaveCount(3);
  expect(state.gets).toBe(gets);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(bell(page)).toBeFocused();
});

test('already-open Storage and Stock react to a different notification target without remount', async ({ page }) => {
  test.setTimeout(90_000);
  const uploads = manyItems(2);
  const stock = { ...fixtureItems[4], attentionState: 'new' as const };
  await mockQueue(page, [...uploads, stock]);
  await page.route('**/api/backend/uploads?**', route => {
    const q = new URL(route.request().url()).searchParams.get('q');
    const data = uploads
      .filter(x => !q || x.entityId === q)
      .map((item, index) => ({
        uploadId: item.entityId,
        sourceIds: [item.entityId],
        orderCode: item.entityId,
        customerName: 'ลูกค้า ' + item.entityId,
        status: 'pending',
        storageStatus: 'waiting',
        createdAt: item.createdAt,
        files: [{ fileId: String(index), originalName: item.entityId + '.pdf', size: 100 }],
      }));
    return route.fulfill({ json: { data, total: data.length } });
  });
  await page.route('**/api/backend/inventory/**', route => {
    const path = new URL(route.request().url()).pathname;
    if (path.endsWith('/items')) return route.fulfill({ json: [{ _id: stock.entityId, code: 'PAPER', name: 'กระดาษทดสอบ', unit: 'แผ่น', onHand: 1, minimumLevel: 10, active: true }] });
    return route.fulfill({ json: path.endsWith('/overview') ? { totalActiveItems: 1, lowStockCount: 1, recentlyMovedItems: [] } : { items: [], page: 1, limit: 25, total: 0, totalPages: 1 } });
  });
  await login(page, '/home/storage');
  for (const item of uploads) {
    await bell(page).click();
    const dialog = page.getByRole('dialog', { name: 'ศูนย์งาน', exact: true });
    await dialog.getByRole('article', { name: item.title, exact: true }).getByRole('link').click();
    await expect(page).toHaveURL(new RegExp('focus=' + item.entityId));
    await expect(page.getByText('ลูกค้า : ลูกค้า ' + item.entityId, { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
  }
  await page.getByRole('navigation', { name: 'เมนูหลัก' }).getByRole('link', { name: 'สต็อกวัสดุ' }).click();
  await expect(page).toHaveURL(/\/home\/stock$/);
  await bell(page).click();
  await page.getByRole('dialog', { name: 'ศูนย์งาน', exact: true }).getByRole('article', { name: stock.title }).getByRole('link').click();
  await expect(page).toHaveURL(new RegExp('focus=' + stock.entityId));
  await expect(page.locator('#stock-item-' + stock.entityId)).toHaveCSS('box-shadow', 'rgba(237, 108, 2, 0.12) 0px 0px 0px 3px');
});

test('same Order switches from detail to payment through the Action Center without acknowledging', async ({ page }) => {
  test.setTimeout(90_000);
  const payment = { ...fixtureItems[0], orderId: 'order-e2e-1', entityId: 'order-e2e-1', attentionState: 'new' as const };
  const state = await mockQueue(page, [payment]);
  await page.route('**/api/backend/orders/order-e2e-1', async route => {
    const response = await route.fetch();
    const order = await response.json();
    await route.fulfill({ json: { ...order, status: 'partial', remainingTotal: 100, depositTotal: 114, paidAmount: 114 } });
  });
  await login(page, '/home/orders?focus=order-e2e-1');
  await expect(page.getByText('ORD-E2E-0001', { exact: false }).first()).toBeVisible();
  await page.keyboard.press('Escape');
  await bell(page).click();
  await page.getByRole('dialog', { name: 'ศูนย์งาน', exact: true }).getByRole('link', { name: 'รับชำระเงิน' }).click();
  await expect(page).toHaveURL(/action=payment/);
  await expect(page.getByText('รับชำระยอดคงเหลือ', { exact: true })).toBeVisible();
  expect(state.patches).toHaveLength(0);
});

test('typed search keeps all characters while updating URL and filters', async ({ page }) => {
  await mockQueue(page, manyItems(1000));
  await login(page);
  const search = page.getByLabel('ค้นหางาน เลขงาน หรือลูกค้า');
  await search.pressSequentially('0999', { delay: 50 });
  await expect(search).toHaveValue('0999');
  await expect(page).toHaveURL(/q=0999/);
  await expect(page.getByRole('article')).toHaveCount(1);
});
