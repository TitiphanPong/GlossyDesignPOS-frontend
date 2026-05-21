'use client';

import { Alert, Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { ApiOrder, OrdersSummary } from '../../lib/contracts';
import { fetchApiJson, hasApiBaseUrl } from '../../lib/api';

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
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasApiBaseUrl()) {
      setMissingApiBase(true);
      setLoading(false);
      return;
    }
    const summaryRequest = fetchApiJson<OrdersSummary>('/orders/summary');
    const ordersRequest = fetchApiJson<unknown>('/orders');

    Promise.all([summaryRequest, ordersRequest])
      .then(([summaryData, orders]) => {
        setLoadError(null);
        setSummary(summaryData);
        if (isApiOrderArray(orders)) {
          const sorted = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRecentOrders(sorted.slice(0, 8));
        }
      })
      .catch(error => {
        console.error('Dashboard load failed:', error);
        setSummary(null);
        setRecentOrders([]);
        setLoadError(error instanceof Error && error.message ? error.message : 'ไม่สามารถโหลดข้อมูลสรุปของแดชบอร์ดได้ในขณะนี้ กรุณาลองรีเฟรชอีกครั้ง');
      })
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
      {loadError ? (
        <Alert severity="warning" sx={{ mb: 2.5, borderRadius: 3, alignItems: 'flex-start' }}>
          <Typography variant="subtitle2" fontWeight={700}>
            ข้อมูลแดชบอร์ดอาจไม่ครบถ้วน
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {loadError}
          </Typography>
        </Alert>
      ) : null}

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

