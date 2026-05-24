'use client';

import type { CustomerDisplayPaymentMethod, OrderStatus } from '../../../lib/contracts';

export type CartItem = {
  name: string;
  category?: string;
  qty: number;
  totalPrice: number;
  fullPayment?: boolean;
  deposit?: number;
  remaining?: number;
  material?: string;
  variant?: { name?: string };
  size?: string;
  note?: string;
};

export type Order = {
  orderId: string;
  clientDraftId?: string;
  rawPayment?: string | null;
  rawStatus?: string | null;
  hasUnsupportedPayment?: boolean;
  hasUnsupportedStatus?: boolean;
  customerName?: string;
  phoneNumber?: string;
  note?: string;
  total: number;
  discount: number;
  grandTotal: number;
  payment: CustomerDisplayPaymentMethod;
  status: OrderStatus;
  cart: CartItem[];
  taxInvoice?: 'yes' | 'no';
  vatAmount?: number;
  remainingTotal: number;
  orderSyncStatus?: 'pending' | 'submitting' | 'submitted';
  lastSubmissionError?: string | null;
};

export type StatusMeta = {
  bg: string;
  border: string;
  color: string;
  label: string;
};

type WorkflowStep = {
  id: number;
  label: string;
  sub: string;
};

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 1, label: 'เธฃเธฑเธเนเธเธฅเน', sub: 'File Received' },
  { id: 2, label: 'เธ•เธฃเธงเธเธเธฒเธ', sub: 'Reviewing' },
  { id: 3, label: 'เธฃเธญเธเธณเธฃเธฐเน€เธเธดเธ', sub: 'Awaiting Payment' },
  { id: 4, label: 'เธเธณเธฅเธฑเธเธเธฅเธดเธ•', sub: 'In Production' },
  { id: 5, label: 'เธเธฃเนเธญเธกเธฃเธฑเธเธชเธดเธเธเนเธฒ', sub: 'Ready for Pickup' },
];

export const STATUS_MESSAGES: Record<number, string> = {
  1: 'เธเธณเธฅเธฑเธเธฃเธฑเธเนเธเธฅเนเธเธฒเธเธเธญเธเธ—เนเธฒเธ...',
  2: 'เธเธณเธฅเธฑเธเธ•เธฃเธงเธเธชเธญเธเนเธเธฅเนเธเธฒเธ...',
  3: 'เธฃเธญเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ  Please Proceed to Payment',
  4: 'เธเธณเธฅเธฑเธเธเธฅเธดเธ•เธชเธดเธเธเนเธฒเธเธญเธเธ—เนเธฒเธ...',
  5: 'เธชเธดเธเธเนเธฒเธเธฃเนเธญเธกเธฃเธฑเธเนเธฅเนเธง!  Ready for Pickup',
};

export const PAYMENT_CONFIRMING_MESSAGE = 'เธเธณเธฅเธฑเธเธขเธทเธเธขเธฑเธเธเธฒเธฃเธเธณเธฃเธฐเน€เธเธดเธ เธเธฃเธธเธ“เธฒเธฃเธญเธชเธฑเธเธเธฃเธนเน';

export const UNKNOWN_STATUS_MESSAGE = 'เธเธณเธฅเธฑเธเธ•เธฃเธงเธเธชเธญเธเธชเธ–เธฒเธเธฐเธเธณเธชเธฑเนเธเธเธทเนเธญ';
export const CANCELLED_STATUS_MESSAGE = 'เธเธณเธชเธฑเนเธเธเธทเนเธญเธเธตเนเธ–เธนเธเธขเธเน€เธฅเธดเธเนเธฅเนเธง เธเธฃเธธเธ“เธฒเธ•เธดเธ”เธ•เนเธญเน€เธเนเธฒเธซเธเนเธฒเธ—เธตเน';
export const UNKNOWN_PAYMENT_MESSAGE = 'เน€เธเนเธฒเธซเธเนเธฒเธ—เธตเนเธเธณเธฅเธฑเธเธ•เธฃเธงเธเธชเธญเธเธงเธดเธเธตเธเธณเธฃเธฐเน€เธเธดเธเธชเธณเธซเธฃเธฑเธเธญเธญเน€เธ”เธญเธฃเนเธเธตเน';

export const BANNERS = [
  { title: 'Glossy Design', sub: 'Premium Printing Services', img: '/banners/Banner1.png' },
  { title: 'เธเธฒเธเธชเธ•เธดเธเน€เธเธญเธฃเนเธเธฃเธเธงเธเธเธฃ', sub: 'Sticker & Label Printing', img: '/banners/Banner8.png' },
  { title: 'เธเธฒเธเธ”เนเธงเธ เธฃเธญเธฃเธฑเธเนเธ”เนเน€เธฅเธข', sub: 'Express Print Service', img: '/banners/Banner9.png' },
  { title: 'เธเธดเธกเธเนเธเธฒเธเธเธธเธ“เธ เธฒเธเธชเธนเธ', sub: 'Premium Print Production', img: '/banners/Banner10.png' },
];

export function formatMoney(value: number): string {
  return Math.round(value).toLocaleString('th-TH');
}

export function getOrderStatusMeta(status: OrderStatus, hasUnsupportedStatus = false): StatusMeta {
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

export function getCartKey(item: CartItem): string {
  return [item.name, item.category ?? '', item.material ?? '', item.variant?.name ?? '', item.size ?? '', item.qty, item.totalPrice].join('|');
}
