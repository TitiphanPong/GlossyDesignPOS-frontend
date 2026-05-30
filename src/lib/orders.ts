import { fetchApiJson } from './api';
import { getOrderDisplayNumber, type ApiOrder, type PendingOrderDraft } from './contracts';

type ApiOrderLike = Partial<ApiOrder> & { id?: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function normalizeApiOrder(value: unknown): ApiOrder | null {
  if (!isRecord(value)) {
    return null;
  }

  const order = value as ApiOrderLike;
  const _id = typeof order._id === 'string' && order._id.trim().length > 0 ? order._id : typeof order.id === 'string' && order.id.trim().length > 0 ? order.id : null;
  const orderId = typeof order.orderId === 'string' && order.orderId.trim().length > 0 ? order.orderId : null;
  const orderNumber = getOrderDisplayNumber(order, '');

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

export async function createOrder(payload: PendingOrderDraft): Promise<ApiOrder> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof payload.clientDraftId === 'string' && payload.clientDraftId.trim().length > 0) {
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
