import type { PaymentMethod, PendingOrderDraft } from './contracts';

export type PendingOrderSyncStatus = 'pending' | 'submitting' | 'submitted';

export type StoredPendingOrderDraft = PendingOrderDraft & {
  orderId?: string;
  orderNumber?: string;
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
const PENDING_ORDER_CHANNEL = 'glossy-pending-order';

function getPendingOrderBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof window.BroadcastChannel === 'undefined') {
    return null;
  }

  return new BroadcastChannel(PENDING_ORDER_CHANNEL);
}

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

  const channel = getPendingOrderBroadcastChannel();
  channel?.postMessage({ key: PENDING_ORDER_KEY, order });
  channel?.close();
  window.dispatchEvent(new Event('storage'));
}

export function subscribePendingOrderDraft(onChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleStorage = () => {
    onChange();
  };

  window.addEventListener('storage', handleStorage);

  const channel = getPendingOrderBroadcastChannel();
  if (!channel) {
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }

  channel.onmessage = event => {
    if (event.data?.key === PENDING_ORDER_KEY) {
      onChange();
    }
  };

  return () => {
    window.removeEventListener('storage', handleStorage);
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

export function isPendingOrderSettled(order: Pick<StoredPendingOrderDraft, 'status' | 'remainingTotal'>): boolean {
  return order.status === 'paid' || (order.status === 'partial' && Number(order.remainingTotal ?? 0) === 0);
}

export function buildPendingOrderPayload(order: StoredPendingOrderDraft, status: 'partial' | 'paid'): PendingOrderDraft {
  const payload = { ...order };
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
  discount: number;
  taxInvoice: 'yes' | 'no';
  totals: CheckoutTotals;
}): StoredPendingOrderDraft {
  return {
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
