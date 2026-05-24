export type PaymentMethod = 'cash' | 'promptpay';

export type CustomerDisplayPaymentMethod = PaymentMethod | 'transfer' | 'card';

export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'partial';

export const PAYMENT_METHOD_VALUES = ['cash', 'promptpay'] as const;

export const CUSTOMER_DISPLAY_PAYMENT_METHOD_VALUES = ['cash', 'promptpay', 'transfer', 'card'] as const;

export const ORDER_STATUS_VALUES = ['pending', 'paid', 'cancelled', 'partial'] as const;

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

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === 'string' && PAYMENT_METHOD_VALUES.includes(value as PaymentMethod);
}

export function isCustomerDisplayPaymentMethod(value: unknown): value is CustomerDisplayPaymentMethod {
  return typeof value === 'string' && CUSTOMER_DISPLAY_PAYMENT_METHOD_VALUES.includes(value as CustomerDisplayPaymentMethod);
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && ORDER_STATUS_VALUES.includes(value as OrderStatus);
}

export function normalizeCustomerDisplayPaymentMethod(value: unknown, fallback: CustomerDisplayPaymentMethod = 'cash'): CustomerDisplayPaymentMethod {
  return isCustomerDisplayPaymentMethod(value) ? value : fallback;
}

export function normalizeOrderStatus(value: unknown, fallback: OrderStatus = 'pending'): OrderStatus {
  return isOrderStatus(value) ? value : fallback;
}

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
