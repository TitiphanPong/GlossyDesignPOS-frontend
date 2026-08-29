import type { CreateOrderRequest, OrderDiscountInput, PaymentMethod, PendingOrderDraft } from './contracts';
import { publishCustomerDisplayStateIfPaired } from './customer-display-sync';

export type PendingOrderSyncStatus = 'pending' | 'submitting' | 'submitted';
export const PENDING_ORDER_SUBMIT_LOCK_TTL_MS = 60 * 1000;

export type StoredPendingOrderDraft = PendingOrderDraft & {
  orderId?: string;
  orderNumber?: string;
  trackingUrl?: string;
  clientDraftId?: string;
  payment?: PaymentMethod;
  discount?: number;
  discountSource?: OrderDiscountInput;
  customerId?: string;
  customerName?: string;
  phoneNumber?: string;
  taxId?: string;
  address?: string;
  note?: string;
  cart?: unknown[];
  orderSyncStatus?: PendingOrderSyncStatus;
  orderSyncStartedAt?: number;
  lastSubmissionError?: string | null;
};

type CheckoutCustomerInfo = {
  customerId?: string;
  customerName: string;
  phoneNumber: string;
  taxId?: string;
  address?: string;
  note: string;
};

type CheckoutTotals = {
  total: number;
  discountAmount: number;
  depositTotal: number;
  remainingTotal: number;
  adjustedCart: unknown[];
  vatAmount: number;
  grandTotal: number;
};

export const PENDING_ORDER_KEY = 'pendingOrder';
const PENDING_ORDER_CHANNEL = 'glossy-pending-order';
const BACKEND_VARIANT_FIELDS = ['id', '_id', 'name', 'price', 'note', 'material', 'sides', 'size', 'active', 'custom', 'width', 'height'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function sanitizeOrderItemForBackend(item: unknown): unknown {
  if (!isRecord(item)) {
    return item;
  }

  const variant = item.variant;
  if (!isRecord(variant)) {
    return item;
  }

  const sanitizedVariant = Object.fromEntries(
    BACKEND_VARIANT_FIELDS
      .filter(field => variant[field] !== undefined)
      .map(field => [field, variant[field]])
  );

  return {
    ...item,
    variant: sanitizedVariant,
  };
}

function sanitizeCartForBackend(cart: unknown): unknown {
  return Array.isArray(cart) ? cart.map(sanitizeOrderItemForBackend) : cart;
}

function getPendingOrderBroadcastChannel(): BroadcastChannel | null {
  if (globalThis.window === undefined || globalThis.BroadcastChannel === undefined) {
    return null;
  }

  return new BroadcastChannel(PENDING_ORDER_CHANNEL);
}

export function getPendingOrderFinalStatus(order: Pick<StoredPendingOrderDraft, 'remainingTotal'>): 'partial' | 'paid' {
  return Number(order.remainingTotal ?? 0) > 0 ? 'partial' : 'paid';
}

export function persistPendingOrderDraft(order: StoredPendingOrderDraft | null): void {
  if (globalThis.window === undefined) return;

  if (order) {
    globalThis.localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(order));
  } else {
    globalThis.localStorage.removeItem(PENDING_ORDER_KEY);
  }

  const channel = getPendingOrderBroadcastChannel();
  channel?.postMessage({ key: PENDING_ORDER_KEY, order });
  channel?.close();
  globalThis.dispatchEvent(new Event('storage'));
  void publishCustomerDisplayStateIfPaired(order).catch(() => {
    // Remote customer display sync is best-effort and must never block checkout.
  });
}

export function subscribePendingOrderDraft(onChange: () => void): () => void {
  if (globalThis.window === undefined) {
    return () => undefined;
  }

  const handleStorage = () => {
    onChange();
  };

  globalThis.addEventListener('storage', handleStorage);

  const channel = getPendingOrderBroadcastChannel();
  if (!channel) {
    return () => {
      globalThis.removeEventListener('storage', handleStorage);
    };
  }

  channel.onmessage = event => {
    if (event.data?.key === PENDING_ORDER_KEY) {
      onChange();
    }
  };

  return () => {
    globalThis.removeEventListener('storage', handleStorage);
    channel.close();
  };
}

export function hasPendingOrderCartItems(order: Pick<StoredPendingOrderDraft, 'cart'>): boolean {
  return Array.isArray(order.cart) && order.cart.length > 0;
}

export function shouldDisplayPendingOrder(order: Pick<StoredPendingOrderDraft, 'status' | 'cart'>): boolean {
  return order.status !== 'cancelled' && hasPendingOrderCartItems(order);
}

export function isPendingOrderSubmitted(order: Pick<StoredPendingOrderDraft, 'orderSyncStatus' | 'status'>): boolean {
  return order.orderSyncStatus === 'submitted' || order.status === 'paid' || order.status === 'partial';
}

export function isPendingOrderSubmissionLocked(
  order: Pick<StoredPendingOrderDraft, 'orderSyncStatus' | 'orderSyncStartedAt'>,
  now = Date.now(),
): boolean {
  if (order.orderSyncStatus !== 'submitting') {
    return false;
  }

  if (typeof order.orderSyncStartedAt !== 'number' || !Number.isFinite(order.orderSyncStartedAt)) {
    return false;
  }

  return now - order.orderSyncStartedAt < PENDING_ORDER_SUBMIT_LOCK_TTL_MS;
}

export function isPendingOrderSettled(order: Pick<StoredPendingOrderDraft, 'status' | 'remainingTotal'>): boolean {
  return order.status === 'paid' || (order.status === 'partial' && Number(order.remainingTotal ?? 0) === 0);
}

export function buildPendingOrderPayload(order: StoredPendingOrderDraft, status: 'partial' | 'paid'): CreateOrderRequest {
  void status;
  const cart = Array.isArray(sanitizeCartForBackend(order.cart))
    ? (sanitizeCartForBackend(order.cart) as Array<Record<string, unknown>>).map(item => {
        const variant = isRecord(item.variant) ? item.variant : {};
        const productId = typeof item.productId === 'string' ? item.productId : undefined;
        const productCode = typeof item.productCode === 'string' ? item.productCode : undefined;
        const typeCode = typeof item.typeCode === 'string' ? item.typeCode : undefined;
        const name = typeof item.name === 'string' ? item.name : 'Custom item';
        const rawUnitPrice = Number(item.unitPrice ?? 0);
        const unitPrice = Math.round((rawUnitPrice + Number.EPSILON) * 100) / 100;
        const rawCatalogUnitPrice = typeof variant.price === 'number' && Number.isFinite(variant.price) ? variant.price : null;
        const catalogUnitPrice = rawCatalogUnitPrice === null ? null : Math.round((rawCatalogUnitPrice + Number.EPSILON) * 100) / 100;
        const hasCatalogIdentity = Boolean(productId || productCode || typeCode);
        const usesAuthoritativeCatalogPrice = hasCatalogIdentity && catalogUnitPrice !== null && catalogUnitPrice === unitPrice;

        return {
          ...(productId ? { productId } : {}),
          ...(productCode ? { productCode } : {}),
          ...(typeCode ? { typeCode } : {}),
          ...(typeof variant.id === 'string' ? { variantId: variant.id } : {}),
          ...(typeof variant._id === 'string' ? { variantId: variant._id } : {}),
          ...(typeof variant.name === 'string' ? { variantName: variant.name } : {}),
          ...(!productId && !productCode && !typeCode ? { customName: name } : {}),
          quantity: Number(item.qty ?? item.quantity ?? 0),
          ...(usesAuthoritativeCatalogPrice ? {} : { priceOverride: { unitPrice, reason: 'configured_pos_quote' } }),
          ...Object.fromEntries(
            ['material', 'colorMode', 'type', 'typePremium', 'shape', 'size', 'setCount', 'inkjetType', 'sizeFlex', 'stickerPVCType', 'plotPlanType', 'sides', 'productNote', 'note', 'fullPayment']
              .filter(field => item[field] !== undefined)
              .map(field => [field, item[field]])
          ),
        };
      })
    : [];
  const paymentAmount = Number(order.depositTotal ?? 0) > 0
    ? Number(order.depositTotal)
    : Number(order.remainingTotal ?? 0) === 0
      ? Number(order.grandTotal ?? 0)
      : 0;

  return {
    clientDraftId: order.clientDraftId,
    customerId: order.customerId,
    orderType: 'NORMAL',
    customerName: order.customerName,
    phoneNumber: order.phoneNumber,
    taxId: order.taxId,
    address: order.address,
    note: order.note,
    taxInvoice: order.taxInvoice,
    discount: order.discountSource ?? { type: 'amount', value: Number(order.discount ?? 0) },
    ...(paymentAmount > 0
      ? {
          initialPayment: {
            amount: paymentAmount,
            method: order.payment ?? 'cash',
            receivedAmount: paymentAmount,
          },
        }
      : {}),
    cart,
  };
}

export function buildPendingOrderDraft({
  draftId,
  customer,
  payment,
  discount,
  taxInvoice,
  totals,
}: {
  draftId: string;
  customer: CheckoutCustomerInfo;
  payment: PaymentMethod;
  discount: OrderDiscountInput;
  taxInvoice: 'yes' | 'no';
  totals: CheckoutTotals;
}): StoredPendingOrderDraft {
  return {
    clientDraftId: draftId,
    ...customer,
    payment,
    total: totals.total,
    discount: totals.discountAmount,
    discountSource: discount,
    status: 'pending',
    orderSyncStatus: 'pending',
    orderSyncStartedAt: undefined,
    lastSubmissionError: null,
    depositTotal: totals.depositTotal,
    remainingTotal: totals.remainingTotal,
    cart: totals.adjustedCart,
    taxInvoice,
    vatAmount: totals.vatAmount,
    grandTotal: totals.grandTotal,
  };
}
