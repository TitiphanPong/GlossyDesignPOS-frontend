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
  orderId?: string;
  orderNumber?: string;
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
  { id: 1, label: 'รับไฟล์', sub: 'File Received' },
  { id: 2, label: 'ตรวจงาน', sub: 'Reviewing' },
  { id: 3, label: 'รอชำระเงิน', sub: 'Awaiting Payment' },
  { id: 4, label: 'กำลังผลิต', sub: 'In Production' },
  { id: 5, label: 'พร้อมรับสินค้า', sub: 'Ready for Pickup' },
];

export const STATUS_MESSAGES: Record<number, string> = {
  1: 'กำลังรับไฟล์งานของท่าน...',
  2: 'กำลังตรวจสอบไฟล์งาน...',
  3: 'รอการชำระเงิน Please Proceed to Payment',
  4: 'กำลังผลิตสินค้าของท่าน...',
  5: 'สินค้าพร้อมรับแล้ว Ready for Pickup',
};

export const PAYMENT_CONFIRMING_MESSAGE = 'กำลังยืนยันการชำระเงิน กรุณารอสักครู่';

export const UNKNOWN_STATUS_MESSAGE = 'กำลังตรวจสอบสถานะคำสั่งซื้อ';
export const CANCELLED_STATUS_MESSAGE = 'คำสั่งซื้อนี้ถูกยกเลิกแล้ว กรุณาติดต่อเจ้าหน้าที่';
export const UNKNOWN_PAYMENT_MESSAGE = 'เจ้าหน้าที่กำลังตรวจสอบวิธีชำระเงินสำหรับออเดอร์นี้';

export const BANNERS = [
  { title: 'Glossy Design', sub: 'Premium Printing Services', img: '/banners/Banner1.png' },
  { title: 'Banner 2', sub: 'Glossy Promotion', img: '/banners/Banner2.png' },
  { title: 'Banner 3', sub: 'Glossy Promotion', img: '/banners/Banner3.png' },
  { title: 'Banner 4', sub: 'Glossy Promotion', img: '/banners/Banner4.png' },
  { title: 'Banner 5', sub: 'Glossy Promotion', img: '/banners/Banner5.png' },
  { title: 'Banner 6', sub: 'Glossy Promotion', img: '/banners/Banner6.png' },
  { title: 'Banner 7', sub: 'Glossy Promotion', img: '/banners/Banner7.png' },
  { title: 'งานสติกเกอร์ครบวงจร', sub: 'Sticker & Label Printing', img: '/banners/Banner8.png' },
  { title: 'งานด่วน รอรับได้เลย', sub: 'Express Print Service', img: '/banners/Banner9.png' },
  { title: 'พิมพ์งานคุณภาพสูง', sub: 'Premium Print Production', img: '/banners/Banner10.png' },
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
      label: 'กำลังตรวจสอบสถานะ',
    };
  }

  if (status === 'pending') {
    return {
      bg: 'rgba(255,152,0,0.15)',
      border: 'rgba(255,152,0,0.45)',
      color: '#FFB74D',
      label: 'รอชำระเงิน',
    };
  }

  if (status === 'partial') {
    return {
      bg: 'rgba(41,121,255,0.15)',
      border: 'rgba(41,121,255,0.45)',
      color: '#64B5F6',
      label: 'มัดจำแล้ว',
    };
  }

  if (status === 'cancelled') {
    return {
      bg: 'rgba(255,82,82,0.15)',
      border: 'rgba(255,82,82,0.45)',
      color: '#FF8A80',
      label: 'ยกเลิกคำสั่งซื้อ',
    };
  }

  return {
    bg: 'rgba(0,200,100,0.15)',
    border: 'rgba(0,200,100,0.45)',
    color: '#69F0AE',
    label: 'ชำระแล้ว',
  };
}

export function getCartKey(item: CartItem): string {
  return [item.name, item.category ?? '', item.material ?? '', item.variant?.name ?? '', item.size ?? '', item.qty, item.totalPrice].join('|');
}
