'use client';

import * as React from 'react';
import {
  Alert, Box, Button, Card, CardActionArea, CardContent, Chip, Divider, LinearProgress, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import LocalAtmRoundedIcon from '@mui/icons-material/LocalAtmRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import Link from 'next/link';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { isMissingApiBaseError } from '../../lib/api';
import { ORDER_STATUS_LABELS, type OrderStatus } from '../../lib/contracts';
import { fetchDashboardSummary, type DashboardProduct, type DashboardSummary } from '../../lib/dashboard';
import AdminPageContainer from './components/AdminPageContainer';
import AdminHeroHeader, { formatAdminLastSynced, formatAdminThaiDate, heroOutlineButtonSx } from './components/AdminHeroHeader';

const cardSx = { border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: '0 8px 28px rgba(15,23,42,.05)', bgcolor: '#fff' };
const money = (value: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 }).format(value);
const integer = (value: number) => new Intl.NumberFormat('th-TH').format(value);
const dateTime = (value: string) => new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Bangkok' }).format(new Date(value));
const percentChange = (current: number, previous: number) => previous > 0 ? ((current - previous) / previous) * 100 : null;

const statusMeta: Record<OrderStatus, { label: string; color: 'default' | 'warning' | 'info' | 'success' | 'error'; tone: string }> = {
  pending: { label: 'รอเริ่มงาน', color: 'warning', tone: '#F59E0B' },
  producing: { label: 'กำลังผลิต', color: 'info', tone: '#3B82F6' },
  awaiting_payment: { label: 'รอชำระเงิน', color: 'warning', tone: '#F97316' },
  ready_for_pickup: { label: 'พร้อมรับ', color: 'success', tone: '#10B981' },
  delivered: { label: 'ส่งมอบแล้ว', color: 'success', tone: '#059669' },
  cancelled: { label: 'ยกเลิก', color: 'error', tone: '#EF4444' },
  partial: { label: 'ชำระบางส่วน', color: 'warning', tone: '#F97316' },
  paid: { label: 'ชำระแล้ว', color: 'success', tone: '#10B981' },
};

function SectionTitle({ title, action }: Readonly<{ title: string; action?: React.ReactNode }>) {
  return <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}><Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>{title}</Typography>{action}</Stack>;
}

function KpiCard({ label, value, helper, icon, color, href }: Readonly<{ label: string; value: string; helper: string; icon: React.ElementType; color: string; href: string }>) {
  const Icon = icon;
  return <Card sx={{ ...cardSx, height: '100%' }}><CardActionArea component={Link} href={href} sx={{ height: '100%' }}><CardContent sx={{ p: { xs: 1.6, md: 2.2 } }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
      <Box><Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 700 }}>{label}</Typography><Typography sx={{ mt: .65, color: '#0F172A', fontSize: { xs: 22, md: 28 }, lineHeight: 1.15, fontWeight: 900 }}>{value}</Typography></Box>
      <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: `${color}14`, color, display: 'grid', placeItems: 'center' }}><Icon fontSize="small" /></Box>
    </Stack><Typography sx={{ mt: 1.2, color: '#64748B', fontSize: 12 }}>{helper}</Typography>
  </CardContent></CardActionArea></Card>;
}

function SalesTrend({ data, periodLabel }: Readonly<{ data: DashboardSummary['salesTrend']; periodLabel: string }>) {
  return <Card sx={{ ...cardSx, height: '100%' }}><CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
    <SectionTitle title="แนวโน้มยอดขาย" action={<Chip label={periodLabel} size="small" color="primary" variant="outlined" />} />
    <Box sx={{ height: 275 }}><ResponsiveContainer width="100%" height="100%"><AreaChart data={data} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
      <defs><linearGradient id="sales-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6C4DFF" stopOpacity={.28} /><stop offset="100%" stopColor="#6C4DFF" stopOpacity={.02} /></linearGradient></defs>
      <CartesianGrid stroke="#EEF2F7" vertical={false} /><XAxis dataKey="date" tickFormatter={(v: string) => v.slice(5)} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
      <YAxis tickFormatter={(v: number) => v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
      <Tooltip formatter={(value) => money(Number(value))} labelFormatter={(value) => `วันที่ ${String(value)}`} contentStyle={{ borderRadius: 12, borderColor: '#E2E8F0' }} />
      <Area type="monotone" dataKey="revenue" name="ยอดขาย" stroke="#6C4DFF" strokeWidth={2.5} fill="url(#sales-fill)" />
    </AreaChart></ResponsiveContainer></Box>
    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>{data.slice(-3).map((point) => <Typography key={point.date} sx={{ fontSize: 12, color: '#64748B' }}>{point.date.slice(5)} · {point.orders} ออเดอร์</Typography>)}</Stack>
  </CardContent></Card>;
}

function OrderStatusCard({ summary }: Readonly<{ summary: DashboardSummary }>) {
  const rows: OrderStatus[] = ['pending', 'producing', 'awaiting_payment', 'ready_for_pickup', 'delivered'];
  const max = Math.max(...rows.map((key) => summary.orderStatus[key] ?? 0), 1);
  return <Card sx={{ ...cardSx, height: '100%' }}><CardContent sx={{ p: { xs: 2, md: 2.5 } }}><SectionTitle title="สถานะงาน" />
    <Stack spacing={1.7}>{rows.map((key) => { const meta = statusMeta[key]; const count = summary.orderStatus[key] ?? 0; return <Box component={Link} href={`/home/orders?status=${key}`} key={key} sx={{ textDecoration: 'none', color: 'inherit' }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: .55 }}><Typography sx={{ fontSize: 13, fontWeight: 700 }}>{meta.label}</Typography><Typography sx={{ fontSize: 13, fontWeight: 900 }}>{count}</Typography></Stack>
      <LinearProgress variant="determinate" value={(count / max) * 100} sx={{ height: 6, borderRadius: 99, bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: meta.tone, borderRadius: 99 } }} />
    </Box>; })}</Stack>
    {!summary.capabilities.dueDates && <Alert severity="info" sx={{ mt: 2, fontSize: 12 }}>ยังไม่มีวันกำหนดส่งในข้อมูลออเดอร์ จึงยังไม่แสดงงานเลยกำหนด</Alert>}
  </CardContent></Card>;
}

function TasksCard({ summary }: Readonly<{ summary: DashboardSummary }>) {
  return <Card sx={cardSx}><CardContent sx={{ p: { xs: 2, md: 2.5 } }}><SectionTitle title="งานที่ต้องติดตาม" action={<Button component={Link} href="/home/orders" size="small" endIcon={<ArrowForwardRoundedIcon />}>ดูทั้งหมด</Button>} />
    {summary.tasks.length === 0 ? <Typography sx={{ color: '#64748B', py: 5, textAlign: 'center' }}>ยังไม่มีงานที่ต้องติดตาม</Typography> : <Stack divider={<Divider flexItem />}>
      {summary.tasks.map((task) => <Box component={Link} href={`/home/orders?order=${encodeURIComponent(task.id)}`} key={task.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr auto', md: '110px 1fr 1fr auto auto' }, gap: 1.2, alignItems: 'center', py: 1.4, color: 'inherit', textDecoration: 'none' }}>
        <Typography sx={{ fontWeight: 850, fontSize: 13 }}>#{task.orderNumber}</Typography><Typography sx={{ display: { xs: 'none', md: 'block' }, fontSize: 13 }}>{task.customerName}</Typography><Typography sx={{ display: { xs: 'none', md: 'block' }, color: '#475569', fontSize: 13 }}>{task.job}</Typography>
        <Chip label={statusMeta[task.status]?.label ?? ORDER_STATUS_LABELS[task.status]} color={statusMeta[task.status]?.color ?? 'default'} size="small" variant="outlined" />
        <Typography sx={{ gridColumn: { xs: '1 / -1', md: 'auto' }, textAlign: { md: 'right' }, color: task.remainingPayment > 0 ? '#DC2626' : '#64748B', fontSize: 13, fontWeight: 800 }}>{task.remainingPayment > 0 ? `ค้าง ${money(task.remainingPayment)}` : 'ชำระครบ'}</Typography>
      </Box>)}
    </Stack>}
  </CardContent></Card>;
}

function PaymentSummary({ summary }: Readonly<{ summary: DashboardSummary }>) {
  const p = summary.paymentSummary;
  return <Card sx={{ ...cardSx, height: '100%' }}><CardContent sx={{ p: { xs: 2, md: 2.5 } }}><SectionTitle title={`รายรับ ${summary.period.label}`} /><Typography sx={{ fontSize: 29, fontWeight: 900 }}>{money(p.received)}</Typography>
    <Stack direction="row" spacing={1.2} sx={{ mt: 2 }}><Box sx={{ flex: 1, p: 1.4, bgcolor: '#F0FDF4', borderRadius: 2 }}><Typography sx={{ fontSize: 12, color: '#64748B' }}>เงินสด</Typography><Typography sx={{ fontWeight: 850 }}>{money(p.cash)}</Typography></Box><Box sx={{ flex: 1, p: 1.4, bgcolor: '#EFF6FF', borderRadius: 2 }}><Typography sx={{ fontSize: 12, color: '#64748B' }}>โอน / PromptPay</Typography><Typography sx={{ fontWeight: 850 }}>{money(p.transfer)}</Typography></Box></Stack>
    <Divider sx={{ my: 2 }} /><Stack spacing={1}>{[['ชำระเต็ม', p.fullPayment], ['เงินมัดจำ', p.deposits], ['รับยอดค้างเดิม', p.oldOutstandingPaid]].map(([label, value]) => <Stack key={String(label)} direction="row" justifyContent="space-between"><Typography sx={{ color: '#64748B', fontSize: 13 }}>{label}</Typography><Typography sx={{ fontWeight: 800, fontSize: 13 }}>{money(Number(value))}</Typography></Stack>)}</Stack>
    <Alert severity={Math.abs(p.cash + p.transfer - p.received) < .01 ? 'success' : 'warning'} sx={{ mt: 2, fontSize: 12 }}>{Math.abs(p.cash + p.transfer - p.received) < .01 ? 'ยอดตามช่องทางรับเงินตรงกับยอดรับจริง' : 'ยอดรับเงินจริงและช่องทางรับเงินไม่ตรงกัน'}</Alert>
  </CardContent></Card>;
}

function TopProducts({ items, periodLabel }: Readonly<{ items: DashboardProduct[]; periodLabel: string }>) {
  return <Card sx={{ ...cardSx, height: '100%' }}><CardContent sx={{ p: 2.2 }}><SectionTitle title={`ขายดี ${periodLabel}`} /><Stack spacing={1.4}>{items.length ? items.map((item, index) => <Stack direction="row" spacing={1.2} alignItems="center" key={item.name}><Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: '#F1F5F9', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 12 }}>{index + 1}</Box><Box sx={{ minWidth: 0, flex: 1 }}><Typography noWrap sx={{ fontWeight: 750, fontSize: 13 }}>{item.name}</Typography><Typography sx={{ color: '#64748B', fontSize: 12 }}>{integer(item.quantity)} รายการ</Typography></Box><Typography sx={{ fontWeight: 850, fontSize: 13 }}>{money(item.revenue)}</Typography></Stack>) : <Typography sx={{ color: '#64748B', py: 3, textAlign: 'center' }}>ยังไม่มีรายการขายในช่วงนี้</Typography>}</Stack></CardContent></Card>;
}

function QuickSeller({ summary }: Readonly<{ summary: DashboardSummary }>) {
  return <Card sx={{ ...cardSx, height: '100%' }}><CardContent sx={{ p: 2.2 }}><SectionTitle title={`ขายด่วน ${summary.period.label}`} action={<PointOfSaleRoundedIcon color="primary" />} /><Stack direction="row" spacing={3}><Box><Typography sx={{ color: '#64748B', fontSize: 12 }}>ออเดอร์</Typography><Typography sx={{ fontSize: 24, fontWeight: 900 }}>{summary.quickSeller.orders}</Typography></Box><Box><Typography sx={{ color: '#64748B', fontSize: 12 }}>ยอดขาย</Typography><Typography sx={{ fontSize: 24, fontWeight: 900 }}>{money(summary.quickSeller.revenue)}</Typography></Box></Stack><Divider sx={{ my: 1.7 }} /><Stack spacing={.8}>{summary.quickSeller.items.map((item) => <Stack key={item.name} direction="row" justifyContent="space-between"><Typography noWrap sx={{ maxWidth: '70%', fontSize: 13 }}>{item.name}</Typography><Typography sx={{ fontSize: 13, fontWeight: 800 }}>{item.quantity}</Typography></Stack>)}{summary.quickSeller.items.length === 0 && <Typography sx={{ color: '#64748B', fontSize: 13 }}>ยังไม่มีรายการขายด่วนในช่วงนี้</Typography>}</Stack></CardContent></Card>;
}

function UploadsCard({ summary }: Readonly<{ summary: DashboardSummary }>) {
  const u = summary.uploads;
  return <Card sx={{ ...cardSx, height: '100%' }}><CardContent sx={{ p: 2.2 }}><SectionTitle title="ไฟล์ลูกค้า" action={u.newFiles > 0 ? <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#EF4444' }} /> : null} /><Stack direction="row" spacing={2}><Box><Typography sx={{ color: '#64748B', fontSize: 12 }}>ไฟล์ใหม่</Typography><Typography sx={{ fontSize: 25, fontWeight: 900 }}>{u.newFiles}</Typography></Box><Box><Typography sx={{ color: '#64748B', fontSize: 12 }}>รอตรวจสอบ</Typography><Typography sx={{ fontSize: 25, fontWeight: 900, color: '#D97706' }}>{u.waitingReview}</Typography></Box></Stack><Button component={Link} href="/home/storage" fullWidth variant="outlined" sx={{ mt: 2 }}>จัดการไฟล์</Button>{!summary.capabilities.uploadOrderLink && <Typography sx={{ mt: 1.2, color: '#94A3B8', fontSize: 11 }}>ระบบยังไม่มี field ผูก Upload กับ Order</Typography>}</CardContent></Card>;
}

function OutstandingCard({ summary }: Readonly<{ summary: DashboardSummary }>) {
  const a = summary.outstandingAging; const rows = [['วันนี้', a.today], ['1–7 วัน', a.days1To7], ['8–30 วัน', a.days8To30], ['มากกว่า 30 วัน', a.over30Days]] as const;
  return <Card sx={{ ...cardSx, height: '100%' }}><CardContent sx={{ p: 2.2 }}><SectionTitle title="ยอดค้างรับ" action={<Button component={Link} href="/home/orders?payment=unpaid" size="small">ดูออเดอร์</Button>} /><Typography sx={{ fontSize: 28, fontWeight: 900, color: '#DC2626' }}>{money(a.total)}</Typography><Stack spacing={1.2} sx={{ mt: 2 }}>{rows.map(([label, value]) => <Stack key={label} direction="row" justifyContent="space-between"><Typography sx={{ color: '#64748B', fontSize: 13 }}>{label}</Typography><Typography sx={{ fontWeight: 850, fontSize: 13 }}>{money(value)}</Typography></Stack>)}</Stack><Typography sx={{ mt: 1.6, color: '#94A3B8', fontSize: 11 }}>อายุยอดค้างคำนวณจากวันที่สร้างออเดอร์</Typography></CardContent></Card>;
}

function ActivityCard({ summary }: Readonly<{ summary: DashboardSummary }>) {
  return <Card sx={{ ...cardSx, height: '100%' }}><CardContent sx={{ p: 2.2 }}><SectionTitle title="ความเคลื่อนไหวล่าสุด" /><Stack divider={<Divider flexItem />}>{summary.recentActivity.length ? summary.recentActivity.map((item) => <Stack direction="row" spacing={1.3} key={`${item.type}-${item.id}-${item.at}`} sx={{ py: 1.1 }}><Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: item.type === 'upload' ? '#ECFEFF' : '#F5F3FF', color: item.type === 'upload' ? '#0891B2' : '#6C4DFF', display: 'grid', placeItems: 'center' }}>{item.type === 'upload' ? <CloudUploadRoundedIcon sx={{ fontSize: 17 }} /> : <ReceiptLongRoundedIcon sx={{ fontSize: 17 }} />}</Box><Box sx={{ minWidth: 0, flex: 1 }}><Typography noWrap sx={{ fontWeight: 750, fontSize: 13 }}>{item.title}</Typography><Typography sx={{ color: '#64748B', fontSize: 12 }}>{item.detail} · {dateTime(item.at)}</Typography></Box></Stack>) : <Typography sx={{ color: '#64748B', py: 3, textAlign: 'center' }}>ยังไม่มีกิจกรรมล่าสุด</Typography>}</Stack></CardContent></Card>;
}

function DashboardSkeleton() {
  return <AdminPageContainer><Stack spacing={2.5}><Skeleton variant="rounded" height={78} /><Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 1.5 }}>{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} variant="rounded" height={135} />)}</Box><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 2.5 }}><Skeleton variant="rounded" height={350} /><Skeleton variant="rounded" height={350} /></Box></Stack></AdminPageContainer>;
}

export default function DashboardPage() {
  const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [period, setPeriod] = React.useState<'today' | 'month'>('today');
  const [month, setMonth] = React.useState(dayjs().format('YYYY-MM'));
  const load = React.useCallback(async () => { setLoading(true); setError(null); try { setSummary(await fetchDashboardSummary({ period, month: period === 'month' ? month : undefined })); } catch (cause) { setError(isMissingApiBaseError(cause) ? 'ยังไม่ได้ตั้งค่า Backend API' : 'โหลดข้อมูล Dashboard ไม่สำเร็จ'); } finally { setLoading(false); } }, [month, period]);
  React.useEffect(() => { void load(); }, [load]);
  if (!summary && loading) return <DashboardSkeleton />;
  if (!summary) return <AdminPageContainer><Alert severity="error" action={<Button onClick={() => void load()}>ลองใหม่</Button>}>{error}</Alert></AdminPageContainer>;

  const salesDelta = percentChange(summary.periodSummary.sales, summary.periodSummary.previousSales);
  const comparisonLabel = period === 'month' ? 'เดือนก่อน' : 'เมื่อวาน';
  const kpis = [
    { label: `ยอดขาย ${summary.period.label}`, value: money(summary.periodSummary.sales), helper: salesDelta === null ? `ยังไม่มีฐานเปรียบเทียบ${comparisonLabel}` : `${salesDelta >= 0 ? '+' : ''}${salesDelta.toFixed(1)}% จาก${comparisonLabel}`, icon: TrendingUpRoundedIcon, color: '#6C4DFF', href: period === 'month' ? `/home/orders?month=${month}` : '/home/orders' },
    { label: `รับเงินจริง ${summary.period.label}`, value: money(summary.periodSummary.collections), helper: 'เงินที่รับเข้าจริงทุกประเภท', icon: PaidRoundedIcon, color: '#059669', href: period === 'month' ? `/home/orders?month=${month}` : '/home/orders' },
    { label: `ออเดอร์ ${summary.period.label}`, value: integer(summary.periodSummary.orders), helper: `${summary.periodSummary.customers} ลูกค้า`, icon: ReceiptLongRoundedIcon, color: '#2563EB', href: period === 'month' ? `/home/orders?month=${month}` : '/home/orders' },
    { label: 'ยอดค้างชำระ', value: money(summary.outstandingAging.total), helper: 'จากออเดอร์ที่ยังชำระไม่ครบ', icon: LocalAtmRoundedIcon, color: '#DC2626', href: '/home/orders?payment=unpaid' },
    { label: 'งานกำลังดำเนินการ', value: integer((summary.orderStatus.pending ?? 0) + (summary.orderStatus.producing ?? 0)), helper: `${summary.orderStatus.ready_for_pickup ?? 0} งานพร้อมรับ`, icon: AssignmentTurnedInRoundedIcon, color: '#D97706', href: '/home/orders?status=producing' },
    { label: 'ไฟล์ใหม่', value: integer(summary.uploads.newFiles), helper: `${summary.uploads.waitingReview} อัปโหลดรอตรวจสอบ`, icon: CloudUploadRoundedIcon, color: '#0891B2', href: '/home/storage' },
  ];

  return <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}><AdminPageContainer>
    <AdminHeroHeader title="Dashboard" description="ภาพรวมการขาย เงินรับ งานค้าง และสถานะการดำเนินงานของร้าน" lastSynced={formatAdminLastSynced(new Date(summary.generatedAt))} thaiDate={formatAdminThaiDate(new Date(summary.generatedAt))} actions={<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}><ToggleButtonGroup exclusive size="small" value={period} onChange={(_, value: 'today' | 'month' | null) => { if (value) setPeriod(value); }}><ToggleButton value="today">วันนี้</ToggleButton><ToggleButton value="month">รายเดือน</ToggleButton></ToggleButtonGroup>{period === 'month' ? <DatePicker label="เดือน" views={['year', 'month']} value={dayjs(`${month}-01`)} maxDate={dayjs()} onChange={value => { if (value?.isValid()) setMonth(value.format('YYYY-MM')); }} slotProps={{ textField: { size: 'small', sx: { width: 170 } } }} /> : null}<Button variant="outlined" startIcon={<RefreshRoundedIcon />} disabled={loading} onClick={() => void load()} sx={heroOutlineButtonSx}>{loading ? 'กำลังรีเฟรช...' : 'รีเฟรช'}</Button></Stack>} />
    {error && <Alert severity="warning" sx={{ mb: 2 }} action={<Button onClick={() => void load()}>ลองใหม่</Button>}>{error}</Alert>}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))' }, gap: 1.5, mb: 2.5 }}>{kpis.map((item) => <KpiCard key={item.label} {...item} />)}</Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(300px, 1fr)' }, gap: 2.5, mb: 2.5 }}><SalesTrend data={summary.salesTrend} periodLabel={period === 'month' ? summary.period.label : '7 วัน'} /><OrderStatusCard summary={summary} /></Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(300px, 1fr)' }, gap: 2.5, mb: 2.5 }}><TasksCard summary={summary} /><PaymentSummary summary={summary} /></Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 2.5, mb: 2.5 }}><TopProducts items={summary.topProducts} periodLabel={summary.period.label} /><QuickSeller summary={summary} /><UploadsCard summary={summary} /></Box>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(0, 1.35fr)' }, gap: 2.5 }}><OutstandingCard summary={summary} /><ActivityCard summary={summary} /></Box>
  </AdminPageContainer></Box>;
}
