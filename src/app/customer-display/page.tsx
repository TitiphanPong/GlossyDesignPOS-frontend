'use client';

import { useEffect, useMemo, useState } from 'react';
import './customer.css';
import { computeOrderPaymentSummary } from '../utils/computeTotal';
import { normalizeCustomerDisplayPaymentMethod, normalizeOrderStatus } from '../../lib/contracts';
import { getPaymentQrProfileFromEnv } from '../../lib/promptpay';
import { subscribeCustomerDisplayRemote } from '../../lib/customer-display-sync';
import { isPendingOrderSettled, PENDING_ORDER_KEY, persistPendingOrderDraft, shouldDisplayPendingOrder, subscribePendingOrderDraft } from '../../lib/pending-order';
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

  const variantName = readVariantName(item.variant) ?? readOptionalString(item.variantName);

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
  const orderNumber = readOptionalString(raw.orderNumber);

  const rawPayment = typeof raw.payment === 'string' ? raw.payment : null;
  const rawStatus = typeof raw.status === 'string' ? raw.status : null;
  const cart = Array.isArray(raw.cart) ? raw.cart.map(normalizeCartItem).filter((item): item is CartItem => Boolean(item)) : [];

  return {
    orderId,
    orderNumber,
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

function readStoredOrder(): Order | null {
  const str = localStorage.getItem(PENDING_ORDER_KEY);
  if (!str) return null;

  try {
    const nextOrder = normalizeStoredOrder(JSON.parse(str));
    if (!nextOrder || !shouldDisplayPendingOrder(nextOrder)) {
      persistPendingOrderDraft(null);
      return null;
    }

    return nextOrder;
  } catch {
    persistPendingOrderDraft(null);
    return null;
  }
}

export default function CustomerScreen() {
  const [order, setOrder] = useState<Order | null>(null);
  const [dismissedOrderKey, setDismissedOrderKey] = useState<string | null>(null);
  const [remoteToken, setRemoteToken] = useState<string | null>(null);
  const paymentQrProfile = getPaymentQrProfileFromEnv();

  useEffect(() => {
    const token = new URLSearchParams(globalThis.location?.search ?? '').get('display');
    if (token) {
      setRemoteToken(token);
      return subscribeCustomerDisplayRemote(
        token,
        payload => {
          setOrder(normalizeStoredOrder(payload.state));
        },
        connected => {
          if (!connected) setOrder(null);
        }
      );
    }

    const handleStorage = () => {
      setOrder(readStoredOrder());
    };

    handleStorage();
    const unsubscribe = subscribePendingOrderDraft(handleStorage);

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!order) return;
    if (order.orderSyncStatus === 'submitting') return;

    const fullyPaid = isPendingOrderSettled(order);
    if (!fullyPaid) return;

    const timeoutId = setTimeout(() => {
      if (!remoteToken) {
        persistPendingOrderDraft(null);
      }
      setOrder(null);
    }, 6000);

    return () => clearTimeout(timeoutId);
  }, [order, remoteToken]);

  useEffect(() => {
    if (!order) {
      setDismissedOrderKey(null);
      return;
    }

    const activeOrderKey = order.clientDraftId ?? order.orderId ?? order.orderNumber;
    if (dismissedOrderKey && dismissedOrderKey !== activeOrderKey) {
      setDismissedOrderKey(null);
    }
  }, [dismissedOrderKey, order]);

  const summary = useMemo(() => (order ? computeOrderPaymentSummary(order) : null), [order]);
  const isPaid = order ? isPendingOrderSettled(order) : false;
  const activeOrderKey = order ? order.clientDraftId ?? order.orderId ?? order.orderNumber ?? null : null;
  const isDismissed = Boolean(order && activeOrderKey && dismissedOrderKey === activeOrderKey);
  if (!order) return <IdleScreen />;
  if (isPaid) return <PaidScreen />;
  if (isDismissed) return <IdleScreen />;
  if (!summary) return <IdleScreen />;
  if (!paymentQrProfile) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-center text-white">
        <div className="max-w-xl rounded-3xl border border-amber-400/30 bg-slate-900 p-8 shadow-2xl">
          <h1 className="text-2xl font-semibold">ยังไม่สามารถแสดง QR รับชำระเงินได้</h1>
          <p className="mt-3 text-slate-300">กรุณาแจ้งพนักงานตรวจสอบการตั้งค่า QR รับชำระเงินก่อนดำเนินการต่อ ระบบจะไม่สร้าง QR จากข้อมูลสำรองที่ไม่ผ่านการตรวจสอบ</p>
        </div>
      </main>
    );
  }

  return (
    <ActiveOrderScreen
      order={order}
      summary={summary}
      paymentQrProfile={paymentQrProfile}
      onClose={() => {
        if (!activeOrderKey) return;
        setDismissedOrderKey(activeOrderKey);
      }}
    />
  );
}
