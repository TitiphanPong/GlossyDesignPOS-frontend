import { isProductionWorkflowStatus, type ProductionWorkflowStatus } from '../../../lib/contracts';

export type OutstandingPaymentFilter = 'all' | 'unpaid';

export type OrderDrilldownFilters = {
  workflowStatus: 'all' | ProductionWorkflowStatus;
  payment: OutstandingPaymentFilter;
  month: string | null;
  period: 'today' | null;
  startDate: string | null;
  endDate: string | null;
  sanitizedSearch: string;
};

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export function parseOrderDrilldownFilters(search: string): OrderDrilldownFilters {
  const params = new URLSearchParams(search);
  const workflowStatusParam = params.get('workflowStatus');
  const statusParam = params.get('status');
  const paymentParam = params.get('payment');
  const monthParam = params.get('month');
  const periodParam = params.get('period');
  const startDateParam = params.get('startDate');
  const endDateParam = params.get('endDate');

  const workflowStatus = workflowStatusParam && isProductionWorkflowStatus(workflowStatusParam) ? workflowStatusParam : statusParam && isProductionWorkflowStatus(statusParam) ? statusParam : 'all';
  const payment: OutstandingPaymentFilter = paymentParam === 'unpaid' ? 'unpaid' : 'all';
  const month = monthParam && MONTH_PATTERN.test(monthParam) ? monthParam : null;
  const period = periodParam === 'today' ? 'today' : null;
  const datesAreValid = Boolean(startDateParam && endDateParam && DATE_PATTERN.test(startDateParam) && DATE_PATTERN.test(endDateParam) && startDateParam <= endDateParam);
  const startDate = datesAreValid ? startDateParam : null;
  const endDate = datesAreValid ? endDateParam : null;

  params.delete('status');
  if (workflowStatus === 'all') params.delete('workflowStatus');
  else params.set('workflowStatus', workflowStatus);
  if (paymentParam && payment === 'all') params.delete('payment');
  if (monthParam && month === null) params.delete('month');
  if (periodParam && period === null) params.delete('period');
  if (!datesAreValid) {
    params.delete('startDate');
    params.delete('endDate');
  }

  return {
    workflowStatus,
    payment,
    month,
    period,
    startDate,
    endDate,
    sanitizedSearch: params.toString(),
  };
}
