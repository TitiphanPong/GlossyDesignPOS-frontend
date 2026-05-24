'use client';

import { useEffect, useMemo, useState } from 'react';
import './customer.css';
import { computeOrderPaymentSummary } from '../utils/computeTotal';
import { ActiveOrderScreen, IdleScreen, PaidScreen } from './components/customerDisplayScreens';
import type { CartItem, Order, StatusMeta } from './components/customerDisplayTypes';
import {
  normalizeCustomerDisplayPaymentMethod,
  normalizeOrderStatus,
  type OrderStatus,
} from '../../lib/contracts';

const STATUS_MESSAGES: Record<number, string> = {
  1: 'เธเธณเธฅเธฑเธเธฃเธฑเธเนเธเธฅเนเธเธฒเธเธเธญเธเธ—เนเธฒเธ...',
  2: 'เธเธณเธฅเธฑเธเธ•เธฃเธงเธเธชเธญเธเนเธเธฅเนเธเธฒเธ...',
  3: 'เธฃเธญเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ  Please Proceed to Payment',
  4: 'เธเธณเธฅเธฑเธเธเธฅเธดเธ•เธชเธดเธเธเนเธฒเธเธญเธเธ—เนเธฒเธ...',
  5: 'เธชเธดเธเธเนเธฒเธเธฃเนเธญเธกเธฃเธฑเธเนเธฅเนเธง!  Ready for Pickup',
};

const PAYMENT_CONFIRMING_MESSAGE = 'เธเธณเธฅเธฑเธเธขเธทเธเธขเธฑเธเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ เธเธฃเธธเธ“เธฒเธฃเธญเธชเธฑเธเธเธฃเธนเน';
const UNKNOWN_STATUS_MESSAGE = 'เธเธณเธฅเธฑเธเธ•เธฃเธงเธเธชเธญเธเธชเธ–เธฒเธเธฐเธเธณเธชเธฑเนเธเธเธทเนเธญ';
const CANCELLED_STATUS_MESSAGE = 'เธเธณเธชเธฑเนเธเธเธทเนเธญเธเธตเนเธ–เธนเธเธขเธเน€เธฅเธดเธเนเธฅเนเธง เธเธฃเธธเธ“เธฒเธ•เธดเธ”เธ•เนเธญเน€เธเนเธฒเธซเธเนเธฒเธ—เธตเน';

function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function readOptionalNullableString(value: unknown): string | null | undefined {
  if (value === null) return null;
  return readOptionalString(value);
}

function readNumber(value: unknown, fallback = 0): number {
  const numeric = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN;
  return Number.isFinite(numeric) ? numeric : fallback;
}

function readTaxInvoice(value: unknown): 'yes' | 'no' | undefined {
  return value === 'yes' || value === 'no' ? value : undefined;
}

function readOrderSyncStatus(value: unknown): Order['orderSyncStatus'] {
  return value === 'pending' || value === 'submitting' || value === 'submitted' ? value : undefined;
}

function normalizeCartItem(value: unknown): CartItem | null {
  if (!value || typeof value !== 'object') return null;

  const item = value as Record<string, unknown>;
  const name = readOptionalString(item.name);
  if (!name) return null;

  const variantName = item.variant && typeof item.variant === 'object' ? readOptionalString((item.variant as { name?: unknown }).name) : undefined;

  return {
    ...item,
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

function getWorkflowStep(status: OrderStatus): number {
  if (status === 'paid') return 5;
  if (status === 'partial') return 4;
  if (status === 'cancelled') return 3;
  return 3;
}

function getOrderStatusMeta(status: OrderStatus, hasUnsupportedStatus = false): StatusMeta {
  if (hasUnsupportedStatus) {
    return {
      bg: 'rgba(148,163,184,0.15)',
      border: 'rgba(148,163,184,0.4)',
      color: '#CBD5E1',
      label: 'เธเธณเธฅเธฑเธเธ•เธฃเธงเธเธชเธญเธเธชเธ–เธฒเธเธฐ',
    };
  }

  if (status === 'pending') {
    return {
      bg: 'rgba(255,152,0,0.15)',
      border: 'rgba(255,152,0,0.45)',
      color: '#FFB74D',
      label: 'โ€ข เธฃเธญเธเธณเธฃเธฐเน€เธเธดเธ',
    };
  }

  if (status === 'partial') {
    return {
      bg: 'rgba(41,121,255,0.15)',
      border: 'rgba(41,121,255,0.45)',
      color: '#64B5F6',
      label: 'โ€ข เธกเธฑเธ”เธเธณเนเธฅเนเธง',
    };
  }

  if (status === 'cancelled') {
    return {
      bg: 'rgba(255,82,82,0.15)',
      border: 'rgba(255,82,82,0.45)',
      color: '#FF8A80',
      label: 'เธขเธเน€เธฅเธดเธเธเธณเธชเธฑเนเธเธเธทเนเธญ',
    };
  }

  return {
    bg: 'rgba(0,200,100,0.15)',
    border: 'rgba(0,200,100,0.45)',
    color: '#69F0AE',
    label: 'โ€ข เธเธณเธฃเธฐเนเธฅเนเธง',
  };
}

function getStatusMessage(status: OrderStatus, hasUnsupportedStatus = false): string {
  if (hasUnsupportedStatus) return UNKNOWN_STATUS_MESSAGE;
  if (status === 'cancelled') return CANCELLED_STATUS_MESSAGE;
  if (status === 'partial') return 'เธเธณเธฃเธฐเธกเธฑเธ”เธเธณเนเธฅเนเธง เธเธณเธฅเธฑเธเน€เธ•เธฃเธตเธขเธกเธเธฅเธดเธ•เธเธฒเธเธเธญเธเธ—เนเธฒเธ';
  if (status === 'paid') return 'เธเธณเธฃเธฐเน€เธเธดเธเน€เธฃเธตเธขเธเธฃเนเธญเธขเนเธฅเนเธง';
  return 'เธฃเธญเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ Please Proceed to Payment';
}

export default function CustomerScreen() {
  const [order, setOrder] = useState<Order | null>(null);
  const promptpayId = process.env.NEXT_PUBLIC_PROMPTPAY_ID || '0625624598';

  useEffect(() => {
    const handleStorage = () => {
      const str = localStorage.getItem('pendingOrder');
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

    const fullyPaid = order.status === 'paid' || (order.status === 'partial' && order.remainingTotal === 0);
    if (!fullyPaid) return;

    const timeoutId = setTimeout(() => {
      localStorage.removeItem('pendingOrder');
      setOrder(null);
    }, 6000);

    return () => clearTimeout(timeoutId);
  }, [order]);

  const summary = useMemo(() => (order ? computeOrderPaymentSummary(order) : null), [order]);
  const currentStep = order ? getWorkflowStep(order.status) : 3;
  const isPaid = order ? order.status === 'paid' || (order.status === 'partial' && order.remainingTotal === 0) : false;
  const statusLabel = STATUS_MESSAGES[currentStep] ?? 'เธเธณเธฅเธฑเธเธ”เธณเน€เธเธดเธเธเธฒเธฃ...';
  const displayStatusLabel =
    order?.orderSyncStatus === 'submitting'
      ? PAYMENT_CONFIRMING_MESSAGE
      : order
        ? getStatusMessage(order.status, order.hasUnsupportedStatus)
        : statusLabel;
  const statusMeta = order ? getOrderStatusMeta(order.status, order.hasUnsupportedStatus) : null;

  if (!order) return <IdleScreen />;
  if (isPaid) return <PaidScreen />;
  if (!summary || !statusMeta) return <IdleScreen />;

  return <ActiveOrderScreen order={order} summary={summary} currentStep={currentStep} statusLabel={displayStatusLabel} promptpayId={promptpayId} statusMeta={statusMeta} />;
}
