export type PaymentMethod = 'cash' | 'promptpay';

export type CustomerDisplayPaymentMethod = PaymentMethod | 'transfer' | 'card';

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'partial';

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  promptpay: 'PromptPay',
};

export const CUSTOMER_DISPLAY_PAYMENT_METHOD_LABELS: Record<CustomerDisplayPaymentMethod, string> = {
  ...PAYMENT_METHOD_LABELS,
  transfer: 'Bank Transfer',
  card: 'Card',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  partial: 'Partial Payment',
  paid: 'Paid',
  cancelled: 'Cancelled',
};

export type ApiCartItem = {
  name: string;
  category?: string;
  quantity?: number;
  qty?: number;
  price?: number;
  unitPrice?: number;
  totalPrice?: number;
  deposit?: number;
  remaining?: number;
  fullPayment?: boolean;
  productNote?: string;
  sides?: string;
  colorMode?: string;
  material?: string;
  size?: string;
  shape?: string;
  type?: string;
  extra?: Record<string, unknown>;
};

export type ApiOrder = {
  _id: string;
  orderId: string;
  customerName?: string;
  phoneNumber?: string;
  note?: string;
  category?: string;
  total?: number;
  remainingTotal?: number;
  discount?: number;
  payment: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  cart?: ApiCartItem[];
  taxInvoice?: 'yes' | 'no';
  vatAmount?: number;
  grandTotal?: number;
};

export type OrdersSummary = {
  salesToday?: number;
  cashToday?: number;
  promptPayToday?: number;
  completed?: number;
};

export type PendingOrderDraft = {
  grandTotal?: number;
  total?: number;
  remainingTotal?: number;
  depositTotal?: number;
  vatAmount?: number;
  taxInvoice?: 'yes' | 'no';
  status?: OrderStatus;
  [key: string]: unknown;
};
