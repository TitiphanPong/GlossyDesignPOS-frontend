'use client';

import { Box, Typography, Paper } from '@mui/material';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { motion } from 'framer-motion';

const FEED = [
  {
    id: 'signup',
    icon: PersonAddAltRoundedIcon,
    color: '#6C4DFF',
    bg: '#EEF2FF',
    title: 'ลูกค้าใหม่สมัครสมาชิก',
    sub: 'คุณสมศรี มีทรัพย์',
    time: '2 นาทีที่แล้ว',
  },
  {
    id: 'new-order-1',
    icon: ShoppingCartRoundedIcon,
    color: '#3B82F6',
    bg: '#EFF6FF',
    title: 'ออเดอร์ใหม่เข้ามา',
    sub: '#ORD-2415 · โฟโต้บุ๊ค × 1',
    time: '15 นาทีที่แล้ว',
  },
  {
    id: 'shipping',
    icon: LocalShippingRoundedIcon,
    color: '#0D9488',
    bg: '#F0FDFA',
    title: 'งานถูกจัดส่งแล้ว',
    sub: '#ORD-2408 · สติ๊กเกอร์ PVC',
    time: '38 นาทีที่แล้ว',
  },
  {
    id: 'payment-success',
    icon: CheckCircleRoundedIcon,
    color: '#16A34A',
    bg: '#F0FDF4',
    title: 'ชำระเงินสำเร็จ',
    sub: '#ORD-2401 · ฿ 1,200',
    time: '1 ชั่วโมงที่แล้ว',
  },
  {
    id: 'new-order-2',
    icon: ShoppingCartRoundedIcon,
    color: '#EC4899',
    bg: '#FDF2F8',
    title: 'ออเดอร์ใหม่เข้ามา',
    sub: '#ORD-2399 · นามบัตร × 200',
    time: '2 ชั่วโมงที่แล้ว',
  },
];

export default function ActivityFeed() {
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
            🔔 กิจกรรมล่าสุด
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#9CA3AF', mt: 0.2, fontWeight: 500 }}>
            อัปเดตแบบเรียลไทม์
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Box sx={{ position: 'relative', width: 10, height: 10 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#10B981',
                position: 'absolute',
              }}
            />
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#10B981',
                position: 'absolute',
                opacity: 0.5,
                animation: 'pulse-ring 1.8s cubic-bezier(0.215,0.61,0.355,1) infinite',
              }}
            />
          </Box>
          <Typography sx={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>LIVE</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative' }}>
        {FEED.map((item, i) => {
          const Icon = item.icon;
          const isLast = i === FEED.length - 1;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Box sx={{ display: 'flex', gap: 1.5, pb: isLast ? 0 : 2, position: 'relative' }}>
                {!isLast && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 19,
                      top: 36,
                      width: 2,
                      bottom: 0,
                      background: 'linear-gradient(to bottom, rgba(108,77,255,0.14), transparent)',
                      borderRadius: '1px',
                    }}
                  />
                )}

                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '11px',
                    background: item.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  <Icon sx={{ fontSize: 18, color: item.color }} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0, pt: 0.3 }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1a1035', lineHeight: 1.3 }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: '#6B7280', mt: 0.2, lineHeight: 1.3 }}>
                    {item.sub}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: '#9CA3AF', mt: 0.3, fontWeight: 500 }}>
                    {item.time}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          );
        })}
      </Box>
    </Paper>
  );
}
