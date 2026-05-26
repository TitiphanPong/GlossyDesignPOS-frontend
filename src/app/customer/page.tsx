'use client';

import { useEffect, useMemo, useState } from 'react';
import './customer.css';
import { computeOrderPaymentSummary } from '../utils/computeTotal';
import { normalizeCustomerDisplayPaymentMethod, normalizeOrderStatus } from '../../lib/contracts';
import { isPendingOrderSettled, PENDING_ORDER_KEY } from '../../lib/pending-order';
import { ActiveOrderScreen } from './components/CustomerActiveOrderScreen';
import { IdleScreen, PaidScreen } from './components/CustomerDisplayShell';
import { type CartItem, type Order } from './components/customerDisplayShared';

function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function readOptionalNullableString(value: unknown): string | null | undefined {
  if (value === null) return null;
  return readOptionalString(value);
}

function readNumber(value: unknown, fallback = 0): number {
  let numeric = Number.NaN;
  if (typeof value === 'number') {
    numeric = value;
  } else if (typeof value === 'string') {
    numeric = Number(value);
  }
  return Number.isFinite(numeric) ? numeric : fallback;
}

function readTaxInvoice(value: unknown): 'yes' | 'no' | undefined {
  return value === 'yes' || value === 'no' ? value : undefined;
}

function readOrderSyncStatus(value: unknown): Order['orderSyncStatus'] {
  return value === 'pending' || value === 'submitting' || value === 'submitted' ? value : undefined;
}

function readVariantName(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  return readOptionalString((value as { name?: unknown }).name);
}

function normalizeCartItem(value: unknown): CartItem | null {
  if (!value || typeof value !== 'object') return null;

  const item = value as Record<string, unknown>;
  const name = readOptionalString(item.name);
  if (!name) return null;

  const variantName = readVariantName(item.variant);

  return {
    name,
    category: readOptionalString(item.category),
    qty: Math.max(0, readNumber(item.qty)),
    totalPrice: readNumber(item.totalPrice),
    fullPayment: typeof item.fullPayment === 'boolean' ? item.fullPayment : undefined,
    deposit: readNumber(item.deposit, 0),
    remaining: readNumber(item.remaining, 0),
    material: readOptionalString(item.material),
    variant: variantName ? { name: variantName } : undefined,
    size: readOptionalString(item.size),
    note: readOptionalString(item.note),
  };
}

function normalizeStoredOrder(value: unknown): Order | null {
  if (!value || typeof value !== 'object') return null;

  const raw = value as Record<string, unknown>;
  const orderId = readOptionalString(raw.orderId);
  if (!orderId) return null;

  const rawPayment = typeof raw.payment === 'string' ? raw.payment : null;
  const rawStatus = typeof raw.status === 'string' ? raw.status : null;
  const cart = Array.isArray(raw.cart) ? raw.cart.map(normalizeCartItem).filter((item): item is CartItem => Boolean(item)) : [];

  return {
    orderId,
    clientDraftId: readOptionalString(raw.clientDraftId),
    rawPayment,
    rawStatus,
    hasUnsupportedPayment: Boolean(rawPayment) && rawPayment !== normalizeCustomerDisplayPaymentMethod(rawPayment),
    hasUnsupportedStatus: Boolean(rawStatus) && rawStatus !== normalizeOrderStatus(rawStatus),
    customerName: readOptionalString(raw.customerName),
    phoneNumber: readOptionalString(raw.phoneNumber),
    note: readOptionalString(raw.note),
    total: readNumber(raw.total),
    discount: readNumber(raw.discount),
    grandTotal: readNumber(raw.grandTotal, readNumber(raw.total)),
    payment: normalizeCustomerDisplayPaymentMethod(raw.payment),
    status: normalizeOrderStatus(raw.status),
    cart,
    taxInvoice: readTaxInvoice(raw.taxInvoice),
    vatAmount: readNumber(raw.vatAmount, 0),
    remainingTotal: readNumber(raw.remainingTotal, 0),
    orderSyncStatus: readOrderSyncStatus(raw.orderSyncStatus),
    lastSubmissionError: readOptionalNullableString(raw.lastSubmissionError),
  };
}

export default function CustomerScreen() {
  const [order, setOrder] = useState<Order | null>(null);
  const promptpayId = process.env.NEXT_PUBLIC_PROMPTPAY_ID || '0625624598';

  useEffect(() => {
    const handleStorage = () => {
      const str = localStorage.getItem(PENDING_ORDER_KEY);
      if (!str) {
        setOrder(null);
        return;
      }

      try {
        setOrder(normalizeStoredOrder(JSON.parse(str)));
      } catch {
        setOrder(null);
      }
    };

    handleStorage();
    globalThis.window?.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 500);

    return () => {
      globalThis.window?.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!order) return;
    if (order.orderSyncStatus === 'submitting') return;

    const fullyPaid = isPendingOrderSettled(order);
    if (!fullyPaid) return;

    const timeoutId = setTimeout(() => {
      localStorage.removeItem(PENDING_ORDER_KEY);
      setOrder(null);
    }, 6000);

    return () => clearTimeout(timeoutId);
  }, [order]);

  const summary = useMemo(() => (order ? computeOrderPaymentSummary(order) : null), [order]);
  const isPaid = order ? isPendingOrderSettled(order) : false;
  if (!order) return <IdleScreen />;
  if (isPaid) return <PaidScreen />;
  if (!summary) return <IdleScreen />;

  return <ActiveOrderScreen order={order} summary={summary} promptpayId={promptpayId} />;
}
