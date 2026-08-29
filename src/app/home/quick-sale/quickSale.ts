import { getDiscountAmount, roundCurrency } from '../../utils/computeTotal';

export type DiscountMode = 'amount' | 'percent';

const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;
export const MAX_BACKDATE_CALENDAR_DAYS = 30;

function bangkokCalendarDayNumber(value: Date): number {
  const shifted = new Date(value.getTime() + BANGKOK_OFFSET_MS);
  return Math.floor(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) / DAY_MS);
}

export function validateQuickSaleBackdate(input: Readonly<{
  entryMode: 'normal' | 'backdated';
  saleDate: Date;
  backdatedReason: string;
  now?: Date;
}>): { valid: boolean; message?: string } {
  if (input.entryMode !== 'backdated') return { valid: true };

  const now = input.now ?? new Date();
  if (Number.isNaN(input.saleDate.getTime())) {
    return { valid: false, message: 'กรุณาระบุวันที่และเวลาที่เกิดการขาย' };
  }
  if (input.saleDate.getTime() > now.getTime()) {
    return { valid: false, message: 'ไม่สามารถลงรายการเป็นวันที่ในอนาคตได้' };
  }

  const calendarDaysAgo = bangkokCalendarDayNumber(now) - bangkokCalendarDayNumber(input.saleDate);
  if (calendarDaysAgo < 0 || calendarDaysAgo > MAX_BACKDATE_CALENDAR_DAYS) {
    return { valid: false, message: `ลงรายการย้อนหลังได้สูงสุด ${MAX_BACKDATE_CALENDAR_DAYS} วัน` };
  }
  if (!input.backdatedReason.trim()) {
    return { valid: false, message: 'กรุณาระบุเหตุผลที่ลงรายการย้อนหลัง' };
  }

  return { valid: true };
}

export function isDefaultVariantName(value: string): boolean {
  return value.trim().toLowerCase() === 'default';
}

export function roundMoney(value: number): number {
  return roundCurrency(value);
}

export function calculateQuickSale(subtotal: number, discountValue: number, mode: DiscountMode) {
  const safeSubtotal = Math.max(0, roundMoney(subtotal));
  const discount = getDiscountAmount(safeSubtotal, { type: mode, value: discountValue });
  return { subtotal: safeSubtotal, discount, grandTotal: roundMoney(safeSubtotal - discount) };
}

export function calculateChange(received: number, grandTotal: number): number {
  return roundMoney(Math.max(0, received - grandTotal));
}

export function canConfirmQuickSalePayment(input: Readonly<{
  paymentMethod: 'cash' | 'promptpay';
  hasEnoughCash: boolean;
  hasPaymentQrProfile: boolean;
  manualTransferVerified: boolean;
}>): boolean {
  if (input.paymentMethod === 'cash') return input.hasEnoughCash;
  return input.hasPaymentQrProfile || input.manualTransferVerified;
}

export function calculateAddedVat(taxableAmount: number): number {
  return roundMoney(Math.max(0, taxableAmount) * 0.07);
}

export function calculatePayableTotal(taxableAmount: number, taxInvoice: 'yes' | 'no'): number {
  const safeTaxableAmount = Math.max(0, roundMoney(taxableAmount));
  const vatAmount = taxInvoice === 'yes' ? calculateAddedVat(safeTaxableAmount) : 0;
  return roundMoney(safeTaxableAmount + vatAmount);
}
