import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createActionCenterPoller, type ActionCenterPoller } from './action-center-polling';
import { fetchApiJson } from './api';

export type NotificationPriority = 'critical' | 'high' | 'normal' | 'low';
export type NotificationCategory = 'action_required' | 'today' | 'follow_up' | 'system';
export type NotificationActionKind = 'collect_payment' | 'open_order' | 'review_upload' | 'pickup_follow_up' | 'open_stock' | string;

export type ActionCenterSummary = {
  total: number;
  attention: number;
  acknowledged: number;
  snoozed: number;
  critical: number;
  outstandingAmount: number;
  filesWaiting: number;
};

export type Notification = {
  _id: string;
  type: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  status: 'active' | 'resolved' | 'dismissed';
  title: string;
  message?: string;
  orderId?: string;
  orderCode?: string;
  customerName?: string;
  amount?: number;
  dueDate?: string;
  relatedUploadId?: string;
  entityType?: 'order' | 'upload' | 'payment' | 'stock' | 'production_job';
  entityId?: string;
  action?: {
    label: string;
    href?: string;
    action?: NotificationActionKind;
  };
  attentionState?: 'new' | 'acknowledged' | 'snoozed';
  acknowledgedAt?: string;
  snoozedUntil?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  dismissedAt?: string;
};

type ActionCenterResponse = {
  summary: ActionCenterSummary;
  items: Notification[];
};

const EMPTY_SUMMARY: ActionCenterSummary = {
  total: 0,
  attention: 0,
  acknowledged: 0,
  snoozed: 0,
  critical: 0,
  outstandingAmount: 0,
  filesWaiting: 0,
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<ActionCenterSummary>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollerRef = useRef<ActionCenterPoller | null>(null);

  const fetchActionCenter = useCallback(async (signal?: AbortSignal) => {
    try {
      setError(null);
      const data = await fetchApiJson<ActionCenterResponse>('/notifications/action-center', { signal });
      if (signal?.aborted) return;
      setNotifications(Array.isArray(data.items) ? data.items : []);
      const incomingSummary = data.summary ?? EMPTY_SUMMARY;
      setSummary({
        ...EMPTY_SUMMARY,
        ...incomingSummary,
        attention:
          typeof incomingSummary.attention === 'number'
            ? incomingSummary.attention
            : incomingSummary.total ?? 0,
      });
    } catch (err) {
      if (signal?.aborted || (err instanceof Error && err.name === 'AbortError')) return;
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to fetch action center:', err);
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  const refetchActionCenter = useCallback(async () => {
    if (pollerRef.current) {
      await pollerRef.current.refetch();
      return;
    }
    await fetchActionCenter();
  }, [fetchActionCenter]);

  const updateActionCenterState = useCallback(
    async (
      notificationIds: string[],
      action: 'acknowledge' | 'unacknowledge' | 'snooze' | 'dismiss',
      snoozeMinutes?: number
    ): Promise<void> => {
      if (notificationIds.length === 0) return;
      await fetchApiJson<{ updated: number }>('/notifications/action-center/state', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationIds,
          action,
          ...(action === 'snooze' ? { snoozeMinutes: snoozeMinutes ?? 60 } : {}),
        }),
      });
      await refetchActionCenter();
    },
    [refetchActionCenter]
  );

  const acknowledgeNotifications = useCallback(
    (notificationIds: string[]) => updateActionCenterState(notificationIds, 'acknowledge'),
    [updateActionCenterState]
  );

  const unacknowledgeNotifications = useCallback(
    (notificationIds: string[]) => updateActionCenterState(notificationIds, 'unacknowledge'),
    [updateActionCenterState]
  );

  const snoozeNotifications = useCallback(
    (notificationIds: string[], minutes = 60) => updateActionCenterState(notificationIds, 'snooze', minutes),
    [updateActionCenterState]
  );

  const resolveNotification = useCallback(
    async (notificationId: string): Promise<void> => {
      await fetchApiJson<Notification>(`/notifications/${notificationId}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      await refetchActionCenter();
    },
    [refetchActionCenter]
  );

  const dismissNotification = useCallback(
    async (notificationId: string): Promise<void> => {
      await fetchApiJson<Notification>(`/notifications/${notificationId}/dismiss`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      await refetchActionCenter();
    },
    [refetchActionCenter]
  );

  const markAsRead = useCallback(async (notificationId: string): Promise<void> => {
    try {
      await fetchApiJson<Notification>(`/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
      setNotifications(previous => previous.map(item => (item._id === notificationId ? { ...item, isRead: true } : item)));
    } catch (err) {
      console.error('Failed to mark action-center item as read:', err);
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const poller = createActionCenterPoller({
      fetchActionCenter: signal => fetchActionCenter(signal),
      documentTarget: document,
      windowTarget: window,
    });
    pollerRef.current = poller;
    poller.start();

    return () => {
      pollerRef.current = null;
      poller.stop();
    };
  }, [fetchActionCenter]);

  const count = useMemo(() => {
    const byPriority = notifications.reduce(
      (accumulator, notification) => {
        accumulator[notification.priority] += 1;
        return accumulator;
      },
      { critical: 0, high: 0, normal: 0, low: 0 } as Record<NotificationPriority, number>
    );

    return {
      total: summary.total,
      active: summary.total,
      actionRequired: summary.attention,
      byPriority,
    };
  }, [notifications, summary.attention, summary.total]);

  return {
    notifications,
    summary,
    count,
    isLoading,
    error,
    refetch: refetchActionCenter,
    acknowledgeNotifications,
    unacknowledgeNotifications,
    snoozeNotifications,
    resolveNotification,
    dismissNotification,
    markAsRead,
  };
}
