import type { Notification } from './useNotifications';

export type ActionCenterTab = 'attention' | 'urgent' | 'files' | 'finance' | 'follow_up' | 'acknowledged';

export type ActionCenterDisplayRow =
  | { kind: 'item'; key: string; notificationIds: string[]; notification: Notification }
  | {
      kind: 'upload_group';
      key: string;
      notificationIds: string[];
      count: number;
      latestAt: string;
      attentionState: 'new' | 'acknowledged' | 'snoozed';
      priority: Notification['priority'];
    };

export function actionCenterGroup(notification: Notification): 'files' | 'finance' | 'follow_up' {
  if (notification.entityType === 'payment' || notification.type.startsWith('payment_')) return 'finance';
  if (notification.entityType === 'upload' || notification.type.startsWith('upload_')) return 'files';
  return 'follow_up';
}

function attentionState(notification: Notification) {
  return notification.attentionState ?? 'new';
}

export function matchesActionCenterTab(notification: Notification, tab: ActionCenterTab): boolean {
  const state = attentionState(notification);
  if (tab === 'acknowledged') return state === 'acknowledged' || state === 'snoozed';
  if (state !== 'new') return false;
  if (tab === 'attention') return true;
  if (tab === 'urgent') return notification.priority === 'critical';
  return actionCenterGroup(notification) === tab;
}

export function buildActionCenterRows(notifications: Notification[], tab: ActionCenterTab): ActionCenterDisplayRow[] {
  const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 } as const;
  const visible = notifications
    .filter(notification => matchesActionCenterTab(notification, tab))
    .sort(
      (a, b) =>
        priorityOrder[a.priority] - priorityOrder[b.priority] ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const uploadGroups = new Map<string, Notification[]>();
  const rows: ActionCenterDisplayRow[] = [];

  for (const notification of visible) {
    if (notification.type !== 'upload_review_required') {
      rows.push({ kind: 'item', key: notification._id, notificationIds: [notification._id], notification });
      continue;
    }
    const key = attentionState(notification);
    const group = uploadGroups.get(key) ?? [];
    group.push(notification);
    uploadGroups.set(key, group);
  }

  for (const [state, group] of uploadGroups) {
    if (group.length === 1) {
      const notification = group[0];
      rows.push({ kind: 'item', key: notification._id, notificationIds: [notification._id], notification });
      continue;
    }
    const latestAt = group.reduce(
      (latest, item) => (new Date(item.createdAt).getTime() > new Date(latest).getTime() ? item.createdAt : latest),
      group[0].createdAt
    );
    const priority = group.reduce<Notification['priority']>(
      (current, item) => (priorityOrder[item.priority] < priorityOrder[current] ? item.priority : current),
      group[0].priority
    );
    rows.push({
      kind: 'upload_group',
      key: `upload-review:${state}`,
      notificationIds: group.map(item => item._id),
      count: group.length,
      latestAt,
      attentionState: state as 'new' | 'acknowledged' | 'snoozed',
      priority,
    });
  }

  return rows.sort((a, b) => {
    const aPriority = a.kind === 'item' ? a.notification.priority : a.priority;
    const bPriority = b.kind === 'item' ? b.notification.priority : b.priority;
    const priorityDiff = priorityOrder[aPriority] - priorityOrder[bPriority];
    if (priorityDiff !== 0) return priorityDiff;
    const aTime = a.kind === 'item' ? a.notification.createdAt : a.latestAt;
    const bTime = b.kind === 'item' ? b.notification.createdAt : b.latestAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });
}
