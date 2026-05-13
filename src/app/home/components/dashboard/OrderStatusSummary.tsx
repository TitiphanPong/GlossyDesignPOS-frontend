'use client';

import { Box, Typography, Paper } from '@mui/material';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { motion } from 'framer-motion';

const STATUSES = [
  {
    label: 'รอดำเนินการ',
    count: 5,
    icon: HourglassEmptyRoundedIcon,
    bg: '#EEF2FF',
    color: '#4F46E5',
    iconBg: '#4F46E520',
    bar: '#4F46E5',
    pct: 10,
  },
  {
    label: 'กำลังผลิต',
    count: 13,
    icon: AutorenewRoundedIcon,
    bg: '#FFF7ED',
    color: '#EA580C',
    iconBg: '#EA580C20',
    bar: '#EA580C',
    pct: 26,
  },
  {
    label: 'รอรับสินค้า',
    count: 7,
    icon: LocalShippingRoundedIcon,
    bg: '#F0FDFA',
    color: '#0D9488',
    iconBg: '#0D948820',
    bar: '#0D9488',
    pct: 14,
  },
  {
    label: 'เสร็จสิ้น',
    count: 28,
    icon: CheckCircleRoundedIcon,
    bg: '#F0FDF4',
    color: '#16A34A',
    iconBg: '#16A34A20',
    bar: '#16A34A',
    pct: 56,
  },
];

export default function OrderStatusSummary() {
  const total = STATUSES.reduce((s, x) => s + x.count, 0);

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
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#1a1035', letterSpacing: '-0.3px' }}>
            📋 สถานะงาน
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#9CA3AF', mt: 0.2, fontWeight: 500 }}>
            {total} งานทั้งหมด
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
        {STATUSES.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.4,
                  borderRadius: '12px',
                  background: s.bg,
                  transition: 'transform 0.18s',
                  '&:hover': { transform: 'translateX(4px)' },
                }}
              >
                <Box
                  sx={{
                    width: 34, height: 34,
                    borderRadius: '9px',
                    background: s.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon sx={{ fontSize: 18, color: s.color }} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#374151' }}>
                      {s.label}
                    </Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 800, color: s.color }}>
                      {s.count}
                    </Typography>
                  </Box>
                  {/* Mini bar */}
                  <Box sx={{ height: 4, borderRadius: '99px', background: `${s.bar}22`, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.pct}%` }}
                      transition={{ duration: 0.9, delay: i * 0.1, ease: 'easeOut' }}
                      style={{ height: '100%', borderRadius: '99px', background: s.bar }}
                    />
                  </Box>
                </Box>
              </Box>
            </motion.div>
          );
        })}
      </Box>
    </Paper>
  );
}
