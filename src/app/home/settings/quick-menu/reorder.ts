import type { Product } from '@/lib/contracts';
import type { QuickProductReorderItem } from '@/lib/products';

const UNSET_ORDER = Number.MAX_SAFE_INTEGER;

export function sortByDisplayOrder(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const orderA = a.quickSaleSortOrder ?? UNSET_ORDER;
    const orderB = b.quickSaleSortOrder ?? UNSET_ORDER;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name, 'th');
  });
}

/**
 * Moves one visible row and reindexes the whole list to 0..n-1.
 *
 * `visibleIds` may be a category-filtered subset of `all`; the permuted subset
 * is written back into the global slots it already occupied, so items outside
 * the subset keep their relative positions.
 */
export function computeReorder(
  all: Product[],
  visibleIds: string[],
  fromIndex: number,
  toIndex: number
): { next: Product[]; changes: QuickProductReorderItem[] } {
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= visibleIds.length || toIndex >= visibleIds.length) {
    return { next: all, changes: [] };
  }

  const movedIds = [...visibleIds];
  const [movedId] = movedIds.splice(fromIndex, 1);
  movedIds.splice(toIndex, 0, movedId);

  const visibleSet = new Set(visibleIds);
  const byId = new Map(all.map(product => [product.id, product]));
  let subsetCursor = 0;
  const reordered = all.map(product => (visibleSet.has(product.id) ? byId.get(movedIds[subsetCursor++]) ?? product : product));

  const next = reordered.map((product, index) => (product.quickSaleSortOrder === index ? product : { ...product, quickSaleSortOrder: index }));
  const previousOrder = new Map(all.map(product => [product.id, product.quickSaleSortOrder]));
  const changes = next
    .filter(product => previousOrder.get(product.id) !== product.quickSaleSortOrder)
    .map(product => ({ id: product.id, quickSaleSortOrder: product.quickSaleSortOrder ?? 0 }));

  return { next, changes };
}

export function moveVisibleRow(
  all: Product[],
  visibleIds: string[],
  activeId: string,
  overId: string
): { next: Product[]; changes: QuickProductReorderItem[] } {
  return computeReorder(all, visibleIds, visibleIds.indexOf(activeId), visibleIds.indexOf(overId));
}
