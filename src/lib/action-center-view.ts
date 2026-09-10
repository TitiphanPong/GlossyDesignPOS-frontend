import type { Notification, NotificationPriority } from './useNotifications';

export const stateLabels = { new: 'ใหม่', acknowledged: 'รับทราบแล้ว', snoozed: 'พักเตือน', all: 'ค้างทั้งหมด' } as const;
export const domainLabels = { all: 'ทั้งหมด', finance: 'การเงิน', files: 'ไฟล์', production: 'การผลิต', pickup: 'ส่งมอบ', stock: 'สต็อก' } as const;
export const priorityLabels = { all: 'ทั้งหมด', critical: 'วิกฤต', high: 'สูง', normal: 'ปกติ', low: 'ต่ำ' } as const;
export type ActionCenterFilters = {
  state: keyof typeof stateLabels;
  domain: keyof typeof domainLabels;
  priority: 'all' | NotificationPriority;
  q: string;
  page: number;
};
export const DEFAULT_FILTERS: ActionCenterFilters = { state: 'new', domain: 'all', priority: 'all', q: '', page: 1 };

export function actionCenterGroup(item: Notification): Exclude<ActionCenterFilters['domain'], 'all'> {
  if (item.entityType === 'payment' || item.type.startsWith('payment_')) return 'finance';
  if (item.entityType === 'upload' || item.type.startsWith('upload_')) return 'files';
  if (item.entityType === 'production_job' || item.type.startsWith('production_')) return 'production';
  if (item.entityType === 'stock' || item.type.startsWith('stock_')) return 'stock';
  return 'pickup';
}

export function readActionCenterFilters(params: Pick<URLSearchParams, 'get'>): ActionCenterFilters {
  const state = params.get('state') === 'ack' ? 'acknowledged' : (params.get('state') ?? '');
  const domain = params.get('domain') ?? '';
  const priority = params.get('priority') ?? '';
  const page = Number(params.get('page') ?? 1);
  return {
    state: Object.hasOwn(stateLabels, state) ? (state as ActionCenterFilters['state']) : 'new',
    domain: Object.hasOwn(domainLabels, domain) ? (domain as ActionCenterFilters['domain']) : 'all',
    priority: Object.hasOwn(priorityLabels, priority) ? (priority as ActionCenterFilters['priority']) : 'all',
    q: params.get('q') ?? '',
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
}

export function actionCenterHref(filters: ActionCenterFilters): string {
  const params = new URLSearchParams();
  for (const key of ['state', 'domain', 'priority', 'q', 'page'] as const) if (filters[key] !== DEFAULT_FILTERS[key]) params.set(key, String(filters[key]));
  return '/home/action-center' + (params.size ? '?' + params.toString() : '');
}

export function selectActionCenterItems(items: Notification[], filters: ActionCenterFilters): Notification[] {
  const query = filters.q.trim().toLocaleLowerCase();
  const priorities = { critical: 0, high: 1, normal: 2, low: 3 };
  return items
    .filter(
      item =>
        (filters.state === 'all' || (item.attentionState ?? 'new') === filters.state) &&
        (filters.domain === 'all' || actionCenterGroup(item) === filters.domain) &&
        (filters.priority === 'all' || item.priority === filters.priority) &&
        (!query || [item.title, item.message, item.orderCode, item.customerName].some(value => value?.toLocaleLowerCase().includes(query)))
    )
    .sort((a, b) => priorities[a.priority] - priorities[b.priority] || Date.parse(b.createdAt) - Date.parse(a.createdAt) || a._id.localeCompare(b._id));
}

export function actionCenterPage(items: Notification[], requestedPage: number, size = 25) {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const page = Math.min(Math.max(1, requestedPage), pages);
  return { page, pages, items: items.slice((page - 1) * size, page * size) };
}
