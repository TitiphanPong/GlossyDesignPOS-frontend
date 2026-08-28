import { fetchApiJson } from './api';

export type StockItem = {
  _id: string;
  code: string;
  name: string;
  unit: string;
  onHand: number;
  minimumLevel: number;
  active: boolean;
};

export type StockMovementType = 'receive' | 'issue' | 'adjustment_in' | 'adjustment_out' | 'waste';

export type StockOverview = {
  totalActiveItems: number;
  lowStockCount: number;
  recentlyMovedItems: Array<{
    item: StockItem;
    lastMovementAt: string | null;
    lastMovementType: StockMovementType | null;
  }>;
};

export type StockMovement = {
  _id: string;
  stockItemId: string;
  type: StockMovementType;
  quantity: number;
  delta: number;
  balanceAfter: number;
  reason: string;
  actorUsername: string;
  occurredAt: string;
  referenceType?: string;
  referenceId?: string;
  stockItem: StockItem | null;
};

export type StockMovementPage = {
  items: StockMovement[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function isLowStock(item: Pick<StockItem, 'active' | 'onHand' | 'minimumLevel'>): boolean {
  return item.active && item.onHand <= item.minimumLevel;
}

export async function listStockItems(q = '', includeInactive = true): Promise<StockItem[]> {
  const params = new URLSearchParams();
  if (q.trim()) params.set('q', q.trim());
  if (includeInactive) params.set('includeInactive', 'true');
  const suffix = params.size ? `?${params.toString()}` : '';
  return fetchApiJson<StockItem[]>(`/inventory/items${suffix}`, { cache: 'no-store' });
}

export async function fetchStockOverview(): Promise<StockOverview> {
  return fetchApiJson<StockOverview>('/inventory/overview', { cache: 'no-store' });
}

export type StockMovementQuery = {
  page?: number;
  limit?: number;
  itemId?: string;
  type?: StockMovementType | '';
  from?: string;
  to?: string;
  q?: string;
};

export function buildStockMovementPath(params: StockMovementQuery = {}): string {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.itemId) query.set('itemId', params.itemId);
  if (params.type) query.set('type', params.type);
  if (params.from) query.set('from', params.from);
  if (params.to) query.set('to', params.to);
  if (params.q?.trim()) query.set('q', params.q.trim());
  const suffix = query.size ? `?${query.toString()}` : '';
  return `/inventory/movements${suffix}`;
}

export async function listStockMovements(params: StockMovementQuery = {}): Promise<StockMovementPage> {
  return fetchApiJson<StockMovementPage>(buildStockMovementPath(params), { cache: 'no-store' });
}

export function stockMutationKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
