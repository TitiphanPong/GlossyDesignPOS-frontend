'use client';

import * as React from 'react';
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DesignServicesRoundedIcon from '@mui/icons-material/DesignServicesRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import LocalAtmRoundedIcon from '@mui/icons-material/LocalAtmRounded';
import LocalPrintshopRoundedIcon from '@mui/icons-material/LocalPrintshopRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import axios from 'axios';
import dayjs from 'dayjs';
import Link from 'next/link';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getApiBaseUrl, hasApiBaseUrl, isMissingApiBaseError } from '../../lib/api';
import { getDisplayOrderNumber, type NormalizedOrder } from '../../lib/contracts';
import { fetchOrders, sortOrdersByNewest } from '../../lib/orders';
import AdminPageContainer from './components/AdminPageContainer';
import { EmptyState, LoadingState, MissingApiConfigState } from './components/dashboardUi';
import { groupStorageRows, normalizeRecord, type StorageRow, type StorageStatus, type UploadApiRecord } from './storage/normalizers';

type StatusTone = 'amber' | 'blue' | 'orange' | 'green' | 'emerald' | 'red' | 'slate';

type StatusMeta = {
  key: string;
  label: string;
  helper: string;
  color: string;
  bg: string;
  border: string;
  tone: StatusTone;
  icon: React.ElementType;
};

type KpiItem = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  accent: string;
  icon: React.ElementType;
  series: number[];
};

type DashboardMetrics = {
  salesToday: number;
  salesThisMonth: number;
  ordersToday: number;
  customersToday: number;
  pendingProduction: number;
  waitingPayment: number;
  newUploadsToday: number;
  uploadWaiting: number;
  uploadProcessing: number;
  uploadCompleted: number;
  productionStatuses: Array<StatusMeta & { count: number }>;
  salesSeries7d: number[];
};

type ChartPoint = {
  label: string;
  value: number;
};

const CARD_SX = {
  borderRadius: '22px',
  border: '1px solid #E5E7EB',
  bgcolor: '#FFFFFF',
  boxShadow: '0 16px 42px rgba(15, 23, 42, 0.06)',
};

const endpointCandidates = ['/uploads', '/upload'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function readArrayPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (isRecord(payload) && Array.isArray(payload.data)) return payload.data;
  if (isRecord(payload) && Array.isArray(payload.items)) return payload.items;
  if (isRecord(payload) && Array.isArray(payload.uploads)) return payload.uploads;
  return [];
}

function getOrderAmount(order: NormalizedOrder): number {
  const value = order.grandTotal ?? order.total;
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(value, 0) : 0;
}

function getOrderDate(order: Pick<NormalizedOrder, 'createdAt'>) {
  const date = dayjs(order.createdAt);
  return date.isValid() ? date : null;
}

function isSameDay(value: string | Date | null | undefined, compare = dayjs()) {
  const date = dayjs(value);
  return date.isValid() && date.isSame(compare, 'day');
}

function formatCurrencyTHB(value: number | null | undefined): string {
  const amount = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatThaiDateTime(value: Date | string | null | undefined): string {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatThaiFullDate(value: Date | string | null | undefined): string {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function normalizeStatusKey(value: unknown): string {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/-/g, '_');
}

function getStatusMeta(status: unknown): StatusMeta {
  const key = normalizeStatusKey(status);
  const thaiValue = String(status ?? '').trim();

  if (['pending', 'รอดำเนินการ', 'รอตรวจสอบ', 'new'].includes(key) || thaiValue === 'รอตรวจสอบ') {
    return {
      key: 'pending',
      label: 'รอตรวจสอบ',
      helper: 'รอตรวจสอบรายละเอียดงาน',
      color: '#B45309',
      bg: '#FFF7ED',
      border: '#FED7AA',
      tone: 'amber',
      icon: FactCheckRoundedIcon,
    };
  }

  if (['designing', 'design', 'กำลังออกแบบ'].includes(key) || thaiValue === 'กำลังออกแบบ') {
    return {
      key: 'designing',
      label: 'กำลังออกแบบ',
      helper: 'งานที่อยู่ในคิว',
      color: '#7C3AED',
      bg: '#F5F3FF',
      border: '#DDD6FE',
      tone: 'blue',
      icon: DesignServicesRoundedIcon,
    };
  }

  if (['in_progress', 'producing', 'production', 'กำลังผลิต'].includes(key) || thaiValue === 'กำลังผลิต') {
    return {
      key: 'producing',
      label: 'กำลังผลิต',
      helper: 'งานที่เข้าสู่ขั้นตอนพิมพ์และผลิต',
      color: '#2563EB',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      tone: 'blue',
      icon: LocalPrintshopRoundedIcon,
    };
  }

  if (['waiting_payment', 'awaiting_payment', 'partial', 'รอชำระเงิน', 'ค้างชำระ'].includes(key) || ['รอชำระเงิน', 'ค้างชำระ'].includes(thaiValue)) {
    return {
      key: 'waiting_payment',
      label: 'รอชำระเงิน',
      helper: 'ยอดที่ยังค้างรับชำระหรือรอยืนยัน',
      color: '#EA580C',
      bg: '#FFF7ED',
      border: '#FDBA74',
      tone: 'orange',
      icon: LocalAtmRoundedIcon,
    };
  }

  if (['ready', 'ready_for_pickup', 'พร้อมรับสินค้า'].includes(key) || thaiValue === 'พร้อมรับสินค้า') {
    return {
      key: 'ready',
      label: 'พร้อมรับสินค้า',
      helper: 'งานผลิตเสร็จและรอลูกค้ามารับ',
      color: '#16A34A',
      bg: '#F0FDF4',
      border: '#BBF7D0',
      tone: 'green',
      icon: AssignmentTurnedInRoundedIcon,
    };
  }

  if (['completed', 'delivered', 'paid', 'done', 'เสร็จสิ้น', 'จัดส่งแล้ว'].includes(key) || ['เสร็จสิ้น', 'จัดส่งแล้ว'].includes(thaiValue)) {
    return {
      key: 'completed',
      label: 'เสร็จสิ้น / จัดส่งแล้ว',
      helper: 'ปิดงานแล้ว',
      color: '#059669',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      tone: 'emerald',
      icon: TaskAltRoundedIcon,
    };
  }

  if (['cancelled', 'ยกเลิก'].includes(key) || thaiValue === 'ยกเลิก') {
    return {
      key: 'cancelled',
      label: 'ยกเลิก',
      helper: 'ออเดอร์ที่ยกเลิกหรือไม่ต้องผลิตแล้ว',
      color: '#DC2626',
      bg: '#FEF2F2',
      border: '#FECACA',
      tone: 'red',
      icon: WarningAmberRoundedIcon,
    };
  }

  return {
    key: key || 'unknown',
    label: thaiValue || 'ไม่ระบุสถานะ',
    helper: 'สถานะจากระบบหลังบ้าน',
    color: '#475569',
    bg: '#F8FAFC',
    border: '#E2E8F0',
    tone: 'slate',
    icon: AutorenewRoundedIcon,
  };
}

function getPaymentLabel(value: unknown): string {
  const key = normalizeStatusKey(value);
  if (key === 'cash') return 'เงินสด';
  if (key === 'promptpay') return 'PromptPay';
  if (key === 'transfer') return 'โอนบัญชี';
  if (key === 'card') return 'บัตร';
  return String(value ?? '-') || '-';
}

function getStorageStatusLabel(status: StorageStatus): string {
  if (status === 'waiting') return 'รอตรวจสอบ';
  if (status === 'pending') return 'กำลังดำเนินการ';
  return 'เสร็จสิ้น';
}

function buildRangeSeries(orders: NormalizedOrder[], days: number): number[] {
  const today = dayjs();
  return Array.from({ length: days }, (_, index) => {
    const target = today.subtract(days - index - 1, 'day');
    return orders.reduce((sum, order) => {
      const createdAt = getOrderDate(order);
      return createdAt?.isSame(target, 'day') ? sum + getOrderAmount(order) : sum;
    }, 0);
  });
}

/*
function calculateBestSellers(orders: NormalizedOrder[]): BestSeller[] {
  const products = new Map<string, BestSeller>();

  for (const order of orders) {
    for (const item of Array.isArray(order.cart) ? order.cart : []) {
      const name = item.name?.trim() || item.category?.trim() || 'สินค้าไม่ระบุชื่อ';
      const quantity = Number.isFinite(item.qty) ? Math.max(item.qty, 0) : Number.isFinite(item.quantity) ? Math.max(item.quantity, 0) : 0;
      const itemRevenue = Number.isFinite(item.total) ? item.total : Number.isFinite(item.totalPrice) ? item.totalPrice : null;
      const existing = products.get(name) ?? { name, quantity: 0, revenue: null };
      existing.quantity += quantity;
      existing.revenue = itemRevenue === null ? existing.revenue : (existing.revenue ?? 0) + Math.max(itemRevenue, 0);
      products.set(name, existing);
    }
  }

  return Array.from(products.values())
    .filter(item => item.quantity > 0)
    .sort((left, right) => right.quantity - left.quantity)
    .slice(0, 5);
}

*/
function calculateDashboardMetrics(orders: NormalizedOrder[], uploads: StorageRow[]): DashboardMetrics {
  const now = dayjs();
  const ordersToday = orders.filter(order => getOrderDate(order)?.isSame(now, 'day'));
  const monthOrders = orders.filter(order => getOrderDate(order)?.isSame(now, 'month'));
  const waitingPaymentOrders = orders.filter(order => {
    const statusKey = getStatusMeta(order.status).key;
    return statusKey === 'waiting_payment' || order.remainingTotal > 0;
  });
  const productionStatuses = ['pending', 'designing', 'producing', 'waiting_payment', 'ready', 'completed'].map(statusKey => {
    const meta = getStatusMeta(statusKey);
    const count = orders.filter(order => getStatusMeta(order.status).key === meta.key).length;
    return { ...meta, count };
  });

  return {
    salesToday: ordersToday.reduce((sum, order) => sum + getOrderAmount(order), 0),
    salesThisMonth: monthOrders.reduce((sum, order) => sum + getOrderAmount(order), 0),
    ordersToday: ordersToday.length,
    customersToday: new Set(ordersToday.map(order => order.customerName?.trim()).filter(Boolean)).size,
    pendingProduction: orders.filter(order => ['pending', 'designing', 'producing', 'ready'].includes(getStatusMeta(order.status).key)).length,
    waitingPayment: waitingPaymentOrders.length,
    newUploadsToday: uploads.filter(upload => isSameDay(upload.uploadDate, now)).length,
    uploadWaiting: uploads.filter(upload => upload.status === 'waiting').length,
    uploadProcessing: uploads.filter(upload => upload.status === 'pending').length,
    uploadCompleted: uploads.filter(upload => upload.status === 'completed').length,
    productionStatuses,
    salesSeries7d: buildRangeSeries(orders, 7),
  };
}

async function fetchUploadsSafely(): Promise<StorageRow[]> {
  const base = getApiBaseUrl();

  for (const endpoint of endpointCandidates) {
    try {
      const response = await axios.get(`${base}${endpoint}`);
      const list = readArrayPayload(response.data);
      return groupStorageRows(list.filter((item): item is UploadApiRecord => isRecord(item)).map(normalizeRecord));
    } catch {
      // Try the legacy endpoint before falling back to an empty queue.
    }
  }

  return [];
}

function DashboardHeader({
  isRefreshing,
  lastUpdated,
  loadError,
  onRefresh,
}: Readonly<{
  isRefreshing: boolean;
  lastUpdated: Date | null;
  loadError: string | null;
  onRefresh: () => void;
}>) {
  const headerButtonSx = {
    minHeight: 42,
    borderRadius: '12px',
    borderColor: '#CBDCF4',
    color: '#0F2B57',
    bgcolor: '#FFFFFF',
    px: 1.8,
    fontWeight: 800,
    textTransform: 'none',
    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)',
    '&:hover': {
      borderColor: '#AFC8EC',
      bgcolor: '#F8FBFF',
      boxShadow: '0 12px 28px rgba(15, 23, 42, 0.07)',
    },
  };

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2.5,
        minHeight: { xs: 'auto', lg: 170 },
        p: { xs: 2.4, md: 3 },
        overflow: 'hidden',
        borderRadius: '22px',
        border: '1px solid #D7E8FF',
        bgcolor: '#FBFDFF',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 100%)',
        boxShadow: '0 18px 42px rgba(74, 144, 226, 0.06)',
        position: 'relative',
      }}>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', lg: 'center' }}
        spacing={{ xs: 2.4, lg: 3 }}
        sx={{ position: 'relative', minHeight: { lg: 112 } }}>
        <Box sx={{ minWidth: 0, maxWidth: 780 }}>
          <Typography
            variant="h3"
            sx={{
              color: '#020617',
              fontWeight: 900,
              fontSize: { xs: 34, md: 40 },
              lineHeight: 1.05,
              letterSpacing: '-0.045em',
            }}>
            Dashboard
          </Typography>
          <Typography sx={{ mt: 1.2, color: '#0F2B57', fontSize: { xs: 14, md: 15 }, lineHeight: 1.65 }}>ติดตามยอดขาย สถานะงาน การรับชำระ งานพิมพ์ และเอกสารการขายได้ในหน้าจอเดียว</Typography>
          <Stack spacing={0.25} sx={{ mt: 1.25 }}>
            <Typography sx={{ color: '#7A8FB3', fontSize: 12.2, fontWeight: 500 }}>อัปเดตล่าสุด {formatThaiDateTime(lastUpdated)}</Typography>
            <Typography sx={{ color: '#7A8FB3', fontSize: 12.2, fontWeight: 500 }}>{formatThaiFullDate(lastUpdated)}</Typography>
          </Stack>
          <Box sx={{ display: 'none' }}>
            <Typography sx={{ mt: 1, color: '#64748B', fontSize: { xs: 14.5, md: 16 }, lineHeight: 1.75 }}>ติดตามยอดขาย สถานะงาน การรับชำระ และออเดอร์ล่าสุดของร้านในภาพรวมเดียว</Typography>
            <Chip size="small" label={`อัปเดตล่าสุด ${formatThaiDateTime(lastUpdated)}`} sx={{ mt: 1.6, borderRadius: '999px', bgcolor: '#EAF4FF', color: '#1D4ED8', fontWeight: 700 }} />
          </Box>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent={{ xs: 'flex-start', lg: 'flex-end' }} sx={{ flexShrink: 0 }}>
          <Button
            aria-label="Notifications"
            variant="outlined"
            sx={{
              ...headerButtonSx,
              position: 'relative',
              minWidth: 44,
              width: { xs: '100%', sm: 44 },
              px: 0,
              color: '#0F2B57',
            }}>
            <NotificationsRoundedIcon sx={{ fontSize: 20 }} />
            <Box
              sx={{
                position: 'absolute',
                top: 7,
                right: 8,
                width: 8,
                height: 8,
                borderRadius: '999px',
                bgcolor: '#EF4444',
                border: '2px solid #FFFFFF',
              }}
            />
          </Button>
          <Button onClick={onRefresh} disabled={isRefreshing} startIcon={isRefreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshRoundedIcon />} variant="outlined" sx={headerButtonSx}>
            รีเฟรช
          </Button>
          <Button component={Link} href="/home/orders" startIcon={<FileDownloadRoundedIcon />} variant="outlined" sx={headerButtonSx}>
            ส่งออกรายงาน
          </Button>
          <Button
            component={Link}
            href="/home/posseller"
            startIcon={<AddShoppingCartRoundedIcon />}
            variant="contained"
            sx={{
              minHeight: 42,
              borderRadius: '12px',
              px: 2,
              bgcolor: '#315BEF',
              color: '#FFFFFF',
              fontWeight: 900,
              textTransform: 'none',
              boxShadow: '0 16px 30px rgba(49, 91, 239, 0.32)',
              '&:hover': {
                bgcolor: '#254CE0',
                boxShadow: '0 18px 34px rgba(49, 91, 239, 0.38)',
              },
            }}>
            สร้างรายการงานใหม่
          </Button>
        </Stack>
      </Stack>

      {loadError ? (
        <Alert severity="warning" sx={{ mt: 2.2, borderRadius: 3, border: '1px solid #FED7AA', bgcolor: '#FFF7ED' }}>
          {loadError}
        </Alert>
      ) : null}
    </Paper>
  );
}

function KpiCard({ item }: Readonly<{ item: KpiItem }>) {
  const Icon = item.icon;
  const chartData = item.series.map(value => ({ value }));
  const gradientId = `kpi-${item.label.replace(/\s+/g, '-')}`;

  return (
    <Card
      elevation={0}
      sx={{
        ...CARD_SX,
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
        minWidth: 0,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${item.accent}, ${alpha(item.accent, 0.45)})`,
        },
      }}>
      <CardContent sx={{ p: 2.2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#64748B', fontSize: 12.5, fontWeight: 700 }}>{item.label}</Typography>
            <Typography sx={{ mt: 0.8, color: '#0F172A', fontSize: { xs: 25, md: 28 }, fontWeight: 900, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>
              {item.prefix ? (
                <Box component="span" sx={{ mr: 0.4, fontSize: '0.65em', color: '#94A3B8' }}>
                  {item.prefix}
                </Box>
              ) : null}
              {item.value.toLocaleString('th-TH')}
              {item.suffix ? (
                <Box component="span" sx={{ ml: 0.5, fontSize: '0.48em', color: '#94A3B8' }}>
                  {item.suffix}
                </Box>
              ) : null}
            </Typography>
          </Box>
          <Box sx={{ width: 42, height: 42, borderRadius: '14px', bgcolor: alpha(item.accent, 0.12), color: item.accent, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Icon sx={{ fontSize: 22 }} />
          </Box>
        </Stack>
        <Box sx={{ mt: 1.3, height: 38 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={item.accent} stopOpacity={0.34} />
                  <stop offset="95%" stopColor={item.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area dataKey="value" type="monotone" stroke={item.accent} strokeWidth={2} fill={`url(#${gradientId})`} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

function ProductionStatusCard({ status }: Readonly<{ status: StatusMeta & { count: number } }>) {
  const Icon = status.icon;
  return (
    <Paper elevation={0} sx={{ borderRadius: '18px', border: `1px solid ${status.border}`, bgcolor: status.bg, p: 1.8, minWidth: 0 }}>
      <Stack direction="row" spacing={1.4} alignItems="flex-start">
        <Box sx={{ width: 38, height: 38, borderRadius: '13px', bgcolor: alpha(status.color, 0.12), color: status.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon sx={{ fontSize: 20 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: status.color, fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{status.count.toLocaleString('th-TH')}</Typography>
          <Typography sx={{ mt: 0.6, color: '#0F172A', fontSize: 13.5, fontWeight: 800 }}>{status.label}</Typography>
          <Typography sx={{ mt: 0.3, color: '#64748B', fontSize: 11.5, lineHeight: 1.4 }}>{status.helper}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function SalesChart({ orders }: Readonly<{ orders: NormalizedOrder[] }>) {
  const [startDate, setStartDate] = React.useState(() => dayjs().subtract(29, 'day').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = React.useState(() => dayjs().format('YYYY-MM-DD'));

  const chartData = React.useMemo<ChartPoint[]>(() => {
    const start = dayjs(startDate).startOf('day');
    const end = dayjs(endDate).endOf('day');
    if (!start.isValid() || !end.isValid() || start.isAfter(end)) return [];

    const points: ChartPoint[] = [];
    let cursor = start;
    while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
      const value = orders.reduce((sum, order) => {
        const createdAt = getOrderDate(order);
        return createdAt?.isSame(cursor, 'day') ? sum + getOrderAmount(order) : sum;
      }, 0);
      points.push({ label: cursor.format('DD/MM'), value });
      cursor = cursor.add(1, 'day');
    }
    return points;
  }, [endDate, orders, startDate]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const average = chartData.length ? Math.round(total / chartData.length) : 0;
  const hasData = chartData.some(item => item.value > 0);

  return (
    <Paper elevation={0} sx={{ ...CARD_SX, p: { xs: 2, md: 2.6 }, height: '100%', minWidth: 0 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography sx={{ color: '#0F172A', fontSize: 20, fontWeight: 900 }}>Revenue Overview</Typography>
          <Typography sx={{ mt: 0.4, color: '#64748B', fontSize: 13 }}>ยอดขายตามช่วงวันที่ เลือกช่วงเพื่อดูแนวโน้มรายได้</Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Box
            component="input"
            type="date"
            value={startDate}
            max={endDate}
            onChange={event => setStartDate(event.target.value)}
            sx={{ border: '1px solid #D7E8FF', borderRadius: '12px', px: 1.4, py: 1, color: '#0F172A', bgcolor: '#F8FAFC', font: 'inherit', minWidth: 150 }}
          />
          <Box
            component="input"
            type="date"
            value={endDate}
            min={startDate}
            max={dayjs().format('YYYY-MM-DD')}
            onChange={event => setEndDate(event.target.value)}
            sx={{ border: '1px solid #D7E8FF', borderRadius: '12px', px: 1.4, py: 1, color: '#0F172A', bgcolor: '#F8FAFC', font: 'inherit', minWidth: 150 }}
          />
        </Stack>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1, mb: 2 }}>
        {[
          ['รายได้รวม', formatCurrencyTHB(total)],
          ['เฉลี่ยต่อวัน', formatCurrencyTHB(average)],
          ['จำนวนวัน', `${chartData.length.toLocaleString('th-TH')} วัน`],
        ].map(([label, value]) => (
          <Box key={label} sx={{ borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px solid #E5E7EB', p: 1.5 }}>
            <Typography sx={{ color: '#64748B', fontSize: 12, fontWeight: 700 }}>{label}</Typography>
            <Typography sx={{ mt: 0.4, color: '#0F172A', fontSize: 18, fontWeight: 900 }}>{value}</Typography>
          </Box>
        ))}
      </Box>

      {hasData ? (
        <ResponsiveContainer width="100%" height={310}>
          <AreaChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="dashboard-revenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.32} />
                <stop offset="95%" stopColor="#4A90E2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 6" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} interval={chartData.length > 20 ? Math.ceil(chartData.length / 8) : 0} />
            <YAxis axisLine={false} tickLine={false} width={58} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={value => `฿${Number(value) / 1000}k`} />
            <Tooltip
              formatter={(value: number) => [formatCurrencyTHB(value), 'ยอดขาย']}
              labelStyle={{ color: '#0F172A', fontWeight: 800 }}
              contentStyle={{ borderRadius: 14, border: '1px solid #D7E8FF', boxShadow: '0 16px 34px rgba(15,23,42,0.12)' }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#4A90E2"
              strokeWidth={3}
              fill="url(#dashboard-revenue)"
              dot={false}
              activeDot={{ r: 5, fill: '#4A90E2', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState compact eyebrow="No Sales Data" title="ยังไม่มียอดขายในช่วงวันที่นี้" subtitle="ลองเลือกช่วงวันที่อื่น หรือรอให้ออเดอร์ใหม่ถูกบันทึกในระบบ" />
      )}
    </Paper>
  );
}

function RecentOrders({ orders }: Readonly<{ orders: NormalizedOrder[] }>) {
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, overflow: 'hidden' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ p: 2.3, borderBottom: '1px solid #E5E7EB' }}>
        <Box>
          <Typography sx={{ color: '#0F172A', fontSize: 20, fontWeight: 900 }}>Recent Orders</Typography>
          <Typography sx={{ mt: 0.3, color: '#64748B', fontSize: 13 }}>ออเดอร์ล่าสุด {orders.length.toLocaleString('th-TH')} รายการ</Typography>
        </Box>
        <Button component={Link} href="/home/orders" size="small" variant="outlined" sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 800 }}>
          ดูทั้งหมด
        </Button>
      </Stack>
      {orders.length ? (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 850 }}>
            <TableHead>
              <TableRow>
                {['Order No.', 'Customer', 'Total', 'Payment', 'Status', 'Created At', 'Action'].map(label => (
                  <TableCell key={label} sx={{ bgcolor: '#F8FAFC', color: '#64748B', fontSize: 12, fontWeight: 900, borderBottom: '1px solid #E5E7EB', py: 1.4 }}>
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map(order => {
                const status = getStatusMeta(order.status);
                return (
                  <TableRow key={order._id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9', py: 1.5 } }}>
                    <TableCell sx={{ color: '#2563EB', fontWeight: 900 }}>{getDisplayOrderNumber(order)}</TableCell>
                    <TableCell>
                      <Typography sx={{ color: '#0F172A', fontSize: 13, fontWeight: 800 }}>{order.customerName || 'ไม่ระบุชื่อลูกค้า'}</Typography>
                      <Typography sx={{ color: '#94A3B8', fontSize: 12 }}>{order.phoneNumber || '-'}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#0F172A', fontWeight: 900 }}>{formatCurrencyTHB(order.grandTotal)}</TableCell>
                    <TableCell sx={{ color: '#334155', fontWeight: 700 }}>{getPaymentLabel(order.payment)}</TableCell>
                    <TableCell>
                      <Chip size="small" label={status.label} sx={{ bgcolor: status.bg, color: status.color, border: `1px solid ${status.border}`, fontWeight: 800 }} />
                    </TableCell>
                    <TableCell sx={{ color: '#64748B', whiteSpace: 'nowrap' }}>{formatThaiDateTime(order.createdAt)}</TableCell>
                    <TableCell>
                      <Button component={Link} href="/home/orders" size="small" startIcon={<VisibilityRoundedIcon />} sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 800 }}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ p: 2.5 }}>
          <EmptyState compact eyebrow="No Orders" title="ยังไม่มีออเดอร์ล่าสุด" subtitle="เมื่อมีออเดอร์ใหม่ รายการจะปรากฏที่นี่" />
        </Box>
      )}
    </Paper>
  );
}

function UploadQueue({ uploads, metrics }: Readonly<{ uploads: StorageRow[]; metrics: DashboardMetrics }>) {
  const latestUploads = uploads.slice(0, 5);
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, p: 2.3, height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
        <Box>
          <Typography sx={{ color: '#0F172A', fontSize: 19, fontWeight: 900 }}>Upload Queue</Typography>
          <Typography sx={{ mt: 0.3, color: '#64748B', fontSize: 13 }}>คิวไฟล์จากหน้าอัปโหลดสาธารณะ</Typography>
        </Box>
        <Box sx={{ width: 44, height: 44, borderRadius: '15px', bgcolor: alpha('#06B6D4', 0.12), color: '#0891B2', display: 'grid', placeItems: 'center' }}>
          <CloudUploadRoundedIcon />
        </Box>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1, my: 2 }}>
        {[
          ['ไฟล์ใหม่วันนี้', metrics.newUploadsToday, '#06B6D4'],
          ['รอตรวจสอบ', metrics.uploadWaiting, '#F59E0B'],
          ['กำลังดำเนินการ', metrics.uploadProcessing, '#3B82F6'],
          ['เสร็จสิ้น', metrics.uploadCompleted, '#10B981'],
        ].map(([label, value, color]) => (
          <Box key={String(label)} sx={{ borderRadius: '16px', bgcolor: alpha(String(color), 0.08), border: `1px solid ${alpha(String(color), 0.22)}`, p: 1.4 }}>
            <Typography sx={{ color: String(color), fontWeight: 900, fontSize: 22 }}>{Number(value).toLocaleString('th-TH')}</Typography>
            <Typography sx={{ color: '#64748B', fontWeight: 700, fontSize: 12 }}>{label}</Typography>
          </Box>
        ))}
      </Box>
      <Divider sx={{ mb: 1.4 }} />
      <Stack spacing={1.1}>
        {latestUploads.length ? (
          latestUploads.map(upload => (
            <Stack key={upload.id} direction="row" justifyContent="space-between" spacing={1.5} sx={{ minWidth: 0 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ color: '#0F172A', fontSize: 13, fontWeight: 800 }}>
                  {upload.customerName}
                </Typography>
                <Typography noWrap sx={{ color: '#64748B', fontSize: 12 }}>
                  {upload.files[0]?.name ?? upload.jobType}
                </Typography>
              </Box>
              <Chip size="small" label={getStorageStatusLabel(upload.status)} sx={{ flexShrink: 0, bgcolor: '#F8FAFC', color: '#334155', fontWeight: 800 }} />
            </Stack>
          ))
        ) : (
          <Typography sx={{ color: '#94A3B8', fontSize: 13 }}>ยังไม่มีไฟล์อัปโหลดในคิว</Typography>
        )}
      </Stack>
    </Paper>
  );
}

/*
function BestSellers({ bestSellers, products }: Readonly<{ bestSellers: BestSeller[]; products: Product[] }>) {
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, p: 2.3, height: '100%' }}>
      <Typography sx={{ color: '#0F172A', fontSize: 19, fontWeight: 900 }}>Best Selling Products</Typography>
      <Typography sx={{ mt: 0.3, color: '#64748B', fontSize: 13 }}>จัดอันดับจากรายการสินค้าในออเดอร์</Typography>
      <Stack spacing={1.2} sx={{ mt: 2 }}>
        {bestSellers.length ? (
          bestSellers.map((item, index) => (
            <Stack key={item.name} direction="row" alignItems="center" spacing={1.4}>
              <Box sx={{ width: 30, height: 30, borderRadius: '10px', bgcolor: index === 0 ? '#EAF4FF' : '#F8FAFC', color: '#2563EB', display: 'grid', placeItems: 'center', fontWeight: 900 }}>
                {index + 1}
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography noWrap sx={{ color: '#0F172A', fontSize: 13.5, fontWeight: 800 }}>
                  {item.name}
                </Typography>
                <Typography sx={{ color: '#64748B', fontSize: 12 }}>
                  {item.quantity.toLocaleString('th-TH')} ชิ้น{item.revenue !== null ? ` · ${formatCurrencyTHB(item.revenue)}` : ''}
                </Typography>
              </Box>
            </Stack>
          ))
        ) : (
          <EmptyState
            compact
            eyebrow="No Item Data"
            title="ยังไม่มีข้อมูลสินค้าขายดี"
            subtitle={products.length ? 'รอให้ออเดอร์มีรายการสินค้าเพื่อจัดอันดับ' : 'ยังโหลดรายการสินค้าไม่ได้ จึงแสดงอันดับจากออเดอร์เท่านั้นเมื่อมีข้อมูล'}
          />
        )}
      </Stack>
    </Paper>
  );
}

*/
function QuickActions() {
  const actions = [
    { label: 'สร้างออเดอร์ใหม่', href: '/home/posseller', icon: AddShoppingCartRoundedIcon, color: '#4A90E2' },
    { label: 'ขายด่วน', href: '/home/posseller', icon: PointOfSaleRoundedIcon, color: '#10B981' },
    { label: 'ดูออเดอร์ทั้งหมด', href: '/home/orders', icon: ReceiptLongRoundedIcon, color: '#3B82F6' },
    { label: 'จัดการสินค้า', href: '/home/products', icon: Inventory2RoundedIcon, color: '#F59E0B' },
    { label: 'ดูไฟล์อัปโหลด', href: '/home/storage', icon: CloudUploadRoundedIcon, color: '#06B6D4' },
    { label: 'สรุปรายงานขาย', href: '/home/orders', icon: BarChartRoundedIcon, color: '#7C3AED' },
  ];

  return (
    <Paper elevation={0} sx={{ ...CARD_SX, p: 2.3 }}>
      <Typography sx={{ color: '#0F172A', fontSize: 19, fontWeight: 900 }}>Quick Actions</Typography>
      <Box sx={{ mt: 1.6, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 1.1 }}>
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <Paper
              key={action.label}
              component={Link}
              href={action.href}
              elevation={0}
              sx={{
                p: 1.4,
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                textDecoration: 'none',
                bgcolor: '#FFFFFF',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-2px)', borderColor: alpha(action.color, 0.38), bgcolor: alpha(action.color, 0.06) },
              }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 34, height: 34, borderRadius: '12px', bgcolor: alpha(action.color, 0.12), color: action.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon sx={{ fontSize: 18 }} />
                </Box>
                <Typography sx={{ color: '#0F172A', fontSize: 12.5, fontWeight: 900, lineHeight: 1.25 }}>{action.label}</Typography>
              </Stack>
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );
}

export default function DashboardPage() {
  const [orders, setOrders] = React.useState<NormalizedOrder[]>([]);
  const [uploads, setUploads] = React.useState<StorageRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [missingApiBase, setMissingApiBase] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null);

  const loadDashboard = React.useCallback(async () => {
    if (!hasApiBaseUrl()) {
      setMissingApiBase(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setMissingApiBase(false);
    setLoadError(null);

    try {
      const [ordersResult, uploadsResult] = await Promise.allSettled([fetchOrders(), fetchUploadsSafely()]);

      if (ordersResult.status === 'fulfilled') {
        setOrders(sortOrdersByNewest(ordersResult.value));
      } else {
        setOrders([]);
        setLoadError('ไม่สามารถโหลดออเดอร์ได้ในขณะนี้ แดชบอร์ดจะแสดงข้อมูลเท่าที่มี');
      }

      setUploads(uploadsResult.status === 'fulfilled' ? uploadsResult.value.sort((left, right) => new Date(right.uploadDate).getTime() - new Date(left.uploadDate).getTime()) : []);
      setLastUpdated(new Date());
    } catch (error) {
      setOrders([]);
      setUploads([]);
      if (isMissingApiBaseError(error)) {
        setMissingApiBase(true);
      } else {
        setLoadError(error instanceof Error && error.message ? error.message : 'ไม่สามารถโหลดข้อมูลแดชบอร์ดได้ กรุณาลองรีเฟรชอีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const metrics = React.useMemo(() => calculateDashboardMetrics(orders, uploads), [orders, uploads]);
  const kpis = React.useMemo<KpiItem[]>(
    () => [
      { label: 'ยอดขายวันนี้', value: metrics.salesToday, prefix: '฿', accent: '#7C3AED', icon: PaidRoundedIcon, series: metrics.salesSeries7d },
      { label: 'ยอดขายเดือนนี้', value: metrics.salesThisMonth, prefix: '฿', accent: '#10B981', icon: LocalAtmRoundedIcon, series: metrics.salesSeries7d },
      {
        label: 'ออเดอร์วันนี้',
        value: metrics.ordersToday,
        suffix: 'งาน',
        accent: '#3B82F6',
        icon: ShoppingBagRoundedIcon,
        series: metrics.salesSeries7d.map((_, index) => (index === metrics.salesSeries7d.length - 1 ? metrics.ordersToday : 0)),
      },
      {
        label: 'ลูกค้าวันนี้',
        value: metrics.customersToday,
        suffix: 'คน',
        accent: '#EC4899',
        icon: PeopleAltRoundedIcon,
        series: metrics.salesSeries7d.map((_, index) => (index === metrics.salesSeries7d.length - 1 ? metrics.customersToday : 0)),
      },
      { label: 'งานค้างผลิต', value: metrics.pendingProduction, suffix: 'งาน', accent: '#F59E0B', icon: LocalPrintshopRoundedIcon, series: metrics.productionStatuses.map(status => status.count) },
      {
        label: 'รอชำระเงิน',
        value: metrics.waitingPayment,
        suffix: 'งาน',
        accent: '#10B981',
        icon: LocalAtmRoundedIcon,
        series: metrics.productionStatuses.map(status => (status.key === 'waiting_payment' ? status.count : 0)),
      },
      {
        label: 'ไฟล์ใหม่วันนี้',
        value: metrics.newUploadsToday,
        suffix: 'ไฟล์',
        accent: '#06B6D4',
        icon: CloudUploadRoundedIcon,
        series: [metrics.uploadWaiting, metrics.uploadProcessing, metrics.uploadCompleted, metrics.newUploadsToday],
      },
    ],
    [metrics]
  );

  if (loading && !lastUpdated) {
    return (
      <AdminPageContainer>
        <LoadingState />
      </AdminPageContainer>
    );
  }

  if (missingApiBase) {
    return (
      <AdminPageContainer>
        <MissingApiConfigState />
      </AdminPageContainer>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <AdminPageContainer>
        <Box sx={{ mb: 2.5 }}>
          <QuickActions />
        </Box>
        <DashboardHeader isRefreshing={loading} lastUpdated={lastUpdated} loadError={loadError} onRefresh={loadDashboard} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))', xl: 'repeat(7, minmax(0, 1fr))' }, gap: 1.8, mb: 2.5 }}>
          {kpis.map(item => (
            <KpiCard key={item.label} item={item} />
          ))}
        </Box>

        <Paper elevation={0} sx={{ ...CARD_SX, p: { xs: 2, md: 2.4 }, mb: 2.5 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 1.8 }}>
            <Box>
              <Typography sx={{ color: '#0F172A', fontSize: 20, fontWeight: 900 }}>Production Status</Typography>
              <Typography sx={{ mt: 0.3, color: '#64748B', fontSize: 13 }}>ภาพรวม workflow งานพิมพ์ตั้งแต่ตรวจไฟล์จนถึงส่งมอบ</Typography>
            </Box>
          </Stack>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))' }, gap: 1.4 }}>
            {metrics.productionStatuses.map(status => (
              <ProductionStatusCard key={status.key} status={status} />
            ))}
          </Box>
        </Paper>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.6fr) minmax(320px, 0.9fr)' }, gap: 2.5, alignItems: 'stretch', mb: 2.5 }}>
          <SalesChart orders={orders} />
          <Stack spacing={2.5} sx={{ minWidth: 0 }}>
            <UploadQueue uploads={uploads} metrics={metrics} />
          </Stack>
        </Box>

        <Box sx={{ mb: 2.5 }}>
          <RecentOrders orders={orders.slice(0, 8)} />
        </Box>
      </AdminPageContainer>
    </Box>
  );
}
