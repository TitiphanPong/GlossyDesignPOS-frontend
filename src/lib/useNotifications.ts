import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchApiJson } from './api';

export type NotificationPriority = 'critical' | 'high' | 'normal' | 'low';
export type NotificationCategory = 'action_required' | 'today' | 'follow_up' | 'system';
export type NotificationActionKind = 'collect_payment' | 'open_order' | 'review_upload' | 'pickup_follow_up' | 'open_stock' | string;

export type ActionCenterSummary = {
  total: number;
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
  entityType?: 'order' | 'upload' | 'payment' | 'stock';
  entityId?: string;
  action?: {
    label: string;
    href?: string;
    action?: NotificationActionKind;
  };
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
  critical: 0,
  outstandingAmount: 0,
  filesWaiting: 0,
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<ActionCenterSummary>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActionCenter = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchApiJson<ActionCenterResponse>('/notifications/action-center');
      setNotifications(Array.isArray(data.items) ? data.items : []);
      setSummary(data.summary ?? EMPTY_SUMMARY);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to fetch action center:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resolveNotification = useCallback(
    async (notificationId: string): Promise<void> => {
      await fetchApiJson<Notification>(`/notifications/${notificationId}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      await fetchActionCenter();
    },
    [fetchActionCenter]
  );

  const dismissNotification = useCallback(
    async (notificationId: string): Promise<void> => {
      await fetchApiJson<Notification>(`/notifications/${notificationId}/dismiss`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      await fetchActionCenter();
    },
    [fetchActionCenter]
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
    void fetchActionCenter();

    const pollingInterval = setInterval(() => {
      void fetchActionCenter();
    }, 30_000);

    return () => clearInterval(pollingInterval);
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
      actionRequired: summary.total,
      byPriority,
    };
  }, [notifications, summary.total]);

  return {
    notifications,
    summary,
    count,
    isLoading,
    error,
    refetch: fetchActionCenter,
    resolveNotification,
    dismissNotification,
    markAsRead,
  };
}
