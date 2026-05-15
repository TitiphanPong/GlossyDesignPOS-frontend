'use client';

import { Box, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { ApiOrder, OrdersSummary } from '../../lib/contracts';

import DashboardHeader from './components/dashboard/DashboardHeader';
import KPICards from './components/dashboard/KPICards';
import SalesChart from './components/dashboard/SalesChart';
import QuickActions from './components/dashboard/QuickActions';
import TopProducts from './components/dashboard/TopProducts';
import PaymentDonut from './components/dashboard/PaymentDonut';
import MonthlyGoal from './components/dashboard/MonthlyGoal';
import OrderStatusSummary from './components/dashboard/OrderStatusSummary';
import RecentOrdersTable from './components/dashboard/RecentOrdersTable';

export default function DashboardPage() {
  const [summary, setSummary] = useState<OrdersSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? '';
    if (!base) {
      setLoading(false);
      return;
    }

    Promise.all([fetch(`${base}/orders/summary`).then(r => r.json()), fetch(`${base}/orders`).then(r => r.json())])
      .then(([summaryData, orders]) => {
        setSummary(summaryData);
        if (Array.isArray(orders)) {
          const sorted = [...(orders as ApiOrder[])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRecentOrders(sorted.slice(0, 8));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress sx={{ color: '#6C4DFF' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 3 },
        pb: 6,
        maxWidth: '1600px',
        mx: 'auto',
      }}>
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
    </Box>
  );
}
