'use client';

import { Box } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { ApiOrder, type OrderStatus } from '../../lib/contracts';
import { hasApiBaseUrl } from '../../lib/api';
import { fetchOrders } from '../../lib/orders';

import DashboardHeader from './components/dashboard/DashboardHeader';
import KPICards from './components/dashboard/KPICards';
import SalesChart from './components/dashboard/SalesChart';
import QuickActions from './components/dashboard/QuickActions';
import PaymentDonut from './components/dashboard/PaymentDonut';
import OrderStatusSummary from './components/dashboard/OrderStatusSummary';
import RecentOrdersTable from './components/dashboard/RecentOrdersTable';
import AdminPageContainer from './components/AdminPageContainer';
import { LoadingState, MissingApiConfigState } from './components/dashboardUi';

type DashboardKpiItem = {
  label: string;
  value: number | null;
  prefix?: string;
  suffix?: string;
  icon: string;
  iconGrad: string;
  topGrad: string;
  sparkColor: string;
  series: number[];
};
type DashboardPaymentSlice = { name: string; value: number; color: string };
type DashboardStatusItem = { key: OrderStatus; count: number };

function getOrderAmount(order: ApiOrder): number {
  const value = order.grandTotal ?? order.total;
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function isSameDay(target: dayjs.Dayjs, compare: dayjs.Dayjs) {
  return target.format('YYYY-MM-DD') === compare.format('YYYY-MM-DD');
}

function buildRangeSeries(orders: ApiOrder[], items: number, unit: 'day' | 'month', labelFormatter: (date: dayjs.Dayjs) => string) {
  const now = dayjs();
  return Array.from({ length: items }, (_, index) => {
    const date = now.subtract(items - index - 1, unit);
    const value = orders
      .filter(order => {
        const createdAt = dayjs(order.createdAt);
        return createdAt.isValid() && createdAt.format(unit === 'day' ? 'YYYY-MM-DD' : 'YYYY-MM') === date.format(unit === 'day' ? 'YYYY-MM-DD' : 'YYYY-MM');
      })
      .reduce((sum, order) => sum + getOrderAmount(order), 0);

    return { label: labelFormatter(date), value };
  });
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [missingApiBase, setMissingApiBase] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const loadDashboard = () => {
    if (!hasApiBaseUrl()) {
      setMissingApiBase(true);
      setLoading(false);
      return;
    }

    setMissingApiBase(false);
    setLoading(true);
    Promise.all([fetchOrders()])
      .then(([orders]) => {
        setLoadError(null);
        setLastSyncedAt(new Date());
        const sorted = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(sorted);
      })
      .catch(error => {
        console.error('Dashboard load failed:', error);
        setOrders([]);
        setLoadError(error instanceof Error && error.message ? error.message : 'ไม่สามารถโหลดข้อมูลสรุปของแดชบอร์ดได้ในขณะนี้ กรุณาลองรีเฟรชอีกครั้ง');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const dashboardData = useMemo(() => {
    const now = dayjs();
    const recentOrders = orders.slice(0, 8);

    const ordersToday = orders.filter(order => isSameDay(dayjs(order.createdAt), now));
    const salesToday = ordersToday.reduce((sum, order) => sum + getOrderAmount(order), 0);
    const cashToday = ordersToday.filter(order => order.payment === 'cash').reduce((sum, order) => sum + getOrderAmount(order), 0);
    const promptPayToday = ordersToday.filter(order => order.payment === 'promptpay').reduce((sum, order) => sum + getOrderAmount(order), 0);
    const completedToday = ordersToday.filter(order => order.status === 'paid').length;
    const openOrders = orders.filter(order => order.status === 'pending' || order.status === 'partial').length;
    const uniqueCustomersToday = new Set(ordersToday.map(order => order.customerName?.trim()).filter(Boolean)).size;

    const paymentData: DashboardPaymentSlice[] = [
      { name: 'เงินสด', value: cashToday, color: '#6C4DFF' },
      { name: 'โอนเงิน', value: promptPayToday, color: '#3B82F6' },
    ].filter(item => item.value > 0);

    const statusData: DashboardStatusItem[] = (['pending', 'partial', 'paid', 'cancelled'] as OrderStatus[])
      .map(key => ({ key, count: orders.filter(order => order.status === key).length }))
      .filter(item => item.count > 0);

    const salesSeries7d = buildRangeSeries(orders, 7, 'day', date => date.format('dd'));

    const kpiCards: DashboardKpiItem[] = [
      {
        label: 'ยอดขายวันนี้',
        value: salesToday,
        prefix: '฿',
        icon: '💰',
        iconGrad: 'linear-gradient(135deg, #6C4DFF, #A87CFF)',
        topGrad: 'linear-gradient(90deg, #6C4DFF, #8A5CFF)',
        sparkColor: '#6C4DFF',
        series: salesSeries7d.map(item => item.value),
      },
      {
        label: 'ยอดขายเงินสด',
        value: cashToday,
        prefix: '฿',
        icon: '💵',
        iconGrad: 'linear-gradient(135deg, #10B981, #34D399)',
        topGrad: 'linear-gradient(90deg, #10B981, #34D399)',
        sparkColor: '#10B981',
        series: salesSeries7d.map(item => item.value),
      },
      {
        label: 'ยอดขายโอนเงิน',
        value: promptPayToday,
        prefix: '฿',
        icon: '📲',
        iconGrad: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
        topGrad: 'linear-gradient(90deg, #3B82F6, #60A5FA)',
        sparkColor: '#3B82F6',
        series: salesSeries7d.map(item => item.value),
      },
      {
        label: 'งานเสร็จวันนี้',
        value: completedToday,
        suffix: 'งาน',
        icon: '✅',
        iconGrad: 'linear-gradient(135deg, #14B8A6, #2DD4BF)',
        topGrad: 'linear-gradient(90deg, #14B8A6, #2DD4BF)',
        sparkColor: '#14B8A6',
        series: salesSeries7d.map(() => 0).map((_, index) => (index === salesSeries7d.length - 1 ? completedToday : 0)),
      },
      {
        label: 'ออเดอร์ค้างดำเนินการ',
        value: openOrders,
        suffix: 'งาน',
        icon: '⏳',
        iconGrad: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
        topGrad: 'linear-gradient(90deg, #F59E0B, #FCD34D)',
        sparkColor: '#F59E0B',
        series: statusData.map(item => item.count),
      },
      {
        label: 'ลูกค้าวันนี้',
        value: uniqueCustomersToday,
        suffix: 'คน',
        icon: '👥',
        iconGrad: 'linear-gradient(135deg, #EC4899, #F472B6)',
        topGrad: 'linear-gradient(90deg, #EC4899, #F472B6)',
        sparkColor: '#EC4899',
        series: salesSeries7d.map(() => 0).map((_, index) => (index === salesSeries7d.length - 1 ? uniqueCustomersToday : 0)),
      },
    ];

    return {
      recentOrders,
      paymentData,
      statusData,
      kpiCards,
    };
  }, [orders]);

  if (loading) {
    return (
      <AdminPageContainer>
        <LoadingState />
      </AdminPageContainer>
    );
  }

  if (missingApiBase) {
    return (
      <AdminPageContainer>
        <MissingApiConfigState />
      </AdminPageContainer>
    );
  }

  return (
    <AdminPageContainer>
      <DashboardHeader isRefreshing={loading} loadError={loadError} lastSyncedAt={lastSyncedAt} onRefresh={loadDashboard} />

      <KPICards cards={dashboardData.kpiCards} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: 'repeat(12, minmax(0, 1fr))' },
          gap: 2.5,
          alignItems: { xs: 'start', xl: 'stretch' },
        }}>
        <Box
          sx={{
            minWidth: 0,
            gridColumn: { xs: 'auto', xl: 'span 7' },
          }}>
          <SalesChart orders={orders} />
        </Box>

        <Box
          sx={{
            minWidth: 0,
            gridColumn: { xs: 'auto', xl: 'span 5' },
          }}>
          <QuickActions />
        </Box>

        <Box
          sx={{
            minWidth: 0,
            gridColumn: { xs: 'auto', xl: 'span 8' },
          }}>
          <OrderStatusSummary statuses={dashboardData.statusData} />
        </Box>

        <Box
          sx={{
            minWidth: 0,
            gridColumn: { xs: 'auto', xl: 'span 4' },
          }}>
          <PaymentDonut data={dashboardData.paymentData} />
        </Box>
      </Box>

      <Box className="section-divider" />

      <Box sx={{ mt: 2.5 }}>
        <RecentOrdersTable orders={dashboardData.recentOrders} />
      </Box>
    </AdminPageContainer>
  );
}
