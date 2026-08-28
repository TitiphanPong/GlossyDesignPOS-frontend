'use client';

import * as React from 'react';
import { Alert, Box, Button, Card, CardActionArea, CardContent, Chip, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import PrecisionManufacturingRoundedIcon from '@mui/icons-material/PrecisionManufacturingRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import Link from 'next/link';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { isMissingApiBaseError } from '../../lib/api';
import { buildDashboardOrdersHref, fetchDashboardSummary, type DashboardProduct, type DashboardSummary } from '../../lib/dashboard';
import AdminPageContainer from './components/AdminPageContainer';
import AdminHeroHeader, { formatAdminLastSynced, formatAdminThaiDate, heroOutlineButtonSx } from './components/AdminHeroHeader';

const cardSx = { border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: '0 8px 28px rgba(15,23,42,.05)', bgcolor: '#fff' };
const money = (value: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
const integer = (value: number) => new Intl.NumberFormat('th-TH').format(value);
const percentChange = (current: number, previous: number) => (previous > 0 ? ((current - previous) / previous) * 100 : null);
type DashboardPeriod = DashboardSummary['period']['mode'];

function SectionTitle({ title, helper, action }: Readonly<{ title: string; helper?: string; action?: React.ReactNode }>) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
          {title}
        </Typography>
        {helper ? <Typography sx={{ mt: 0.25, color: '#64748B', fontSize: 13 }}>{helper}</Typography> : null}
      </Box>
      {action}
    </Stack>
  );
}

type MetricCardProps = Readonly<{ label: string; value: string; helper: string; icon: React.ElementType; color: string; href: string }>;

function ActionCard({ label, value, helper, icon, color, href }: MetricCardProps) {
  const Icon = icon;
  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardActionArea component={Link} href={href} sx={{ height: '100%' }}>
        <CardContent sx={{ p: { xs: 1.75, md: 2 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: `${color}14`, color, display: 'grid', placeItems: 'center' }}>
              <Icon sx={{ fontSize: 20 }} />
            </Box>
            <Typography sx={{ color: '#0F172A', fontSize: { xs: 24, md: 27 }, fontWeight: 900, lineHeight: 1.1 }}>{value}</Typography>
          </Stack>
          <Typography sx={{ mt: 1.25, color: '#334155', fontSize: 13.5, fontWeight: 750 }}>{label}</Typography>
          <Typography sx={{ mt: 0.35, color: '#64748B', fontSize: 11.5 }}>{helper}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function KpiCard({ label, value, helper, icon, color, href }: MetricCardProps) {
  const Icon = icon;
  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardActionArea component={Link} href={href} sx={{ height: '100%' }}>
        <CardContent sx={{ p: { xs: 1.6, md: 2.2 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 700 }}>{label}</Typography>
              <Typography sx={{ mt: 0.65, color: '#0F172A', fontSize: { xs: 21, md: 27 }, lineHeight: 1.15, fontWeight: 900 }}>{value}</Typography>
            </Box>
            <Box sx={{ flex: '0 0 auto', width: 40, height: 40, borderRadius: 2.5, bgcolor: `${color}14`, color, display: 'grid', placeItems: 'center' }}>
              <Icon fontSize="small" />
            </Box>
          </Stack>
          <Typography sx={{ mt: 1.2, color: '#64748B', fontSize: 12 }}>{helper}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

const DATE_RANGE_PRESETS: ReadonlyArray<{ value: Exclude<DashboardPeriod, 'custom'>; label: string }> = [
  { value: 'today', label: 'วันนี้' },
  { value: 'last7', label: 'ย้อนหลัง 7 วัน' },
  { value: 'month', label: 'เดือนนี้' },
];

function PeriodFilterCard({
  period,
  startDate,
  endDate,
  onPresetChange,
  onStartDateChange,
  onEndDateChange,
}: Readonly<{
  period: DashboardPeriod;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  onPresetChange: (preset: Exclude<DashboardPeriod, 'custom'>) => void;
  onStartDateChange: (value: dayjs.Dayjs) => void;
  onEndDateChange: (value: dayjs.Dayjs) => void;
}>) {
  const dateFieldSx = { '& .MuiOutlinedInput-root': { height: 44, borderRadius: 1.5, bgcolor: '#FFFFFF' }, '& .MuiInputBase-input': { fontSize: 13, py: 0 } };
  return (
    <Card sx={{ ...cardSx, mb: 2.5 }}>
      <CardContent sx={{ p: { xs: 1.75, md: 2.25 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'auto minmax(360px, 1fr) minmax(360px, 1fr)' }, alignItems: 'center', gap: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1.75, display: 'grid', placeItems: 'center', bgcolor: '#EFF6FF', color: '#2563EB' }}>
              <CalendarMonthRoundedIcon sx={{ fontSize: 19 }} />
            </Box>
            <Box>
              <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: 14 }}>ช่วงรายงาน</Typography>
              <Typography sx={{ color: '#64748B', fontSize: 11.5 }}>มีผลเฉพาะข้อมูลสรุปด้านล่าง</Typography>
            </Box>
          </Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.5, p: 0.5, border: '1px solid #E2E8F0', borderRadius: 1.75 }}>
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
                  color: period === item.value ? '#1D4ED8' : '#64748B',
                  bgcolor: period === item.value ? '#EFF6FF' : 'transparent',
                  fontSize: 12.5,
                  fontWeight: period === item.value ? 700 : 600,
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
            <Typography sx={{ display: { xs: 'none', sm: 'block' }, pb: 1.35, color: '#94A3B8' }}>→</Typography>
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
        </Box>
      </CardContent>
    </Card>
  );
}

function SalesTrend({ data, periodLabel }: Readonly<{ data: DashboardSummary['salesTrend']; periodLabel: string }>) {
  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <SectionTitle title="แนวโน้มยอดขาย" action={<Chip label={periodLabel} size="small" color="primary" variant="outlined" />} />
        <Box sx={{ height: { xs: 245, md: 290 } }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6C4DFF" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#6C4DFF" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(value: string) => value.slice(5)} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(value: number) => (value >= 1000 ? `${Math.round(value / 1000)}k` : String(value))} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={value => money(Number(value))} labelFormatter={value => `วันที่ ${String(value)}`} contentStyle={{ borderRadius: 12, borderColor: '#E2E8F0' }} />
              <Area type="monotone" dataKey="revenue" name="ยอดขาย" stroke="#6C4DFF" strokeWidth={2.5} fill="url(#sales-fill)" />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

function PaymentSummary({ summary }: Readonly<{ summary: DashboardSummary }>) {
  const payment = summary.paymentSummary;
  const mismatch = Math.abs(payment.cash + payment.transfer - payment.received) >= 0.01;
  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <SectionTitle title={`รายรับ ${summary.period.label}`} />
        <Typography sx={{ fontSize: 29, fontWeight: 900 }}>{money(payment.received)}</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ mt: 2 }}>
          <Box sx={{ flex: 1, p: 1.4, bgcolor: '#F0FDF4', borderRadius: 2 }}>
            <Typography sx={{ fontSize: 12, color: '#64748B' }}>เงินสด</Typography>
            <Typography sx={{ fontWeight: 850 }}>{money(payment.cash)}</Typography>
          </Box>
          <Box sx={{ flex: 1, p: 1.4, bgcolor: '#EFF6FF', borderRadius: 2 }}>
            <Typography sx={{ fontSize: 12, color: '#64748B' }}>PromptPay</Typography>
            <Typography sx={{ fontWeight: 850 }}>{money(payment.transfer)}</Typography>
          </Box>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1}>
          {(
            [
              ['ชำระเต็ม', payment.fullPayment],
              ['เงินมัดจำ', payment.deposits],
              ['รับยอดค้างเดิม', payment.oldOutstandingPaid],
            ] as const
          ).map(([label, value]) => (
            <Stack key={label} direction="row" justifyContent="space-between" spacing={1}>
              <Typography sx={{ color: '#64748B', fontSize: 13 }}>{label}</Typography>
              <Typography sx={{ fontWeight: 800, fontSize: 13 }}>{money(value)}</Typography>
            </Stack>
          ))}
        </Stack>
        {mismatch ? (
          <Alert severity="warning" sx={{ mt: 2, fontSize: 12 }}>
            ยอดรวมตามช่องทางรับเงินไม่ตรงกับยอดรับจริง กรุณาตรวจสอบรายการชำระเงิน
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}

function TopProducts({ items, periodLabel }: Readonly<{ items: DashboardProduct[]; periodLabel: string }>) {
  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <SectionTitle title="สินค้าขายดี" action={<Typography sx={{ color: '#64748B', fontSize: 12 }}>{periodLabel}</Typography>} />
        <Stack divider={<Divider flexItem />}>
          {items.length ? (
            items.slice(0, 5).map((item, index) => (
              <Stack key={`${item.name}-${index}`} direction="row" alignItems="center" spacing={1.2} sx={{ py: 1.1 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1.5,
                    bgcolor: index === 0 ? '#FEF3C7' : '#F1F5F9',
                    color: '#475569',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 12,
                    fontWeight: 900,
                  }}>
                  {index + 1}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography noWrap sx={{ fontWeight: 750, fontSize: 13 }}>
                    {item.name}
                  </Typography>
                  <Typography sx={{ color: '#64748B', fontSize: 11.5 }}>{integer(item.quantity)} ชิ้น</Typography>
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: 12.5 }}>{money(item.revenue)}</Typography>
              </Stack>
            ))
          ) : (
            <Typography sx={{ color: '#64748B', py: 4, textAlign: 'center' }}>ยังไม่มีข้อมูลสินค้าในช่วงนี้</Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function QuickSeller({ summary }: Readonly<{ summary: DashboardSummary }>) {
  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <SectionTitle title="ขายด่วน" />
        <Stack direction="row" spacing={3} sx={{ mb: 1.5 }}>
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: 12 }}>ออเดอร์</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 900 }}>{integer(summary.quickSeller.orders)}</Typography>
          </Box>
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: 12 }}>ยอดขาย</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 900 }}>{money(summary.quickSeller.revenue)}</Typography>
          </Box>
        </Stack>
        <Divider sx={{ mb: 1 }} />
        <Stack divider={<Divider flexItem />}>
          {summary.quickSeller.items.length ? (
            summary.quickSeller.items.slice(0, 4).map(item => (
              <Stack key={item.name} direction="row" justifyContent="space-between" spacing={1} sx={{ py: 1 }}>
                <Typography noWrap sx={{ fontSize: 13, fontWeight: 700, minWidth: 0 }}>
                  {item.name}
                </Typography>
                <Typography sx={{ color: '#64748B', fontSize: 12, flex: '0 0 auto' }}>{integer(item.quantity)} ชิ้น</Typography>
              </Stack>
            ))
          ) : (
            <Typography sx={{ color: '#64748B', py: 3, textAlign: 'center' }}>ยังไม่มีรายการขายด่วน</Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function OutstandingCard({ summary }: Readonly<{ summary: DashboardSummary }>) {
  const aging = summary.outstandingAging;
  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardActionArea component={Link} href="/home/orders?payment=unpaid" sx={{ height: '100%' }}>
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <SectionTitle title="รายละเอียดยอดค้างทั้งหมด" helper="ยอดค้างเป็นข้อมูลปัจจุบัน ไม่เปลี่ยนตามช่วงรายงาน" />
          <Typography sx={{ fontSize: 29, fontWeight: 900, color: '#C2410C' }}>{money(aging.total)}</Typography>
          <Stack spacing={1.1} sx={{ mt: 2 }}>
            {(
              [
                ['วันนี้', aging.today],
                ['1–7 วัน', aging.days1To7],
                ['8–30 วัน', aging.days8To30],
                ['มากกว่า 30 วัน', aging.over30Days],
              ] as const
            ).map(([label, value]) => (
              <Stack key={label} direction="row" justifyContent="space-between">
                <Typography sx={{ color: '#64748B', fontSize: 13 }}>{label}</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: 13 }}>{money(value)}</Typography>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <AdminPageContainer>
      <Stack spacing={2.5}>
        <Skeleton variant="rounded" height={160} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(6, 1fr)' }, gap: 1.5 }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={145} />
          ))}
        </Box>
        <Skeleton variant="rounded" height={100} />
        <Skeleton variant="rounded" height={360} />
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
  const [startDate, setStartDate] = React.useState(dayjs());
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
      setEndDate(today);
    }
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

  const operations = summary.operations;
  const salesDelta = percentChange(summary.periodSummary.sales, summary.periodSummary.previousSales);
  const comparisonLabel = period === 'month' ? 'เดือนก่อน' : period === 'today' ? 'เมื่อวาน' : 'ช่วงก่อนหน้า';
  const salesDeltaText = salesDelta === null ? `ยังไม่มีฐานเปรียบเทียบ${comparisonLabel}` : `${salesDelta >= 0 ? '+' : ''}${salesDelta.toFixed(1)}% จาก${comparisonLabel}`;
  const periodOrdersHref = buildDashboardOrdersHref({ period, month, startDate: startDate.format('YYYY-MM-DD'), endDate: endDate.format('YYYY-MM-DD') });
  const actionCards: MetricCardProps[] = [
    {
      label: 'รอเริ่มงาน',
      value: integer(operations.workflow.pending),
      helper: operations.unclassifiedWorkflow > 0 ? `${integer(operations.unclassifiedWorkflow)} รายการยังไม่ระบุขั้นตอน` : 'เปิดรายการที่ต้องเริ่มทำ',
      icon: ScheduleRoundedIcon,
      color: '#D97706',
      href: '/home/orders?workflowStatus=pending',
    },
    {
      label: 'กำลังผลิต',
      value: integer(operations.workflow.producing),
      helper: 'ติดตามงานที่กำลังทำ',
      icon: PrecisionManufacturingRoundedIcon,
      color: '#2563EB',
      href: '/home/orders?workflowStatus=producing',
    },
    {
      label: 'พร้อมรับงาน',
      value: integer(operations.workflow.ready_for_pickup),
      helper: 'แจ้งลูกค้าและส่งมอบ',
      icon: TaskAltRoundedIcon,
      color: '#059669',
      href: '/home/orders?workflowStatus=ready_for_pickup',
    },
    {
      label: 'ยอดค้างชำระ',
      value: money(operations.outstanding.amount),
      helper: `${integer(operations.outstanding.orders)} ออเดอร์`,
      icon: PaidRoundedIcon,
      color: '#C2410C',
      href: '/home/orders?payment=unpaid',
    },
    {
      label: 'ไฟล์รอตรวจ',
      value: integer(operations.filesWaiting),
      helper: `${integer(summary.uploads.newFiles)} ไฟล์ใหม่วันนี้`,
      icon: CloudUploadRoundedIcon,
      color: '#0891B2',
      href: '/home/storage',
    },
    { label: 'สต็อกต่ำ', value: integer(operations.lowStock), helper: 'ตรวจสอบรายการที่ต้องเติม', icon: Inventory2RoundedIcon, color: '#7C3AED', href: '/home/stock' },
  ];
  const periodKpis: Omit<MetricCardProps, 'href'>[] = [
    { label: `ยอดขาย ${summary.period.label}`, value: money(summary.periodSummary.sales), helper: salesDeltaText, icon: TrendingUpRoundedIcon, color: '#6C4DFF' },
    { label: `รับเงินจริง ${summary.period.label}`, value: money(summary.periodSummary.collections), helper: 'รวมเงินสดและ PromptPay', icon: PaidRoundedIcon, color: '#059669' },
    { label: `ออเดอร์ ${summary.period.label}`, value: integer(summary.periodSummary.orders), helper: 'ไม่รวมยอดขายของรายการยกเลิก', icon: ReceiptLongRoundedIcon, color: '#2563EB' },
    { label: `ลูกค้า ${summary.period.label}`, value: integer(summary.periodSummary.customers), helper: 'จำนวนลูกค้าที่มีรายการขาย', icon: GroupsRoundedIcon, color: '#0891B2' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <AdminPageContainer>
        <AdminHeroHeader
          title="Dashboard"
          description="ดูงานที่ต้องจัดการตอนนี้ และภาพรวมยอดขายตามช่วงเวลาที่เลือก"
          lastSynced={formatAdminLastSynced(new Date(summary.generatedAt))}
          thaiDate={formatAdminThaiDate(new Date(summary.generatedAt))}
          actions={
            <Button variant="outlined" startIcon={<RefreshRoundedIcon />} disabled={loading} onClick={() => void load()} sx={heroOutlineButtonSx}>
              {loading ? 'กำลังรีเฟรช...' : 'รีเฟรช'}
            </Button>
          }
        />
        {error ? (
          <Alert severity="warning" sx={{ mb: 2 }} action={<Button onClick={() => void load()}>ลองใหม่</Button>}>
            {error}
          </Alert>
        ) : null}
        <SectionTitle title="สิ่งที่ต้องทำตอนนี้" helper="ข้อมูลปัจจุบันของร้าน ไม่เปลี่ยนตามช่วงรายงาน" />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))' }, gap: 1.5, mb: 3 }}>
          {actionCards.map(item => (
            <ActionCard key={item.label} {...item} />
          ))}
        </Box>
        {operations.unclassifiedWorkflow > 0 ? (
          <Alert severity="warning" sx={{ mt: -1.5, mb: 3 }}>
            มี {integer(operations.unclassifiedWorkflow)} ออเดอร์จากข้อมูลเดิมที่ยังไม่ระบุขั้นตอนงาน ระบบจึงรวมไว้ใน “รอเริ่มงาน” เพื่อไม่ให้รายการตกหล่น
          </Alert>
        ) : null}
        <PeriodFilterCard
          period={period}
          startDate={startDate}
          endDate={endDate}
          onPresetChange={handlePresetChange}
          onStartDateChange={value => {
            setStartDate(value);
            setPeriod('custom');
          }}
          onEndDateChange={value => {
            setEndDate(value);
            setPeriod('custom');
          }}
        />
        <SectionTitle title={`ภาพรวม ${summary.period.label}`} helper="รายการยกเลิกไม่ถูกนำมาคิดยอดขายและรายรับ" />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5, mb: 2.5 }}>
          {periodKpis.map(item => (
            <KpiCard key={item.label} {...item} href={periodOrdersHref} />
          ))}
        </Box>
        <Box sx={{ mb: 2.5 }}>
          <SalesTrend data={summary.salesTrend} periodLabel={period === 'today' ? '7 วันล่าสุด' : summary.period.label} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 2.5, mb: 2.5 }}>
          <PaymentSummary summary={summary} />
          <TopProducts items={summary.topProducts} periodLabel={summary.period.label} />
          <QuickSeller summary={summary} />
        </Box>
        <Box sx={{ maxWidth: { lg: '50%' } }}>
          <OutstandingCard summary={summary} />
        </Box>
      </AdminPageContainer>
    </Box>
  );
}
