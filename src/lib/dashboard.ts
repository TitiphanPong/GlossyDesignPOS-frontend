import { fetchApiJson } from './api';
import type { OrderStatus, ProductionWorkflowStatus } from './contracts';

export type DashboardProduct = { name: string; quantity: number; revenue: number };
export type DashboardTask = { id: string; orderNumber: string; customerName: string; job: string; status: OrderStatus; remainingPayment: number; updatedAt?: string };
export type DashboardActivity = { type: 'order' | 'upload'; id: string; title: string; detail: string; at: string };

export type DashboardSummary = {
  generatedAt: string;
  timezone: 'Asia/Bangkok';
  period: { mode: 'today' | 'last7' | 'month' | 'custom'; month?: string; from: string; toExclusive: string; label: string };
  periodSummary: { sales: number; collections: number; orders: number; customers: number; previousSales: number; previousOrders: number };
  today: { sales: number; received: number; orders: number; customers: number; outstanding: number; urgentJobs: number; yesterdaySales: number; yesterdayOrders: number };
  paymentSummary: { received: number; cash: number; transfer: number; fullPayment: number; deposits: number; oldOutstandingPaid: number };
  orderStatus: Record<OrderStatus, number>;
  operations: {
    workflow: Record<'pending' | 'producing' | 'ready_for_pickup', number>;
    outstanding: { orders: number; amount: number };
    filesWaiting: number;
    lowStock: number;
  };
  salesTrend: Array<{ date: string; revenue: number; orders: number }>;
  topProducts: DashboardProduct[];
  quickSeller: { orders: number; revenue: number; items: DashboardProduct[] };
  uploads: { newFiles: number; newUploads: number; waitingReview: number; unlinked: number };
  outstandingAging: { total: number; today: number; days1To7: number; days8To30: number; over30Days: number };
  tasks: DashboardTask[];
  recentActivity: DashboardActivity[];
  capabilities: { dueDates: boolean; urgentFlag: boolean; uploadOrderLink: boolean };
};

export function buildDashboardOrdersHref(options: {
  period: DashboardSummary['period']['mode'];
  month?: string;
  startDate: string;
  endDate: string;
  workflowStatus?: ProductionWorkflowStatus;
  payment?: 'unpaid';
}): string {
  const query = new URLSearchParams();
  if (options.period === 'today') query.set('period', 'today');
  if (options.period === 'month' && options.month) query.set('month', options.month);
  if (options.period === 'last7' || options.period === 'custom') {
    query.set('startDate', options.startDate);
    query.set('endDate', options.endDate);
  }
  if (options.workflowStatus) query.set('workflowStatus', options.workflowStatus);
  if (options.payment) query.set('payment', options.payment);
  return `/home/orders?${query.toString()}`;
}

export function fetchDashboardSummary(params: { period?: 'today' | 'last7' | 'month' | 'custom'; month?: string; startDate?: string; endDate?: string } = {}): Promise<DashboardSummary> {
  const query = new URLSearchParams();
  if (params.period) query.set('period', params.period);
  if (params.period === 'month' && params.month) query.set('month', params.month);
  if (params.period === 'custom' && params.startDate && params.endDate) {
    query.set('startDate', params.startDate);
    query.set('endDate', params.endDate);
  }
  const suffix = query.size ? `?${query.toString()}` : '';
  return fetchApiJson<DashboardSummary>(`/dashboard/summary${suffix}`, { cache: 'no-store' });
}
