import type { Notification } from './useNotifications';

function encode(value: string) {
  return encodeURIComponent(value);
}

function normalizeLegacyHref(href: string): string {
  const orderMatch = /^\/home\/orders\/([^/?#]+)(?:\?[^#]*)?$/.exec(href);
  if (orderMatch?.[1]) {
    return `/home/orders?focus=${encode(orderMatch[1])}`;
  }
  return href;
}

export function getNotificationActionHref(notification: Notification): string | null {
  const actionKind = notification.action?.action;
  const orderId = notification.orderId ?? (notification.entityType === 'order' || notification.entityType === 'payment' ? notification.entityId : undefined);
  const uploadId = notification.relatedUploadId ?? (notification.entityType === 'upload' ? notification.entityId : undefined);

  if ((actionKind === 'collect_payment' || actionKind === 'pay') && orderId) {
    return `/home/orders?focus=${encode(orderId)}&action=payment`;
  }
  if ((actionKind === 'open_order' || actionKind === 'pickup_follow_up') && orderId) {
    return `/home/orders?focus=${encode(orderId)}`;
  }
  if ((actionKind === 'review_upload' || notification.type.startsWith('upload_')) && uploadId) {
    return `/home/storage?focus=${encode(uploadId)}`;
  }
  if (notification.action?.href) {
    return normalizeLegacyHref(notification.action.href);
  }
  if (orderId) {
    return `/home/orders?focus=${encode(orderId)}`;
  }
  if (uploadId) {
    return `/home/storage?focus=${encode(uploadId)}`;
  }
  return null;
}
