import type { PaymentMethod, PendingOrderDraft } from './contracts';

export type PendingOrderSyncStatus = 'pending' | 'submitting' | 'submitted';

export type StoredPendingOrderDraft = PendingOrderDraft & {
  orderId?: string;
  clientDraftId?: string;
  payment?: PaymentMethod;
  discount?: number;
  customerName?: string;
  phoneNumber?: string;
  note?: string;
  cart?: unknown[];
  orderSyncStatus?: PendingOrderSyncStatus;
  lastSubmissionError?: string | null;
};

type CheckoutCustomerInfo = {
  customerName: string;
  phoneNumber: string;
  note: string;
};

type CheckoutTotals = {
  total: number;
  depositTotal: number;
  remainingTotal: number;
  adjustedCart: unknown[];
  vatAmount: number;
  grandTotal: number;
};

export const PENDING_ORDER_KEY = 'pendingOrder';

export function getPendingOrderFinalStatus(order: Pick<StoredPendingOrderDraft, 'remainingTotal'>): 'partial' | 'paid' {
  return Number(order.remainingTotal ?? 0) > 0 ? 'partial' : 'paid';
}

export function persistPendingOrderDraft(order: StoredPendingOrderDraft | null): void {
  if (typeof window === 'undefined') return;

  if (order) {
    window.localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(order));
  } else {
    window.localStorage.removeItem(PENDING_ORDER_KEY);
  }

  window.dispatchEvent(new Event('storage'));
}

export function hasPendingOrderCartItems(order: Pick<StoredPendingOrderDraft, 'cart'>): boolean {
  return Array.isArray(order.cart) && order.cart.length > 0;
}

export function shouldDisplayPendingOrder(order: Pick<StoredPendingOrderDraft, 'orderId' | 'status' | 'cart'>): boolean {
  return typeof order.orderId === 'string' && order.orderId.trim().length > 0 && order.status !== 'cancelled' && hasPendingOrderCartItems(order);
}

export function isPendingOrderSubmitted(order: Pick<StoredPendingOrderDraft, 'orderSyncStatus' | 'status'>): boolean {
  return order.orderSyncStatus === 'submitted' || order.status === 'paid' || order.status === 'partial';
}

export function isPendingOrderSettled(order: Pick<StoredPendingOrderDraft, 'status' | 'remainingTotal'>): boolean {
  return order.status === 'paid' || (order.status === 'partial' && Number(order.remainingTotal ?? 0) === 0);
}

export function buildPendingOrderPayload(order: StoredPendingOrderDraft, status: 'partial' | 'paid'): PendingOrderDraft {
  const payload = { ...order };
  delete payload.clientDraftId;
  delete payload.orderSyncStatus;
  delete payload.lastSubmissionError;

  return {
    ...payload,
    status,
    taxInvoice: payload.taxInvoice,
    vatAmount: payload.vatAmount,
    grandTotal: payload.grandTotal,
  };
}

export function buildPendingOrderDraft({
  orderId,
  draftId,
  customer,
  payment,
  discount,
  taxInvoice,
  totals,
}: {
  orderId: string;
  draftId: string;
  customer: CheckoutCustomerInfo;
  payment: PaymentMethod;
  discount: number;
  taxInvoice: 'yes' | 'no';
  totals: CheckoutTotals;
}): StoredPendingOrderDraft {
  return {
    orderId,
    clientDraftId: draftId,
    ...customer,
    payment,
    total: totals.total,
    discount,
    status: 'pending',
    orderSyncStatus: 'pending',
    lastSubmissionError: null,
    depositTotal: totals.depositTotal,
    remainingTotal: totals.remainingTotal,
    cart: totals.adjustedCart,
    taxInvoice,
    vatAmount: totals.vatAmount,
    grandTotal: totals.grandTotal,
  };
}
