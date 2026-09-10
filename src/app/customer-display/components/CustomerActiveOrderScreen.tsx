'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CircleDollarSign, Palette, ReceiptText, Sparkles, TimerReset } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { buildPaymentQrPayload, paymentQrRequiresManualAmount, type PaymentQrProfile } from '../../../lib/promptpay';
import type { PaymentSummaryResult } from '../../utils/computeTotal';
import { getDisplayOrderNumber as getSharedDisplayOrderNumber } from '../../../lib/contracts';
import { formatMoney, getCartKey, type CartItem, type Order } from './customerDisplayShared';

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function panelClassName(extra?: string) {
  return cn('relative overflow-hidden rounded-[28px] border border-[var(--glossy-display-border)] bg-[var(--glossy-display-surface)] shadow-[0_24px_72px_rgba(0,169,206,0.10)] backdrop-blur-xl', extra);
}

function getPaymentInstruction(order: Order): string {
  if (order.lastSubmissionError) return 'ระบบยังสร้างออเดอร์ไม่สำเร็จ กรุณาติดต่อพนักงานเพื่อดำเนินการต่อ';
  if (order.orderSyncStatus === 'submitting') return 'ระบบตรวจพบการชำระเงินแล้ว กรุณารอพนักงานตรวจสอบ';
  if (order.status === 'partial') return 'ได้รับมัดจำแล้ว กรุณารอพนักงานดำเนินการต่อ';
  if (order.status === 'cancelled') return 'กรุณาติดต่อพนักงานที่เคาน์เตอร์';
  return 'สแกน QR เพื่อชำระเงิน แล้วแสดงหน้าจอนี้ให้พนักงาน';
}

function getDisplayOrderNumber(order: Order): string {
  const displayNumber = getSharedDisplayOrderNumber(order, '');
  if (displayNumber) return displayNumber;
  if (order.lastSubmissionError) {
    return 'Order number unavailable';
  }
  if (order.orderSyncStatus === 'submitting') {
    return 'Creating order...';
  }
  return 'Pending backend confirmation';
}

function getUnitPrice(item: CartItem): number {
  return item.qty > 0 ? item.totalPrice / item.qty : item.totalPrice;
}

function getItemDescription(item: CartItem): string {
  return [item.category, item.material, item.variant?.name, item.size, item.note].filter(Boolean).join(' / ') || 'งานพิมพ์พรีเมียม';
}

function ClockBlock() {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const intervalId = globalThis.setInterval(() => setNow(new Date()), 1000);
    return () => globalThis.clearInterval(intervalId);
  }, []);

  return (
    <div className="flex h-full w-full items-center gap-4 rounded-[24px] border border-[var(--glossy-display-border)] bg-[var(--glossy-display-surface)] px-4 py-3 shadow-[0_12px_36px_rgba(0,0,0,0.18)]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--glossy-display-cyan)] to-[var(--glossy-action-primary)] text-white shadow-[0_10px_24px_rgba(0,169,206,0.22)]">
        <CalendarDays className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold tracking-[0.18em] text-[var(--glossy-display-text-muted)] uppercase">
          {now.toLocaleDateString('th-TH', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </div>
        <div className="text-[1.75rem] font-semibold tracking-tight text-[var(--glossy-display-text-primary)] md:text-[1.9rem]">
          {now.toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </div>
      </div>
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
    <div className={cn('flex items-center justify-between text-sm', emphasis ? 'font-semibold text-[var(--glossy-display-text-primary)]' : 'text-[var(--glossy-display-text-secondary)]')}>
      <span>{label}</span>
      <span className={cn(emphasis ? 'text-[var(--glossy-display-text-primary)]' : 'text-[var(--glossy-display-text-secondary)]', valueClassName)}>{value}</span>
    </div>
  );
}

function ProductAvatar({ item }: Readonly<{ item: CartItem }>) {
  return (
    <div className="relative h-20 w-20 overflow-hidden rounded-[22px] border border-[var(--glossy-display-border)] bg-[var(--glossy-display-surface-strong)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,169,206,0.22),transparent_55%)]" />
      <div className="absolute inset-x-3 top-3 h-7 rounded-xl bg-white/70" />
      <div className="absolute inset-x-3 bottom-3 h-7 rounded-xl bg-[var(--glossy-display-cyan-soft)]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--glossy-display-cyan)] to-[var(--glossy-action-primary)] text-white shadow-[0_12px_30px_rgba(0,169,206,0.24)]">
          <Palette className="h-5 w-5" />
        </div>
      </div>
      <div className="absolute bottom-2 right-2 rounded-full bg-white/92 px-2 py-0.5 text-[10px] font-semibold text-[var(--glossy-display-cyan)]">x{item.qty}</div>
    </div>
  );
}

export function ActiveOrderScreen({
  order,
  summary,
  paymentQrProfile,
}: Readonly<{
  order: Order;
  summary: PaymentSummaryResult;
  paymentQrProfile: PaymentQrProfile;
  onClose: () => void;
}>) {
  const [qrRefreshIn, setQrRefreshIn] = useState(45);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const intervalId = globalThis.setInterval(() => {
      setQrRefreshIn(prev => (prev <= 1 ? 45 : prev - 1));
    }, 1000);
    return () => globalThis.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));

    syncFullscreen();
    document.addEventListener('fullscreenchange', syncFullscreen);

    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen);
    };
  }, []);

  const orderNumber = useMemo(() => getDisplayOrderNumber(order), [order]);
  const totalLines = order.cart.length;
  const qrSize = isFullscreen ? 300 : 350;
  const requiresManualAmount = paymentQrRequiresManualAmount(paymentQrProfile);

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[linear-gradient(180deg,var(--glossy-display-shell-deep)_0%,var(--glossy-display-shell)_58%,var(--glossy-display-surface-strong)_100%)] text-[var(--glossy-display-text-primary)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-[-10rem] h-80 w-80 rounded-full bg-[var(--glossy-display-violet-soft)] blur-3xl" />
        <div className="absolute right-[-8rem] top-0 h-[28rem] w-[28rem] rounded-full bg-[var(--glossy-display-cyan-soft)] blur-3xl" />
        <div className="absolute bottom-[-10rem] left-1/3 h-80 w-80 rounded-full bg-[var(--glossy-display-cyan-soft)] blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--glossy-display-grid)_1px,transparent_1px),linear-gradient(to_bottom,var(--glossy-display-grid)_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative mx-auto flex h-[100dvh] w-full max-w-[1900px] flex-col gap-3 px-3 py-3 sm:px-4 sm:py-4 lg:gap-3.5 lg:px-5 lg:py-4 xl:px-6">
        <motion.header
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={panelClassName('shrink-0 p-3 md:p-3.5 lg:p-4')}>
          <div className="absolute inset-y-0 right-0 hidden w-[36%] bg-[radial-gradient(circle_at_top_right,rgba(0,169,206,0.16),transparent_58%)] lg:block" />
          <div className="grid gap-3 xl:grid-cols-[minmax(230px,0.82fr)_minmax(460px,1.35fr)_minmax(250px,0.88fr)] xl:items-stretch">
            <div className="flex items-center gap-3 rounded-[24px] border border-[var(--glossy-display-border)] bg-[var(--glossy-display-surface)] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-[var(--glossy-display-cyan)] to-[var(--glossy-action-primary)] text-white shadow-[0_18px_40px_rgba(0,169,206,0.24)]">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold tracking-[0.24em] text-[var(--glossy-display-text-muted)] uppercase">Premium Print Studio</div>
                <div className="mt-1 text-[1.55rem] font-semibold tracking-[0.16em] text-[var(--glossy-display-text-primary)] sm:text-[1.8rem]">GLOSSY</div>
                <div className="-mt-1 text-sm font-medium tracking-[0.46em] text-[var(--glossy-display-cyan)] sm:text-[15px]">DESIGN</div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[var(--glossy-display-border)] bg-[linear-gradient(135deg,var(--glossy-display-surface-strong),rgba(0,169,206,0.10))] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_48px_rgba(0,169,206,0.08)]">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.18em] text-[var(--glossy-display-text-muted)] uppercase">Order Number</div>
                  <div className="mt-1.5 text-[1.7rem] font-semibold tracking-tight text-[var(--glossy-display-cyan)] sm:text-[1.95rem] md:text-[2.15rem] xl:text-[2.35rem]">{orderNumber}</div>
                  {order.customerName ? <div className="mt-1 text-sm font-semibold text-[var(--glossy-display-text-secondary)]">{order.customerName}</div> : null}
                </div>
              </div>
            </div>

            <div className="grid h-full">
              <ClockBlock />
            </div>
          </div>
        </motion.header>

        <motion.main
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[1.18fr_0.82fr]">
          <section className={panelClassName('flex min-h-0 flex-col overflow-hidden p-4 md:p-4.5 xl:p-5')}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--glossy-display-cyan)] to-transparent" />
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--glossy-display-cyan)] to-[var(--glossy-action-primary)] text-white shadow-[0_12px_30px_rgba(0,169,206,0.24)]">
                    <ReceiptText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold tracking-[0.18em] text-[var(--glossy-display-text-muted)] uppercase">สรุปรายการ</div>
                    <h1 className="text-xl font-semibold tracking-tight text-[var(--glossy-display-text-primary)] md:text-2xl">รายการพิมพ์ของคุณ</h1>
                  </div>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-5 text-[var(--glossy-display-text-secondary)]">ตรวจสอบรายการ จำนวน และยอดรวมก่อนชำระเงิน พนักงานจะใช้หน้าจอนี้สำหรับยืนยันรายการ</p>
                {order.lastSubmissionError ? <p className="mt-3 rounded-2xl border border-[var(--glossy-status-error-border)] bg-[var(--glossy-status-error-soft)] px-4 py-3 text-sm font-medium text-[var(--glossy-status-error)]">{order.lastSubmissionError}</p> : null}
              </div>
            </div>

            <div className="hidden grid-cols-[1.25fr_1.9fr_0.7fr_0.85fr_0.9fr] gap-4 rounded-[20px] border border-[var(--glossy-display-border)] bg-[var(--glossy-display-surface)] px-5 py-3 text-[11px] font-semibold tracking-[0.16em] text-[var(--glossy-display-text-muted)] uppercase lg:grid">
              <span>รายการ</span>
              <span>รายละเอียด</span>
              <span className="text-center">จำนวน</span>
              <span className="text-right">ราคา/ชิ้น</span>
              <span className="text-right">รวม</span>
            </div>

            <div className="customer-scroll mt-3 flex-1 space-y-2.5 overflow-y-auto pr-1">
              {order.cart.map((item, index) => (
                <motion.div
                  key={getCartKey(item)}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="grid gap-3 rounded-[24px] border border-[var(--glossy-display-border)] bg-[var(--glossy-display-surface)] p-3.5 shadow-[0_12px_36px_rgba(0,0,0,0.14)] lg:grid-cols-[1.25fr_1.9fr_0.7fr_0.85fr_0.9fr] lg:items-center lg:p-4">
                  <div className="flex items-center gap-4">
                    <ProductAvatar item={item} />
                    <div className="min-w-0">
                      <div className="text-base font-semibold tracking-tight text-[var(--glossy-display-text-primary)] md:text-lg">{item.name}</div>
                      <div className="mt-1 inline-flex items-center rounded-full bg-[var(--glossy-display-cyan-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--glossy-display-cyan)]">งานพิมพ์</div>
                    </div>
                  </div>

                  <div className="text-sm leading-5 text-[var(--glossy-display-text-secondary)]">{getItemDescription(item)}</div>

                  <div className="flex items-center justify-between lg:block lg:text-center">
                    <span className="text-xs font-semibold tracking-[0.16em] text-[var(--glossy-display-text-muted)] uppercase lg:hidden">จำนวน</span>
                    <span className="text-base font-semibold text-[var(--glossy-display-text-primary)]">{item.qty}</span>
                  </div>

                  <div className="flex items-center justify-between lg:block lg:text-right">
                    <span className="text-xs font-semibold tracking-[0.16em] text-[var(--glossy-display-text-muted)] uppercase lg:hidden">ราคา/ชิ้น</span>
                    <span className="text-base font-semibold text-[var(--glossy-display-text-primary)]">฿{formatMoney(getUnitPrice(item))}</span>
                  </div>

                  <div className="flex items-center justify-between lg:block lg:text-right">
                    <span className="text-xs font-semibold tracking-[0.16em] text-[var(--glossy-display-text-muted)] uppercase lg:hidden">รวม</span>
                    <span className="text-lg font-semibold tracking-tight text-[var(--glossy-display-cyan)]">฿{formatMoney(item.totalPrice)}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 shrink-0">
              <div className="rounded-[28px] border border-[var(--glossy-display-border)] bg-[linear-gradient(135deg,var(--glossy-display-surface-strong),rgba(0,169,206,0.08))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <div className="space-y-2.5">
                  <SummaryRow label="จำนวนรายการ" value={`${totalLines}`} />
                  <SummaryRow label="ราคาก่อนลด" value={`฿${formatMoney(summary.subtotal)}`} />
                  <SummaryRow label="ส่วนลด" value={`- ฿${formatMoney(summary.discount)}`} valueClassName="text-[var(--glossy-display-success)]" />
                  <SummaryRow label="ภาษีมูลค่าเพิ่ม" value={`฿${formatMoney(summary.vat)}`} />
                  {summary.hasDeposit ? <SummaryRow label="ยอดคงเหลือ" value={`฿${formatMoney(summary.remaining)}`} emphasis /> : null}
                </div>
                <div className="my-3 h-px bg-gradient-to-r from-transparent via-[var(--glossy-display-cyan)] to-transparent" />
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold tracking-[0.14em] text-[var(--glossy-display-cyan)] uppercase">{summary.hasDeposit ? 'ยอดมัดจำที่ต้องชำระ' : 'ยอดชำระทั้งหมด'}</div>
                    <div className="mt-1.5 text-sm text-[var(--glossy-display-text-secondary)]">ยอดที่ลูกค้าต้องชำระในรายการนี้</div>
                  </div>
                  <div className="text-right text-[2rem] font-semibold tracking-tight text-[var(--glossy-display-cyan)] md:text-[2.5rem]">฿{formatMoney(summary.amountToPay)}</div>
                </div>
              </div>
            </div>
          </section>

          <section className={panelClassName('flex min-h-0 flex-col overflow-hidden p-4 md:p-4.5 xl:p-5')}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--glossy-display-cyan)] to-transparent" />
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--glossy-display-cyan)] to-[var(--glossy-action-primary)] text-white shadow-[0_12px_30px_rgba(0,169,206,0.24)]">
                    <CircleDollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold tracking-[0.18em] text-[var(--glossy-display-text-muted)] uppercase">ชำระเงิน</div>
                    <h2 className="text-xl font-semibold tracking-tight text-[var(--glossy-display-text-primary)] md:text-2xl">สแกนเพื่อจ่าย</h2>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-5 text-[var(--glossy-display-text-secondary)]">{getPaymentInstruction(order)}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--glossy-action-primary-border)] bg-[var(--glossy-display-cyan-soft)] px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-[var(--glossy-display-cyan)]">
                {requiresManualAmount ? null : <TimerReset className="h-3.5 w-3.5" />}
                {requiresManualAmount ? 'QR ร้านค้าแบบคงที่' : `รีเฟรชใน ${qrRefreshIn} วินาที`}
              </div>
            </div>

            <div className="grid min-h-0 flex-1 gap-3">
              <div className="flex min-h-0 flex-col rounded-[28px] border border-[var(--glossy-display-border)] bg-[var(--glossy-display-surface-strong)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] xl:p-5">
                <div className="text-center">
                  <div className="text-[11px] font-semibold tracking-[0.18em] text-[var(--glossy-display-text-muted)] uppercase">ขั้นตอนลูกค้า</div>
                  <div className="mt-1.5 text-xl font-semibold text-[var(--glossy-display-text-primary)] md:text-[1.45rem] xl:text-[1.6rem]">สแกน QR เพื่อชำระเงิน</div>
                </div>

                <div className="relative mt-3 flex min-h-0 flex-1 items-center justify-center py-1 xl:py-2">
                  <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,169,206,0.20),transparent_65%)] blur-2xl xl:h-72 xl:w-72" />
                  <motion.div
                    key={requiresManualAmount ? 'merchant-static' : qrRefreshIn > 43 ? 'refresh' : 'steady'}
                    initial={{ opacity: 0.9, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={cn('relative rounded-[34px] border border-white bg-white shadow-[0_24px_60px_rgba(0,169,206,0.14)]', isFullscreen ? 'p-6 xl:p-7' : 'p-4 xl:p-5')}>
                    <div className="absolute inset-0 rounded-[34px] border border-[var(--glossy-action-primary-border)]" />
                    <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[var(--glossy-display-cyan)] to-transparent" />
                    <QRCodeCanvas value={buildPaymentQrPayload(paymentQrProfile, summary.amountToPay)} size={qrSize}/>
                  </motion.div>
                </div>

                <div className="mt-3 grid shrink-0 gap-3 md:grid-cols-[0.95fr_1.05fr]">
                  <div className="rounded-[24px] border border-[var(--glossy-display-border)] bg-[var(--glossy-display-surface)] p-4 shadow-[0_10px_28px_rgba(0,0,0,0.14)]">
                    <div className="text-[11px] font-semibold tracking-[0.16em] text-[var(--glossy-display-text-muted)] uppercase">บัญชีรับโอน</div>
                    <div className="mt-3 text-lg font-semibold text-[var(--glossy-display-text-primary)]">{paymentQrProfile.kind === 'merchant-static' ? 'QR ร้านค้า' : 'พร้อมเพย์ (PromptPay)'}</div>
                    <div className="mt-1 text-sm text-[var(--glossy-display-text-secondary)]">{paymentQrProfile.displayName}</div>
                    <div className="mt-2 text-base font-semibold text-[var(--glossy-display-text-primary)]">{paymentQrProfile.displayIdentifier}</div>
                    {requiresManualAmount ? <div className="mt-2 text-sm font-semibold text-[var(--glossy-status-warning)]">กรอกยอด ฿{formatMoney(summary.amountToPay)} ในแอปธนาคารก่อนยืนยัน</div> : null}
                  </div>
                  <div className="rounded-[24px] border border-[var(--glossy-action-primary-border)] bg-[linear-gradient(135deg,var(--glossy-display-surface),rgba(0,169,206,0.12))] p-4 shadow-[0_10px_28px_rgba(0,169,206,0.06)]">
                    <div className="text-[11px] font-semibold tracking-[0.16em] text-[var(--glossy-display-text-muted)] uppercase">ยอดที่ต้องชำระ</div>
                    <div className="mt-2 text-[2.2rem] font-semibold tracking-tight text-[var(--glossy-display-cyan)] md:text-[2.55rem] xl:text-[2.8rem]">฿{formatMoney(summary.amountToPay)}</div>
                    <div className="mt-2 text-sm leading-5 text-[var(--glossy-display-text-secondary)]">{summary.hasDeposit ? 'ชำระมัดจำเพื่อเริ่มดำเนินงานพิมพ์' : 'ชำระเต็มจำนวนเพื่อยืนยันรายการ'}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </motion.main>
      </div>
    </div>
  );
}
