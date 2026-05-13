'use client';

import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';

const ACTIONS = [
  {
    label: 'พิมพ์ใบเสร็จ',
    description: 'ออกเอกสาร',
    href: '/home/saleListPage',
    icon: PrintRoundedIcon,
    iconGrad: 'linear-gradient(135deg, #6C4DFF, #8A5CFF)',
    bgHover: '#F5F0FF',
  },
  {
    label: 'เพิ่มสินค้า',
    description: 'จัดการสินค้า',
    href: '/home/posseller',
    icon: AddBoxRoundedIcon,
    iconGrad: 'linear-gradient(135deg, #10B981, #34D399)',
    bgHover: '#F0FDF4',
  },
  {
    label: 'จัดการลูกค้า',
    description: 'ข้อมูลลูกค้า',
    href: '/home/saleListPage',
    icon: PeopleAltRoundedIcon,
    iconGrad: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    bgHover: '#EFF6FF',
  },
  {
    label: 'ดูรายงาน',
    description: 'สรุปยอดขาย',
    href: '/home/saleListPage',
    icon: BarChartRoundedIcon,
    iconGrad: 'linear-gradient(135deg, #EC4899, #F472B6)',
    bgHover: '#FDF2F8',
  },
];

export default function QuickActions() {
  return (
    <Box>
      <Typography
        variant="subtitle1"
        fontWeight={700}
        sx={{ color: '#374151', mb: 1.5, fontSize: 14 }}
      >
        ⚡ การดำเนินการด่วน
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
        {ACTIONS.map((act, i) => {
          const Icon = act.icon;
          return (
            <motion.div
              key={act.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 280, damping: 22 }}
            >
              <Paper
                component={Link}
                href={act.href}
                elevation={0}
                className="quick-action-card"
                sx={{
                  borderRadius: '16px',
                  background: 'white',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  textDecoration: 'none',
                  border: '1.5px solid transparent',
                  transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                  '&:hover': {
                    background: act.bgHover,
                    borderColor: 'rgba(108,77,255,0.14)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 26px rgba(0,0,0,0.09)',
                  },
                }}
              >
                <Box
                  className="quick-action-icon"
                  sx={{
                    width: 44, height: 44,
                    borderRadius: '13px',
                    background: act.iconGrad,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                  }}
                >
                  <Icon sx={{ color: 'white', fontSize: 22 }} />
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1a1035', lineHeight: 1.2 }}>
                    {act.label}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: '#9CA3AF', mt: 0.2 }}>
                    {act.description}
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          );
        })}
      </Box>
    </Box>
  );
}
