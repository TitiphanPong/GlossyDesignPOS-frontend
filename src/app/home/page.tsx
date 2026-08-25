'use client';

import * as React from 'react';
import { Alert, Box, Button, Card, CardActionArea, CardContent, Chip, Divider, LinearProgress, Skeleton, Stack, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import Link from 'next/link';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { isMissingApiBaseError } from '../../lib/api';
import { fetchDashboardSummary, type DashboardProduct, type DashboardSummary } from '../../lib/dashboard';
import { ORDER_STATUS_CONFIG } from '../../lib/order-status';
import AdminPageContainer from './components/AdminPageContainer';
import AdminHeroHeader, { formatAdminLastSynced, formatAdminThaiDate, heroOutlineButtonSx } from './components/AdminHeroHeader';

const cardSx = { border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: '0 8px 28px rgba(15,23,42,.05)', bgcolor: '#fff' };
const money = (value: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(value);
const integer = (value: number) => new Intl.NumberFormat('th-TH').format(value);
const dateTime = (value: string) => new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok' }).format(new Date(value));
const percentChange = (current: number, previous: number) => (previous > 0 ? ((current - previous) / previous) * 100 : null);

function SectionTitle({ title, action }: Readonly<{ title: string; action?: React.ReactNode }>) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
        {title}
      </Typography>
      {action}
    </Stack>
  );
}

function KpiCard({ label, value, helper, icon, color, href }: Readonly<{ label: string; value: string; helper: string; icon: React.ElementType; color: string; href: string }>) {
  const Icon = icon;
  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardActionArea component={Link} href={href} sx={{ height: '100%' }}>
        <CardContent sx={{ p: { xs: 1.6, md: 2.2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box>
              <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 700 }}>{label}</Typography>
              <Typography sx={{ mt: 0.65, color: '#0F172A', fontSize: { xs: 22, md: 28 }, lineHeight: 1.15, fontWeight: 900 }}>{value}</Typography>
            </Box>
            <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: `${color}14`, color, display: 'grid', placeItems: 'center' }}>
              <Icon fontSize="small" />
            </Box>
          </Stack>
          <Typography sx={{ mt: 1.2, color: '#64748B', fontSize: 12 }}>{helper}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function CashTransferKpiCard({ cash, transfer, href }: Readonly<{ cash: number; transfer: number; href: string }>) {
  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardActionArea component={Link} href={href} sx={{ height: '100%' }}>
        <CardContent sx={{ p: { xs: 1.6, md: 2.2 } }}>
          <Stack direction="row" spacing={1.4} divider={<Divider orientation="vertical" flexItem sx={{ borderColor: '#E2E8F0' }} />}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Box sx={{ width: 26, height: 26, borderRadius: 1.5, bgcolor: '#ECFDF5', color: '#059669', display: 'grid', placeItems: 'center' }}>
                  <PaidRoundedIcon sx={{ fontSize: 15 }} />
                </Box>
                <Typography sx={{ color: '#64748B', fontSize: 12 }}>เงินสด</Typography>
              </Stack>
              <Typography noWrap sx={{ mt: 0.5, color: '#0F172A', fontSize: { xs: 18, md: 22 }, lineHeight: 1.15, fontWeight: 900 }}>
                {money(cash)}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Box sx={{ width: 26, height: 26, borderRadius: 1.5, bgcolor: '#EFF6FF', color: '#2563EB', display: 'grid', placeItems: 'center' }}>
                  <AccountBalanceRoundedIcon sx={{ fontSize: 15 }} />
                </Box>
                <Typography sx={{ color: '#64748B', fontSize: 12 }}>โอน / PromptPay</Typography>
              </Stack>
              <Typography noWrap sx={{ mt: 0.5, color: '#0F172A', fontSize: { xs: 18, md: 22 }, lineHeight: 1.15, fontWeight: 900 }}>
                {money(transfer)}
              </Typography>
            </Box>
          </Stack>
          <Typography sx={{ mt: 1.2, color: '#64748B', fontSize: 12 }}>เงินที่รับเข้าจริงทุกประเภท</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function SalesTrend({ data, periodLabel }: Readonly<{ data: DashboardSummary['salesTrend']; periodLabel: string }>) {
  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <SectionTitle title="แนวโน้มยอดขาย" action={<Chip label={periodLabel} size="small" color="primary" variant="outlined" />} />
        <Box sx={{ height: 275 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C4DFF" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#6C4DFF" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(v: string) => v.slice(5)} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={value => money(Number(value))} labelFormatter={value => `วันที่ ${String(value)}`} contentStyle={{ borderRadius: 12, borderColor: '#E2E8F0' }} />
              <Area type="monotone" dataKey="revenue" name="ยอดขาย" stroke="#6C4DFF" strokeWidth={2.5} fill="url(#sales-fill)" />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
          {data.slice(-3).map(point => (
            <Typography key={point.date} sx={{ fontSize: 12, color: '#64748B' }}>
              {point.date.slice(5)} · {point.orders} ออเดอร์
            </Typography>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

type DashboardPeriod = 'today' | 'last7' | 'month' | 'custom';

type DateRangeCardProps = Readonly<{
  period: DashboardPeriod;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  summary: DashboardSummary;
  onPresetChange: (preset: Exclude<DashboardPeriod, 'custom'>) => void;
  onStartDateChange: (value: dayjs.Dayjs) => void;
  onEndDateChange: (value: dayjs.Dayjs) => void;
}>;

const DATE_RANGE_PRESETS: ReadonlyArray<{ value: Exclude<DashboardPeriod, 'custom'>; label: string }> = [
  { value: 'today', label: 'วันนี้' },
  { value: 'last7', label: 'ย้อนหลัง 7 วัน' },
  { value: 'month', label: 'เดือนนี้' },
];

const STATUS_BREAKDOWN_ROWS = ['pending', 'producing', 'awaiting_payment', 'ready_for_pickup', 'delivered'] as const;

function DateRangeCard({ period, startDate, endDate, summary, onPresetChange, onStartDateChange, onEndDateChange }: DateRangeCardProps) {
  const dateFieldSx = {
    '& .MuiOutlinedInput-root': {
      height: 44,
      borderRadius: 1.5,
      bgcolor: '#FFFFFF',
      '& fieldset': { borderColor: '#E2E8F0', borderWidth: 1 },
      '&:hover fieldset': { borderColor: '#94A3B8' },
      '&.Mui-focused fieldset': { borderColor: '#2563EB' },
    },
    '& .MuiInputBase-input': { fontSize: 13, py: 0 },
  };

  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Box sx={{ width: 34, height: 34, borderRadius: 1.5, display: 'grid', placeItems: 'center', bgcolor: '#EFF6FF', color: '#2563EB' }}>
            <CalendarMonthRoundedIcon sx={{ fontSize: 19 }} />
          </Box>
          <Typography sx={{ color: '#0F172A', fontWeight: 700, fontSize: 15 }}>ช่วงวันที่</Typography>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.5, p: 0.5, border: '1px solid #E2E8F0', borderRadius: 1.75, mb: 2 }}>
          {DATE_RANGE_PRESETS.map(item => (
            <Button
              key={item.value}
              variant="text"
              onClick={() => onPresetChange(item.value)}
              aria-pressed={period === item.value}
              sx={{
                minWidth: 0,
                minHeight: 38,
                px: 0.5,
                borderRadius: 1.25,
                textTransform: 'none',
                color: period === item.value ? '#1D4ED8' : '#64748B',
                bgcolor: period === item.value ? '#EFF6FF' : 'transparent',
                fontSize: 12.5,
                fontWeight: period === item.value ? 700 : 600,
                '&:hover': { bgcolor: '#F8FAFC' },
              }}>
              {item.label}
            </Button>
          ))}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) auto minmax(0, 1fr)' }, alignItems: 'end', gap: 0.75 }}>
          <DatePicker
            label="วันที่เริ่มต้น"
            value={startDate}
            maxDate={endDate}
            format="DD/MM/YYYY"
            onChange={value => value?.isValid() && onStartDateChange(value)}
            slotProps={{ textField: { size: 'small', fullWidth: true, sx: dateFieldSx } }}
          />
          <Typography sx={{ display: { xs: 'none', sm: 'block' }, pb: 1.6, color: '#94A3B8', fontSize: 18 }}>→</Typography>
          <DatePicker
            label="วันที่สิ้นสุด"
            value={endDate}
            minDate={startDate}
            maxDate={dayjs()}
            format="DD/MM/YYYY"
            onChange={value => value?.isValid() && onEndDateChange(value)}
            slotProps={{ textField: { size: 'small', fullWidth: true, sx: dateFieldSx } }}
          />
        </Box>
        {period === 'custom' ? <Typography sx={{ mt: 1, color: '#2563EB', fontSize: 12, fontWeight: 600 }}>กำหนดช่วงวันที่เอง</Typography> : null}
        <Divider sx={{ my: 2 }} />
        <Typography sx={{ mb: 1.2, color: '#94A3B8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>สถานะงานทั้งหมด</Typography>
        <Stack spacing={1.2}>
          {(() => {
            const max = Math.max(...STATUS_BREAKDOWN_ROWS.map(row => summary.orderStatus[row] ?? 0), 1);
            return STATUS_BREAKDOWN_ROWS.map(key => {
              const config = ORDER_STATUS_CONFIG[key];
              const count = summary.orderStatus[key] ?? 0;
              return (
                <Box component={Link} href={`/home/orders?status=${key}`} key={key} sx={{ textDecoration: 'none', color: 'inherit' }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.4 }}>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: '#334155' }}>{config.shortLabel}</Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: '#0F172A' }}>{count}</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(count / max) * 100}
                    sx={{ height: 5, borderRadius: 99, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: config.hex, borderRadius: 99 } }}
                  />
                </Box>
              );
            });
          })()}
        </Stack>
      </CardContent>
    </Card>
  );
}

function PaymentSummary({ summary }: Readonly<{ summary: DashboardSummary }>) {
  const p = summary.paymentSummary;
  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <SectionTitle title={`รายรับ ${summary.period.label}`} />
        <Typography sx={{ fontSize: 29, fontWeight: 900 }}>{money(p.received)}</Typography>
        <Stack direction="row" spacing={1.2} sx={{ mt: 2 }}>
          <Box sx={{ flex: 1, p: 1.4, bgcolor: '#F0FDF4', borderRadius: 2 }}>
            <Typography sx={{ fontSize: 12, color: '#64748B' }}>เงินสด</Typography>
            <Typography sx={{ fontWeight: 850 }}>{money(p.cash)}</Typography>
          </Box>
          <Box sx={{ flex: 1, p: 1.4, bgcolor: '#EFF6FF', borderRadius: 2 }}>
            <Typography sx={{ fontSize: 12, color: '#64748B' }}>โอน / PromptPay</Typography>
            <Typography sx={{ fontWeight: 850 }}>{money(p.transfer)}</Typography>
          </Box>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1}>
          {[
            ['ชำระเต็ม', p.fullPayment],
            ['เงินมัดจำ', p.deposits],
            ['รับยอดค้างเดิม', p.oldOutstandingPaid],
          ].map(([label, value]) => (
            <Stack key={String(label)} direction="row" justifyContent="space-between">
              <Typography sx={{ color: '#64748B', fontSize: 13 }}>{label}</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: 13 }}>{money(Number(value))}</Typography>
            </Stack>
          ))}
        </Stack>
        <Alert severity={Math.abs(p.cash + p.transfer - p.received) < 0.01 ? 'success' : 'warning'} sx={{ mt: 2, fontSize: 12 }}>
          {Math.abs(p.cash + p.transfer - p.received) < 0.01 ? 'ยอดตามช่องทางรับเงินตรงกับยอดรับจริง' : 'ยอดรับเงินจริงและช่องทางรับเงินไม่ตรงกัน'}
        </Alert>
      </CardContent>
    </Card>
  );
}

function TopProducts({ items, periodLabel }: Readonly<{ items: DashboardProduct[]; periodLabel: string }>) {
  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardContent sx={{ p: 2.2 }}>
        <SectionTitle title={`ขายดี ${periodLabel}`} />
        <Stack spacing={1.4}>
          {items.length ? (
            items.map((item, index) => (
              <Stack direction="row" spacing={1.2} alignItems="center" key={item.name}>
                <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: '#F1F5F9', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 12 }}>{index + 1}</Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography noWrap sx={{ fontWeight: 750, fontSize: 13 }}>
                    {item.name}
                  </Typography>
                  <Typography sx={{ color: '#64748B', fontSize: 12 }}>{integer(item.quantity)} รายการ</Typography>
                </Box>
                <Typography sx={{ fontWeight: 850, fontSize: 13 }}>{money(item.revenue)}</Typography>
              </Stack>
            ))
          ) : (
            <Typography sx={{ color: '#64748B', py: 3, textAlign: 'center' }}>ยังไม่มีรายการขายในช่วงนี้</Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function QuickSeller({ summary }: Readonly<{ summary: DashboardSummary }>) {
  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardContent sx={{ p: 2.2 }}>
        <SectionTitle title={`ขายด่วน ${summary.period.label}`} action={<PointOfSaleRoundedIcon color="primary" />} />
        <Stack direction="row" spacing={3}>
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: 12 }}>ออเดอร์</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 900 }}>{summary.quickSeller.orders}</Typography>
          </Box>
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: 12 }}>ยอดขาย</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 900 }}>{money(summary.quickSeller.revenue)}</Typography>
          </Box>
        </Stack>
        <Divider sx={{ my: 1.7 }} />
        <Stack spacing={0.8}>
          {summary.quickSeller.items.map(item => (
            <Stack key={item.name} direction="row" justifyContent="space-between">
              <Typography noWrap sx={{ maxWidth: '70%', fontSize: 13 }}>
                {item.name}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 800 }}>{item.quantity}</Typography>
            </Stack>
          ))}
          {summary.quickSeller.items.length === 0 && <Typography sx={{ color: '#64748B', fontSize: 13 }}>ยังไม่มีรายการขายด่วนในช่วงนี้</Typography>}
        </Stack>
      </CardContent>
    </Card>
  );
}

function UploadsCard({ summary }: Readonly<{ summary: DashboardSummary }>) {
  const u = summary.uploads;
  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardContent sx={{ p: 2.2 }}>
        <SectionTitle title="ไฟล์ลูกค้า" action={u.newFiles > 0 ? <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#EF4444' }} /> : null} />
        <Stack direction="row" spacing={2}>
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: 12 }}>ไฟล์ใหม่</Typography>
            <Typography sx={{ fontSize: 25, fontWeight: 900 }}>{u.newFiles}</Typography>
          </Box>
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: 12 }}>รอตรวจสอบ</Typography>
            <Typography sx={{ fontSize: 25, fontWeight: 900, color: '#D97706' }}>{u.waitingReview}</Typography>
          </Box>
        </Stack>
        <Button component={Link} href="/home/storage" fullWidth variant="outlined" sx={{ mt: 2 }}>
          จัดการไฟล์
        </Button>
        {!summary.capabilities.uploadOrderLink && <Typography sx={{ mt: 1.2, color: '#94A3B8', fontSize: 11 }}>ระบบยังไม่มี field ผูก Upload กับ Order</Typography>}
      </CardContent>
    </Card>
  );
}

function OutstandingCard({ summary }: Readonly<{ summary: DashboardSummary }>) {
  const a = summary.outstandingAging;
  const rows = [
    ['วันนี้', a.today],
    ['1–7 วัน', a.days1To7],
    ['8–30 วัน', a.days8To30],
    ['มากกว่า 30 วัน', a.over30Days],
  ] as const;
  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardContent sx={{ p: 2.2 }}>
        <SectionTitle
          title="ยอดค้างรับ"
          action={
            <Button component={Link} href="/home/orders?payment=unpaid" size="small">
              ดูออเดอร์
            </Button>
          }
        />
        <Typography sx={{ fontSize: 28, fontWeight: 900, color: '#DC2626' }}>{money(a.total)}</Typography>
        <Stack spacing={1.2} sx={{ mt: 2 }}>
          {rows.map(([label, value]) => (
            <Stack key={label} direction="row" justifyContent="space-between">
              <Typography sx={{ color: '#64748B', fontSize: 13 }}>{label}</Typography>
              <Typography sx={{ fontWeight: 850, fontSize: 13 }}>{money(value)}</Typography>
            </Stack>
          ))}
        </Stack>
        <Typography sx={{ mt: 1.6, color: '#94A3B8', fontSize: 11 }}>อายุยอดค้างคำนวณจากวันที่สร้างออเดอร์</Typography>
      </CardContent>
    </Card>
  );
}

function ActivityCard({ summary }: Readonly<{ summary: DashboardSummary }>) {
  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardContent sx={{ p: 2.2 }}>
        <SectionTitle title="ความเคลื่อนไหวล่าสุด" />
        <Stack divider={<Divider flexItem />}>
          {summary.recentActivity.length ? (
            summary.recentActivity.map(item => (
              <Stack direction="row" spacing={1.3} key={`${item.type}-${item.id}-${item.at}`} sx={{ py: 1.1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 2,
                    bgcolor: item.type === 'upload' ? '#ECFEFF' : '#F5F3FF',
                    color: item.type === 'upload' ? '#0891B2' : '#6C4DFF',
                    display: 'grid',
                    placeItems: 'center',
                  }}>
                  {item.type === 'upload' ? <CloudUploadRoundedIcon sx={{ fontSize: 17 }} /> : <ReceiptLongRoundedIcon sx={{ fontSize: 17 }} />}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography noWrap sx={{ fontWeight: 750, fontSize: 13 }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ color: '#64748B', fontSize: 12 }}>
                    {item.detail} · {dateTime(item.at)}
                  </Typography>
                </Box>
              </Stack>
            ))
          ) : (
            <Typography sx={{ color: '#64748B', py: 3, textAlign: 'center' }}>ยังไม่มีกิจกรรมล่าสุด</Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <AdminPageContainer>
      <Stack spacing={2.5}>
        <Skeleton variant="rounded" height={78} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 1.5 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={135} />
          ))}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2.5 }}>
          <Skeleton variant="rounded" height={350} />
          <Skeleton variant="rounded" height={350} />
        </Box>
      </Stack>
    </AdminPageContainer>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [period, setPeriod] = React.useState<DashboardPeriod>('today');
  const [month, setMonth] = React.useState(dayjs().format('YYYY-MM'));
  const [startDate, setStartDate] = React.useState(dayjs().subtract(6, 'day'));
  const [endDate, setEndDate] = React.useState(dayjs());
  const handlePresetChange = (value: Exclude<DashboardPeriod, 'custom'>) => {
    const today = dayjs();
    setPeriod(value);
    if (value === 'today') {
      setStartDate(today);
      setEndDate(today);
    } else if (value === 'last7') {
      setStartDate(today.subtract(6, 'day'));
      setEndDate(today);
    } else {
      setMonth(today.format('YYYY-MM'));
      setStartDate(today.startOf('month'));
      setEndDate(today.endOf('month'));
    }
  };
  const handleStartDateChange = (value: dayjs.Dayjs) => {
    setStartDate(value);
    setPeriod('custom');
  };
  const handleEndDateChange = (value: dayjs.Dayjs) => {
    setEndDate(value);
    setPeriod('custom');
  };
  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSummary(
        await fetchDashboardSummary({
          period,
          month: period === 'month' ? month : undefined,
          startDate: period === 'custom' ? startDate.format('YYYY-MM-DD') : undefined,
          endDate: period === 'custom' ? endDate.format('YYYY-MM-DD') : undefined,
        })
      );
    } catch (cause) {
      setError(isMissingApiBaseError(cause) ? 'ยังไม่ได้ตั้งค่า Backend API' : 'โหลดข้อมูล Dashboard ไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [endDate, month, period, startDate]);
  React.useEffect(() => {
    void load();
  }, [load]);
  if (!summary && loading) return <DashboardSkeleton />;
  if (!summary)
    return (
      <AdminPageContainer>
        <Alert severity="error" action={<Button onClick={() => void load()}>ลองใหม่</Button>}>
          {error}
        </Alert>
      </AdminPageContainer>
    );

  const salesDelta = percentChange(summary.periodSummary.sales, summary.periodSummary.previousSales);
  let comparisonLabel = 'ช่วงก่อนหน้า';
  if (period === 'month') comparisonLabel = 'เดือนก่อน';
  if (period === 'today') comparisonLabel = 'เมื่อวาน';
  const salesDeltaText = salesDelta === null ? `ยังไม่มีฐานเปรียบเทียบ${comparisonLabel}` : `${salesDelta >= 0 ? '+' : ''}${salesDelta.toFixed(1)}% จาก${comparisonLabel}`;
  const kpis = [
    {
      label: `ยอดขาย ${summary.period.label}`,
      value: money(summary.periodSummary.sales),
      helper: salesDeltaText,
      icon: TrendingUpRoundedIcon,
      color: '#6C4DFF',
      href: period === 'month' ? `/home/orders?month=${month}` : '/home/orders',
    },
    {
      label: `ออเดอร์ ${summary.period.label}`,
      value: integer(summary.periodSummary.orders),
      helper: `${summary.periodSummary.customers} ลูกค้า`,
      icon: ReceiptLongRoundedIcon,
      color: '#2563EB',
      href: period === 'month' ? `/home/orders?month=${month}` : '/home/orders',
    },
    { label: 'ไฟล์ใหม่', value: integer(summary.uploads.newFiles), helper: `${summary.uploads.waitingReview} อัปโหลดรอตรวจสอบ`, icon: CloudUploadRoundedIcon, color: '#0891B2', href: '/home/storage' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <AdminPageContainer>
        <AdminHeroHeader
          title="Dashboard"
          description="ภาพรวมการขาย เงินรับ งานค้าง และสถานะการดำเนินงานของร้าน"
          lastSynced={formatAdminLastSynced(new Date(summary.generatedAt))}
          thaiDate={formatAdminThaiDate(new Date(summary.generatedAt))}
          actions={
            <Button variant="outlined" startIcon={<RefreshRoundedIcon />} disabled={loading} onClick={() => void load()} sx={heroOutlineButtonSx}>
              {loading ? 'กำลังรีเฟรช...' : 'รีเฟรช'}
            </Button>
          }
        />
        {error && (
          <Alert severity="warning" sx={{ mb: 2 }} action={<Button onClick={() => void load()}>ลองใหม่</Button>}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5, mb: 2.5 }}>
          <KpiCard {...kpis[0]} />
          <CashTransferKpiCard cash={summary.paymentSummary.cash} transfer={summary.paymentSummary.transfer} href={period === 'month' ? `/home/orders?month=${month}` : '/home/orders'} />
          {kpis.slice(1).map(item => (
            <KpiCard key={item.label} {...item} />
          ))}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(300px, 1fr)' }, gap: 2.5, mb: 2.5 }}>
          <SalesTrend data={summary.salesTrend} periodLabel={period === 'today' ? '7 วัน' : summary.period.label} />
          <DateRangeCard
            period={period}
            startDate={startDate}
            endDate={endDate}
            summary={summary}
            onPresetChange={handlePresetChange}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
          />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 2.5, mb: 2.5 }}>
          <PaymentSummary summary={summary} />
          <TopProducts items={summary.topProducts} periodLabel={summary.period.label} />
          <QuickSeller summary={summary} />
          <UploadsCard summary={summary} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(0, 1.35fr)' }, gap: 2.5 }}>
          <OutstandingCard summary={summary} />
          <ActivityCard summary={summary} />
        </Box>
      </AdminPageContainer>
    </Box>
  );
}
