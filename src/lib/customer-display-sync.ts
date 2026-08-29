import { buildApiUrl, fetchApiJson } from './api';

const CUSTOMER_DISPLAY_SESSION_KEY = 'glossyCustomerDisplaySession';
const PENDING_ORDER_KEY = 'pendingOrder';

export type CustomerDisplaySession = {
  sessionId: string;
  displayToken: string;
  expiresAt: string;
};

export type CustomerDisplayRemotePayload = {
  type: 'state';
  state: Record<string, unknown> | null;
  sessionId: string;
  updatedAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function readSession(): CustomerDisplaySession | null {
  if (globalThis.window === undefined) return null;
  const raw = globalThis.localStorage.getItem(CUSTOMER_DISPLAY_SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CustomerDisplaySession>;
    if (!parsed.sessionId || !parsed.displayToken || !parsed.expiresAt) return null;
    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      globalThis.localStorage.removeItem(CUSTOMER_DISPLAY_SESSION_KEY);
      return null;
    }
    return parsed as CustomerDisplaySession;
  } catch {
    globalThis.localStorage.removeItem(CUSTOMER_DISPLAY_SESSION_KEY);
    return null;
  }
}

function sanitizeCartItem(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value)) return null;
  const name = typeof value.name === 'string' ? value.name.trim() : '';
  if (!name) return null;
  const qty = Number(value.qty ?? value.quantity ?? 0);
  const totalPrice = Number(value.totalPrice ?? value.lineTotal ?? 0);
  const variant = isRecord(value.variant) ? value.variant : null;
  return {
    name,
    ...(typeof value.category === 'string' && value.category.trim() ? { category: value.category.trim() } : {}),
    qty: Number.isFinite(qty) && qty >= 0 ? qty : 0,
    totalPrice: Number.isFinite(totalPrice) && totalPrice >= 0 ? totalPrice : 0,
    ...(typeof value.fullPayment === 'boolean' ? { fullPayment: value.fullPayment } : {}),
    ...(Number.isFinite(Number(value.deposit)) && Number(value.deposit) >= 0 ? { deposit: Number(value.deposit) } : {}),
    ...(Number.isFinite(Number(value.remaining)) && Number(value.remaining) >= 0 ? { remaining: Number(value.remaining) } : {}),
    ...(typeof value.material === 'string' && value.material.trim() ? { material: value.material.trim() } : {}),
    ...(variant && typeof variant.name === 'string' && variant.name.trim() ? { variantName: variant.name.trim() } : {}),
    ...(typeof value.variantName === 'string' && value.variantName.trim() ? { variantName: value.variantName.trim() } : {}),
    ...(typeof value.size === 'string' && value.size.trim() ? { size: value.size.trim() } : {}),
  };
}

export function sanitizeCustomerDisplayState(value: unknown): Record<string, unknown> | null {
  if (!isRecord(value)) return null;
  const cart = Array.isArray(value.cart) ? value.cart.map(sanitizeCartItem).filter((item): item is Record<string, unknown> => Boolean(item)) : [];
  if (!cart.length) return null;
  const total = Number(value.total ?? 0);
  const discount = Number(value.discount ?? 0);
  const grandTotal = Number(value.grandTotal ?? total);
  const remainingTotal = Number(value.remainingTotal ?? 0);
  const payment = value.payment === 'promptpay' ? 'promptpay' : 'cash';
  const supportedStatuses = new Set(['pending', 'awaiting_payment', 'partial', 'paid', 'producing', 'ready_for_pickup', 'delivered', 'cancelled']);
  const status = typeof value.status === 'string' && supportedStatuses.has(value.status) ? value.status : 'pending';

  return {
    ...(typeof value.orderId === 'string' && value.orderId.trim() ? { orderId: value.orderId.trim() } : {}),
    ...(typeof value.orderNumber === 'string' && value.orderNumber.trim() ? { orderNumber: value.orderNumber.trim() } : {}),
    ...(typeof value.clientDraftId === 'string' && value.clientDraftId.trim() ? { clientDraftId: value.clientDraftId.trim() } : {}),
    total: Number.isFinite(total) && total >= 0 ? total : 0,
    discount: Number.isFinite(discount) && discount >= 0 ? discount : 0,
    grandTotal: Number.isFinite(grandTotal) && grandTotal >= 0 ? grandTotal : 0,
    payment,
    status,
    cart,
    ...(value.taxInvoice === 'yes' || value.taxInvoice === 'no' ? { taxInvoice: value.taxInvoice } : {}),
    ...(Number.isFinite(Number(value.vatAmount)) && Number(value.vatAmount) >= 0 ? { vatAmount: Number(value.vatAmount) } : {}),
    remainingTotal: Number.isFinite(remainingTotal) && remainingTotal >= 0 ? remainingTotal : 0,
    ...(value.orderSyncStatus === 'pending' || value.orderSyncStatus === 'submitting' || value.orderSyncStatus === 'submitted'
      ? { orderSyncStatus: value.orderSyncStatus }
      : {}),
  };
}

export async function ensureCustomerDisplaySession(): Promise<CustomerDisplaySession> {
  const existing = readSession();
  if (existing) return existing;
  const created = await fetchApiJson<CustomerDisplaySession>('/customer-display/sessions', { method: 'POST' });
  globalThis.localStorage.setItem(CUSTOMER_DISPLAY_SESSION_KEY, JSON.stringify(created));
  const pending = globalThis.localStorage.getItem(PENDING_ORDER_KEY);
  if (pending) {
    try {
      await publishCustomerDisplayStateIfPaired(JSON.parse(pending));
    } catch {
      // Pairing succeeds even if the currently open draft cannot be republished.
    }
  }
  return created;
}

export function getCustomerDisplayPairingUrl(session: CustomerDisplaySession, origin = globalThis.location?.origin): string | null {
  if (!origin) return null;
  const url = new URL('/customer-display', origin);
  url.searchParams.set('display', session.displayToken);
  return url.toString();
}

export async function publishCustomerDisplayStateIfPaired(value: unknown): Promise<void> {
  const session = readSession();
  if (!session) return;
  const state = sanitizeCustomerDisplayState(value);
  await fetchApiJson(`/customer-display/sessions/${encodeURIComponent(session.sessionId)}/state`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state }),
  });
}

export function subscribeCustomerDisplayRemote(
  token: string,
  onPayload: (payload: CustomerDisplayRemotePayload) => void,
  onConnectionChange?: (connected: boolean) => void,
): () => void {
  const url = `${buildApiUrl('/customer-display/events')}?token=${encodeURIComponent(token)}`;
  const source = new EventSource(url);
  source.onopen = () => onConnectionChange?.(true);
  source.onerror = () => onConnectionChange?.(false);
  source.onmessage = event => {
    try {
      const parsed = JSON.parse(event.data) as CustomerDisplayRemotePayload;
      if (parsed?.type === 'state') onPayload(parsed);
    } catch {
      // Ignore malformed events and keep the stream alive for the next valid state.
    }
  };
  return () => source.close();
}
