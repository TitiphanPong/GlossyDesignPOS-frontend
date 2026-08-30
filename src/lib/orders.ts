import { fetchApi, fetchApiJson } from './api';
import { normalizeApiOrder, type ApiOrder, type CreateOrderRequest, type NormalizedOrder, type ProductionWorkflowStatus } from './contracts';

type ApiOrderLike = Partial<ApiOrder> & {
  id?: string;
  finalTotal?: number;
  cart?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function normalizeApiOrderCandidate(value: unknown): NormalizedOrder | null {
  if (!isRecord(value)) {
    return null;
  }

  const order = value as ApiOrderLike;
  const hasIdentifier = (typeof order._id === 'string' && order._id.trim().length > 0) || (typeof order.id === 'string' && order.id.trim().length > 0);
  const hasOrderId = typeof order.orderId === 'string' && order.orderId.trim().length > 0;

  if (!hasIdentifier || !hasOrderId) {
    return null;
  }

  return normalizeApiOrder({
    ...order,
    cart: Array.isArray(order.cart) ? order.cart : [],
  });
}

export function extractOrderFromResponse(value: unknown): NormalizedOrder | null {
  const directOrder = normalizeApiOrderCandidate(value);
  if (directOrder) {
    return directOrder;
  }

  if (!isRecord(value)) {
    return null;
  }

  const wrappedCandidates = [
    value.data,
    value.order,
    value.result,
    value.payload,
    isRecord(value.data) ? value.data.order : null,
    isRecord(value.result) ? value.result.order : null,
    isRecord(value.payload) ? value.payload.order : null,
  ];

  for (const candidate of wrappedCandidates) {
    const normalizedOrder = normalizeApiOrderCandidate(candidate);
    if (normalizedOrder) {
      return normalizedOrder;
    }
  }

  return null;
}

export function extractOrdersFromResponse(value: unknown): NormalizedOrder[] | null {
  if (Array.isArray(value)) {
    const normalizedOrders = value.map(extractOrderFromResponse).filter((order): order is NormalizedOrder => Boolean(order));
    return normalizedOrders.length > 0 || value.length === 0 ? normalizedOrders : null;
  }

  if (!isRecord(value)) {
    return null;
  }

  const wrappedCandidates = [
    value.data,
    value.orders,
    value.items,
    value.result,
    value.payload,
    isRecord(value.data) ? value.data.orders : null,
    isRecord(value.result) ? value.result.orders : null,
    isRecord(value.payload) ? value.payload.orders : null,
  ];

  for (const candidate of wrappedCandidates) {
    if (!Array.isArray(candidate)) {
      continue;
    }

    const normalizedOrders = candidate.map(extractOrderFromResponse).filter((order): order is NormalizedOrder => Boolean(order));

    if (normalizedOrders.length > 0 || candidate.length === 0) {
      return normalizedOrders;
    }
  }

  return null;
}

type RemainingPaymentPayload = {
  amount: number;
  method: ApiOrder['payment'];
  idempotencyKey?: string;
};

type UpdateCustomerInfoPayload = {
  customerName: string;
  phoneNumber?: string;
  taxId?: string;
  address?: string;
  itemNames?: string[];
};

export type OrderListSort = 'newest' | 'oldest' | 'amount_desc' | 'amount_asc';

export type OrderListSummary = {
  sales: number;
  collections: number;
  outstanding: number;
  orders: number;
  paidOrders: number;
  cancelledOrders: number;
};

export type FetchOrdersParams = {
  page?: number;
  limit?: number;
  search?: string;
  saleMonth?: string;
  period?: 'today';
  saleFrom?: string;
  saleTo?: string;
  status?: ApiOrder['status'];
  workflowStatus?: ProductionWorkflowStatus;
  payment?: 'unpaid';
  paymentMethod?: ApiOrder['payment'];
  taxInvoice?: 'yes' | 'no';
  sort?: OrderListSort;
  signal?: AbortSignal;
};

export type FetchOrdersPage = {
  data: NormalizedOrder[];
  page: number;
  limit: number;
  total: number;
  summary: OrderListSummary;
};

function buildOrdersPath(params: FetchOrdersParams = {}): string {
  const query = new URLSearchParams();

  if (params.page !== undefined) {
    query.set('page', String(params.page));
  }
  if (params.limit !== undefined) {
    query.set('limit', String(params.limit));
  }
  if (params.search?.trim()) {
    query.set('search', params.search.trim());
  }
  if (params.saleMonth) {
    query.set('saleMonth', params.saleMonth);
  }
  if (params.period) {
    query.set('period', params.period);
  }
  if (params.saleFrom) {
    query.set('saleFrom', params.saleFrom);
  }
  if (params.saleTo) {
    query.set('saleTo', params.saleTo);
  }
  if (params.status) {
    query.set('status', params.status);
  }
  if (params.workflowStatus) {
    query.set('workflowStatus', params.workflowStatus);
  }
  if (params.payment) {
    query.set('payment', params.payment);
  }
  if (params.paymentMethod) {
    query.set('paymentMethod', params.paymentMethod);
  }
  if (params.taxInvoice) {
    query.set('taxInvoice', params.taxInvoice);
  }
  if (params.sort) {
    query.set('sort', params.sort);
  }

  const queryString = query.toString();
  return queryString ? `/orders?${queryString}` : '/orders';
}

export function sortOrdersByNewest<T extends Pick<NormalizedOrder, 'createdAt'>>(orders: T[]): T[] {
  return [...orders].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export async function createOrder(payload: CreateOrderRequest): Promise<NormalizedOrder> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof payload.clientDraftId === 'string' && payload.clientDraftId.trim().length > 0) {
    headers['Idempotency-Key'] = payload.clientDraftId.trim();
  }

  const responseBody = await fetchApiJson<unknown>('/orders', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const createdOrder = extractOrderFromResponse(responseBody);
  if (!createdOrder) {
    throw new Error('Backend did not return a valid order identifier');
  }

  return createdOrder;
}

export async function getOrderTrackingAccess(orderId: string): Promise<{ token: string }> {
  const responseBody = await fetchApiJson<unknown>(`/orders/${orderId}/tracking-access`, {
    method: 'POST',
  });
  if (!isRecord(responseBody)) {
    throw new Error('Backend did not return tracking access');
  }

  const token = typeof responseBody.token === 'string' ? responseBody.token.trim() : '';
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
    throw new Error('Backend returned invalid tracking access');
  }

  return { token };
}

export async function payRemainingBalance(orderId: string, payload: RemainingPaymentPayload): Promise<NormalizedOrder> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const idempotencyKey = payload.idempotencyKey?.trim();
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }
  const responseBody = await fetchApiJson<unknown>(`/orders/${orderId}/payments`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ amount: payload.amount, method: payload.method }),
  });

  const updatedOrder = extractOrderFromResponse(responseBody);
  if (!updatedOrder) {
    throw new Error('Backend did not return a valid updated order');
  }

  return updatedOrder;
}

export async function fetchOrders(params: FetchOrdersParams = {}): Promise<NormalizedOrder[]> {
  return (await fetchOrdersPage(params)).data;
}

export async function fetchOrdersPage(params: FetchOrdersParams = {}): Promise<FetchOrdersPage> {
  const responseBody = await fetchApiJson<unknown>(buildOrdersPath(params), {
    cache: 'no-store',
    signal: params.signal,
  });
  const orders = extractOrdersFromResponse(responseBody);

  if (!orders) {
    throw new Error('Backend did not return a valid orders list');
  }

  if (!isRecord(responseBody)) {
    return {
      data: orders,
      page: params.page ?? 1,
      limit: params.limit ?? orders.length,
      total: orders.length,
      summary: {
        sales: orders.reduce((sum, order) => sum + (order.status === 'cancelled' ? 0 : order.grandTotal), 0),
        collections: orders.reduce((sum, order) => sum + order.paidAmount, 0),
        outstanding: orders.reduce((sum, order) => sum + (order.status === 'cancelled' ? 0 : order.remainingTotal), 0),
        orders: orders.length,
        paidOrders: orders.filter(order => order.status === 'paid' || order.status === 'delivered').length,
        cancelledOrders: orders.filter(order => order.status === 'cancelled').length,
      },
    };
  }

  return {
    data: orders,
    page: typeof responseBody.page === 'number' ? responseBody.page : (params.page ?? 1),
    limit: typeof responseBody.limit === 'number' ? responseBody.limit : (params.limit ?? orders.length),
    total: typeof responseBody.total === 'number' ? responseBody.total : orders.length,
    summary: isRecord(responseBody.summary)
      ? {
          sales: typeof responseBody.summary.sales === 'number' ? responseBody.summary.sales : 0,
          collections: typeof responseBody.summary.collections === 'number' ? responseBody.summary.collections : 0,
          outstanding: typeof responseBody.summary.outstanding === 'number' ? responseBody.summary.outstanding : 0,
          orders: typeof responseBody.summary.orders === 'number' ? responseBody.summary.orders : orders.length,
          paidOrders: typeof responseBody.summary.paidOrders === 'number' ? responseBody.summary.paidOrders : 0,
          cancelledOrders: typeof responseBody.summary.cancelledOrders === 'number' ? responseBody.summary.cancelledOrders : 0,
        }
      : { sales: 0, collections: 0, outstanding: 0, orders: orders.length, paidOrders: 0, cancelledOrders: 0 },
  };
}

export async function downloadOrdersExport(
  params: Pick<FetchOrdersParams, 'search' | 'saleMonth' | 'period' | 'saleFrom' | 'saleTo' | 'status' | 'workflowStatus' | 'payment' | 'paymentMethod' | 'taxInvoice' | 'sort'>,
  format: 'xlsx' | 'pdf'
): Promise<void> {
  const query = new URLSearchParams({ format });
  if (params.search?.trim()) query.set('search', params.search.trim());
  if (params.saleMonth) query.set('saleMonth', params.saleMonth);
  if (params.period) query.set('period', params.period);
  if (params.saleFrom) query.set('saleFrom', params.saleFrom);
  if (params.saleTo) query.set('saleTo', params.saleTo);
  if (params.status) query.set('status', params.status);
  if (params.workflowStatus) query.set('workflowStatus', params.workflowStatus);
  if (params.payment) query.set('payment', params.payment);
  if (params.paymentMethod) query.set('paymentMethod', params.paymentMethod);
  if (params.taxInvoice) query.set('taxInvoice', params.taxInvoice);
  if (params.sort) query.set('sort', params.sort);
  const response = await fetchApi(`/orders/export?${query.toString()}`, { cache: 'no-store' });
  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') ?? '';
  const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] ?? `orders-${params.saleMonth ?? 'all'}.${format}`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function fetchOrderById(orderId: string): Promise<NormalizedOrder> {
  const endpoints = [`/orders/${orderId}`, `/orders/by-order-id/${encodeURIComponent(orderId)}`];
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const responseBody = await fetchApiJson<unknown>(endpoint);
      const order = extractOrderFromResponse(responseBody);

      if (!order) {
        throw new Error('Backend did not return a valid order');
      }

      return order;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('fetch_order_failed');
    }
  }

  throw lastError ?? new Error('Backend did not return a valid order');
}

export async function updateOrderCustomerInfo(orderId: string, customerInfo: UpdateCustomerInfoPayload): Promise<NormalizedOrder> {
  const normalizedCustomerName = customerInfo.customerName.trim();
  const normalizedPhoneNumber = customerInfo.phoneNumber?.trim();
  const normalizedTaxId = customerInfo.taxId?.trim();
  const normalizedAddress = customerInfo.address?.trim();

  const responseBody = await fetchApiJson<unknown>(`/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: normalizedCustomerName || '-',
      ...(normalizedPhoneNumber !== undefined ? { phoneNumber: normalizedPhoneNumber } : {}),
      taxId: normalizedTaxId || undefined,
      customerTaxId: normalizedTaxId || undefined,
      address: normalizedAddress || undefined,
      customerAddress: normalizedAddress || undefined,
      ...(customerInfo.itemNames ? { itemNames: customerInfo.itemNames.map(itemName => itemName.trim() || '-') } : {}),
    }),
  });

  const updatedOrder = extractOrderFromResponse(responseBody);
  if (!updatedOrder) {
    throw new Error('Backend did not return a valid updated order');
  }

  return updatedOrder;
}

export async function convertOrderToTaxInvoice(orderId: string): Promise<NormalizedOrder> {
  const responseBody = await fetchApiJson<unknown>(`/orders/${orderId}/tax-invoice`, {
    method: 'POST',
  });
  const updatedOrder = extractOrderFromResponse(responseBody);
  if (!updatedOrder) throw new Error('Backend did not return a valid updated order');
  return updatedOrder;
}

export async function cancelOrder(orderId: string, reason: string): Promise<NormalizedOrder> {
  const responseBody = await fetchApiJson<unknown>(`/orders/${orderId}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason: reason.trim() }),
  });
  const updatedOrder = extractOrderFromResponse(responseBody);
  if (!updatedOrder) {
    throw new Error('Backend did not return a valid cancelled order');
  }
  return updatedOrder;
}
