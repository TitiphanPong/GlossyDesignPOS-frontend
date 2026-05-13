'use client';

import { Box, Typography, Paper } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const DATA = [
  { name: 'เงินสด',     value: 6200, color: '#6C4DFF' },
  { name: 'โอนเงิน',    value: 4100, color: '#3B82F6' },
  { name: 'QR Payment', value: 1800, color: '#10B981' },
];

const total = DATA.reduce((s, d) => s + d.value, 0);

function CustomTooltip({ active, payload }: Readonly<{ active?: boolean; payload?: { name: string; value: number }[] }>) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <Box
      sx={{
        background: 'rgba(26,16,53,0.92)',
        borderRadius: '10px',
        px: 1.8, py: 1,
        boxShadow: '0 8px 24px rgba(0,0,0,0.28)',
      }}
    >
      <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{d.name}</Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 800, color: 'white' }}>
        ฿ {d.value.toLocaleString('th-TH')}
      </Typography>
      <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
        {((d.value / total) * 100).toFixed(1)}%
      </Typography>
    </Box>
  );
}

function CustomLegend() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mt: 1.5 }}>
      {DATA.map((d) => (
        <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '3px', background: d.color, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 12.5, color: '#6B7280', fontWeight: 500 }}>{d.name}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1a1035' }}>
              ฿ {d.value.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#9CA3AF' }}>
              ({((d.value / total) * 100).toFixed(0)}%)
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export default function PaymentDonut() {
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
      <Typography variant="h6" fontWeight={800} sx={{ color: '#1a1035', mb: 0.5, letterSpacing: '-0.3px' }}>
        💳 ช่องทางชำระเงิน
      </Typography>
      <Typography sx={{ fontSize: 12, color: '#9CA3AF', mb: 2, fontWeight: 500 }}>
        ยอดรวมวันนี้ ฿ {total.toLocaleString()}
      </Typography>

      {/* Donut chart */}
      <Box sx={{ position: 'relative', height: 180 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={DATA}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
              dataKey="value"
              isAnimationActive
              animationBegin={200}
              animationDuration={900}
            >
              {DATA.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography sx={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500 }}>ยอดรวม</Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#1a1035', letterSpacing: '-0.5px' }}>
            ฿ {(total / 1000).toFixed(1)}k
          </Typography>
        </Box>
      </Box>

      <CustomLegend />
    </Paper>
  );
}
