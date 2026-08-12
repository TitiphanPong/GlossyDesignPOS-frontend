import { fetchApiJson } from './api';
import type { OrderStatus } from './contracts';

export type PublicTrackingResult = {
  orderNumber: string;
  status: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
};

export async function trackOrder(orderNumber: string, phoneSuffix: string): Promise<PublicTrackingResult> {
  return fetchApiJson<PublicTrackingResult>('/tracking/lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderNumber: orderNumber.trim(),
      phoneSuffix: phoneSuffix.trim(),
    }),
    cache: 'no-store',
  });
}
