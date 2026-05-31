'use client';

import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, type NormalizedInvoiceOrder, type OrderStatus, type PaymentMethod } from '../../../../lib/contracts';

export type InvoiceDocumentType = 'quotation' | 'tax-invoice' | 'receipt';

export type InvoiceDocumentMeta = {
  titleTh: string;
  titleEn: string;
  statusLabel: string;
};

const CURRENCY_FORMATTER = new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DATE_FORMATTER = new Intl.DateTimeFormat('th-TH', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const DATETIME_FORMATTER = new Intl.DateTimeFormat('th-TH', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const STATUS_LABELS_TH: Record<OrderStatus, string> = {
  pending: 'รอชำระเงิน',
  partial: 'ชำระบางส่วน',
  paid: 'ชำระแล้ว',
  cancelled: 'ยกเลิก',
};

const PAYMENT_LABELS_TH: Record<PaymentMethod, string> = {
  cash: 'เงินสด',
  promptpay: 'พร้อมเพย์',
};

const DOCUMENT_META: Record<InvoiceDocumentType, InvoiceDocumentMeta> = {
  quotation: {
    titleTh: 'ใบเสนอราคา',
    titleEn: 'Quotation',
    statusLabel: 'รออนุมัติ',
  },
  'tax-invoice': {
    titleTh: 'ใบกำกับภาษี / ใบเสร็จรับเงิน',
    titleEn: 'Tax Invoice / Receipt',
    statusLabel: 'ออกเอกสารแล้ว',
  },
  receipt: {
    titleTh: 'ใบเสร็จรับเงิน',
    titleEn: 'Receipt',
    statusLabel: 'รับชำระแล้ว',
  },
};

export function resolveInvoiceDocumentType(
  value: string | null | undefined,
  order?: Pick<NormalizedInvoiceOrder, 'status'> | null,
  taxInvoice?: 'yes' | 'no'
): InvoiceDocumentType {
  if (value === 'quotation' || value === 'tax-invoice' || value === 'receipt') {
    return value;
  }

  if (taxInvoice === 'yes') {
    return 'tax-invoice';
  }

  if (order?.status === 'paid' || order?.status === 'partial') {
    return 'receipt';
  }

  return 'quotation';
}

export function getInvoiceDocumentMeta(documentType: InvoiceDocumentType): InvoiceDocumentMeta {
  return DOCUMENT_META[documentType];
}

export function formatCurrency(amount: number): string {
  return CURRENCY_FORMATTER.format(Number.isFinite(amount) ? amount : 0);
}

export function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return DATE_FORMATTER.format(parsed);
}

export function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return DATETIME_FORMATTER.format(parsed);
}

export function getStatusLabel(status: OrderStatus): string {
  return STATUS_LABELS_TH[status] ?? ORDER_STATUS_LABELS[status] ?? status;
}

export function getPaymentMethodLabel(paymentMethod: PaymentMethod): string {
  return PAYMENT_LABELS_TH[paymentMethod] ?? PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod;
}

export function getDocumentStatusLabel(documentType: InvoiceDocumentType, status: OrderStatus): string {
  if (documentType === 'quotation') {
    return DOCUMENT_META.quotation.statusLabel;
  }

  if (documentType === 'receipt' && status === 'partial') {
    return 'รับชำระบางส่วน';
  }

  if (documentType === 'tax-invoice' && status === 'cancelled') {
    return 'ยกเลิกเอกสาร';
  }

  return getStatusLabel(status);
}

const THAI_DIGITS = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const THAI_POSITIONS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

function convertIntegerPart(value: number): string {
  if (value === 0) {
    return 'ศูนย์';
  }

  if (value >= 1_000_000) {
    const millions = Math.floor(value / 1_000_000);
    const remainder = value % 1_000_000;
    return `${convertIntegerPart(millions)}ล้าน${remainder > 0 ? convertIntegerPart(remainder) : ''}`;
  }

  const digits = String(value).split('').map(Number);
  const lastIndex = digits.length - 1;
  let result = '';

  digits.forEach((digit, index) => {
    if (digit === 0) {
      return;
    }

    const position = lastIndex - index;

    if (position === 0 && digit === 1 && digits.length > 1) {
      result += 'เอ็ด';
      return;
    }

    if (position === 1 && digit === 1) {
      result += 'สิบ';
      return;
    }

    if (position === 1 && digit === 2) {
      result += 'ยี่สิบ';
      return;
    }

    result += `${THAI_DIGITS[digit]}${THAI_POSITIONS[position]}`;
  });

  return result;
}

export function convertAmountToThaiText(amount: number): string {
  const safeAmount = Math.max(0, Math.round((Number.isFinite(amount) ? amount : 0) * 100) / 100);
  const integerPart = Math.floor(safeAmount);
  const satang = Math.round((safeAmount - integerPart) * 100);
  const bahtText = `${convertIntegerPart(integerPart)}บาท`;

  if (satang === 0) {
    return `${bahtText}ถ้วน`;
  }

  return `${bahtText}${convertIntegerPart(satang)}สตางค์`;
}
