'use client';

import { useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import CountUp from 'react-countup';

/* ── Mock data ── */
const MOCK: Record<string, { label: string; value: number }[]> = {
  '7d': [
    { label: 'จ',  value: 8200 },
    { label: 'อ',  value: 11500 },
    { label: 'พ',  value: 9800 },
    { label: 'พฤ', value: 14200 },
    { label: 'ศ',  value: 16800 },
    { label: 'ส',  value: 19200 },
    { label: 'อา', value: 12580 },
  ],
  '30d': Array.from({ length: 30 }, (_, i) => ({
    label: `${i + 1}`,
    value: Math.round(6000 + Math.sin(i * 0.6) * 3000 + Math.random() * 4000 + i * 200),
  })),
  '90d': Array.from({ length: 13 }, (_, i) => ({
    label: `สัปดาห์ ${i + 1}`,
    value: Math.round(40000 + Math.sin(i * 0.8) * 15000 + Math.random() * 20000 + i * 1500),
  })),
  '1y': [
    { label: 'ม.ค.', value: 68000 },
    { label: 'ก.พ.', value: 72000 },
    { label: 'มี.ค.', value: 85000 },
    { label: 'เม.ย.', value: 91000 },
    { label: 'พ.ค.', value: 88000 },
    { label: 'มิ.ย.', value: 95000 },
    { label: 'ก.ค.', value: 102000 },
    { label: 'ส.ค.', value: 98000 },
    { label: 'ก.ย.', value: 110000 },
    { label: 'ต.ค.', value: 105000 },
    { label: 'พ.ย.', value: 118000 },
    { label: 'ธ.ค.', value: 132000 },
  ],
};

type TabKey = '7d' | '30d' | '90d' | '1y';

const TABS: { key: TabKey; label: string }[] = [
  { key: '7d',  label: '7 วัน' },
  { key: '30d', label: '30 วัน' },
  { key: '90d', label: '90 วัน' },
  { key: '1y',  label: '1 ปี' },
];

function CustomTooltip({ active, payload, label }: Readonly<{ active?: boolean; payload?: { value: number }[]; label?: string }>) {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        background: 'rgba(26,16,53,0.92)',
        backdropFilter: 'blur(8px)',
        borderRadius: '12px',
        px: 2, py: 1.2,
        boxShadow: '0 8px 28px rgba(0,0,0,0.28)',
      }}
    >
      <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', mb: 0.3 }}>{label}</Typography>
      <Typography sx={{ fontSize: 15, fontWeight: 800, color: 'white' }}>
        ฿ {payload[0].value.toLocaleString('th-TH')}
      </Typography>
    </Box>
  );
}

function StatBadge({ label, value, prefix = '' }: Readonly<{ label: string; value: number; prefix?: string }>) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <Typography sx={{ fontSize: 11, color: '#9CA3AF', mb: 0.3, fontWeight: 500 }}>{label}</Typography>
      <Typography sx={{ fontSize: 17, fontWeight: 800, color: '#1a1035', letterSpacing: '-0.4px' }}>
        {prefix}
        <CountUp end={value} duration={1.4} separator="," />
      </Typography>
    </Box>
  );
}

export default function SalesChart() {
  const [tab, setTab] = useState<TabKey>('7d');
  const data = MOCK[tab];
  const total = data.reduce((s, d) => s + d.value, 0);
  const avg   = Math.round(total / data.length);

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
      {/* ── Header row ── */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#1a1035', letterSpacing: '-0.3px' }}>
            📈 กราฟยอดขายรายเดือน
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: '#9CA3AF', mt: 0.3, fontWeight: 500 }}>
            ข้อมูลยอดขายสะสม Glossy Design
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ display: 'flex', gap: 0.5, background: '#F3F4F6', borderRadius: '12px', p: 0.6 }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`chart-tab${tab === t.key ? ' active' : ''}`}
              style={{ fontFamily: 'inherit' }}
            >
              {t.label}
            </button>
          ))}
        </Box>
      </Box>

      {/* ── Mini stat badges ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
          mb: 2.5,
          background: 'linear-gradient(135deg, #F8F5FF, #F0EEFF)',
          borderRadius: '14px',
          p: 2,
        }}
      >
        <StatBadge label="รายได้รวม" value={total} prefix="฿ " />
        <Box sx={{ borderLeft: '1px solid rgba(108,77,255,0.12)', borderRight: '1px solid rgba(108,77,255,0.12)' }}>
          <StatBadge label="ค่าเฉลี่ยต่อวัน" value={avg} prefix="฿ " />
        </Box>
        <StatBadge label="ออเดอร์ทั้งหมด" value={data.length * 8} />
      </Box>

      {/* ── Area Chart ── */}
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6C4DFF" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#6C4DFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            interval={tab === '30d' ? 4 : 0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `฿${(v / 1000).toFixed(0)}k`}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6C4DFF', strokeWidth: 1.5, strokeDasharray: '5 4' }} />
          <Area
            key={tab}
            type="monotone"
            dataKey="value"
            stroke="#6C4DFF"
            strokeWidth={2.5}
            fill="url(#salesGrad)"
            dot={{ r: 0 }}
            activeDot={{ r: 5, fill: '#6C4DFF', stroke: 'white', strokeWidth: 2.5 }}
            isAnimationActive
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
}
