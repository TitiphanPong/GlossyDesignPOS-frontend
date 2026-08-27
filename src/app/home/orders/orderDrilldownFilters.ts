import { isOrderStatus, type OrderStatus } from '../../../lib/contracts';

export type OutstandingPaymentFilter = 'all' | 'unpaid';

export type OrderDrilldownFilters = {
  status: 'all' | OrderStatus;
  payment: OutstandingPaymentFilter;
  month: string | null;
  sanitizedSearch: string;
};

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export function parseOrderDrilldownFilters(search: string): OrderDrilldownFilters {
  const params = new URLSearchParams(search);
  const statusParam = params.get('status');
  const paymentParam = params.get('payment');
  const monthParam = params.get('month');

  const status = statusParam && isOrderStatus(statusParam) ? statusParam : 'all';
  const payment: OutstandingPaymentFilter = paymentParam === 'unpaid' ? 'unpaid' : 'all';
  const month = monthParam && MONTH_PATTERN.test(monthParam) ? monthParam : null;

  if (statusParam && status === 'all') params.delete('status');
  if (paymentParam && payment === 'all') params.delete('payment');
  if (monthParam && month === null) params.delete('month');

  return {
    status,
    payment,
    month,
    sanitizedSearch: params.toString(),
  };
}
