import { extractArrayPayload, extractObjectPayload, fetchApi, fetchApiJson, isRecord } from './api';
import type { Product, ProductVariant } from './contracts';

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

function fallbackTypeCode(name: string, category: string): string {
  const source = `${category || name}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ก-๙]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  return source || 'general';
}

export function normalizeProductVariant(value: unknown): ProductVariant {
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
  };
}

export function normalizeProduct(value: unknown): Product | null {
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
    variants,
  };
}

export function extractProductsFromResponse(value: unknown): Product[] {
  const payload = extractArrayPayload(value, ['data', 'products', 'items', 'result', 'payload']);
  if (!payload) return [];
  return payload.map(normalizeProduct).filter((product): product is Product => Boolean(product));
}

export function extractProductFromResponse(value: unknown): Product | null {
  const direct = normalizeProduct(value);
  if (direct) return direct;

  const payload = extractObjectPayload(value, ['data', 'product', 'item', 'result', 'payload']);
  return normalizeProduct(payload);
}

export async function fetchProducts(): Promise<Product[]> {
  const responseBody = await fetchApiJson<unknown>('/products', { cache: 'no-store' });
  return extractProductsFromResponse(responseBody);
}

export type ProductPayload = Omit<Product, 'id' | '_id'> & {
  id?: string;
  _id?: string;
};

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const responseBody = await fetchApiJson<unknown>('/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const product = extractProductFromResponse(responseBody);
  if (!product) throw new Error('Backend did not return a valid product');
  return product;
}

export async function updateProduct(productId: string, payload: ProductPayload): Promise<Product> {
  const responseBody = await fetchApiJson<unknown>(`/products/${encodeURIComponent(productId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const product = extractProductFromResponse(responseBody);
  if (!product) throw new Error('Backend did not return a valid product');
  return product;
}

export async function deleteProduct(productId: string): Promise<void> {
  await fetchApi(`/products/${encodeURIComponent(productId)}`, { method: 'DELETE' });
}
