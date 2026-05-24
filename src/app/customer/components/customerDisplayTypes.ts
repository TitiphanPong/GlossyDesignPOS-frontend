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
  [key: string]: unknown;
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
