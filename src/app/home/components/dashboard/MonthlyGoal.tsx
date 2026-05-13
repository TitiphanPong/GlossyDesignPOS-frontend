'use client';

import { Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const CURRENT = 82000;
const TARGET  = 100000;
const PCT     = Math.round((CURRENT / TARGET) * 100);
const REMAIN  = TARGET - CURRENT;

export default function MonthlyGoal() {
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
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #6C4DFF, #EC4899)',
          borderRadius: '20px 20px 0 0',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#1a1035', letterSpacing: '-0.3px' }}>
            🎯 เป้าหมายเดือนนี้
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#9CA3AF', mt: 0.3, fontWeight: 500 }}>
            พฤษภาคม 2568
          </Typography>
        </Box>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #6C4DFF15, #EC489915)',
            borderRadius: '12px',
            px: 1.5, py: 0.6,
          }}
        >
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#6C4DFF' }}>{PCT}%</Typography>
        </Box>
      </Box>

      {/* Amount display */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
          <Typography sx={{ fontSize: 26, fontWeight: 900, color: '#1a1035', letterSpacing: '-0.8px' }}>
            ฿ <CountUp end={CURRENT} duration={1.5} separator="," />
          </Typography>
          <Typography sx={{ fontSize: 14, color: '#9CA3AF', fontWeight: 500 }}>
            / ฿ {TARGET.toLocaleString()}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: 12, color: '#9CA3AF', mt: 0.3 }}>
          เหลืออีก ฿ {REMAIN.toLocaleString()} เพื่อบรรลุเป้า
        </Typography>
      </Box>

      {/* Progress bar */}
      <Box sx={{ height: 10, borderRadius: '99px', background: '#F3F4F6', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${PCT}%` }}
          transition={{ duration: 1.3, ease: 'easeOut', delay: 0.3 }}
          style={{
            height: '100%',
            borderRadius: '99px',
            background: 'linear-gradient(90deg, #6C4DFF, #EC4899)',
            boxShadow: '0 2px 10px rgba(108,77,255,0.4)',
            position: 'relative',
            overflow: 'visible',
          }}
        />
      </Box>

      {/* Milestone markers */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.8 }}>
        {[0, 25, 50, 75, 100].map((m) => (
          <Typography key={m} sx={{ fontSize: 10, color: m <= PCT ? '#6C4DFF' : '#D1D5DB', fontWeight: 600 }}>
            {m}%
          </Typography>
        ))}
      </Box>

      {/* Trend mini stats */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1.5,
          mt: 2.5,
          pt: 2,
          borderTop: '1px solid #F3F4F6',
        }}
      >
        {[
          { label: 'วันทำงาน', value: '18 วัน' },
          { label: 'เหลือ',    value: '13 วัน' },
          { label: 'ต่อวัน',   value: '฿ 4,556' },
          { label: 'จำเป็น',   value: '฿ 1,692' },
        ].map((s) => (
          <Box key={s.label}>
            <Typography sx={{ fontSize: 10.5, color: '#9CA3AF', fontWeight: 500 }}>{s.label}</Typography>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#374151' }}>{s.value}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
