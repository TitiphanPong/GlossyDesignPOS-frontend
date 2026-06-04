export type PaymentMethod = 'cash' | 'promptpay';

export type CustomerDisplayPaymentMethod = PaymentMethod | 'transfer' | 'card';

export type WorkflowOrderStatus = 'pending' | 'producing' | 'awaiting_payment' | 'ready_for_pickup' | 'delivered' | 'cancelled';

export type LegacyPaymentOrderStatus = 'paid' | 'partial';

export type OrderStatus = WorkflowOrderStatus | LegacyPaymentOrderStatus;

export type ProductVariant = {
  id?: string;
  _id?: string;
  name: string;
  price: number;
  note?: string;
  material?: string;
  sides?: string;
  size?: string;
  active: boolean;
};

export type Product = {
  id: string;
  _id?: string;
  name: string;
  category: string;
  code: string;
  typeCode: string;
  cover?: string;
  icon?: string;
  emoji?: string;
  tint?: string;
  badge?: 'NEW' | 'HIT' | string;
  active: boolean;
  variants: ProductVariant[];
};

export const PAYMENT_METHOD_VALUES = ['cash', 'promptpay'] as const;

export const CUSTOMER_DISPLAY_PAYMENT_METHOD_VALUES = ['cash', 'promptpay', 'transfer', 'card'] as const;

export const WORKFLOW_ORDER_STATUS_VALUES = ['pending', 'producing', 'awaiting_payment', 'ready_for_pickup', 'delivered', 'cancelled'] as const;

export const LEGACY_PAYMENT_ORDER_STATUS_VALUES = ['paid', 'partial'] as const;

export const ORDER_STATUS_VALUES = [...WORKFLOW_ORDER_STATUS_VALUES, ...LEGACY_PAYMENT_ORDER_STATUS_VALUES] as const;

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
  producing: 'Producing',
  awaiting_payment: 'Awaiting Payment',
  ready_for_pickup: 'Ready for Pickup',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  partial: 'Partial Payment',
  paid: 'Paid',
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

export function getDisplayOrderNumber(
  value: {
    orderNumber?: unknown;
    orderId?: unknown;
  },
  fallback = '-'
): string {
  return getOrderDisplayNumber(value, fallback);
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
  variant?: Partial<ProductVariant>;
  extra?: Record<string, unknown>;
};

export type CustomerInfo = {
  customerName: string;
  phoneNumber?: string;
  email?: string;
  taxId?: string;
  branchType?: 'สำนักงานใหญ่' | 'สาขา';
  branchNo?: string;
  address?: string;
  subDistrict?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  shippingAddress?: string;
};

export type ApiOrder = {
  _id: string;
  orderId: string;
  orderNumber?: string;
  customerName?: string;
  phoneNumber?: string;
  email?: string;
  customerEmail?: string;
  address?: string;
  customerAddress?: string;
  taxId?: string;
  customerTaxId?: string;
  branch?: string;
  customerBranch?: string;
  branchType?: CustomerInfo['branchType'];
  branchNo?: string;
  subDistrict?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  shippingAddress?: string;
  note?: string;
  category?: string;
  total?: number;
  remainingTotal?: number;
  discount?: number;
  payment: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  issueDate?: string;
  salesChannel?: string;
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
  orderId?: string;
  orderNumber?: string;
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
  qty: number;
  price: number;
  total: number;
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
  total: number;
  grandTotal: number;
  remainingTotal: number;
  paidAmount: number;
};

export type NormalizedOrder = {
  _id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  address: string;
  taxId: string;
  branch: string;
  note: string;
  category?: string;
  salesChannel: string;
  payment: PaymentMethod;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  issueDate: string;
  taxInvoice: 'yes' | 'no';
  customerInfo: CustomerInfo;
  cart: NormalizedOrderCartItem[];
  subtotal: number;
  discount: number;
  finalTotal: number;
  total: number;
  vatAmount: number;
  grandTotal: number;
  remainingTotal: number;
  paidAmount: number;
};

export type NormalizedInvoiceOrder = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  phoneNumber: string;
  email: string;
  address: string;
  taxId: string;
  branch: string;
  note: string;
  salesChannel: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  issueDate: string;
  orderDate: string;
  taxInvoice: 'yes' | 'no';
  customerInfo: CustomerInfo;
  cart: NormalizedInvoiceCartItem[];
  subtotal: number;
  discount: number;
  finalTotal: number;
  vatAmount: number;
  grandTotal: number;
};

function readInvoiceString(
  value: Partial<ApiOrder>,
  ...keys: Array<keyof ApiOrder>
): string | null {
  for (const key of keys) {
    const resolved = readNonEmptyString(value[key]);
    if (resolved) {
      return resolved;
    }
  }

  return null;
}

export function formatCustomerAddress(customerInfo: CustomerInfo): string {
  const primary = readNonEmptyString(customerInfo.address);
  const localityParts = [
    readNonEmptyString(customerInfo.subDistrict),
    readNonEmptyString(customerInfo.district),
    readNonEmptyString(customerInfo.province),
    readNonEmptyString(customerInfo.postalCode),
  ].filter((value): value is string => Boolean(value));

  const sections = [primary, localityParts.length > 0 ? localityParts.join(' ') : null].filter((value): value is string => Boolean(value));
  return sections.join(' ').trim();
}

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
    qty: quantity,
    unitPrice,
    price: unitPrice,
    totalPrice,
    total: totalPrice,
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
    cart?: Array<Partial<ApiCartItem>>;
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
    total: finalTotal,
    grandTotal,
    remainingTotal,
    paidAmount,
  };
}

export function normalizeApiOrder(
  order: Partial<ApiOrder> & {
    id?: string;
    finalTotal?: number;
    cart?: Array<Partial<ApiCartItem>>;
  }
): NormalizedOrder {
  const cart = Array.isArray(order.cart) ? order.cart.map(normalizeApiCartItem) : [];
  const amounts = normalizeApiOrderAmounts({ ...order, cart });
  const paymentMethod = isPaymentMethod(order.payment) ? order.payment : 'cash';
  const address = readInvoiceString(order, 'address', 'customerAddress') ?? '-';
  const customerInfo: CustomerInfo = {
    customerName: readNonEmptyString(order.customerName) ?? '-',
    phoneNumber: readNonEmptyString(order.phoneNumber) ?? undefined,
    email: readInvoiceString(order, 'email', 'customerEmail') ?? undefined,
    taxId: readInvoiceString(order, 'taxId', 'customerTaxId') ?? undefined,
    branchType: order.branchType,
    branchNo: readNonEmptyString(order.branchNo) ?? undefined,
    address: address !== '-' ? address : undefined,
    subDistrict: readNonEmptyString(order.subDistrict) ?? undefined,
    district: readNonEmptyString(order.district) ?? undefined,
    province: readNonEmptyString(order.province) ?? undefined,
    postalCode: readNonEmptyString(order.postalCode) ?? undefined,
    shippingAddress: readNonEmptyString(order.shippingAddress) ?? undefined,
  };

  return {
    _id: readNonEmptyString(order._id) ?? readNonEmptyString(order.id) ?? readNonEmptyString(order.orderId) ?? '-',
    orderId: readNonEmptyString(order.orderId) ?? readNonEmptyString(order._id) ?? readNonEmptyString(order.id) ?? '-',
    orderNumber: getDisplayOrderNumber(order),
    customerName: customerInfo.customerName,
    phoneNumber: customerInfo.phoneNumber ?? '-',
    email: customerInfo.email ?? '-',
    address: customerInfo.address ?? '-',
    taxId: customerInfo.taxId ?? '-',
    branch: readInvoiceString(order, 'branch', 'customerBranch') ?? '-',
    note: readNonEmptyString(order.note) ?? '-',
    category: readNonEmptyString(order.category) ?? undefined,
    salesChannel: readNonEmptyString(order.salesChannel) ?? '-',
    payment: paymentMethod,
    paymentMethod,
    status: normalizeOrderStatus(order.status, 'pending'),
    createdAt: readInvoiceString(order, 'createdAt', 'updatedAt', 'issueDate') ?? '',
    updatedAt: readNonEmptyString(order.updatedAt) ?? undefined,
    issueDate: readInvoiceString(order, 'issueDate', 'updatedAt', 'createdAt') ?? '',
    taxInvoice: order.taxInvoice === 'yes' ? 'yes' : 'no',
    customerInfo,
    cart,
    subtotal: amounts.subtotal,
    discount: amounts.discount,
    finalTotal: amounts.finalTotal,
    total: amounts.total,
    vatAmount: amounts.vatAmount,
    grandTotal: amounts.grandTotal,
    remainingTotal: amounts.remainingTotal,
    paidAmount: amounts.paidAmount,
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
  const address = readInvoiceString(order, 'address', 'customerAddress') ?? '-';
  const customerInfo: CustomerInfo = {
    customerName: readNonEmptyString(order.customerName) ?? '-',
    phoneNumber: readNonEmptyString(order.phoneNumber) ?? undefined,
    email: readInvoiceString(order, 'email', 'customerEmail') ?? undefined,
    taxId: readInvoiceString(order, 'taxId', 'customerTaxId') ?? undefined,
    branchType: order.branchType === 'สำนักงานใหญ่' || order.branchType === 'สาขา' ? order.branchType : undefined,
    branchNo: readNonEmptyString(order.branchNo) ?? undefined,
    address: address !== '-' ? address : undefined,
    subDistrict: readNonEmptyString(order.subDistrict) ?? undefined,
    district: readNonEmptyString(order.district) ?? undefined,
    province: readNonEmptyString(order.province) ?? undefined,
    postalCode: readNonEmptyString(order.postalCode) ?? undefined,
    shippingAddress: readNonEmptyString(order.shippingAddress) ?? undefined,
  };

  return {
    orderId: readNonEmptyString(order.orderId) ?? readNonEmptyString(order._id) ?? '-',
    orderNumber: getDisplayOrderNumber(order),
    customerName: customerInfo.customerName,
    phoneNumber: customerInfo.phoneNumber ?? '-',
    email: customerInfo.email ?? '-',
    address: customerInfo.address ?? '-',
    taxId: customerInfo.taxId ?? '-',
    branch: readInvoiceString(order, 'branch', 'customerBranch') ?? '-',
    note: readNonEmptyString(order.note) ?? '-',
    salesChannel: readNonEmptyString(order.salesChannel) ?? '-',
    paymentMethod: isPaymentMethod(order.payment) ? order.payment : 'cash',
    status: normalizeOrderStatus(order.status, 'pending'),
    issueDate: readInvoiceString(order, 'issueDate', 'updatedAt', 'createdAt') ?? '',
    orderDate: readInvoiceString(order, 'createdAt', 'updatedAt', 'issueDate') ?? '',
    taxInvoice: order.taxInvoice === 'yes' ? 'yes' : 'no',
    customerInfo,
    cart,
    subtotal: amounts.subtotal,
    discount: amounts.discount,
    finalTotal: amounts.finalTotal,
    vatAmount: amounts.vatAmount,
    grandTotal: amounts.grandTotal,
  };
}

export function createInvoiceOrderFromNormalizedOrder(order: NormalizedOrder): NormalizedInvoiceOrder {
  return {
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    phoneNumber: order.phoneNumber,
    email: order.email,
    address: order.address,
    taxId: order.taxId,
    branch: order.branch,
    note: order.note,
    salesChannel: order.salesChannel,
    paymentMethod: order.paymentMethod,
    status: order.status,
    issueDate: order.issueDate,
    orderDate: order.createdAt,
    taxInvoice: order.taxInvoice,
    customerInfo: order.customerInfo,
    cart: order.cart.map(normalizeApiCartItemForInvoice),
    subtotal: order.subtotal,
    discount: order.discount,
    finalTotal: order.finalTotal,
    vatAmount: order.vatAmount,
    grandTotal: order.grandTotal,
  };
}
