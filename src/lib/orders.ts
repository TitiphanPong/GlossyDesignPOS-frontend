import { fetchApiJson } from './api';
import { normalizeApiOrder, type ApiOrder, type NormalizedOrder, type PendingOrderDraft } from './contracts';

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
  const hasIdentifier =
    (typeof order._id === 'string' && order._id.trim().length > 0) ||
    (typeof order.id === 'string' && order.id.trim().length > 0);
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
    const normalizedOrders = value
      .map(extractOrderFromResponse)
      .filter((order): order is NormalizedOrder => Boolean(order));
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

    const normalizedOrders = candidate
      .map(extractOrderFromResponse)
      .filter((order): order is NormalizedOrder => Boolean(order));

    if (normalizedOrders.length > 0 || candidate.length === 0) {
      return normalizedOrders;
    }
  }

  return null;
}

type RemainingPaymentPayload = {
  amount: number;
  method: ApiOrder['payment'];
};

type UpdateCustomerInfoPayload = {
  customerName: string;
  taxId?: string;
  address?: string;
};

export function sortOrdersByNewest<T extends Pick<NormalizedOrder, 'createdAt'>>(orders: T[]): T[] {
  return [...orders].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export async function createOrder(payload: PendingOrderDraft): Promise<NormalizedOrder> {
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

export async function payRemainingBalance(
  orderId: string,
  payload: RemainingPaymentPayload,
): Promise<NormalizedOrder> {
  const responseBody = await fetchApiJson<unknown>(`/orders/${orderId}/payments`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const updatedOrder = extractOrderFromResponse(responseBody);
  if (!updatedOrder) {
    throw new Error('Backend did not return a valid updated order');
  }

  return updatedOrder;
}

export async function fetchOrders(): Promise<NormalizedOrder[]> {
  const responseBody = await fetchApiJson<unknown>('/orders', {
    cache: 'no-store',
  });
  const orders = extractOrdersFromResponse(responseBody);

  if (!orders) {
    throw new Error('Backend did not return a valid orders list');
  }

  return orders;
}

export async function fetchOrderById(orderId: string): Promise<NormalizedOrder> {
  const responseBody = await fetchApiJson<unknown>(`/orders/${orderId}`);
  const order = extractOrderFromResponse(responseBody);

  if (!order) {
    throw new Error('Backend did not return a valid order');
  }

  return order;
}

export async function updateOrderCustomerInfo(
  orderId: string,
  customerInfo: UpdateCustomerInfoPayload,
): Promise<NormalizedOrder> {
  const normalizedCustomerName = customerInfo.customerName.trim();
  const normalizedTaxId = customerInfo.taxId?.trim();
  const normalizedAddress = customerInfo.address?.trim();

  const responseBody = await fetchApiJson<unknown>(`/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: normalizedCustomerName || '-',
      taxId: normalizedTaxId || undefined,
      customerTaxId: normalizedTaxId || undefined,
      address: normalizedAddress || undefined,
      customerAddress: normalizedAddress || undefined,
    }),
  });

  const updatedOrder = extractOrderFromResponse(responseBody);
  if (!updatedOrder) {
    throw new Error('Backend did not return a valid updated order');
  }

  return updatedOrder;
}
