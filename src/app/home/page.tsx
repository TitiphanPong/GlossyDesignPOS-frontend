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
  helper?: string;
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
  cashToday: number;
  promptPayToday: number;
  salesYesterday: number;
  ordersYesterday: number;
};

type BestSeller = { name: string; quantity: number; revenue: number };

type ChartPoint = {
  label: string;
  value: number;
};

const CARD_SX = {
  borderRadius: '18px',
  border: '1px solid #E2E8F0',
  bgcolor: '#FFFFFF',
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
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

type DateInput = string | Date | null | undefined;

function isSameDay(value: DateInput, compare = dayjs()) {
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
  return stringifyPrimitive(value).toLowerCase().trim().replace(/\s+/g, '_').replaceAll('-', '_');
}

function getStatusMeta(status: unknown): StatusMeta {
  const key = normalizeStatusKey(status);
  const thaiValue = stringifyPrimitive(status).trim();

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

function stringifyPrimitive(value: unknown, fallback = ''): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint' || typeof value === 'boolean') {
    return String(value);
  }

  return fallback;
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

/* NOSONAR -- archived implementation retained for product comparison.
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
  const yesterdayOrders = orders.filter(order => getOrderDate(order)?.isSame(now.subtract(1, 'day'), 'day'));
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
    cashToday: ordersToday.filter(order => order.payment === 'cash').reduce((sum, order) => sum + getOrderAmount(order), 0),
    promptPayToday: ordersToday.filter(order => order.payment === 'promptpay').reduce((sum, order) => sum + getOrderAmount(order), 0),
    salesYesterday: yesterdayOrders.reduce((sum, order) => sum + getOrderAmount(order), 0),
    ordersYesterday: yesterdayOrders.length,
  };
}

function calculateBestSellers(orders: NormalizedOrder[]): BestSeller[] {
  const totals = new Map<string, BestSeller>();
  for (const order of orders) {
    for (const item of order.cart) {
      const name = item.name?.trim() || item.category?.trim() || 'ไม่ระบุบริการ';
      const quantity = Math.max(Number(item.qty ?? item.quantity ?? 0), 0);
      const revenue = Math.max(Number(item.totalPrice ?? item.total ?? 0), 0);
      const current = totals.get(name) ?? { name, quantity: 0, revenue: 0 };
      current.quantity += quantity;
      current.revenue += revenue;
      totals.set(name, current);
    }
  }
  return [...totals.values()].filter(item => item.quantity > 0).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
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
        minHeight: { xs: 'auto', lg: 128 },
        p: { xs: 2, md: 2.5 },
        overflow: 'hidden',
        borderRadius: '20px',
        border: '1px solid #DDE5EF',
        bgcolor: '#FFFFFF',
        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
        position: 'relative',
      }}>
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', lg: 'center' }}
        spacing={{ xs: 2.4, lg: 3 }}
        sx={{ position: 'relative', minHeight: { lg: 76 } }}>
        <Box sx={{ minWidth: 0, maxWidth: 780 }}>
          <Typography
            variant="h3"
            sx={{
              color: '#020617',
              fontWeight: 800,
              fontSize: { xs: 26, md: 28 },
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
            }}>
            ภาพรวมร้าน
          </Typography>
          <Typography sx={{ mt: .65, color: '#64748B', fontSize: { xs: 13.5, md: 14 }, lineHeight: 1.55 }}>ติดตามยอดขาย งาน และสถานะร้านวันนี้</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0, sm: 1 }} sx={{ mt: .65 }}>
            <Typography sx={{ color: '#94A3B8', fontSize: 12, fontWeight: 500 }}>{formatThaiFullDate(lastUpdated)}</Typography>
            <Typography sx={{ color: '#94A3B8', fontSize: 12, fontWeight: 500 }}>· อัปเดต {formatThaiDateTime(lastUpdated)}</Typography>
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
              display: 'none',
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
          <Button component={Link} href="/home/orders" startIcon={<FileDownloadRoundedIcon />} variant="outlined" sx={{ ...headerButtonSx, display: 'none' }}>
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
  return (
    <Card
      elevation={0}
      sx={{
        ...CARD_SX,
        borderRadius: '18px',
        minWidth: 0,
        transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        '&:hover': { transform: 'translateY(-1px)', borderColor: alpha(item.accent, .35), boxShadow: '0 10px 28px rgba(15, 23, 42, .06)' },
      }}>
      <CardContent sx={{ p: { xs: 2, md: 2.25 }, '&:last-child': { pb: { xs: 2, md: 2.25 } } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#64748B', fontSize: 12.5, fontWeight: 700, letterSpacing: '.01em' }}>{item.label}</Typography>
            <Typography sx={{ mt: 1.25, color: '#0F172A', fontSize: { xs: 28, md: 31 }, fontWeight: 850, letterSpacing: '-0.045em', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
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
          <Box sx={{ width: 36, height: 36, borderRadius: '11px', bgcolor: alpha(item.accent, 0.09), color: item.accent, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Icon sx={{ fontSize: 19 }} />
          </Box>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={.75} sx={{ mt: 1.5 }}>
          <Box sx={{ width: 6, height: 6, borderRadius: 99, bgcolor: item.accent }} />
          <Typography sx={{ color: '#94A3B8', fontSize: 11.5, fontWeight: 650 }}>{item.helper ?? 'อัปเดตจากข้อมูลล่าสุดของร้าน'}</Typography>
        </Stack>
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
  const [range, setRange] = React.useState<'7' | '30' | 'month'>('7');

  const chartData = React.useMemo<ChartPoint[]>(() => {
    const end = dayjs().endOf('day');
    const start = range === 'month' ? dayjs().startOf('month') : dayjs().subtract(Number(range) - 1, 'day').startOf('day');

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
  }, [orders, range]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const average = chartData.length ? Math.round(total / chartData.length) : 0;
  const hasData = chartData.some(item => item.value > 0);

  return (
    <Paper elevation={0} sx={{ ...CARD_SX, p: { xs: 2, md: 2.6 }, height: '100%', minWidth: 0 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography sx={{ color: '#0F172A', fontSize: 18, fontWeight: 800 }}>ภาพรวมยอดขาย</Typography>
          <Typography sx={{ mt: 0.35, color: '#64748B', fontSize: 13 }}>แนวโน้มรายได้จากรายการขายจริง</Typography>
        </Box>
        <Stack direction="row" spacing={.5} sx={{ p: .4, borderRadius: 2.5, bgcolor: '#F1F5F9', alignSelf: { xs: 'stretch', md: 'flex-start' } }}>
          {([['7', '7 วัน'], ['30', '30 วัน'], ['month', 'เดือนนี้']] as const).map(([value, label]) => <Button key={value} size="small" onClick={() => setRange(value)} sx={{ flex: { xs: 1, md: 'initial' }, minWidth: { xs: 0, md: 64 }, px: 1.2, borderRadius: 2, color: range === value ? '#0F172A' : '#64748B', bgcolor: range === value ? '#FFFFFF' : 'transparent', boxShadow: range === value ? '0 1px 2px rgba(15,23,42,.08)' : 'none', fontSize: 12, fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: range === value ? '#FFFFFF' : '#E2E8F0' } }}>{label}</Button>)}
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
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="dashboard-revenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.32} />
                <stop offset="95%" stopColor="#4A90E2" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#EEF2F7" strokeDasharray="4 8" vertical={false} />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} interval={chartData.length > 20 ? Math.ceil(chartData.length / 8) : 0} />
            <YAxis axisLine={false} tickLine={false} width={50} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={value => `฿${Number(value) / 1000}k`} />
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
        <>
        <Box sx={{ display: { xs: 'block', sm: 'none' }, px: 1.5, pb: 1.5 }}>
          {orders.map(order => {
            const status = getStatusMeta(order.status);
            const service = order.cart[0]?.name ?? order.cart[0]?.category ?? 'ไม่ระบุบริการ';
            return (
              <Box key={order._id} component={Link} href="/home/orders" sx={{ display: 'block', py: 1.5, px: .5, color: 'inherit', textDecoration: 'none', borderBottom: '1px solid #EEF2F7', '&:last-child': { borderBottom: 0 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={.8} alignItems="center">
                      <Typography sx={{ color: '#2563EB', fontSize: 13, fontWeight: 850 }}>{getDisplayOrderNumber(order)}</Typography>
                      <Chip size="small" label={status.label} sx={{ height: 22, bgcolor: status.bg, color: status.color, border: `1px solid ${status.border}`, fontSize: 10.5, fontWeight: 800 }} />
                    </Stack>
                    <Typography noWrap sx={{ mt: .7, color: '#0F172A', fontSize: 13.5, fontWeight: 800 }}>{order.customerName || 'ไม่ระบุชื่อลูกค้า'}</Typography>
                    <Typography noWrap sx={{ mt: .2, color: '#64748B', fontSize: 12 }}>{service}</Typography>
                  </Box>
                  <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                    <Typography sx={{ color: '#0F172A', fontSize: 14, fontWeight: 850 }}>{formatCurrencyTHB(order.grandTotal)}</Typography>
                    <Typography sx={{ mt: .4, color: '#94A3B8', fontSize: 11.5 }}>{dayjs(order.createdAt).format('HH:mm')}</Typography>
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Box>
        <TableContainer sx={{ display: { xs: 'none', sm: 'block' }, overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 850 }}>
            <TableHead>
              <TableRow>
                {['Order', 'Customer', 'Service', 'Amount', 'Status', 'Time'].map(label => (
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
                    <TableCell sx={{ color: '#475569', fontWeight: 650, maxWidth: 220 }}>
                      <Typography noWrap sx={{ fontSize: 13 }}>{order.cart[0]?.name ?? order.cart[0]?.category ?? 'ไม่ระบุบริการ'}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#0F172A', fontWeight: 900 }}>{formatCurrencyTHB(order.grandTotal)}</TableCell>
                    <TableCell>
                      <Chip size="small" label={status.label} sx={{ bgcolor: status.bg, color: status.color, border: `1px solid ${status.border}`, fontWeight: 800 }} />
                    </TableCell>
                    <TableCell sx={{ color: '#64748B', whiteSpace: 'nowrap' }}>{dayjs(order.createdAt).format('HH:mm')}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        </>
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

/* NOSONAR -- archived implementation retained for product comparison.
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
function PaymentSummary({ metrics }: Readonly<{ metrics: DashboardMetrics }>) {
  const total = metrics.cashToday + metrics.promptPayToday;
  const methods = [
    { label: 'เงินสด', helper: 'รับที่หน้าร้าน', value: metrics.cashToday, color: '#0F766E', bg: '#F0FDFA', icon: LocalAtmRoundedIcon },
    { label: 'โอน / PromptPay', helper: 'ชำระผ่าน QR และโอนเงิน', value: metrics.promptPayToday, color: '#2563EB', bg: '#EFF6FF', icon: PaidRoundedIcon },
  ];
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, p: { xs: 2, md: 2.4 }, height: '100%' }}>
      <Typography sx={{ color: '#0F172A', fontSize: 17, fontWeight: 800 }}>ช่องทางการชำระเงิน</Typography>
      <Typography sx={{ mt: 0.25, color: '#64748B', fontSize: 12.5 }}>สรุปยอดรับเงินของวันนี้</Typography>

      <Box sx={{ mt: 2, pb: 1.8, borderBottom: '1px solid #EEF2F7' }}>
        <Typography sx={{ color: '#94A3B8', fontSize: 11.5, fontWeight: 700 }}>ยอดรับรวม</Typography>
        <Typography sx={{ mt: .4, color: '#0F172A', fontSize: { xs: 28, md: 32 }, lineHeight: 1, fontWeight: 850, letterSpacing: '-.04em', fontVariantNumeric: 'tabular-nums' }}>{formatCurrencyTHB(total)}</Typography>
        <Box sx={{ display: 'flex', mt: 1.5, height: 9, overflow: 'hidden', borderRadius: 99, bgcolor: '#F1F5F9' }}>
          {methods.map(method => <Box key={method.label} sx={{ width: `${total > 0 ? (method.value / total) * 100 : 0}%`, bgcolor: method.color, transition: 'width 180ms ease' }} />)}
        </Box>
      </Box>

      <Stack spacing={1} sx={{ mt: 1.4 }}>
        {methods.map(method => {
          const percent = total > 0 ? (method.value / total) * 100 : 0;
          const Icon = method.icon;
          return <Box key={method.label} sx={{ p: 1.35, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
            <Stack direction="row" alignItems="center" spacing={1.2}>
              <Box sx={{ width: 38, height: 38, display: 'grid', placeItems: 'center', flexShrink: 0, borderRadius: 2.5, color: method.color, bgcolor: method.bg }}><Icon sx={{ fontSize: 20 }} /></Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ color: '#334155', fontSize: 13, fontWeight: 800 }}>{method.label}</Typography>
                <Typography noWrap sx={{ mt: .1, color: '#94A3B8', fontSize: 10.5 }}>{method.helper}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                <Typography sx={{ color: '#0F172A', fontSize: 14, fontWeight: 850, fontVariantNumeric: 'tabular-nums' }}>{formatCurrencyTHB(method.value)}</Typography>
                <Typography sx={{ mt: .1, color: method.color, fontSize: 11, fontWeight: 800 }}>{Math.round(percent)}%</Typography>
              </Box>
            </Stack>
          </Box>;
        })}
      </Stack>
    </Paper>
  );
}

function AttentionRequired({ metrics }: Readonly<{ metrics: DashboardMetrics }>) {
  const items = [
    { label: 'งานรอดำเนินการ', value: metrics.productionStatuses.find(item => item.key === 'pending')?.count ?? 0, color: '#D97706', href: '/home/orders?status=pending' },
    { label: 'งานยังชำระไม่ครบ', value: metrics.waitingPayment, color: '#DC2626', href: '/home/orders?status=awaiting_payment' },
    { label: 'ไฟล์ใหม่รอตรวจสอบ', value: metrics.uploadWaiting, color: '#0891B2', href: '/home/storage' },
    { label: 'งานพร้อมให้ลูกค้ารับ', value: metrics.productionStatuses.find(item => item.key === 'ready')?.count ?? 0, color: '#7C3AED', href: '/home/orders?status=ready_for_pickup' },
  ];
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, p: 2.3 }}>
      <Stack direction="row" spacing={1.2} alignItems="center">
        <WarningAmberRoundedIcon sx={{ color: '#D97706' }} />
        <Box><Typography sx={{ color: '#0F172A', fontSize: 19, fontWeight: 900 }}>ต้องตรวจสอบ</Typography><Typography sx={{ color: '#64748B', fontSize: 13 }}>สิ่งที่ควรจัดการต่อในตอนนี้</Typography></Box>
      </Stack>
      <Stack spacing={0.8} sx={{ mt: 1.7 }}>
        {items.map(item => <Button key={item.label} component={Link} href={item.href} fullWidth sx={{ justifyContent: 'space-between', borderRadius: 3, px: 1.4, py: 1.1, color: '#334155', bgcolor: '#F8FAFC', textTransform: 'none' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 750 }}>{item.label}</Typography><Chip size="small" label={item.value} sx={{ bgcolor: alpha(item.color, .11), color: item.color, fontWeight: 900 }} />
        </Button>)}
      </Stack>
    </Paper>
  );
}

function PopularServices({ items }: Readonly<{ items: BestSeller[] }>) {
  return <Paper elevation={0} sx={{ ...CARD_SX, p: 2.3 }}>
    <Typography sx={{ color: '#0F172A', fontSize: 19, fontWeight: 900 }}>บริการขายดี</Typography>
    <Typography sx={{ mt: .3, color: '#64748B', fontSize: 13 }}>จัดอันดับจากรายการสินค้าในออเดอร์จริง</Typography>
    {items.length ? <Stack spacing={1.2} sx={{ mt: 1.8 }}>{items.map((item, index) => <Stack key={item.name} direction="row" alignItems="center" spacing={1.2}>
      <Box sx={{ width: 28, height: 28, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: index === 0 ? '#EAF4FF' : '#F1F5F9', color: '#2563EB', fontWeight: 900 }}>{index + 1}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}><Typography noWrap sx={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>{item.name}</Typography><Typography sx={{ fontSize: 12, color: '#64748B' }}>{item.quantity.toLocaleString('th-TH')} ชิ้น · {formatCurrencyTHB(item.revenue)}</Typography></Box>
    </Stack>)}</Stack> : <Box sx={{ mt: 1.5 }}><EmptyState compact eyebrow="No sales yet" title="ยังไม่มีข้อมูลบริการขายดี" subtitle="ข้อมูลจะแสดงเมื่อออเดอร์มีรายการสินค้า" /></Box>}
  </Paper>;
}

function QuickActions() {
  const actions = [
    { label: 'ขายหน้าร้าน', href: '/home/posseller', icon: AddShoppingCartRoundedIcon, color: '#2563EB', primary: true },
    { label: 'ขายด่วน', href: '/home/posseller', icon: PointOfSaleRoundedIcon, color: '#10B981' },
    { label: 'ดูออเดอร์ทั้งหมด', href: '/home/orders', icon: ReceiptLongRoundedIcon, color: '#3B82F6' },
    { label: 'ดูไฟล์อัปโหลด', href: '/home/storage', icon: CloudUploadRoundedIcon, color: '#06B6D4' },
    { label: 'สรุปรายงานขาย', href: '/home/orders', icon: BarChartRoundedIcon, color: '#7C3AED' },
  ];

  return (
    <Paper elevation={0} sx={{ ...CARD_SX, p: 2.3 }}>
      <Typography sx={{ color: '#0F172A', fontSize: 16, fontWeight: 850 }}>ทางลัดสำหรับพนักงาน</Typography>
      <Box sx={{ mt: 1.3, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, 1fr)' }, gap: 1 }}>
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
                border: action.primary ? '1px solid #2563EB' : '1px solid #E5E7EB',
                textDecoration: 'none',
                bgcolor: action.primary ? '#2563EB' : '#FFFFFF',
                transition: 'background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease, transform 100ms ease',
                '&:hover': { transform: 'translateY(-1px)', borderColor: alpha(action.color, 0.5), bgcolor: action.primary ? '#1D4ED8' : alpha(action.color, 0.06) },
              }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 34, height: 34, borderRadius: '12px', bgcolor: action.primary ? alpha('#FFFFFF', .16) : alpha(action.color, 0.12), color: action.primary ? '#FFFFFF' : action.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon sx={{ fontSize: 18 }} />
                </Box>
                <Typography sx={{ color: action.primary ? '#FFFFFF' : '#0F172A', fontSize: 12.5, fontWeight: 850, lineHeight: 1.25 }}>{action.label}</Typography>
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

      setUploads(uploadsResult.status === 'fulfilled' ? uploadsResult.value.toSorted((left, right) => new Date(right.uploadDate).getTime() - new Date(left.uploadDate).getTime()) : []);
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
  const bestSellers = React.useMemo(() => calculateBestSellers(orders), [orders]);
  const allKpis = React.useMemo<KpiItem[]>(
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

  const kpis = React.useMemo(() => [{
    ...allKpis[0],
    helper: metrics.salesYesterday > 0
      ? `${metrics.salesToday >= metrics.salesYesterday ? '↑' : '↓'} ${Math.abs(((metrics.salesToday - metrics.salesYesterday) / metrics.salesYesterday) * 100).toFixed(1)}% จากเมื่อวาน`
      : 'ยอดขายที่บันทึกวันนี้',
  }, {
    ...allKpis[2],
    helper: `${metrics.ordersToday - metrics.ordersYesterday >= 0 ? '+' : ''}${metrics.ordersToday - metrics.ordersYesterday} จากเมื่อวาน`,
  }, allKpis[4], {
    label: 'งานพร้อมรับ / รอส่งมอบ',
    value: metrics.productionStatuses.find(status => status.key === 'ready')?.count ?? 0,
    suffix: 'งาน',
    accent: '#7C3AED',
    icon: AssignmentTurnedInRoundedIcon,
    series: metrics.productionStatuses.map(status => status.key === 'ready' ? status.count : 0),
  }], [allKpis, metrics.ordersToday, metrics.ordersYesterday, metrics.productionStatuses, metrics.salesToday, metrics.salesYesterday]);

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
        <DashboardHeader isRefreshing={loading} lastUpdated={lastUpdated} loadError={loadError} onRefresh={loadDashboard} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: { xs: 1.2, md: 1.8 }, mb: 2.5 }}>
          {kpis.map(item => (
            <KpiCard key={item.label} item={item} />
          ))}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.65fr) minmax(300px, .75fr)' }, gap: 2.5, mb: 2.5, alignItems: 'stretch' }}>
          <SalesChart orders={orders} />
          <PaymentSummary metrics={metrics} />
        </Box>

        <Box sx={{ mb: 2.5 }}>
          <RecentOrders orders={orders.slice(0, 8)} />
        </Box>
        {false && <><ProductionStatusCard status={metrics.productionStatuses[0]} /><AttentionRequired metrics={metrics} /><PopularServices items={bestSellers} /><QuickActions /><UploadQueue uploads={uploads} metrics={metrics} /></>}
      </AdminPageContainer>
    </Box>
  );
}
