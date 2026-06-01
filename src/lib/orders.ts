import { fetchApiJson } from './api';
import { getDisplayOrderNumber, type ApiOrder, type PendingOrderDraft } from './contracts';

type ApiOrderLike = Partial<ApiOrder> & { id?: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function normalizeApiOrder(value: unknown): ApiOrder | null {
  if (!isRecord(value)) {
    return null;
  }

  const order = value as ApiOrderLike;
  let _id: string | null = null;
  if (typeof order._id === 'string' && order._id.trim().length > 0) {
    _id = order._id;
  } else if (typeof order.id === 'string' && order.id.trim().length > 0) {
    _id = order.id;
  }

  const orderId = typeof order.orderId === 'string' && order.orderId.trim().length > 0 ? order.orderId : null;
  const orderNumber = getDisplayOrderNumber(order, '');

  if (!_id || !orderId || !orderNumber) {
    return null;
  }

  return {
    ...order,
    _id,
    orderId,
    orderNumber,
  } as ApiOrder;
}

function extractApiOrder(value: unknown): ApiOrder | null {
  const directOrder = normalizeApiOrder(value);
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
  ];

  for (const candidate of wrappedCandidates) {
    const normalizedOrder = normalizeApiOrder(candidate);
    if (normalizedOrder) {
      return normalizedOrder;
    }
  }

  return null;
}

function extractApiOrderArray(value: unknown): ApiOrder[] | null {
  if (Array.isArray(value)) {
    const normalizedOrders = value
      .map(extractApiOrder)
      .filter((order): order is ApiOrder => Boolean(order));
    return normalizedOrders.length > 0 || value.length === 0
      ? normalizedOrders
      : null;
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
      .map(extractApiOrder)
      .filter((order): order is ApiOrder => Boolean(order));
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

export function sortOrdersByNewest<T extends Pick<ApiOrder, 'createdAt'>>(orders: T[]): T[] {
  return [...orders].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export async function createOrder(payload: PendingOrderDraft): Promise<ApiOrder> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (
    typeof payload.clientDraftId === 'string' &&
    payload.clientDraftId.trim().length > 0
  ) {
    // Backend requirement: POST /orders should deduplicate repeated submissions using this key.
    headers['Idempotency-Key'] = payload.clientDraftId.trim();
  }

  const responseBody = await fetchApiJson<unknown>('/orders', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const createdOrder = extractApiOrder(responseBody);
  if (!createdOrder) {
    throw new Error('Backend did not return a valid order identifier');
  }

  return createdOrder;
}

export async function payRemainingBalance(
  orderId: string,
  payload: RemainingPaymentPayload,
): Promise<ApiOrder> {
  const responseBody = await fetchApiJson<unknown>(
    `/orders/${orderId}/payments`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );

  const updatedOrder = extractApiOrder(responseBody);
  if (!updatedOrder) {
    throw new Error('Backend did not return a valid updated order');
  }

  return updatedOrder;
}

export async function fetchOrders(): Promise<ApiOrder[]> {
  const responseBody = await fetchApiJson<unknown>('/orders', {
    cache: 'no-store',
  });
  const orders = extractApiOrderArray(responseBody);

  if (!orders) {
    throw new Error('Backend did not return a valid orders list');
  }

  return orders;
}

export async function fetchOrderById(orderId: string): Promise<ApiOrder> {
  const responseBody = await fetchApiJson<unknown>(`/orders/${orderId}`);
  const order = extractApiOrder(responseBody);

  if (!order) {
    throw new Error('Backend did not return a valid order');
  }

  return order;
}

export async function updateOrderCustomerInfo(
  orderId: string,
  customerInfo: UpdateCustomerInfoPayload,
): Promise<ApiOrder> {
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

  const updatedOrder = extractApiOrder(responseBody);
  if (!updatedOrder) {
    throw new Error('Backend did not return a valid updated order');
  }

  return updatedOrder;
}
