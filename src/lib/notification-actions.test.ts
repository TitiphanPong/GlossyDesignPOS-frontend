import assert from 'node:assert/strict';
import test from 'node:test';

import { getNotificationActionHref } from './notification-actions';
import type { Notification } from './useNotifications';

function item(overrides: Partial<Notification>): Notification {
  return {
    _id: 'notification-1',
    type: 'payment_outstanding',
    category: 'action_required',
    priority: 'high',
    status: 'active',
    title: 'ทดสอบ',
    isRead: false,
    createdAt: '2026-08-27T10:00:00.000Z',
    updatedAt: '2026-08-27T10:00:00.000Z',
    ...overrides,
  };
}

test('collect payment deep-links to focused order and payment action', () => {
  assert.equal(
    getNotificationActionHref(item({ orderId: 'abc 123', action: { label: 'รับชำระเงิน', action: 'collect_payment' } })),
    '/home/orders?focus=abc%20123&action=payment'
  );
});

test('review upload deep-links to focused storage record', () => {
  assert.equal(
    getNotificationActionHref(item({ relatedUploadId: 'upload-1', entityType: 'upload', action: { label: 'ตรวจไฟล์', action: 'review_upload' } })),
    '/home/storage?focus=upload-1'
  );
});

test('legacy order detail href is normalized to the current orders route', () => {
  assert.equal(
    getNotificationActionHref(item({ action: { label: 'ดูงาน', href: '/home/orders/order-99' } })),
    '/home/orders?focus=order-99'
  );
});
