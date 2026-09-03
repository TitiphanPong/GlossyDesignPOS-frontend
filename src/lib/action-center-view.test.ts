import assert from 'node:assert/strict';
import test from 'node:test';

import { buildActionCenterRows, matchesActionCenterTab } from './action-center-view';
import type { Notification } from './useNotifications';

function notification(id: string, overrides: Partial<Notification> = {}): Notification {
  return {
    _id: id,
    type: 'upload_review_required',
    category: 'action_required',
    priority: 'high',
    status: 'active',
    title: 'ไฟล์ใหม่รอตรวจสอบ',
    entityType: 'upload',
    entityId: id,
    isRead: false,
    attentionState: 'new',
    createdAt: `2026-09-03T0${id.slice(-1) || '1'}:00:00.000Z`,
    updatedAt: '2026-09-03T08:00:00.000Z',
    ...overrides,
  };
}

test('groups repeated upload review actions into one compact row', () => {
  const rows = buildActionCenterRows(
    [notification('upload-1'), notification('upload-2'), notification('upload-3')],
    'attention'
  );

  assert.equal(rows.length, 1);
  assert.equal(rows[0]?.kind, 'upload_group');
  if (rows[0]?.kind !== 'upload_group') return;
  assert.equal(rows[0].count, 3);
  assert.deepEqual(rows[0].notificationIds, ['upload-3', 'upload-2', 'upload-1']);
});

test('acknowledged and snoozed work leaves the must-do tab but remains discoverable', () => {
  const acknowledged = notification('upload-1', { attentionState: 'acknowledged' });
  const snoozed = notification('upload-2', { attentionState: 'snoozed' });
  const fresh = notification('upload-3');

  assert.equal(matchesActionCenterTab(acknowledged, 'attention'), false);
  assert.equal(matchesActionCenterTab(snoozed, 'attention'), false);
  assert.equal(matchesActionCenterTab(fresh, 'attention'), true);
  assert.equal(matchesActionCenterTab(acknowledged, 'acknowledged'), true);
  assert.equal(matchesActionCenterTab(snoozed, 'acknowledged'), true);
});

test('finance and urgent filters show only new attention items', () => {
  const payment = notification('payment-1', {
    type: 'payment_outstanding',
    entityType: 'payment',
    priority: 'critical',
  });
  const acknowledgedPayment = notification('payment-2', {
    type: 'payment_outstanding',
    entityType: 'payment',
    priority: 'critical',
    attentionState: 'acknowledged',
  });

  assert.equal(matchesActionCenterTab(payment, 'finance'), true);
  assert.equal(matchesActionCenterTab(payment, 'urgent'), true);
  assert.equal(matchesActionCenterTab(acknowledgedPayment, 'finance'), false);
  assert.equal(matchesActionCenterTab(acknowledgedPayment, 'urgent'), false);
});
