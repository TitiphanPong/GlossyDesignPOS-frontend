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

export type StockMovementType = 'receive' | 'issue' | 'adjustment_in' | 'adjustment_out';

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

export function stockMutationKey(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
