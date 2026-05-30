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

function readNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function getOrderDisplayNumber(
  value: {
    orderNumber?: unknown;
    orderId?: unknown;
  },
  fallback = '-'
): string {
  return readNonEmptyString(value.orderNumber) ?? readNonEmptyString(value.orderId) ?? fallback;
}

export type ApiCartItem = {
  name: string;
  category?: string;
  quantity?: number;
  qty?: number;
  price?: number;
  unitPrice?: number;
  totalPrice?: number;
  lineTotal?: number;
  deposit?: number;
  remaining?: number;
  fullPayment?: boolean;
  productNote?: string;
  note?: string;
  sides?: string;
  colorMode?: string;
  material?: string;
  size?: string;
  shape?: string;
  type?: string;
  variant?: { name?: string };
  extra?: Record<string, unknown>;
};

export type ApiOrder = {
  _id: string;
  orderId: string;
  orderNumber: string;
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
  clientDraftId?: string;
  grandTotal?: number;
  total?: number;
  remainingTotal?: number;
  depositTotal?: number;
  vatAmount?: number;
  taxInvoice?: 'yes' | 'no';
  status?: OrderStatus;
  [key: string]: unknown;
};

export type NormalizedInvoiceCartItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type NormalizedOrderCartItem = NormalizedInvoiceCartItem & {
  category?: string;
  deposit: number;
  remaining: number;
  fullPayment?: boolean;
  material?: string;
  variant?: { name?: string };
  size?: string;
  note?: string;
};

export type NormalizedOrderAmounts = {
  subtotal: number;
  discount: number;
  vatAmount: number;
  finalTotal: number;
  grandTotal: number;
  remainingTotal: number;
  paidAmount: number;
};

export type NormalizedInvoiceOrder = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  phoneNumber: string;
  cart: NormalizedInvoiceCartItem[];
  finalTotal: number;
  vatAmount: number;
  grandTotal: number;
};

export function normalizeApiCartItem(item: Partial<ApiCartItem>): NormalizedOrderCartItem {
  const quantity = Math.max(1, readNumber(item.quantity ?? item.qty) ?? 1);
  const directUnitPrice = readNumber(item.unitPrice);
  const fallbackUnitPrice = readNumber(item.price);
  const totalPrice = readNumber(item.totalPrice) ?? readNumber(item.lineTotal) ?? (directUnitPrice ?? fallbackUnitPrice ?? 0) * quantity;
  const unitPrice = directUnitPrice ?? fallbackUnitPrice ?? (quantity > 0 ? totalPrice / quantity : 0);

  return {
    name: readNonEmptyString(item.name) ?? '-',
    category: readNonEmptyString(item.category) ?? undefined,
    quantity,
    unitPrice,
    totalPrice,
    deposit: Math.max(readNumber(item.deposit) ?? 0, 0),
    remaining: Math.max(readNumber(item.remaining) ?? 0, 0),
    fullPayment: typeof item.fullPayment === 'boolean' ? item.fullPayment : undefined,
    material: readNonEmptyString(item.material) ?? undefined,
    variant: readNonEmptyString(item.variant?.name) ? { name: readNonEmptyString(item.variant?.name) ?? undefined } : undefined,
    size: readNonEmptyString(item.size) ?? undefined,
    note: readNonEmptyString(item.note) ?? readNonEmptyString(item.productNote) ?? undefined,
  };
}

export function normalizeApiCartItemForInvoice(item: ApiCartItem): NormalizedInvoiceCartItem {
  const normalized = normalizeApiCartItem(item);
  return {
    name: normalized.name,
    quantity: normalized.quantity,
    unitPrice: normalized.unitPrice,
    totalPrice: normalized.totalPrice,
  };
}

export function normalizeApiOrderAmounts(
  order: Partial<ApiOrder> & {
    finalTotal?: number;
    cart?: ApiCartItem[];
  }
): NormalizedOrderAmounts {
  const cart = Array.isArray(order.cart) ? order.cart.map(normalizeApiCartItem) : [];
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const discount = Math.max(readNumber(order.discount) ?? 0, 0);
  const vatAmount = Math.max(readNumber(order.vatAmount) ?? 0, 0);
  const finalTotal = Math.max(readNumber(order.finalTotal) ?? readNumber(order.total) ?? subtotal - discount, 0);
  const grandTotal = Math.max(readNumber(order.grandTotal) ?? finalTotal + vatAmount, 0);
  const remainingTotal = Math.max(readNumber(order.remainingTotal) ?? 0, 0);
  const paidAmount = Math.min(grandTotal, Math.max(grandTotal - remainingTotal, 0));

  return {
    subtotal,
    discount,
    vatAmount,
    finalTotal,
    grandTotal,
    remainingTotal,
    paidAmount,
  };
}

export function normalizeApiOrderForInvoice(
  order: Partial<ApiOrder> & {
    _id?: string;
    finalTotal?: number;
    cart?: ApiCartItem[];
  }
): NormalizedInvoiceOrder {
  const cart = Array.isArray(order.cart) ? order.cart.map(normalizeApiCartItemForInvoice) : [];
  const amounts = normalizeApiOrderAmounts(order);

  return {
    orderId: readNonEmptyString(order.orderId) ?? readNonEmptyString(order._id) ?? '-',
    orderNumber: getOrderDisplayNumber(order),
    customerName: readNonEmptyString(order.customerName) ?? '-',
    phoneNumber: readNonEmptyString(order.phoneNumber) ?? '-',
    cart,
    finalTotal: amounts.finalTotal,
    vatAmount: amounts.vatAmount,
    grandTotal: amounts.grandTotal,
  };
}
