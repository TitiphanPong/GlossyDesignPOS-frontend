'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CircleDollarSign, Palette, ReceiptText, Sparkles, TimerReset } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import generatePayload from 'promptpay-qr';
import type { PaymentSummaryResult } from '../../utils/computeTotal';
import { formatMoney, getCartKey, type CartItem, type Order } from './customerDisplayShared';

const bankDetails = {
  name: 'พร้อมเพย์ (PromptPay)',
  accountName: 'เพ็ญพิชชาย์ ผ่องสุวรรณ',
  accountNumber: '099-469-4635',
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function panelClassName(extra?: string) {
  return cn('relative overflow-hidden rounded-[28px] border border-white/70 bg-white/76 shadow-[0_24px_72px_rgba(37,99,235,0.10)] backdrop-blur-xl', extra);
}

function getPaymentInstruction(order: Order): string {
  if (order.lastSubmissionError) return 'ระบบยังสร้างออเดอร์ไม่สำเร็จ กรุณาติดต่อพนักงานเพื่อดำเนินการต่อ';
  if (order.orderSyncStatus === 'submitting') return 'ระบบตรวจพบการชำระเงินแล้ว กรุณารอพนักงานตรวจสอบ';
  if (order.status === 'partial') return 'ได้รับมัดจำแล้ว กรุณารอพนักงานดำเนินการต่อ';
  if (order.status === 'cancelled') return 'กรุณาติดต่อพนักงานที่เคาน์เตอร์';
  return 'สแกน QR เพื่อชำระเงิน แล้วแสดงหน้าจอนี้ให้พนักงาน';
}

function getDisplayOrderNumber(order: Order): string {
  if (order.orderNumber?.trim()) {
    return order.orderNumber.trim();
  }
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
    const intervalId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="flex h-full w-full items-center gap-4 rounded-[24px] border border-slate-200/80 bg-white/88 px-4 py-3 shadow-[0_12px_36px_rgba(15,23,42,0.06)]">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]">
        <CalendarDays className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">
          {now.toLocaleDateString('th-TH', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </div>
        <div className="text-[1.75rem] font-semibold tracking-tight text-slate-900 md:text-[1.9rem]">
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

export function ActiveOrderScreen({
  order,
  summary,
  promptpayId,
}: Readonly<{
  order: Order;
  summary: PaymentSummaryResult;
  promptpayId: string;
  onClose: () => void;
}>) {
  const [qrRefreshIn, setQrRefreshIn] = useState(45);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setQrRefreshIn(prev => (prev <= 1 ? 45 : prev - 1));
    }, 1000);
    return () => window.clearInterval(intervalId);
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
  const showDigitalPayment = order.payment !== 'cash';
  const totalLines = order.cart.length;
  const qrSize = isFullscreen ? (showDigitalPayment ? 300 : 300) : showDigitalPayment ? 350 : 350;

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
          className={panelClassName('shrink-0 p-3 md:p-3.5 lg:p-4')}>
          <div className="absolute inset-y-0 right-0 hidden w-[36%] bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.16),transparent_58%)] lg:block" />
          <div className="grid gap-3 xl:grid-cols-[minmax(230px,0.82fr)_minmax(460px,1.35fr)_minmax(250px,0.88fr)] xl:items-stretch">
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
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">Order Number</div>
                  <div className="mt-1.5 text-[1.7rem] font-semibold tracking-tight text-blue-700 sm:text-[1.95rem] md:text-[2.15rem] xl:text-[2.35rem]">{orderNumber}</div>
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
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_12px_30px_rgba(37,99,235,0.24)]">
                    <ReceiptText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">สรุปรายการ</div>
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">รายการพิมพ์ของคุณ</h1>
                  </div>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-5 text-slate-500">ตรวจสอบรายการ จำนวน และยอดรวมก่อนชำระเงิน พนักงานจะใช้หน้าจอนี้สำหรับยืนยันรายการ</p>
                {order.lastSubmissionError ? <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{order.lastSubmissionError}</p> : null}
              </div>
            </div>

            <div className="hidden grid-cols-[1.25fr_1.9fr_0.7fr_0.85fr_0.9fr] gap-4 rounded-[20px] border border-slate-200/80 bg-slate-50/80 px-5 py-3 text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase lg:grid">
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
                  className="grid gap-3 rounded-[24px] border border-slate-200/80 bg-white/82 p-3.5 shadow-[0_12px_36px_rgba(15,23,42,0.05)] lg:grid-cols-[1.25fr_1.9fr_0.7fr_0.85fr_0.9fr] lg:items-center lg:p-4">
                  <div className="flex items-center gap-4">
                    <ProductAvatar item={item} />
                    <div className="min-w-0">
                      <div className="text-base font-semibold tracking-tight text-slate-900 md:text-lg">{item.name}</div>
                      <div className="mt-1 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">งานพิมพ์</div>
                    </div>
                  </div>

                  <div className="text-sm leading-5 text-slate-500">{getItemDescription(item)}</div>

                  <div className="flex items-center justify-between lg:block lg:text-center">
                    <span className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase lg:hidden">จำนวน</span>
                    <span className="text-base font-semibold text-slate-900">{item.qty}</span>
                  </div>

                  <div className="flex items-center justify-between lg:block lg:text-right">
                    <span className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase lg:hidden">ราคา/ชิ้น</span>
                    <span className="text-base font-semibold text-slate-700">฿{formatMoney(getUnitPrice(item))}</span>
                  </div>

                  <div className="flex items-center justify-between lg:block lg:text-right">
                    <span className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase lg:hidden">รวม</span>
                    <span className="text-lg font-semibold tracking-tight text-blue-700">฿{formatMoney(item.totalPrice)}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 shrink-0">
              <div className="rounded-[28px] border border-blue-100 bg-gradient-to-br from-[#eef5ff] via-white to-[#f4f8ff] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.98)]">
                <div className="space-y-2.5">
                  <SummaryRow label="จำนวนรายการ" value={`${totalLines}`} />
                  <SummaryRow label="ราคาก่อนลด" value={`฿${formatMoney(summary.subtotal)}`} />
                  <SummaryRow label="ส่วนลด" value={`- ฿${formatMoney(summary.discount)}`} valueClassName="text-emerald-600" />
                  <SummaryRow label="ภาษีมูลค่าเพิ่ม" value={`฿${formatMoney(summary.vat)}`} />
                  {summary.hasDeposit ? <SummaryRow label="ยอดคงเหลือ" value={`฿${formatMoney(summary.remaining)}`} emphasis /> : null}
                </div>
                <div className="my-3 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold tracking-[0.14em] text-blue-700 uppercase">{summary.hasDeposit ? 'ยอดมัดจำที่ต้องชำระ' : 'ยอดชำระทั้งหมด'}</div>
                    <div className="mt-1.5 text-sm text-slate-500">ยอดที่ลูกค้าต้องชำระในรายการนี้</div>
                  </div>
                  <div className="text-right text-[2rem] font-semibold tracking-tight text-blue-700 md:text-[2.5rem]">฿{formatMoney(summary.amountToPay)}</div>
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
                    <div className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">ชำระเงิน</div>
                    <h2 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">สแกนเพื่อจ่าย</h2>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-5 text-slate-500">{getPaymentInstruction(order)}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/88 px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-blue-700">
                <TimerReset className="h-3.5 w-3.5" />
                รีเฟรชใน {qrRefreshIn} วินาที
              </div>
            </div>

            <div className="grid min-h-0 flex-1 gap-3">
              <div className="flex min-h-0 flex-col rounded-[28px] border border-blue-100 bg-gradient-to-b from-white to-[#f8fbff] p-4 xl:p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <div className="text-center">
                  <div className="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">ขั้นตอนลูกค้า</div>
                  <div className="mt-1.5 text-xl font-semibold text-slate-900 md:text-[1.45rem] xl:text-[1.6rem]">สแกน QR เพื่อชำระเงิน</div>
                </div>

                <div className="relative mt-3 flex min-h-0 flex-1 items-center justify-center py-1 xl:py-2">
                  <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.20),transparent_65%)] blur-2xl xl:h-72 xl:w-72" />
                  <motion.div
                    key={qrRefreshIn > 43 ? 'refresh' : 'steady'}
                    initial={{ opacity: 0.9, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={cn('relative rounded-[34px] border border-white bg-white shadow-[0_24px_60px_rgba(37,99,235,0.14)]', isFullscreen ? 'p-6 xl:p-7' : 'p-4 xl:p-5')}>
                    <div className="absolute inset-0 rounded-[34px] border border-blue-100" />
                    <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
                    <QRCodeCanvas value={generatePayload(promptpayId, { amount: Math.round(summary.amountToPay) })} size={qrSize}/>
                  </motion.div>
                </div>

                <div className="mt-3 grid shrink-0 gap-3 md:grid-cols-[0.95fr_1.05fr]">
                  <div className="rounded-[24px] border border-slate-200/80 bg-white/88 p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
                    <div className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">บัญชีรับโอน</div>
                    <div className="mt-3 text-lg font-semibold text-slate-900">{bankDetails.name}</div>
                    <div className="mt-1 text-sm text-slate-500">{bankDetails.accountName}</div>
                    <div className="mt-2 text-base font-semibold text-slate-700">{bankDetails.accountNumber}</div>
                  </div>
                  <div className="rounded-[24px] border border-blue-100 bg-gradient-to-br from-[#eef5ff] to-white p-4 shadow-[0_10px_28px_rgba(37,99,235,0.06)]">
                    <div className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">ยอดที่ต้องชำระ</div>
                    <div className="mt-2 text-[2.2rem] font-semibold tracking-tight text-blue-700 md:text-[2.55rem] xl:text-[2.8rem]">฿{formatMoney(summary.amountToPay)}</div>
                    <div className="mt-2 text-sm leading-5 text-slate-500">{summary.hasDeposit ? 'ชำระมัดจำเพื่อเริ่มดำเนินงานพิมพ์' : 'ชำระเต็มจำนวนเพื่อยืนยันรายการ'}</div>
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
