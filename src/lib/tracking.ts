import { fetchApiJson } from './api';
import { extractOrderFromResponse, extractOrdersFromResponse } from './orders';
import type { NormalizedOrder } from './contracts';

export async function trackOrder(query: string): Promise<NormalizedOrder[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return [];
  }

  const params = new URLSearchParams({ q: normalizedQuery });
  const trackingOrderNumberParams = new URLSearchParams({ orderNumber: normalizedQuery });
  const trackingPhoneParams = new URLSearchParams({ phone: normalizedQuery });
  const endpoints = [
    `/orders/track?${params.toString()}`,
    `/tracking/search?${trackingOrderNumberParams.toString()}`,
    `/tracking/search?${trackingPhoneParams.toString()}`,
    `/tracking/${encodeURIComponent(normalizedQuery)}`,
    `/orders?${params.toString()}`,
  ];
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const responseBody = await fetchApiJson<unknown>(endpoint, { cache: 'no-store' });
      const singleOrder = extractOrderFromResponse(responseBody);
      if (singleOrder) return [singleOrder];

      const orders = extractOrdersFromResponse(responseBody);
      if (orders) {
        const loweredQuery = normalizedQuery.toLowerCase();
        return orders.filter(order => order.orderNumber.toLowerCase().includes(loweredQuery) || order.orderId.toLowerCase().includes(loweredQuery) || order.phoneNumber.toLowerCase().includes(loweredQuery));
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('tracking_request_failed');
    }
  }

  throw lastError ?? new Error('ไม่พบข้อมูลออเดอร์');
}
