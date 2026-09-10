import { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
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

export type PersonalAction = 'acknowledge' | 'unacknowledge' | 'snooze';

/** Called only by the authenticated shell provider. Consumers use the context below. */
export function useActionCenterStore() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [summary, setSummary] = useState<ActionCenterSummary>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutationErrors, setMutationErrors] = useState<ReadonlyMap<string, string>>(new Map());
  const [lastSuccessfulAt, setLastSuccessfulAt] = useState<Date | null>(null);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const pendingRef = useRef(new Set<string>());
  const revision = useRef(0);
  const pollerRef = useRef<ActionCenterPoller | null>(null);

  const fetchActionCenter = useCallback(async (signal: AbortSignal) => {
    const startedRevision = revision.current;
    try {
      const data = await fetchApiJson<ActionCenterResponse>('/notifications/action-center', { signal });
      if (signal.aborted || startedRevision !== revision.current) return;
      setNotifications(data.items);
      setSummary(data.summary);
      setLastSuccessfulAt(new Date());
      setError(null);
    } catch (err) {
      if (signal.aborted || startedRevision !== revision.current) return;
      setError(err instanceof Error ? err.message : 'โหลดศูนย์งานไม่สำเร็จ');
    } finally {
      if (!signal.aborted && startedRevision === revision.current) setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await pollerRef.current?.refetch();
  }, []);
  const updateState = useCallback(async (ids: string[], action: PersonalAction) => {
    const notificationIds = [...new Set(ids)];
    if (!notificationIds.length || notificationIds.some(id => pendingRef.current.has(id))) return;
    notificationIds.forEach(id => pendingRef.current.add(id));
    setPendingIds(new Set(pendingRef.current));
    setMutationErrors(previous => {
      const next = new Map(previous);
      notificationIds.forEach(id => next.delete(id));
      return next;
    });
    try {
      await fetchApiJson('/notifications/action-center/state', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds, action, ...(action === 'snooze' ? { snoozeMinutes: 60 } : {}) }),
      });
      revision.current += 1;
      await pollerRef.current?.refetchAfterCurrent();
    } catch (err) {
      setMutationErrors(previous => {
        const next = new Map(previous);
        notificationIds.forEach(id => next.set(id, err instanceof Error ? err.message : 'บันทึกสถานะไม่สำเร็จ'));
        return next;
      });
    } finally {
      notificationIds.forEach(id => pendingRef.current.delete(id));
      setPendingIds(new Set(pendingRef.current));
    }
  }, []);

  useEffect(() => {
    const poller = createActionCenterPoller({ fetchActionCenter, documentTarget: document, windowTarget: window });
    pollerRef.current = poller;
    poller.start();
    return () => {
      pollerRef.current = null;
      poller.stop();
    };
  }, [fetchActionCenter]);

  return { notifications, summary, isLoading, error, mutationErrors, lastSuccessfulAt, pendingIds, refetch, updateState };
}

export const ActionCenterContext = createContext<
  | (ReturnType<typeof useActionCenterStore> & {
      drawerOpen: boolean;
      openDrawer: () => void;
      closeDrawer: () => void;
    })
  | null
>(null);

export function useNotifications() {
  const value = useContext(ActionCenterContext);
  if (!value) throw new Error('Action Center requires the authenticated shell provider');
  return value;
}
