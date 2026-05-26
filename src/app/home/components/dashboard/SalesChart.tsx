'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import CountUp from 'react-countup';
import dayjs, { type Dayjs } from 'dayjs';
import { EmptyState } from '../dashboardUi';
import type { ApiOrder } from '../../../../lib/contracts';

type SalesChartProps = {
  orders: ApiOrder[];
};

type ChartPoint = {
  label: string;
  value: number;
};

function getOrderAmount(order: ApiOrder): number {
  const value = order.grandTotal ?? order.total;
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function CustomTooltip({ active, payload, label }: Readonly<{ active?: boolean; payload?: { value: number }[]; label?: string }>) {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        background: 'rgba(26,16,53,0.92)',
        backdropFilter: 'blur(8px)',
        borderRadius: '12px',
        px: 2,
        py: 1.2,
        boxShadow: '0 8px 28px rgba(0,0,0,0.28)',
      }}>
      <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', mb: 0.3 }}>{label}</Typography>
      <Typography sx={{ fontSize: 15, fontWeight: 800, color: 'white' }}>฿ {payload[0].value.toLocaleString('th-TH')}</Typography>
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

export default function SalesChart({ orders }: Readonly<SalesChartProps>) {
  const today = useMemo(() => dayjs().startOf('day'), []);
  const [startDate, setStartDate] = useState<Dayjs | null>(() => dayjs().subtract(29, 'day').startOf('day'));
  const [endDate, setEndDate] = useState<Dayjs | null>(() => dayjs().startOf('day'));

  useEffect(() => {
    if (startDate && endDate && startDate.isAfter(endDate, 'day')) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  const chartData = useMemo(() => {
    if (!startDate || !endDate) {
      return [] as ChartPoint[];
    }

    const start = startDate.startOf('day');
    const end = endDate.endOf('day');
    if (!start.isValid() || !end.isValid() || start.isAfter(end)) {
      return [] as ChartPoint[];
    }

    const points: ChartPoint[] = [];
    let cursor = start;

    while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
      const dayStart = cursor.startOf('day');
      const dayEnd = cursor.endOf('day');

      const value = orders
        .filter(order => {
          const createdAt = dayjs(order.createdAt);
          return createdAt.isValid() && !createdAt.isBefore(dayStart) && !createdAt.isAfter(dayEnd);
        })
        .reduce((sum, order) => sum + getOrderAmount(order), 0);

      points.push({
        label: cursor.format('DD/MM'),
        value,
      });

      cursor = cursor.add(1, 'day');
    }

    return points;
  }, [orders, startDate, endDate]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const average = chartData.length > 0 ? Math.round(total / chartData.length) : 0;
  const hasData = chartData.some(item => item.value > 0);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: '#1a1035', letterSpacing: '-0.3px' }}>
              กราฟยอดขาย
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: '#9CA3AF', mt: 0.3, fontWeight: 500 }}>ข้อมูลยอดขายจริงจากออเดอร์ในระบบตามช่วงวันที่ที่เลือก</Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(168px, 1fr))' },
              gap: 1,
              minWidth: { xs: '100%', sm: 360 },
            }}>
            <DatePicker
              label="จากวันที่"
              value={startDate}
              format="DD/MM/YYYY"
              maxDate={endDate ?? today}
              onChange={value => setStartDate(value ? value.startOf('day') : null)}
              slotProps={{
                textField: {
                  size: 'small',
                  placeholder: 'วว/ดด/ปปปป',
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: '#F8FAFC',
                    },
                  },
                },
              }}
            />

            <DatePicker
              label="ถึงวันที่"
              value={endDate}
              format="DD/MM/YYYY"
              minDate={startDate ?? undefined}
              maxDate={today}
              onChange={value => setEndDate(value ? value.startOf('day') : null)}
              slotProps={{
                textField: {
                  size: 'small',
                  placeholder: 'วว/ดด/ปปปป',
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      bgcolor: '#F8FAFC',
                    },
                  },
                },
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            mb: 2.5,
            background: 'linear-gradient(135deg, #F8F5FF, #F0EEFF)',
            borderRadius: '14px',
            p: 2,
          }}>
          <StatBadge label="รายได้รวม" value={total} prefix="฿ " />
          <Box sx={{ borderLeft: '1px solid rgba(108,77,255,0.12)', borderRight: '1px solid rgba(108,77,255,0.12)' }}>
            <StatBadge label="ค่าเฉลี่ยต่อวัน" value={average} prefix="฿ " />
          </Box>
          <StatBadge label="จำนวนวัน" value={chartData.length} />
        </Box>

        {hasData ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C4DFF" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6C4DFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 500 }} axisLine={false} tickLine={false} interval={chartData.length > 20 ? Math.ceil(chartData.length / 8) : 0} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={value => `฿${(value / 1000).toFixed(0)}k`} width={52} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6C4DFF', strokeWidth: 1.5, strokeDasharray: '5 4' }} />
              <Area type="monotone" dataKey="value" stroke="#6C4DFF" strokeWidth={2.5} fill="url(#salesGrad)" dot={{ r: 0 }} activeDot={{ r: 5, fill: '#6C4DFF', stroke: 'white', strokeWidth: 2.5 }} isAnimationActive animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState compact title="ไม่มีข้อมูลยอดขายในช่วงวันที่นี้" subtitle="ลองเลือกช่วงวันที่อื่น หรือรอให้ออเดอร์จากระบบเข้ามาก่อน" eyebrow="No Sales Data" />
        )}
      </Paper>
    </LocalizationProvider>
  );
}
