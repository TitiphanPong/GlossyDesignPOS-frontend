import assert from 'node:assert/strict';
import test from 'node:test';
import { actionCenterGroup, actionCenterHref, actionCenterPage, DEFAULT_FILTERS, readActionCenterFilters, selectActionCenterItems } from './action-center-view';
import type { Notification } from './useNotifications';
import { readFileSync } from 'node:fs';

function notification(id: string, overrides: Partial<Notification> = {}): Notification {
  return {
    _id: id,
    type: 'upload_review_required',
    category: 'action_required',
    priority: 'high',
    status: 'active',
    title: 'รายการไฟล์รอตรวจ',
    entityType: 'upload',
    entityId: id,
    isRead: false,
    attentionState: 'new',
    createdAt: '2026-09-03T08:00:00.000Z',
    updatedAt: '2026-09-03T08:00:00.000Z',
    ...overrides,
  };
}
test('uploads remain individual with deterministic id tie-break ordering', () => {
  assert.deepEqual(
    selectActionCenterItems([notification('c'), notification('a'), notification('b')], DEFAULT_FILTERS).map(x => x._id),
    ['a', 'b', 'c']
  );
});

test('shared serialized backend snapshot is consumed without grouping or summary reinterpretation', () => {
  const snapshot = JSON.parse(readFileSync('test/fixtures/action-center.snapshot.json', 'utf8')) as { summary: { attention: number; total: number }; items: Notification[] };
  assert.equal(selectActionCenterItems(snapshot.items, DEFAULT_FILTERS).length, snapshot.summary.attention);
  assert.equal(selectActionCenterItems(snapshot.items, { ...DEFAULT_FILTERS, state: 'all' }).length, snapshot.summary.total);
});
test('critical acknowledged and snoozed leave new, have distinct states, remain in all', () => {
  const items = [notification('a', { priority: 'critical', attentionState: 'acknowledged' }), notification('b', { attentionState: 'snoozed' }), notification('c')];
  assert.deepEqual(
    selectActionCenterItems(items, DEFAULT_FILTERS).map(x => x._id),
    ['c']
  );
  assert.deepEqual(
    selectActionCenterItems(items, { ...DEFAULT_FILTERS, state: 'acknowledged' }).map(x => x._id),
    ['a']
  );
  assert.deepEqual(
    selectActionCenterItems(items, { ...DEFAULT_FILTERS, state: 'snoozed' }).map(x => x._id),
    ['b']
  );
  assert.equal(selectActionCenterItems(items, { ...DEFAULT_FILTERS, state: 'all' }).length, 3);
});
test('independent domains include low stock and production', () => {
  assert.equal(actionCenterGroup(notification('p', { type: 'payment_outstanding' })), 'finance');
  assert.equal(actionCenterGroup(notification('p', { entityType: 'production_job', type: 'production_overdue' })), 'production');
  assert.equal(actionCenterGroup(notification('s', { entityType: 'stock', type: 'low_stock' })), 'stock');
  assert.equal(actionCenterGroup(notification('o', { entityType: 'order', type: 'order_ready_for_pickup' })), 'pickup');
});
test('search full 1000-row snapshot before pagination; clamp removed last page', () => {
  const items = Array.from({ length: 1000 }, (_, i) => notification(String(i).padStart(4, '0'), { orderCode: 'ORD-' + i }));
  assert.equal(actionCenterPage(selectActionCenterItems(items, DEFAULT_FILTERS), 40).items.length, 25);
  const found = selectActionCenterItems(items, { ...DEFAULT_FILTERS, q: 'ord-999' });
  assert.equal(found.length, 1);
  assert.equal(actionCenterPage(found, 40).page, 1);
  assert.equal(actionCenterPage([], 40).pages, 1);
  for (const key of ['title', 'message', 'orderCode', 'customerName'] as const)
    assert.equal(selectActionCenterItems([notification('1', { [key]: 'Needle' })], { ...DEFAULT_FILTERS, q: ' needle ' }).length, 1);
});
test('filters round-trip Thai query and reject invalid URL values', () => {
  assert.equal(readActionCenterFilters(new URLSearchParams('state=ack')).state, 'acknowledged');
  const filters = { ...DEFAULT_FILTERS, state: 'all' as const, domain: 'stock' as const, priority: 'critical' as const, q: 'ลูกค้า & งาน', page: 7 };
  assert.deepEqual(readActionCenterFilters(new URL(actionCenterHref(filters), 'http://local').searchParams), filters);
  assert.deepEqual(readActionCenterFilters(new URLSearchParams('state=constructor&domain=oops&priority=__proto__&page=Infinity')), DEFAULT_FILTERS);
});
