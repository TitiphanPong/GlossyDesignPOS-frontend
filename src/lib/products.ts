import { extractArrayPayload, extractObjectPayload, fetchApi, fetchApiJson, isRecord } from './api';
import type { Product, ProductRecipe, ProductVariant } from './contracts';

const PRODUCT_CACHE_TTL_MS = 30_000;
type ProductCacheEntry = { expiresAt: number; promise: Promise<Product[]> };
let productCache: ProductCacheEntry | null = null;
let quickProductCache: ProductCacheEntry | null = null;

function cachedProducts(current: ProductCacheEntry | null, load: () => Promise<Product[]>, force: boolean, assign: (entry: ProductCacheEntry | null) => void): Promise<Product[]> {
  if (!force && current && current.expiresAt > Date.now()) return current.promise;
  const entry = { expiresAt: Date.now() + PRODUCT_CACHE_TTL_MS, promise: load() };
  assign(entry);
  void entry.promise.catch(() => assign(null));
  return entry.promise;
}

function invalidateProductCache(): void {
  productCache = null;
  quickProductCache = null;
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function readBoolean(value: unknown, fallback = true): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return fallback;
}

function normalizeRecipe(value: unknown): ProductRecipe | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.flatMap(component => {
    if (!isRecord(component)) return [];
    const stockItemId = readString(component.stockItemId);
    const unit = readString(component.unit);
    const quantity = readNumber(component.quantity, Number.NaN);
    const conversionFactor = component.conversionFactor == null
      ? undefined
      : readNumber(component.conversionFactor, Number.NaN);
    if (!stockItemId || !unit || !(quantity > 0) || (conversionFactor !== undefined && !(conversionFactor > 0))) return [];
    return [{ stockItemId, quantity, unit, conversionFactor }];
  });
}

function fallbackTypeCode(name: string, category: string): string {
  const source = `${category || name}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ก-๙]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  return source || 'general';
}

function normalizeProductVariant(value: unknown): ProductVariant {
  const raw = isRecord(value) ? value : {};
  return {
    id: readString(raw.id),
    _id: readString(raw._id),
    name: readString(raw.name, 'Default'),
    price: readNumber(raw.price),
    note: readString(raw.note) || undefined,
    material: readString(raw.material) || undefined,
    sides: readString(raw.sides) || undefined,
    size: readString(raw.size) || undefined,
    active: readBoolean(raw.active, true),
    recipe: normalizeRecipe(raw.recipe),
  };
}

function normalizeProduct(value: unknown): Product | null {
  if (!isRecord(value)) return null;

  const name = readString(value.name);
  if (!name) return null;

  const id = readString(value.id) || readString(value._id) || readString(value.code) || name;
  const category = readString(value.category, 'ทั่วไป');
  const typeCode = readString(value.typeCode) || readString(value.code) || fallbackTypeCode(name, category);
  const variants = Array.isArray(value.variants) ? value.variants.map(normalizeProductVariant) : [];

  return {
    id,
    _id: readString(value._id) || undefined,
    quickProductId: readString(value.quickProductId) || undefined,
    productId: readString(value.productId) || undefined,
    variantId: readString(value.variantId) || undefined,
    name,
    category,
    code: readString(value.code, typeCode),
    typeCode,
    cover: readString(value.cover) || undefined,
    icon: readString(value.icon) || undefined,
    emoji: readString(value.emoji) || undefined,
    tint: readString(value.tint, '#F4F7FB'),
    badge: readString(value.badge) || undefined,
    active: readBoolean(value.active, true),
    quickSaleEnabled: readBoolean(value.quickSaleEnabled, false),
    isHotMenu: readBoolean(value.isHotMenu, false),
    quickSaleSortOrder: readNumber(value.quickSaleSortOrder, Number.MAX_SAFE_INTEGER),
    unitLabel: readString(value.unitLabel) || undefined,
    priceDisplayMode: value.priceDisplayMode === 'STARTING_AT' ? 'STARTING_AT' : 'FIXED',
    createdAt: readString(value.createdAt) || undefined,
    updatedAt: readString(value.updatedAt) || undefined,
    recipe: normalizeRecipe(value.recipe),
    variants,
  };
}

function extractProductsFromResponse(value: unknown): Product[] {
  const payload = extractArrayPayload(value, ['data', 'products', 'items', 'result', 'payload']);
  if (!payload) return [];
  return payload.map(normalizeProduct).filter((product): product is Product => Boolean(product));
}

function extractProductFromResponse(value: unknown): Product | null {
  const direct = normalizeProduct(value);
  if (direct) return direct;

  const payload = extractObjectPayload(value, ['data', 'product', 'item', 'result', 'payload']);
  return normalizeProduct(payload);
}

export function fetchProducts(options: { force?: boolean } = {}): Promise<Product[]> {
  return cachedProducts(
    productCache,
    async () => extractProductsFromResponse(await fetchApiJson<unknown>('/products', { cache: 'no-store' })),
    options.force === true,
    entry => {
      productCache = entry;
    }
  );
}

export function fetchQuickProducts(options: { force?: boolean } = {}): Promise<Product[]> {
  return cachedProducts(
    quickProductCache,
    async () => extractProductsFromResponse(await fetchApiJson<unknown>('/quick-products', { cache: 'no-store' })),
    options.force === true,
    entry => {
      quickProductCache = entry;
    }
  );
}

export type QuickProductPayload = { productId?: string; variantId?: string; name: string; code: string; typeCode?: string; category: string; price: number; unitLabel?: string; emoji?: string; tint?: string; isHotMenu?: boolean; active?: boolean; quickSaleSortOrder?: number };

export async function fetchQuickProductsForAdmin(): Promise<Product[]> {
  return extractProductsFromResponse(await fetchApiJson<unknown>('/quick-products?includeInactive=true', { cache: 'no-store' }));
}

export async function createQuickProduct(payload: QuickProductPayload): Promise<Product> {
  const product = extractProductFromResponse(await fetchApiJson<unknown>('/quick-products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }));
  if (!product) throw new Error('Backend did not return a valid quick menu');
  invalidateProductCache(); return product;
}

export async function updateQuickProduct(id: string, payload: Partial<QuickProductPayload>): Promise<Product> {
  const product = extractProductFromResponse(await fetchApiJson<unknown>(`/quick-products/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }));
  if (!product) throw new Error('Backend did not return a valid quick menu');
  invalidateProductCache(); return product;
}

export async function deleteQuickProduct(id: string): Promise<void> {
  await fetchApi(`/quick-products/${encodeURIComponent(id)}`, { method: 'DELETE' });
  invalidateProductCache();
}

export type QuickProductReorderItem = { id: string; quickSaleSortOrder: number };

export async function reorderQuickProducts(items: QuickProductReorderItem[]): Promise<Product[]> {
  const products = extractProductsFromResponse(await fetchApiJson<unknown>('/quick-products/reorder', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) }));
  invalidateProductCache();
  return products;
}
