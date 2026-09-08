'use client';

import * as React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Card, CardContent, Chip, Divider, Skeleton, Stack, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import Link from 'next/link';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { isMissingApiBaseError } from '../../lib/api';
import { buildDashboardOrdersHref, buildDashboardProductionHref, fetchDashboardSummary, type DashboardProduct, type DashboardSummary } from '../../lib/dashboard';
import AdminPageContainer from './components/AdminPageContainer';
import AdminHeroHeader, { heroUtilityButtonSx } from './components/AdminHeroHeader';

const cardSx = { border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: '0 8px 28px rgba(15,23,42,.05)', bgcolor: '#fff' };
const money = (value: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
const integer = (value: number) => new Intl.NumberFormat('th-TH').format(value);
const percentChange = (current: number, previous: number) => (previous > 0 ? ((current - previous) / previous) * 100 : null);
type DashboardPeriod = DashboardSummary['period']['mode'];

function SectionTitle({ title, helper, action }: Readonly<{ title: string; helper?: string; action?: React.ReactNode }>) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={1} sx={{ mb: 2 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F172A' }}>
          {title}
        </Typography>
        {helper ? <Typography sx={{ mt: 0.25, color: '#64748B', fontSize: 13 }}>{helper}</Typography> : null}
      </Box>
      {action}
    </Stack>
  );
}

type MetricCardProps = Readonly<{
  label: string;
  value: string;
  helper: string;
  icon: React.ElementType;
  color: string;
  action?: React.ReactNode;
}>;

function MetricCard({ label, value, helper, icon, color, action }: MetricCardProps) {
  const Icon = icon;
  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardContent sx={{ p: { xs: 1.75, md: 2.2 } }}>
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
        {action ? <Box sx={{ mt: 0.5 }}>{action}</Box> : null}
      </CardContent>
    </Card>
  );
}

const DATE_RANGE_PRESETS: ReadonlyArray<{ value: Exclude<DashboardPeriod, 'custom'>; label: string }> = [
  { value: 'today', label: 'วันนี้' },
  { value: 'last7', label: '7 วัน' },
  { value: 'month', label: 'เดือนนี้' },
];

function PeriodFilterCard({
  period,
  startDate,
  endDate,
  onPresetChange,
  onCustomClick,
  onStartDateChange,
  onEndDateChange,
}: Readonly<{
  period: DashboardPeriod;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  onPresetChange: (preset: Exclude<DashboardPeriod, 'custom'>) => void;
  onCustomClick: () => void;
  onStartDateChange: (value: dayjs.Dayjs) => void;
  onEndDateChange: (value: dayjs.Dayjs) => void;
}>) {
  const dateFieldSx = { '& .MuiOutlinedInput-root': { height: 44, borderRadius: 1.5, bgcolor: '#FFFFFF' }, '& .MuiInputBase-input': { fontSize: 13, py: 0 } };
  return (
    <Card sx={{ ...cardSx, mb: 2.5 }}>
      <CardContent sx={{ p: { xs: 1.75, md: 2.25 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: period === 'custom' ? 'auto minmax(360px, 1fr) minmax(360px, 1fr)' : 'auto minmax(360px, 1fr)' }, alignItems: 'center', gap: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1.75, display: 'grid', placeItems: 'center', bgcolor: '#EFF6FF', color: '#2563EB' }}>
              <CalendarMonthRoundedIcon sx={{ fontSize: 19 }} />
            </Box>
            <Box>
              <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: 14 }}>ช่วงรายงาน</Typography>
              <Typography sx={{ color: '#64748B', fontSize: 11.5 }}>มีผลกับยอดขาย รายรับ และออเดอร์</Typography>
            </Box>
          </Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' }, gap: 0.5, p: 0.5, border: '1px solid #E2E8F0', borderRadius: 1.75 }}>
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
            <Button
              variant="text"
              onClick={onCustomClick}
              aria-pressed={period === 'custom'}
              sx={{ minWidth: 0, minHeight: 38, px: 0.5, borderRadius: 1.25, color: period === 'custom' ? '#1D4ED8' : '#64748B', bgcolor: period === 'custom' ? '#EFF6FF' : 'transparent', fontSize: 12.5, fontWeight: period === 'custom' ? 700 : 600 }}>
              กำหนดช่วงเวลา
            </Button>
          </Box>
          {period === 'custom' ? (
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
          ) : null}
        </Box>
      </CardContent>
    </Card>
  );
}

function SalesTrend({ data, periodLabel, isToday }: Readonly<{ data: DashboardSummary['salesTrend']; periodLabel: string; isToday: boolean }>) {
  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <SectionTitle
          title="แนวโน้มยอดขาย"
          helper={isToday ? 'เลือกวันนี้ แต่กราฟแสดงแนวโน้ม 7 วันล่าสุด' : 'ใช้วันที่ขายจริง และใช้วันที่สร้างออเดอร์เป็นข้อมูลสำรอง'}
          action={<Chip label={isToday ? 'วันนี้ · 7 วันล่าสุด' : periodLabel} size="small" color="primary" variant="outlined" />}
        />
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

type FollowUpItem = Readonly<{ label: string; helper: string; value: number; icon: React.ElementType; color: string; href: string; actionLabel: string }>;

function FollowUpRow({ item }: Readonly<{ item: FollowUpItem }>) {
  const Icon = item.icon;
  return (
    <Stack direction="row" alignItems="center" spacing={1.2} sx={{ py: 1.25, minWidth: 0 }}>
      <Box sx={{ width: 36, height: 36, flex: '0 0 auto', borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: `${item.color}14`, color: item.color }}>
        <Icon sx={{ fontSize: 19 }} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ color: '#0F172A', fontSize: 13.5, fontWeight: 800 }}>{item.label}</Typography>
        <Typography sx={{ color: '#64748B', fontSize: 11.5 }}>{item.helper}</Typography>
      </Box>
      <Stack alignItems="flex-end" spacing={0.2} sx={{ flex: '0 0 auto' }}>
        <Typography sx={{ color: '#0F172A', fontSize: 18, fontWeight: 900 }}>{integer(item.value)}</Typography>
        <Button component={Link} href={item.href} size="small" variant="text" sx={{ minWidth: 0, px: 0, fontSize: 11.5, fontWeight: 700 }}>
          {item.actionLabel}
        </Button>
      </Stack>
    </Stack>
  );
}

function FollowUpPanel({ summary }: Readonly<{ summary: DashboardSummary }>) {
  const operations = summary.operations;
  const items: FollowUpItem[] = [
    { label: 'งานเกินกำหนด', helper: 'Production Job ที่ยังไม่จบ', value: operations.production.overdue, icon: ScheduleRoundedIcon, color: '#DC2626', href: buildDashboardProductionHref('overdue'), actionLabel: 'เปิดงานผลิต' },
    { label: 'พร้อมรับงาน', helper: 'ออเดอร์ที่พร้อมส่งมอบ', value: operations.workflow.ready_for_pickup, icon: TaskAltRoundedIcon, color: '#059669', href: '/home/orders?workflowStatus=ready_for_pickup', actionLabel: 'เปิดออเดอร์' },
    { label: 'สต็อกต่ำ', helper: 'รายการที่ต่ำกว่าระดับขั้นต่ำ', value: operations.lowStock, icon: Inventory2RoundedIcon, color: '#7C3AED', href: '/home/stock', actionLabel: 'เปิด Stock' },
  ].filter(item => item.value > 0);

  return (
    <Card sx={{ ...cardSx, height: '100%' }}>
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <SectionTitle title="เรื่องที่ต้องติดตามตอนนี้" helper="แสดงเฉพาะ 3 หมวดหลักที่ต้องลงมือทำ" />
        {items.length ? (
          <Stack divider={<Divider flexItem />}>
            {items.map(item => (
              <FollowUpRow key={item.label} item={item} />
            ))}
          </Stack>
        ) : (
          <Alert severity="info" sx={{ mt: 1, fontSize: 13 }}>
            ไม่มีรายการในสามหมวดนี้
            <Typography component="span" sx={{ display: 'block', mt: 0.4, color: '#475569', fontSize: 12 }}>
              งานประเภทอื่นและคำเตือนที่ต้องตรวจสอบยังอยู่ในรายละเอียดเพิ่มเติม
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value, helper, href, actionLabel }: Readonly<{ label: string; value: string; helper?: string; href?: string; actionLabel?: string }>) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={0.75} sx={{ py: 1 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: '#334155', fontSize: 13, fontWeight: 700 }}>{label}</Typography>
        {helper ? <Typography sx={{ color: '#64748B', fontSize: 11.5 }}>{helper}</Typography> : null}
      </Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: '0 0 auto' }}>
        <Typography sx={{ color: '#0F172A', fontSize: 13, fontWeight: 800 }}>{value}</Typography>
        {href && actionLabel ? (
          <Button component={Link} href={href} size="small" variant="text" sx={{ minWidth: 0, px: 0, fontSize: 11.5, fontWeight: 700 }}>
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
}

function DetailGroup({ title, helper, children }: Readonly<{ title: string; helper: string; children: React.ReactNode }>) {
  return (
    <Accordion disableGutters sx={{ ...cardSx, boxShadow: 'none', '&:before': { display: 'none' }, '& + &': { mt: 1 } }}>
      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: { xs: 1.5, md: 2 }, minHeight: 58, '& .MuiAccordionSummary-content': { my: 1 } }}>
        <Box>
          <Typography sx={{ color: '#0F172A', fontSize: 14, fontWeight: 800 }}>{title}</Typography>
          <Typography sx={{ color: '#64748B', fontSize: 11.5 }}>{helper}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ px: { xs: 1.5, md: 2 }, pb: 1.5, pt: 0 }}>{children}</AccordionDetails>
    </Accordion>
  );
}

function RevenueDetails({ summary }: Readonly<{ summary: DashboardSummary }>) {
  const payment = summary.paymentSummary;
  const aging = summary.outstandingAging;
  return (
    <Stack divider={<Divider flexItem />}>
      <DetailRow label="เงินสด" value={money(payment.cash)} />
      <DetailRow label="PromptPay" value={money(payment.transfer)} />
      <DetailRow label="ชำระเต็มตั้งต้น" value={money(payment.fullPayment)} helper="ส่วนที่ถูกนับจากข้อมูลการสร้างออเดอร์" />
      <DetailRow label="มัดจำตั้งต้น" value={money(payment.deposits)} helper="ส่วนที่ถูกนับจากข้อมูลการสร้างออเดอร์" />
      <DetailRow label="รับชำระภายหลัง" value={money(payment.oldOutstandingPaid)} helper="payments ที่เกิดขึ้นในช่วงรายงาน" />
      <Box sx={{ pt: 1.5 }}>
        <Typography sx={{ color: '#0F172A', fontSize: 13, fontWeight: 800 }}>อายุยอดค้าง</Typography>
        <Typography sx={{ color: '#64748B', fontSize: 11.5 }}>นับจากวันที่สร้างรายการ ไม่ใช่วันครบกำหนดชำระ</Typography>
        <Stack divider={<Divider flexItem />} sx={{ mt: 0.5 }}>
          <DetailRow label="วันนี้" value={money(aging.today)} />
          <DetailRow label="1–7 วัน" value={money(aging.days1To7)} />
          <DetailRow label="8–30 วัน" value={money(aging.days8To30)} />
          <DetailRow label="มากกว่า 30 วัน" value={money(aging.over30Days)} />
        </Stack>
      </Box>
      <Box sx={{ pt: 1.25 }}>
        <Button component={Link} href="/home/orders?payment=unpaid" size="small" variant="outlined">
          เปิดรายการค้างชำระ
        </Button>
      </Box>
    </Stack>
  );
}

function ProductDetails({ summary }: Readonly<{ summary: DashboardSummary }>) {
  return (
    <Stack divider={<Divider flexItem />}>
      <DetailRow label="จำนวนลูกค้า" value={integer(summary.periodSummary.customers)} helper={`ในช่วง ${summary.period.label}`} />
      <Box sx={{ pt: 1.25 }}>
        <Typography sx={{ color: '#0F172A', fontSize: 13, fontWeight: 800 }}>สินค้าขายดี (ไม่รวม Quick Sale)</Typography>
        <Typography sx={{ color: '#64748B', fontSize: 11.5 }}>ในช่วง {summary.period.label}</Typography>
        <Stack divider={<Divider flexItem />} sx={{ mt: 0.5 }}>
          {summary.topProducts.length ? (
            summary.topProducts.slice(0, 5).map((item: DashboardProduct, index) => (
              <Stack key={`${item.name}-${index}`} direction="row" alignItems="center" spacing={1} sx={{ py: 1 }}>
                <Box sx={{ width: 24, height: 24, borderRadius: 1.25, bgcolor: index === 0 ? '#FEF3C7' : '#F1F5F9', color: '#475569', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 900 }}>
                  {index + 1}
                </Box>
                <Typography noWrap sx={{ minWidth: 0, flex: 1, color: '#334155', fontSize: 13, fontWeight: 700 }}>
                  {item.name}
                </Typography>
                <Typography sx={{ color: '#64748B', fontSize: 12, flex: '0 0 auto' }}>{integer(item.quantity)} ชิ้น · {money(item.revenue)}</Typography>
              </Stack>
            ))
          ) : (
            <Typography sx={{ color: '#64748B', py: 2, fontSize: 13 }}>ยังไม่มีข้อมูลสินค้าในช่วงนี้</Typography>
          )}
        </Stack>
      </Box>
      <Box sx={{ pt: 1.25 }}>
        <Typography sx={{ color: '#0F172A', fontSize: 13, fontWeight: 800 }}>ขายด่วน (Quick Sale)</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.75, sm: 3 }} sx={{ mt: 0.75 }}>
          <DetailRow label="ออเดอร์" value={integer(summary.quickSeller.orders)} />
          <DetailRow label="ยอดขาย" value={money(summary.quickSeller.revenue)} />
          <DetailRow label="จำนวนสินค้า" value={integer(summary.quickSeller.items.reduce((total, item) => total + item.quantity, 0))} />
        </Stack>
      </Box>
    </Stack>
  );
}

function WorkflowDetails({ summary }: Readonly<{ summary: DashboardSummary }>) {
  const operations = summary.operations;
  return (
    <Stack divider={<Divider flexItem />}>
      <DetailRow label="รอเริ่มงาน" value={integer(operations.workflow.pending)} helper={operations.unclassifiedWorkflow > 0 ? `${integer(operations.unclassifiedWorkflow)} รายการยังไม่ระบุขั้นตอน` : undefined} href="/home/orders?workflowStatus=pending" actionLabel="เปิดออเดอร์" />
      <DetailRow label="กำลังผลิต" value={integer(operations.workflow.producing)} href="/home/orders?workflowStatus=producing" actionLabel="เปิดออเดอร์" />
      <DetailRow label="พร้อมรับงาน" value={integer(operations.workflow.ready_for_pickup)} href="/home/orders?workflowStatus=ready_for_pickup" actionLabel="เปิดออเดอร์" />
      <DetailRow label="งานครบกำหนดวันนี้" value={integer(operations.production.dueToday)} helper="Production Job ที่ยังไม่จบ" href={buildDashboardProductionHref('dueToday')} actionLabel="เปิดงานผลิต" />
      <DetailRow label="งาน Rush" value={integer(operations.production.rush)} helper="งานเร่งด่วนที่ยังอยู่ระหว่างผลิต" href={buildDashboardProductionHref('rush')} actionLabel="เปิดงานผลิต" />
      <DetailRow label="ไฟล์รอตรวจ" value={integer(operations.filesWaiting)} helper={`${integer(summary.uploads.newFiles)} ไฟล์ใหม่วันนี้`} href="/home/storage" actionLabel="เปิด Storage" />
    </Stack>
  );
}

function AdditionalDetails({ summary }: Readonly<{ summary: DashboardSummary }>) {
  return (
    <Accordion disableGutters sx={{ ...cardSx, '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: { xs: 1.75, md: 2.5 }, minHeight: 66, '& .MuiAccordionSummary-content': { my: 1.25 } }}>
        <Box>
          <Typography sx={{ color: '#0F172A', fontSize: 16, fontWeight: 800 }}>รายละเอียดเพิ่มเติม</Typography>
          <Typography sx={{ color: '#64748B', fontSize: 12 }}>เปิดดูรายรับ ยอดค้าง ลูกค้า สินค้า และสถานะงานเมื่อจำเป็น</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ px: { xs: 1.25, md: 2.5 }, pb: 2.5, pt: 0 }}>
        <DetailGroup title="รายรับและยอดค้าง" helper="แยกตามช่องทางรับเงินและอายุยอดค้าง">
          <RevenueDetails summary={summary} />
        </DetailGroup>
        <DetailGroup title="ลูกค้าและสินค้า" helper="ข้อมูลประกอบของช่วงรายงานที่เลือก">
          <ProductDetails summary={summary} />
        </DetailGroup>
        <DetailGroup title="สถานะงาน" helper="รายละเอียดที่ไม่ได้อยู่ในรายการติดตามหลัก">
          <WorkflowDetails summary={summary} />
        </DetailGroup>
      </AccordionDetails>
    </Accordion>
  );
}

function DashboardSkeleton() {
  return (
    <AdminPageContainer>
      <Stack spacing={2.5}>
        <Skeleton variant="rounded" height={112} />
        <Skeleton variant="rounded" height={82} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={142} />
          ))}
        </Box>
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
  const payment = summary.paymentSummary;
  const salesDelta = percentChange(summary.periodSummary.sales, summary.periodSummary.previousSales);
  const comparisonLabel = period === 'month' ? 'เดือนก่อน' : period === 'today' ? 'เมื่อวาน' : 'ช่วงก่อนหน้า';
  const salesDeltaText = salesDelta === null ? `ยังไม่มีฐานเปรียบเทียบ${comparisonLabel}` : `${salesDelta >= 0 ? '+' : ''}${salesDelta.toFixed(1)}% จาก${comparisonLabel}`;
  const periodOrdersHref = buildDashboardOrdersHref({ period, month, startDate: startDate.format('YYYY-MM-DD'), endDate: endDate.format('YYYY-MM-DD') });
  const financialMismatch = Math.abs(payment.cash + payment.transfer - payment.received) >= 0.01;
  const periodKpis: MetricCardProps[] = [
    { label: `ยอดขาย ${summary.period.label}`, value: money(summary.periodSummary.sales), helper: salesDeltaText, icon: TrendingUpRoundedIcon, color: '#6C4DFF' },
    { label: `เงินรับจริง ${summary.period.label}`, value: money(summary.periodSummary.collections), helper: 'เงินตั้งต้นตามวันที่สร้างออเดอร์ + payments/financial adjustments ตามวันที่เกิดรายการ', icon: PaidRoundedIcon, color: '#059669' },
    { label: `ออเดอร์ ${summary.period.label}`, value: integer(summary.periodSummary.orders), helper: 'ออเดอร์ที่ไม่ถูกยกเลิก', icon: ReceiptLongRoundedIcon, color: '#2563EB' },
    {
      label: 'ยอดค้างชำระทั้งหมด',
      value: money(operations.outstanding.amount),
      helper: `ข้อมูลปัจจุบัน · ${integer(operations.outstanding.orders)} ออเดอร์ · ไม่เปลี่ยนตามช่วงรายงาน`,
      icon: PaidRoundedIcon,
      color: '#C2410C',
      action: (
        <Button component={Link} href="/home/orders?payment=unpaid" size="small" variant="text" sx={{ minWidth: 0, px: 0, fontSize: 11.5, fontWeight: 700 }}>
          เปิดออเดอร์ค้าง
        </Button>
      ),
    },
  ];

  return (
    <AdminPageContainer>
      <AdminHeroHeader
        title="ภาพรวมร้าน"
        description="ขายเป็นอย่างไร · รับเงินแล้วเท่าไร · มีอะไรต้องตามต่อ"
        lastSyncedAt={new Date(summary.generatedAt)}
        utilityActions={
          <Button variant="text" startIcon={<RefreshRoundedIcon />} disabled={loading} onClick={() => void load()} sx={heroUtilityButtonSx}>
            {loading ? 'กำลังรีเฟรช...' : 'รีเฟรช'}
          </Button>
        }
      />
      {error ? (
        <Alert severity="warning" sx={{ mb: 2 }} action={<Button onClick={() => void load()}>ลองใหม่</Button>}>
          {error}
        </Alert>
      ) : null}
      <PeriodFilterCard
        period={period}
        startDate={startDate}
        endDate={endDate}
        onPresetChange={handlePresetChange}
        onCustomClick={() => setPeriod('custom')}
        onStartDateChange={value => {
          setStartDate(value);
          setPeriod('custom');
        }}
        onEndDateChange={value => {
          setEndDate(value);
          setPeriod('custom');
        }}
      />
      <SectionTitle
        title="สรุปหลัก"
        helper="ยอดขาย รายรับ และออเดอร์ใช้ช่วงรายงานที่เลือก · ยอดค้างเป็นสถานะปัจจุบัน"
        action={
          <Button component={Link} href={periodOrdersHref} size="small" variant="text" sx={{ fontWeight: 700 }}>
            ดูออเดอร์ตามช่วง
          </Button>
        }
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5, mb: 2.5 }}>
        {periodKpis.map(item => (
          <MetricCard key={item.label} {...item} />
        ))}
      </Box>
      <Stack spacing={1.25} sx={{ mb: 2.5 }} aria-live="polite">
        {financialMismatch ? <Alert severity="warning">ยอดรวมตามช่องทางรับเงินไม่ตรงกับเงินรับจริงสุทธิ กรุณาตรวจสอบรายการชำระเงินและ financial adjustments</Alert> : null}
        {operations.unclassifiedWorkflow > 0 ? <Alert severity="warning">มี {integer(operations.unclassifiedWorkflow)} ออเดอร์จากข้อมูลเดิมที่ยังไม่ระบุขั้นตอนงาน ระบบรวมไว้ใน “รอเริ่มงาน” เพื่อไม่ให้รายการตกหล่น</Alert> : null}
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(300px, 1fr)' }, gap: 2.5, mb: 2.5 }}>
        <SalesTrend data={summary.salesTrend} periodLabel={summary.period.label} isToday={period === 'today'} />
        <FollowUpPanel summary={summary} />
      </Box>
      <AdditionalDetails summary={summary} />
    </AdminPageContainer>
  );
}
