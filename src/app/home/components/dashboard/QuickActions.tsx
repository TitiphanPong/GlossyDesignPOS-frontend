'use client';

import { Box, Paper, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import { uiCardSx } from '../adminUi';

const ACTIONS = [
  {
    label: 'รายการออเดอร์',
    description: 'ตรวจสอบและพิมพ์เอกสาร',
    href: '/home/orders',
    icon: PrintRoundedIcon,
    iconGrad: 'linear-gradient(135deg, #6C4DFF, #8A5CFF)',
    bgHover: '#F5F0FF',
  },
  {
    label: 'หน้าขาย',
    description: 'เพิ่มสินค้าและเปิดบิลใหม่',
    href: '/home/posseller',
    icon: AddBoxRoundedIcon,
    iconGrad: 'linear-gradient(135deg, #10B981, #34D399)',
    bgHover: '#F0FDF4',
  },
  {
    label: 'จัดการสต็อก',
    description: 'ดูไฟล์งานและสถานะจัดเก็บ',
    href: '/home/storage',
    icon: Inventory2RoundedIcon,
    iconGrad: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    bgHover: '#EFF6FF',
  },
  {
    label: 'สรุปการขาย',
    description: 'ติดตามภาพรวมและผลลัพธ์',
    href: '/home/orders',
    icon: BarChartRoundedIcon,
    iconGrad: 'linear-gradient(135deg, #EC4899, #F472B6)',
    bgHover: '#FDF2F8',
  },
];

export default function QuickActions() {
  return (
    <Paper elevation={0} sx={{ ...uiCardSx, p: { xs: 2, md: 2.25 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
          gap: 1.5,
          flex: 1,
        }}>
        {ACTIONS.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div key={action.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, type: 'spring', stiffness: 280, damping: 22 }}>
              <Paper
                component={Link}
                href={action.href}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  p: 1.75,
                  minHeight: { xs: 132, md: 140 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  textDecoration: 'none',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  bgcolor: 'background.paper',
                  transition: 'all 0.22s ease',
                  '&:hover': {
                    background: action.bgHover,
                    borderColor: 'rgba(108,77,255,0.14)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 22px rgba(15, 23, 42, 0.08)',
                  },
                }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    background: action.iconGrad,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 6px 16px rgba(15, 23, 42, 0.14)',
                  }}>
                  <Icon sx={{ color: '#fff', fontSize: 22 }} />
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#101828', lineHeight: 1.2 }}>{action.label}</Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.3, lineHeight: 1.35 }}>{action.description}</Typography>
                </Box>
              </Paper>
            </motion.div>
          );
        })}
      </Box>
    </Paper>
  );
}
