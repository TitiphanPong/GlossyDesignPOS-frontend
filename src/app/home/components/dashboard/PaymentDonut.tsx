'use client';

import { Box, Paper, Typography } from '@mui/material';
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { EmptyState } from '../dashboardUi';

type PaymentSlice = { name: string; value: number; color: string };

type PaymentDonutProps = {
  data: PaymentSlice[];
};

function CustomTooltip({ active, payload, total }: Readonly<{ active?: boolean; payload?: { name: string; value: number }[]; total: number }>) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <Box sx={{ background: 'rgba(26,16,53,0.92)', borderRadius: '10px', px: 1.8, py: 1, boxShadow: '0 8px 24px rgba(0,0,0,0.28)' }}>
      <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{item.name}</Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 800, color: 'white' }}>฿ {item.value.toLocaleString('th-TH')}</Typography>
      <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{total > 0 ? `${((item.value / total) * 100).toFixed(1)}%` : '-'}</Typography>
    </Box>
  );
}

export default function PaymentDonut({ data }: Readonly<PaymentDonutProps>) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

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
      <Typography variant="h6" fontWeight={800} sx={{ color: '#1a1035', mb: 0.5, letterSpacing: '-0.3px' }}>
        ช่องทางชำระเงิน
      </Typography>
      <Typography sx={{ fontSize: 12, color: '#9CA3AF', mb: 2, fontWeight: 500 }}>ยอดรวมวันนี้ ฿ {total.toLocaleString('th-TH')}</Typography>

      {data.length > 0 ? (
        <>
          <Box sx={{ position: 'relative', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value" isAnimationActive animationBegin={200} animationDuration={900}>
                  {data.map(item => (
                    <Cell key={item.name} fill={item.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip total={total} />} />
              </PieChart>
            </ResponsiveContainer>

            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <Typography sx={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500 }}>ยอดรวม</Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#1a1035', letterSpacing: '-0.5px' }}>฿ {total.toLocaleString('th-TH')}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 1.5 }}>
            {data.map(item => (
              <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '3px', background: item.color, flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 12.5, color: '#6B7280', fontWeight: 500 }}>{item.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1a1035' }}>฿ {item.value.toLocaleString('th-TH')}</Typography>
                  <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>({((item.value / total) * 100).toFixed(0)}%)</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </>
      ) : (
        <EmptyState compact title="ไม่มีข้อมูลการชำระเงินวันนี้" subtitle="เมื่อมีออเดอร์ที่รับชำระแล้ว ระบบจะแยกช่องทางชำระเงินให้อัตโนมัติ" eyebrow="No Payment Data" />
      )}
    </Paper>
  );
}
