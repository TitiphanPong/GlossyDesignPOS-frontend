import { fetchApiJson } from './api';
import { formatCustomerAddress, getDisplayOrderNumber, type ApiOrder, type CustomerInfo, type PendingOrderDraft } from './contracts';

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
  const orderNumber = getDisplayOrderNumber(order, '');

  if (!_id || !orderId || !orderNumber) {
    return null;
  }

  return {
    ...order,
    _id,
    orderId,
    // TODO(order-number): remove this frontend fallback once the backend always returns orderNumber.
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
    const normalizedOrders = value.map(extractApiOrder).filter((order): order is ApiOrder => Boolean(order));
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

    const normalizedOrders = candidate.map(extractApiOrder).filter((order): order is ApiOrder => Boolean(order));
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

type UpdateCustomerInfoPayload = CustomerInfo;

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

export async function payRemainingBalance(orderId: string, payload: RemainingPaymentPayload): Promise<ApiOrder> {
  const responseBody = await fetchApiJson<unknown>(`/orders/${orderId}/payments`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const updatedOrder = extractApiOrder(responseBody);
  if (!updatedOrder) {
    throw new Error('Backend did not return a valid updated order');
  }

  return updatedOrder;
}

export async function fetchOrders(): Promise<ApiOrder[]> {
  const responseBody = await fetchApiJson<unknown>('/orders', { cache: 'no-store' });
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

export async function updateOrderCustomerInfo(orderId: string, customerInfo: UpdateCustomerInfoPayload): Promise<ApiOrder> {
  const formattedAddress = formatCustomerAddress(customerInfo);
  const branchLabel =
    customerInfo.branchType === 'สาขา'
      ? `สาขา ${customerInfo.branchNo?.trim() || '-'}`
      : customerInfo.branchType === 'สำนักงานใหญ่'
        ? 'สำนักงานใหญ่'
        : undefined;

  const responseBody = await fetchApiJson<unknown>(`/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: customerInfo.customerName,
      phoneNumber: customerInfo.phoneNumber,
      email: customerInfo.email,
      customerEmail: customerInfo.email,
      taxId: customerInfo.taxId,
      customerTaxId: customerInfo.taxId,
      branchType: customerInfo.branchType,
      branchNo: customerInfo.branchNo,
      branch: branchLabel,
      customerBranch: branchLabel,
      address: formattedAddress,
      customerAddress: formattedAddress,
      subDistrict: customerInfo.subDistrict,
      district: customerInfo.district,
      province: customerInfo.province,
      postalCode: customerInfo.postalCode,
      shippingAddress: customerInfo.shippingAddress,
    }),
  });

  const updatedOrder = extractApiOrder(responseBody);
  if (!updatedOrder) {
    throw new Error('Backend did not return a valid updated order');
  }

  return updatedOrder;
}
