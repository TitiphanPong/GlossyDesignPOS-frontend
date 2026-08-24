import { useEffect, useState, useCallback, useRef } from 'react';

export type NotificationCountResponse = {
  total: number;
  active: number;
  actionRequired: number;
  byPriority: {
    critical: number;
    high: number;
    normal: number;
    low: number;
  };
};

export type Notification = {
  _id: string;
  type: string;
  category: 'action_required' | 'today' | 'follow_up' | 'system';
  priority: 'critical' | 'high' | 'normal' | 'low';
  status: 'active' | 'resolved' | 'dismissed';
  title: string;
  message?: string;
  orderId?: string;
  orderCode?: string;
  customerName?: string;
  amount?: number;
  dueDate?: string;
  action?: {
    label: string;
    href?: string;
    action?: string;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  dismissedAt?: string;
};

type ListNotificationsResponse = {
  data: Notification[];
  total: number;
  skip: number;
  limit: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [count, setCount] = useState<NotificationCountResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/notifications/active`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = (await response.json()) as Notification[];
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch notification count
  const fetchCount = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/notifications/count`);
      if (!response.ok) {
        throw new Error('Failed to fetch notification count');
      }

      const data = (await response.json()) as NotificationCountResponse;
      setCount(data);
    } catch (err) {
      console.error('Failed to fetch notification count:', err);
    }
  }, []);

  // Resolve notification
  const resolveNotification = useCallback(
    async (notificationId: string): Promise<void> => {
      try {
        const response = await fetch(`${API_BASE}/notifications/${notificationId}/resolve`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error('Failed to resolve notification');
        }

        // Remove from list
        setNotifications(prev => prev.filter(n => n._id !== notificationId));

        // Refetch count
        await fetchCount();
      } catch (err) {
        console.error('Failed to resolve notification:', err);
        throw err;
      }
    },
    [fetchCount]
  );

  // Dismiss notification
  const dismissNotification = useCallback(
    async (notificationId: string): Promise<void> => {
      try {
        const response = await fetch(`${API_BASE}/notifications/${notificationId}/dismiss`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error('Failed to dismiss notification');
        }

        // Remove from list
        setNotifications(prev => prev.filter(n => n._id !== notificationId));

        // Refetch count
        await fetchCount();
      } catch (err) {
        console.error('Failed to dismiss notification:', err);
        throw err;
      }
    },
    [fetchCount]
  );

  // Mark as read
  const markAsRead = useCallback(async (notificationId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      // Update in list
      setNotifications(prev => prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
    fetchCount();
  }, [fetchNotifications, fetchCount]);

  // Set up polling (refetch every 30 seconds)
  useEffect(() => {
    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications();
      fetchCount();
    }, 30000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchNotifications, fetchCount]);

  return {
    notifications,
    count,
    isLoading,
    error,
    refetch: async () => {
      await fetchNotifications();
      await fetchCount();
    },
    resolveNotification,
    dismissNotification,
    markAsRead,
  };
}
