import { fetchApiJson } from './api';
import type { OrderStatus } from './contracts';

export type DashboardProduct = { name: string; quantity: number; revenue: number };
export type DashboardTask = { id: string; orderNumber: string; customerName: string; job: string; status: OrderStatus; remainingPayment: number; updatedAt?: string };
export type DashboardActivity = { type: 'order' | 'upload'; id: string; title: string; detail: string; at: string };

export type DashboardSummary = {
  generatedAt: string;
  timezone: 'Asia/Bangkok';
  today: { sales: number; received: number; orders: number; customers: number; outstanding: number; urgentJobs: number; yesterdaySales: number; yesterdayOrders: number };
  paymentSummary: { received: number; cash: number; transfer: number; fullPayment: number; deposits: number; oldOutstandingPaid: number };
  orderStatus: Record<OrderStatus, number>;
  salesTrend: Array<{ date: string; revenue: number; orders: number }>;
  topProducts: DashboardProduct[];
  quickSeller: { orders: number; revenue: number; items: DashboardProduct[] };
  uploads: { newFiles: number; newUploads: number; waitingReview: number; unlinked: number };
  outstandingAging: { total: number; today: number; days1To7: number; days8To30: number; over30Days: number };
  tasks: DashboardTask[];
  recentActivity: DashboardActivity[];
  capabilities: { dueDates: boolean; urgentFlag: boolean; uploadOrderLink: boolean };
};

export function fetchDashboardSummary(): Promise<DashboardSummary> {
  return fetchApiJson<DashboardSummary>('/dashboard/summary', { cache: 'no-store' });
}
