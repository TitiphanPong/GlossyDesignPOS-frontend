'use client';

import { Box, Paper, Typography } from '@mui/material';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { motion } from 'framer-motion';
import { EmptyState } from '../dashboardUi';
import type { OrderStatus } from '../../../../lib/contracts';

type DashboardStatusItem = { key: OrderStatus; count: number };

const STATUS_META: Record<OrderStatus, { label: string; icon: typeof HourglassEmptyRoundedIcon; bg: string; color: string; iconBg: string; bar: string }> = {
  pending: {
    label: 'รอดำเนินการ',
    icon: HourglassEmptyRoundedIcon,
    bg: '#EEF2FF',
    color: '#4F46E5',
    iconBg: '#4F46E520',
    bar: '#4F46E5',
  },
  partial: {
    label: 'ค้างชำระ',
    icon: AutorenewRoundedIcon,
    bg: '#FFF7ED',
    color: '#EA580C',
    iconBg: '#EA580C20',
    bar: '#EA580C',
  },
  paid: {
    label: 'เสร็จสิ้น',
    icon: CheckCircleRoundedIcon,
    bg: '#F0FDF4',
    color: '#16A34A',
    iconBg: '#16A34A20',
    bar: '#16A34A',
  },
  cancelled: {
    label: 'ยกเลิก',
    icon: CancelRoundedIcon,
    bg: '#F3F4F6',
    color: '#6B7280',
    iconBg: '#E5E7EB',
    bar: '#9CA3AF',
  },
};

type OrderStatusSummaryProps = {
  statuses: DashboardStatusItem[];
};

export default function OrderStatusSummary({ statuses }: Readonly<OrderStatusSummaryProps>) {
  const total = statuses.reduce((sum, item) => sum + item.count, 0);

  return (
    <Paper
      elevation={0}
      className="glass-card-hover"
      sx={{
        borderRadius: '20px',
        background: 'white',
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        p: 3,
        overflow: 'hidden',
      }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#1a1035', letterSpacing: '-0.3px' }}>
            สถานะงาน
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#9CA3AF', mt: 0.2, fontWeight: 500 }}>{total} งานทั้งหมด</Typography>
        </Box>
      </Box>

      {statuses.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
          {statuses.map((status, index) => {
            const meta = STATUS_META[status.key];
            const Icon = meta.icon;
            const pct = total > 0 ? Math.round((status.count / total) * 100) : 0;
            return (
              <motion.div key={status.key} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.07 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.4,
                    borderRadius: '12px',
                    background: meta.bg,
                    transition: 'transform 0.18s',
                    '&:hover': { transform: 'translateX(4px)' },
                  }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: '9px', background: meta.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon sx={{ fontSize: 18, color: meta.color }} />
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#374151' }}>{meta.label}</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 800, color: meta.color }}>{status.count}</Typography>
                    </Box>
                    <Box sx={{ height: 4, borderRadius: '99px', background: `${meta.bar}22`, overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, delay: index * 0.1, ease: 'easeOut' }} style={{ height: '100%', borderRadius: '99px', background: meta.bar }} />
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            );
          })}
        </Box>
      ) : (
        <EmptyState compact title="ไม่มีสถานะงานให้แสดง" subtitle="เมื่อมีออเดอร์ในระบบ สถานะงานจะถูกสรุปอัตโนมัติ" eyebrow="No Status Data" />
      )}
    </Paper>
  );
}
