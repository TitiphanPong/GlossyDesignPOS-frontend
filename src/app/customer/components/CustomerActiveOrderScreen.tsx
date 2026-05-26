'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  PackageCheck,
  Palette,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Store,
  TimerReset,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import generatePayload from 'promptpay-qr';
import type { PaymentSummaryResult } from '../../utils/computeTotal';
import { formatMoney, getCartKey, type CartItem, type Order } from './customerDisplayShared';

type DisplayStatusTone = 'warning' | 'success' | 'danger' | 'info';

type StatusStep = {
  id: number;
  title: string;
  subtitle: string;
};

const bankDetails = {
  name: 'Bangkok Bank',
  accountName: 'Glossy Design Co., Ltd.',
  accountNumber: '123-4-56789-0',
};

const statusSteps: StatusStep[] = [
  { id: 1, title: 'Review Order', subtitle: 'Items confirmed' },
  { id: 2, title: 'Scan Payment', subtitle: 'Customer action' },
  { id: 3, title: 'Verify Payment', subtitle: 'Staff validation' },
  { id: 4, title: 'Enter Production', subtitle: 'Job released' },
];

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function panelClassName(extra?: string) {
  return cn(
    'relative overflow-hidden rounded-[28px] border border-white/70 bg-white/76 shadow-[0_24px_72px_rgba(37,99,235,0.10)] backdrop-blur-xl',
    extra,
  );
}

function getToneFromStatus(status: Order['status'], hasUnsupportedStatus?: boolean): DisplayStatusTone {
  if (hasUnsupportedStatus) return 'info';
  if (status === 'paid') return 'success';
  if (status === 'cancelled') return 'danger';
  if (status === 'partial') return 'info';
  return 'warning';
}

function getStatusBadgeLabel(order: Order): string {
  if (order.hasUnsupportedStatus) return 'Status Updating';
  if (order.orderSyncStatus === 'submitting') return 'Staff Verifying';
  if (order.status === 'partial') return 'Deposit Received';
  if (order.status === 'paid') return 'Paid';
  if (order.status === 'cancelled') return 'On Hold';
  return 'Awaiting Payment';
}

function getPaymentInstruction(order: Order): string {
  if (order.orderSyncStatus === 'submitting') return 'Payment detected. Our staff is verifying the transaction.';
  if (order.status === 'partial') return 'Deposit received. Please wait while the staff releases your job to production.';
  if (order.status === 'cancelled') return 'Please contact staff at the cashier counter for assistance.';
  return 'Scan the QR code and show this screen to staff after payment.';
}

function getEstimatedReadyTime(order: Order): string {
  if (order.status === 'paid') return 'Today, 18:30';
  if (order.status === 'partial') return 'Today, 19:15';
  if (order.orderSyncStatus === 'submitting') return 'Pending verification';
  return 'After payment';
}

function getActiveStep(order: Order): number {
  if (order.status === 'paid') return 4;
  if (order.orderSyncStatus === 'submitting') return 3;
  return 2;
}

function formatDisplayOrderId(orderId: string): string {
  const normalized = orderId.replace(/^#/, '').trim();
  if (/^GD[-A-Z0-9]+$/i.test(normalized)) {
    return `#${normalized.toUpperCase()}`;
  }

  const digits = normalized.replace(/\D/g, '').slice(-5).padStart(5, '0');
  return `#GD-BKK-${new Date().getFullYear()}-${digits}`;
}

function getUnitPrice(item: CartItem): number {
  return item.qty > 0 ? item.totalPrice / item.qty : item.totalPrice;
}

function getItemDescription(item: CartItem): string {
  return [item.category, item.material, item.variant?.name, item.size, item.note].filter(Boolean).join(' • ') || 'Premium print production';
}

function getPickupMethod(order: Order): string {
  return order.status === 'paid' ? 'Counter Pickup' : 'Pickup after payment';
}

function ClockBlock() {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="flex items-center gap-3 rounded-[20px] border border-slate-200/80 bg-white/88 px-4 py-2.5 shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]">
        <CalendarDays className="h-4.5 w-4.5" />
      </div>
      <div className="text-right">
        <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
          {now.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </div>
        <div className="text-[1.75rem] font-semibold tracking-tight text-slate-900 md:text-[1.9rem]">
          {now.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}

function HeaderBadge({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50/90 px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-blue-700 uppercase">
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  emphasis,
  valueClassName,
}: Readonly<{
  label: string;
  value: string;
  emphasis?: boolean;
  valueClassName?: string;
}>) {
  return (
    <div className={cn('flex items-center justify-between text-sm', emphasis ? 'font-semibold text-slate-900' : 'text-slate-500')}>
      <span>{label}</span>
      <span className={cn(emphasis ? 'text-slate-900' : 'text-slate-600', valueClassName)}>{value}</span>
    </div>
  );
}

function ProductAvatar({ item }: Readonly<{ item: CartItem }>) {
  return (
    <div className="relative h-20 w-20 overflow-hidden rounded-[22px] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.84)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.22),transparent_55%)]" />
      <div className="absolute inset-x-3 top-3 h-7 rounded-xl bg-white/70" />
      <div className="absolute inset-x-3 bottom-3 h-7 rounded-xl bg-blue-100/70" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_12px_30px_rgba(37,99,235,0.24)]">
          <Palette className="h-5 w-5" />
        </div>
      </div>
      <div className="absolute bottom-2 right-2 rounded-full bg-white/92 px-2 py-0.5 text-[10px] font-semibold text-blue-700">x{item.qty}</div>
    </div>
  );
}

function InsightCard({
  icon,
  label,
  value,
  tone = 'info',
}: Readonly<{
  icon: ReactNode;
  label: string;
  value: string;
  tone?: DisplayStatusTone;
}>) {
  const toneMap: Record<DisplayStatusTone, string> = {
    info: 'border-blue-100 bg-gradient-to-br from-[#f8fbff] to-white',
    success: 'border-emerald-100 bg-gradient-to-br from-emerald-50 to-white',
    warning: 'border-amber-100 bg-gradient-to-br from-amber-50 to-white',
    danger: 'border-rose-100 bg-gradient-to-br from-rose-50 to-white',
  };

  return (
    <div className={cn('rounded-[24px] border p-4 shadow-[0_10px_32px_rgba(15,23,42,0.04)]', toneMap[tone])}>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">{icon}</div>
      <div className="mt-3 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">{label}</div>
      <div className="mt-1.5 text-base font-semibold tracking-tight text-slate-900">{value}</div>
    </div>
  );
}

function StatusStrip({ activeStep }: Readonly<{ activeStep: number }>) {
  return (
    <div className={panelClassName('shrink-0 px-4 py-3 md:px-5')}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
      <div className="grid gap-3 md:grid-cols-4">
        {statusSteps.map((step, index) => {
          const isDone = step.id < activeStep;
          const isActive = step.id === activeStep;
          const hasConnector = index < statusSteps.length - 1;

          return (
            <div key={step.id} className="relative">
              {hasConnector ? (
                <div className="absolute left-[calc(50%+1.4rem)] top-5 hidden h-0.5 w-[calc(100%-2.8rem)] bg-slate-200 md:block">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      isDone ? 'w-full bg-gradient-to-r from-blue-600 to-blue-700' : isActive ? 'w-1/2 bg-gradient-to-r from-blue-400 to-blue-600' : 'w-0',
                    )}
                  />
                </div>
              ) : null}
              <div className="flex items-center gap-3 rounded-[20px] border border-slate-200/80 bg-white/80 px-3.5 py-3">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-bold',
                    isDone
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                      : isActive
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]'
                        : 'bg-slate-100 text-slate-400',
                  )}
                >
                  {isDone ? <CheckCircle2 className="h-4.5 w-4.5" /> : step.id}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{step.title}</div>
                  <div className="text-xs text-slate-500">{step.subtitle}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ActiveOrderScreen({
  order,
  summary,
  promptpayId,
  onClose,
}: Readonly<{
  order: Order;
  summary: PaymentSummaryResult;
  promptpayId: string;
  onClose: () => void;
}>) {
  const [qrRefreshIn, setQrRefreshIn] = useState(45);
  const statusTone = getToneFromStatus(order.status, order.hasUnsupportedStatus);
  const statusBadgeLabel = getStatusBadgeLabel(order);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setQrRefreshIn(prev => (prev <= 1 ? 45 : prev - 1));
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const orderId = useMemo(() => formatDisplayOrderId(order.orderId), [order.orderId]);
  const amountLabel = summary.hasDeposit ? 'Deposit Due' : 'Grand Total';
  const showDigitalPayment = order.payment !== 'cash';
  const totalItems = order.cart.reduce((sum, item) => sum + item.qty, 0);
  const totalLines = order.cart.length;
  const activeStep = getActiveStep(order);

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_52%,#eef5ff_100%)] text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-10rem] h-80 w-80 rounded-full bg-blue-200/45 blur-3xl" />
        <div className="absolute right-[-8rem] top-0 h-[28rem] w-[28rem] rounded-full bg-sky-200/50 blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/3 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative mx-auto flex h-[100dvh] w-full max-w-[1900px] flex-col gap-3 px-3 py-3 sm:px-4 sm:py-4 lg:gap-3.5 lg:px-5 lg:py-4 xl:px-6">
        <motion.header
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={panelClassName('shrink-0 p-3 md:p-3.5 lg:p-4')}
        >
          <div className="absolute inset-y-0 right-0 hidden w-[36%] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.16),transparent_58%)] lg:block" />
          <div className="grid gap-3 xl:grid-cols-[minmax(230px,0.82fr)_minmax(460px,1.35fr)_minmax(250px,0.88fr)] xl:items-center">
            <div className="flex items-center gap-3 rounded-[24px] border border-slate-200/70 bg-white/58 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
              <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-[0_18px_40px_rgba(37,99,235,0.24)]">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold tracking-[0.24em] text-slate-400 uppercase">Premium Print Studio</div>
                <div className="mt-1 text-[1.55rem] font-semibold tracking-[0.16em] text-slate-900 sm:text-[1.8rem]">GLOSSY</div>
                <div className="-mt-1 text-sm font-medium tracking-[0.46em] text-blue-700 sm:text-[15px]">DESIGN</div>
              </div>
            </div>

            <div className="rounded-[28px] border border-blue-100/80 bg-[linear-gradient(135deg,rgba(238,245,255,0.95),rgba(255,255,255,0.98),rgba(238,245,255,0.92))] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.98),0_18px_48px_rgba(37,99,235,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <HeaderBadge>Order Reference</HeaderBadge>
                  <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">Show this number to cashier</div>
                </div>
                <div className="hidden rounded-full border border-blue-100 bg-white/84 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-blue-700 uppercase md:inline-flex">
                  Official Ticket
                </div>
              </div>
              <div className="mt-3 flex items-end justify-between gap-4 border-t border-blue-100/80 pt-3">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">Running Number</div>
                  <div className="mt-1.5 text-[1.7rem] font-semibold tracking-tight text-blue-700 sm:text-[1.95rem] md:text-[2.15rem] xl:text-[2.35rem]">{orderId}</div>
                </div>
                <div className="max-w-[220px] text-right text-xs text-slate-500">Use this reference for payment verification, pickup, and production tracking.</div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-[22px] border border-slate-200/70 bg-white/60 px-4 py-2.5">
                <div>
                  <HeaderBadge>POS Customer</HeaderBadge>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close cart view"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase',
                      statusTone === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
                      statusTone === 'warning' && 'border-amber-200 bg-amber-50 text-amber-700',
                      statusTone === 'danger' && 'border-rose-200 bg-rose-50 text-rose-700',
                      statusTone === 'info' && 'border-blue-200 bg-blue-50 text-blue-700',
                    )}
                  >
                    <span className="h-2 w-2 rounded-full bg-current shadow-[0_0_12px_currentColor]" />
                    {statusBadgeLabel}
                  </div>
                </div>
              </div>
              <ClockBlock />
            </div>
          </div>
        </motion.header>

        <motion.main
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[1.18fr_0.82fr]"
        >
          <section className={panelClassName('flex min-h-0 flex-col overflow-hidden p-4 md:p-4.5 xl:p-5')}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_12px_30px_rgba(37,99,235,0.24)]">
                    <ReceiptText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">Order Summary</div>
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">Your print order</h1>
                  </div>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-5 text-slate-500">
                  Review all print items, quantities, and totals before scanning payment. The cashier will use this view for confirmation.
                </p>
              </div>
            </div>

            <div className="hidden grid-cols-[1.25fr_1.9fr_0.7fr_0.85fr_0.9fr] gap-4 rounded-[20px] border border-slate-200/80 bg-slate-50/80 px-5 py-3 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase lg:grid">
              <span>Product</span>
              <span>Description</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Unit</span>
              <span className="text-right">Total</span>
            </div>

            <div className="customer-scroll mt-3 flex-1 space-y-2.5 overflow-y-auto pr-1">
              {order.cart.map((item, index) => (
                <motion.div
                  key={getCartKey(item)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="grid gap-3 rounded-[24px] border border-slate-200/80 bg-white/82 p-3.5 shadow-[0_12px_36px_rgba(15,23,42,0.05)] lg:grid-cols-[1.25fr_1.9fr_0.7fr_0.85fr_0.9fr] lg:items-center lg:p-4"
                >
                  <div className="flex items-center gap-4">
                    <ProductAvatar item={item} />
                    <div>
                      <div className="text-base font-semibold tracking-tight text-slate-900 md:text-lg">{item.name}</div>
                      <div className="mt-1 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
                        Print Studio
                      </div>
                    </div>
                  </div>

                  <div className="text-sm leading-5 text-slate-500">{getItemDescription(item)}</div>

                  <div className="flex items-center justify-between lg:block lg:text-center">
                    <span className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase lg:hidden">Qty</span>
                    <span className="text-base font-semibold text-slate-900">{item.qty}</span>
                  </div>

                  <div className="flex items-center justify-between lg:block lg:text-right">
                    <span className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase lg:hidden">Unit</span>
                    <span className="text-base font-semibold text-slate-700">฿{formatMoney(getUnitPrice(item))}</span>
                  </div>

                  <div className="flex items-center justify-between lg:block lg:text-right">
                    <span className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase lg:hidden">Total</span>
                    <span className="text-lg font-semibold tracking-tight text-blue-700">฿{formatMoney(item.totalPrice)}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 grid shrink-0 gap-3 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <InsightCard icon={<PackageCheck className="h-5 w-5" />} label="Total Items" value={`${totalItems} units`} />
                <InsightCard icon={<ShieldCheck className="h-5 w-5" />} label="Payment Status" value={statusBadgeLabel} tone={statusTone} />
                <InsightCard icon={<Store className="h-5 w-5" />} label="Pickup Method" value={getPickupMethod(order)} />
                <InsightCard icon={<Clock3 className="h-5 w-5" />} label="Estimated Ready" value={getEstimatedReadyTime(order)} tone="warning" />
              </div>

              <div className="rounded-[28px] border border-blue-100 bg-gradient-to-br from-[#eef5ff] via-white to-[#f4f8ff] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.98)]">
                <div className="space-y-2.5">
                  <SummaryRow label="Order Lines" value={`${totalLines}`} />
                  <SummaryRow label="Subtotal" value={`฿${formatMoney(summary.subtotal)}`} />
                  <SummaryRow label="Discount" value={`- ฿${formatMoney(summary.discount)}`} valueClassName="text-emerald-600" />
                  <SummaryRow label="VAT" value={`฿${formatMoney(summary.vat)}`} />
                  {summary.hasDeposit ? <SummaryRow label="Remaining Balance" value={`฿${formatMoney(summary.remaining)}`} emphasis /> : null}
                </div>
                <div className="my-3 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold tracking-[0.14em] text-blue-700 uppercase">{amountLabel}</div>
                    <div className="mt-1.5 text-sm text-slate-500">Primary amount for customer payment.</div>
                  </div>
                  <div className="text-right text-[2rem] font-semibold tracking-tight text-blue-700 md:text-[2.5rem]">
                    ฿{formatMoney(summary.amountToPay)}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={panelClassName('flex min-h-0 flex-col overflow-hidden p-4 md:p-4.5 xl:p-5')}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_12px_30px_rgba(37,99,235,0.24)]">
                    <CircleDollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">Payment Section</div>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">Scan to pay</h2>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-5 text-slate-500">{getPaymentInstruction(order)}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/88 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-blue-700 uppercase">
                <TimerReset className="h-3.5 w-3.5" />
                {qrRefreshIn}s
              </div>
            </div>

            <div className="mb-3 inline-flex items-center gap-2 self-start rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-amber-700 uppercase">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Awaiting Payment
            </div>

            <div className="grid min-h-0 flex-1 gap-3">
              <div className="rounded-[28px] border border-blue-100 bg-gradient-to-b from-white to-[#f8fbff] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <div className="text-center">
                  <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">Customer Action</div>
                  <div className="mt-1.5 text-lg font-semibold text-slate-900">Scan to Pay</div>
                </div>

                <div className="relative mt-4 flex justify-center">
                  <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.18),transparent_65%)] blur-2xl" />
                  <motion.div
                    key={qrRefreshIn > 43 ? 'refresh' : 'steady'}
                    initial={{ opacity: 0.9, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative rounded-[34px] border border-white bg-white p-5 shadow-[0_24px_60px_rgba(37,99,235,0.14)]"
                  >
                    <div className="absolute inset-0 rounded-[34px] border border-blue-100" />
                    <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
                    <QRCodeCanvas value={generatePayload(promptpayId, { amount: Math.round(summary.amountToPay) })} size={showDigitalPayment ? 220 : 190} includeMargin />
                  </motion.div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-[24px] border border-slate-200/80 bg-white/88 p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
                    <div className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">Bank Information</div>
                    <div className="mt-3 text-lg font-semibold text-slate-900">{bankDetails.name}</div>
                    <div className="mt-1 text-sm text-slate-500">{bankDetails.accountName}</div>
                    <div className="mt-1 text-sm font-semibold text-slate-700">{bankDetails.accountNumber}</div>
                  </div>
                  <div className="rounded-[24px] border border-blue-100 bg-gradient-to-br from-[#eef5ff] to-white p-4 shadow-[0_10px_28px_rgba(37,99,235,0.06)]">
                    <div className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">Amount Due</div>
                    <div className="mt-2 text-[2rem] font-semibold tracking-tight text-blue-700 md:text-[2.4rem]">฿{formatMoney(summary.amountToPay)}</div>
                    <div className="mt-2 text-sm text-slate-500">
                      {summary.hasDeposit ? 'Deposit required to release production.' : 'Full amount required for order confirmation.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </motion.main>

        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <StatusStrip activeStep={activeStep} />
        </motion.footer>
      </div>
    </div>
  );
}
