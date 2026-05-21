'use client';

import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { ApiOrder, OrdersSummary } from '../../lib/contracts';
import { getApiBaseUrl, hasApiBaseUrl } from '../../lib/api';

import DashboardHeader from './components/dashboard/DashboardHeader';
import KPICards from './components/dashboard/KPICards';
import SalesChart from './components/dashboard/SalesChart';
import QuickActions from './components/dashboard/QuickActions';
import TopProducts from './components/dashboard/TopProducts';
import PaymentDonut from './components/dashboard/PaymentDonut';
import MonthlyGoal from './components/dashboard/MonthlyGoal';
import OrderStatusSummary from './components/dashboard/OrderStatusSummary';
import RecentOrdersTable from './components/dashboard/RecentOrdersTable';
import AdminPageContainer from './components/AdminPageContainer';
import { LoadingState, MissingApiConfigState } from './components/dashboardUi';

const isApiOrderArray = (value: unknown): value is ApiOrder[] => Array.isArray(value);

export default function DashboardPage() {
  const [summary, setSummary] = useState<OrdersSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [missingApiBase, setMissingApiBase] = useState(false);

  useEffect(() => {
    if (!hasApiBaseUrl()) {
      setMissingApiBase(true);
      setLoading(false);
      return;
    }
    const base = getApiBaseUrl();

    const summaryRequest: Promise<OrdersSummary> = fetch(`${base}/orders/summary`).then((response) => response.json());
    const ordersRequest: Promise<unknown> = fetch(`${base}/orders`).then((response) => response.json());

    Promise.all([summaryRequest, ordersRequest])
      .then(([summaryData, orders]) => {
        setSummary(summaryData);
        if (isApiOrderArray(orders)) {
          const sorted = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRecentOrders(sorted.slice(0, 8));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminPageContainer title="Dashboard" subtitle="ภาพรวมการขายและสถานะธุรกิจวันนี้">
        <LoadingState />
      </AdminPageContainer>
    );
  }

  if (missingApiBase) {
    return (
      <AdminPageContainer title="Dashboard" subtitle="ภาพรวมการขายและสถานะธุรกิจวันนี้">
        <MissingApiConfigState />
      </AdminPageContainer>
    );
  }

  return (
    <AdminPageContainer title="Dashboard" subtitle="ภาพรวมการขายและสถานะธุรกิจวันนี้">
      <DashboardHeader />

      <KPICards salesToday={summary?.salesToday} cashToday={summary?.cashToday} promptPayToday={summary?.promptPayToday} completed={summary?.completed} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: 'minmax(0, 1.45fr) minmax(320px, 0.9fr)',
          },
          gap: 3,
          alignItems: 'start',
        }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <SalesChart />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 3,
              alignItems: 'stretch',
            }}>
            <QuickActions />
            <TopProducts />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <PaymentDonut />
          <MonthlyGoal />
          <OrderStatusSummary />
        </Box>
      </Box>

      <Box className="section-divider" />

      <RecentOrdersTable orders={recentOrders} />
    </AdminPageContainer>
  );
}

