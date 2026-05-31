'use client';

import * as React from 'react';
import {
  alpha,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import Link from 'next/link';
import AdminPageContainer from '../components/AdminPageContainer';
import JobTimelineCard, { type JobTimelineCardItem } from '../components/JobTimelineCard';
import { commonButtonSx, statusChipSx, uiCardSx } from '../components/adminUi';
import { EmptyState, MissingApiConfigState } from '../components/dashboardUi';
import { fetchApi, isMissingApiBaseError } from '../../../lib/api';
import { fetchOrders } from '../../../lib/orders';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import PayRemainingModal from '../saleListPage/components/PayRemainingModal';
import { ApiOrder, getDisplayOrderNumber, normalizeApiCartItem, normalizeApiOrderAmounts, type OrderStatus, type PaymentMethod } from '../../../lib/contracts';

type PaymentStatus = OrderStatus;
type SortOrder = 'newest' | 'oldest' | 'high' | 'low';
type ExportType = 'excel' | 'pdf' | 'sales';

const DAYS_TH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const MONTHS_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const STATUS_LABELS_TH: Record<PaymentStatus, string> = {
  pending: 'รอชำระเงิน',
  partial: 'ชำระบางส่วน',
  paid: 'ชำระแล้ว',
  cancelled: 'ยกเลิกงาน',
};
const FILTER_STATUS_LABELS: Record<'all' | PaymentStatus, string> = {
  all: 'ทั้งหมด',
  ...STATUS_LABELS_TH,
};
const PAYMENT_METHOD_LABELS_TH: Record<PaymentMethod, string> = {
  cash: 'เงินสด',
  promptpay: 'พร้อมเพย์',
};
const SORT_ORDER_LABELS: Record<SortOrder, string> = {
  newest: 'ล่าสุด',
  oldest: 'เก่าสุด',
  high: 'ยอดรวมสูงสุด',
  low: 'ยอดรวมต่ำสุด',
};

type OrderProduct = {
  name: string;
  qty: number;
  price: number;
};

type TimelineEvent = {
  title: string;
  at: string;
  note?: string;
};

type OrderRow = {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  phoneNumber: string;
  lineId: string;
  email: string;
  address: string;
  date: string;
  month: string;
  salesChannel: string;
  staffName: string;
  status: PaymentStatus;
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  products: OrderProduct[];
  timeline: TimelineEvent[];
};

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return 0;
}

function mapApiOrderToRow(order: ApiOrder): OrderRow {
  const createdAt = order.createdAt || dayjs().toISOString();
  const products = (order.cart ?? []).map(item => {
    const qty = Math.max(1, toNumber(item.quantity ?? item.qty));
    const lineTotal = toNumber(item.totalPrice ?? item.lineTotal) || toNumber(item.price ?? item.unitPrice) * qty;
    const unitPrice = qty > 0 ? lineTotal / qty : 0;
    const normalizedItem = normalizeApiCartItem(item);
    return {
      name: item.name || item.category || 'สินค้าไม่ระบุชื่อ',
      qty: normalizedItem.quantity,
      price: normalizedItem.unitPrice || unitPrice,
    };
  });

  const amounts = normalizeApiOrderAmounts(order);
  const status = order.status;
  const timeline: TimelineEvent[] = [{ title: 'สร้างรายการงาน', at: createdAt }];

  if (status === 'paid') {
    timeline.push({ title: 'ชำระเงินเรียบร้อย', at: createdAt });
  }
  if (status === 'pending') {
    timeline.push({ title: 'รอชำระเงิน', at: createdAt });
  }
  if (status === 'partial') {
    timeline.push({ title: 'รับชำระบางส่วนแล้ว', at: createdAt });
  }
  if (status === 'cancelled') {
    timeline.push({ title: 'ยกเลิกรายการงาน', at: createdAt });
  }

  return {
    id: order._id || order.orderId,
    orderId: order.orderId,
    orderNumber: getDisplayOrderNumber(order),
    customerName: order.customerName || 'ลูกค้าไม่ระบุชื่อ',
    phoneNumber: order.phoneNumber || '-',
    lineId: '-',
    email: '-',
    address: '-',
    date: createdAt,
    month: dayjs(createdAt).format('YYYY-MM'),
    salesChannel: '-',
    staffName: '-',
    status,
    subtotal: amounts.subtotal,
    discount: amounts.discount,
    vat: amounts.vatAmount,
    total: amounts.grandTotal,
    paidAmount: amounts.paidAmount,
    paymentMethod: order.payment,
    products,
    timeline,
  };
}

async function fetchOrderRows(): Promise<OrderRow[]> {
  const orders = await fetchOrders();
  return orders.map(mapApiOrderToRow);
}

async function updateOrderStatus(orderId: string, status: PaymentStatus): Promise<void> {
  const endpoints = [`/orders/${orderId}/status`, `/orders/${orderId}`];
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      await fetchApi(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('update_request_failed');
    }
  }

  throw lastError ?? new Error('update_request_failed');
}

const MotionDiv = motion.div;
const ORDER_TABLE_STATUS_UI: Record<PaymentStatus, { label: string; dot: string }> = {
  paid: { label: STATUS_LABELS_TH.paid, dot: '#16A34A' },
  pending: { label: STATUS_LABELS_TH.pending, dot: '#4F46E5' },
  partial: { label: STATUS_LABELS_TH.partial, dot: '#B45309' },
  cancelled: { label: STATUS_LABELS_TH.cancelled, dot: '#9CA3AF' },
};

const ORDER_TABLE_PAYMENT_LABEL: Record<PaymentMethod, string> = {
  cash: PAYMENT_METHOD_LABELS_TH.cash,
  promptpay: PAYMENT_METHOD_LABELS_TH.promptpay,
};

function formatMoney(amount: number) {
  return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatTableCurrency(amount: number) {
  return `฿ ${amount.toLocaleString('th-TH')}`;
}

function getCustomerInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed[0].toUpperCase() : '?';
}

function buildOrderLineSummary(row: OrderRow): { primary: string; secondary: string } {
  const primaryItem = row.products[0];
  const itemCount = row.products.length;
  const totalQty = row.products.reduce((sum, item) => sum + Math.max(0, item.qty || 0), 0);
  const primary = primaryItem?.name?.trim() || 'ไม่มีรายละเอียดรายการ';

  if (itemCount <= 1) {
    return {
      primary,
      secondary: `${Math.max(totalQty, 1)} ชิ้น`,
    };
  }

  return {
    primary,
    secondary: `${itemCount} รายการ • ${Math.max(totalQty, itemCount)} ชิ้น`,
  };
}

function formatOrderRowTime(value: string): { relative: string; exact: string } {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { relative: 'ไม่ทราบเวลา', exact: '-' };
  }

  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);

  if (mins < 1) {
    return {
      relative: 'เมื่อสักครู่',
      exact: date.toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
  }

  if (mins < 60) {
    return {
      relative: `${mins} นาทีที่แล้ว`,
      exact: date.toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
  }

  if (hours < 24) {
    return {
      relative: `${hours} ชั่วโมงที่แล้ว`,
      exact: date.toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    };
  }

  return {
    relative: date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
    exact: date.toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
  };
}

function formatThaiFullDate(value: dayjs.Dayjs | null): string {
  if (!value) return 'กำลังโหลดวันที่';
  const date = value.toDate();
  return `วัน${DAYS_TH[date.getDay()]}ที่ ${date.getDate()} ${MONTHS_TH[date.getMonth()]} พ.ศ. ${date.getFullYear() + 543}`;
}

function formatMonthFilterLabel(month: string): string {
  const [year, monthIndexText] = month.split('-');
  const monthIndex = Number(monthIndexText) - 1;
  const yearNumber = Number(year);

  if (!Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11 || !Number.isInteger(yearNumber)) {
    return month;
  }

  return `${MONTHS_TH[monthIndex]} ${yearNumber + 543}`;
}

function buildOrderPaymentTimelineSubtitle(order: OrderRow): string {
  const remaining = Math.max(order.total - order.paidAmount, 0);

  if (order.status === 'paid') {
    return `ชำระครบแล้วผ่าน ${PAYMENT_METHOD_LABELS_TH[order.paymentMethod]}`;
  }

  if (order.status === 'partial') {
    return `ชำระแล้ว ฿${formatMoney(order.paidAmount)} คงเหลือ ฿${formatMoney(remaining)}`;
  }

  if (order.status === 'cancelled') {
    return 'รายการนี้ถูกยกเลิกและหยุดการดำเนินงานแล้ว';
  }

  return `สถานะปัจจุบัน: ${STATUS_LABELS_TH[order.status]}`;
}

function buildOrderTimelineItems(order: OrderRow): JobTimelineCardItem[] {
  const activeStage: 'created' | 'payment' = order.status === 'pending' ? 'created' : 'payment';
  let productionSubtitle = 'รอเข้าสู่กระบวนการผลิต';

  if (order.status === 'paid' || order.status === 'partial') {
    productionSubtitle = 'พร้อมส่งต่อเข้ากระบวนการผลิต';
  } else if (order.status === 'cancelled') {
    productionSubtitle = 'หยุดการดำเนินการตามสถานะรายการงาน';
  }

  const steps: Array<{ id: string; title: string; subtitle: string; icon: React.ReactNode; active: boolean }> = [
    {
      id: 'order-created',
      title: 'สร้างรายการงาน',
      subtitle: 'บันทึกคำสั่งซื้อเข้าสู่ระบบ',
      icon: <ReceiptLongRoundedIcon sx={{ fontSize: 18 }} />,
      active: activeStage === 'created',
    },
    {
      id: 'order-confirmed',
      title: 'ยืนยันข้อมูลลูกค้าและรายการผลิต',
      subtitle: 'ตรวจสอบรายละเอียดงานก่อนดำเนินการ',
      icon: <FactCheckRoundedIcon sx={{ fontSize: 18 }} />,
      active: false,
    },
    {
      id: 'order-payment',
      title: 'อัปเดตสถานะการชำระเงิน',
      subtitle: buildOrderPaymentTimelineSubtitle(order),
      icon: <PaymentsRoundedIcon sx={{ fontSize: 18 }} />,
      active: activeStage === 'payment',
    },
    {
      id: 'order-production',
      title: 'เตรียมงานผลิต / พิมพ์',
      subtitle: productionSubtitle,
      icon: <PrintRoundedIcon sx={{ fontSize: 18 }} />,
      active: false,
    },
  ];

  return steps.map((step, index) => ({
    id: step.id,
    title: step.title,
    subtitle: step.subtitle,
    icon: step.icon,
    active: step.active,
    pillLabel: step.active ? 'ล่าสุด' : `ขั้นตอน ${index + 1}`,
  }));
}

function statusChip(status: PaymentStatus) {
  if (status === 'paid') {
    return <Chip label={STATUS_LABELS_TH[status]} color="success" size="small" sx={statusChipSx} />;
  }
  if (status === 'pending') {
    return <Chip label={STATUS_LABELS_TH[status]} color="warning" size="small" sx={statusChipSx} />;
  }
  if (status === 'partial') {
    return <Chip label={STATUS_LABELS_TH[status]} color="info" size="small" sx={statusChipSx} />;
  }
  return <Chip label={STATUS_LABELS_TH[status]} color="error" size="small" sx={statusChipSx} />;
}

function getLoadOrdersErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'โหลดรายการงานไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
}

function matchesSearch(row: OrderRow, search: string): boolean {
  const normalizedQuery = search.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }
  return row.customerName.toLowerCase().includes(normalizedQuery) || row.orderNumber.toLowerCase().includes(normalizedQuery) || row.phoneNumber.toLowerCase().includes(normalizedQuery);
}

function matchesStatusFilter(row: OrderRow, statusFilter: 'all' | PaymentStatus): boolean {
  return statusFilter === 'all' || row.status === statusFilter;
}

function matchesMonthFilter(row: OrderRow, monthFilter: string): boolean {
  return monthFilter === 'all' || row.month === monthFilter;
}

function compareOrderRows(a: OrderRow, b: OrderRow, sort: SortOrder): number {
  if (sort === 'high') return b.total - a.total;
  if (sort === 'low') return a.total - b.total;

  const t1 = dayjs(a.date).valueOf();
  const t2 = dayjs(b.date).valueOf();
  return sort === 'newest' ? t2 - t1 : t1 - t2;
}

function filterOrderRows(rows: OrderRow[], search: string, statusFilter: 'all' | PaymentStatus, monthFilter: string, sort: SortOrder): OrderRow[] {
  return rows
    .filter(row => matchesSearch(row, search))
    .filter(row => matchesStatusFilter(row, statusFilter))
    .filter(row => matchesMonthFilter(row, monthFilter))
    .sort((a, b) => compareOrderRows(a, b, sort));
}

function buildOrderStats(rows: OrderRow[]) {
  const todayKey = dayjs().format('YYYY-MM-DD');
  const currentMonth = dayjs().format('YYYY-MM');

  return rows.reduce(
    (stats, row) => {
      stats.totalSales += row.total;

      if (row.status === 'pending' || row.status === 'partial') {
        stats.pendingPayments += Math.max(row.total - row.paidAmount, 0);
      }
      if (row.status === 'paid') {
        stats.paidOrders += 1;
      }
      if (dayjs(row.date).format('YYYY-MM-DD') === todayKey) {
        stats.ordersToday += 1;
      }
      if (row.month === currentMonth) {
        stats.ordersThisMonth += 1;
      }

      return stats;
    },
    {
      totalSales: 0,
      pendingPayments: 0,
      paidOrders: 0,
      ordersToday: 0,
      ordersThisMonth: 0,
    }
  );
}

function downloadCsv(rows: OrderRow[], label: ExportType) {
  const headers = ['เลขที่งาน', 'ลูกค้า', 'เบอร์โทรศัพท์', 'วันที่', 'สถานะ', 'ยอดรวม'];
  const lines = rows.map(row => [row.orderNumber, row.customerName, row.phoneNumber, dayjs(row.date).format('DD/MM/YYYY HH:mm'), STATUS_LABELS_TH[row.status], row.total]);
  const csv = [headers, ...lines].map(line => line.map(item => `"${String(item).replaceAll('"', '""')}"`).join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cashierprint-${label}-${dayjs().format('YYYY-MM-DD')}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function printDocument(row: OrderRow, mode: 'receipt' | 'invoice') {
  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=720');
  if (!win) return;

  const content = `
    <html>
      <head>
        <title>${mode === 'receipt' ? 'ใบเสร็จรับเงิน' : 'ใบกำกับภาษี'} ${row.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0F172A; }
          .header { border-bottom: 2px solid #1E5EFF; padding-bottom: 12px; margin-bottom: 16px; }
          .title { font-size: 22px; font-weight: bold; }
          .meta { font-size: 13px; color: #334155; margin-top: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #CBD5E1; padding: 8px; text-align: left; font-size: 13px; }
          th { background: #F8FAFC; }
          .sum { margin-top: 14px; text-align: right; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">Glossy Design - ${mode === 'receipt' ? 'ใบเสร็จรับเงิน' : 'ใบกำกับภาษี'}</div>
          <div class="meta">เลขที่งาน: ${row.orderNumber} | ลูกค้า: ${row.customerName} | วันที่: ${dayjs(row.date).format('DD/MM/YYYY HH:mm')}</div>
        </div>
        <table>
          <thead>
            <tr><th>รายการ</th><th>จำนวน</th><th>ราคา</th><th>ยอดรวม</th></tr>
          </thead>
          <tbody>
            ${row.products.map(product => `<tr><td>${product.name}</td><td>${product.qty}</td><td>${formatMoney(product.price)}</td><td>${formatMoney(product.qty * product.price)}</td></tr>`).join('')}
          </tbody>
        </table>
        <div class="sum">ยอดรวม: ${formatMoney(row.total)} THB</div>
      </body>
    </html>
  `;

  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  win.location.replace(url);
  win.focus();
  win.addEventListener('load', () => {
    win.print();
    URL.revokeObjectURL(url);
  });
}

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  tone: string;
  icon: React.ReactNode;
};

function StatCard({ title, value, subtitle, tone, icon }: Readonly<StatCardProps>) {
  return (
    <Card
      sx={{
        borderRadius: 4.5,
        border: '1px solid #E8EDF5',
        boxShadow: '0 14px 32px rgba(13, 30, 64, 0.07)',
        background: `linear-gradient(135deg, ${alpha(tone, 0.11)} 0%, #FFFFFF 50%, #FCFDFF 100%)`,
        backdropFilter: 'blur(6px)',
      }}>
      <CardContent sx={{ p: 2.2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ color: '#64748B', fontWeight: 700, fontSize: 12.7 }}>{title}</Typography>
            <Typography sx={{ mt: 0.75, fontWeight: 800, fontSize: 28, color: '#0B1325', lineHeight: 1.1 }}>{value}</Typography>
            <Typography sx={{ mt: 0.5, color: '#8A95A7', fontSize: 11.8 }}>{subtitle}</Typography>
          </Box>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              color: tone,
              bgcolor: alpha(tone, 0.14),
              boxShadow: `0 10px 20px ${alpha(tone, 0.2)}`,
            }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

type ExportMenuProps = {
  anchorEl: HTMLElement | null;
  rows: OrderRow[];
  onClose: () => void;
};

function ExportMenu({ anchorEl, rows, onClose }: Readonly<ExportMenuProps>) {
  const handleExport = (label: ExportType) => {
    downloadCsv(rows, label);
    onClose();
  };

  return (
    <Menu
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            border: '1px solid #E6EDF7',
            boxShadow: '0 16px 34px rgba(15, 23, 42, 0.14)',
            p: 0.5,
          },
        },
      }}>
      <MenuItem onClick={() => handleExport('excel')}>ส่งออก Excel</MenuItem>
      <MenuItem onClick={() => handleExport('pdf')}>ส่งออก PDF</MenuItem>
      <MenuItem onClick={() => handleExport('sales')}>ส่งออกรายงานยอดขาย</MenuItem>
    </Menu>
  );
}

type RowActionsMenuProps = {
  anchorEl: HTMLElement | null;
  rowMenuTarget: OrderRow | null;
  updatingOrderId: string | null;
  onClose: () => void;
  onOpenDrawer: (row: OrderRow) => void;
  onMarkAsPaid: (id: string) => void;
  onCancelOrder: (id: string) => void;
};

function RowActionsMenu({ anchorEl, rowMenuTarget, updatingOrderId, onClose, onOpenDrawer, onMarkAsPaid, onCancelOrder }: Readonly<RowActionsMenuProps>) {
  const rowMenuTargetId = rowMenuTarget?.id ?? '';
  const confirmPaymentDisabled = !rowMenuTarget || rowMenuTarget.status === 'paid' || rowMenuTarget.status === 'cancelled' || updatingOrderId === rowMenuTargetId;
  const cancelOrderDisabled = !rowMenuTarget || updatingOrderId === rowMenuTargetId;

  return (
    <Menu
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            border: '1px solid #E6EDF7',
            boxShadow: '0 16px 34px rgba(15, 23, 42, 0.14)',
            p: 0.6,
          },
        },
      }}>
      <MenuItem
        onClick={() => {
          if (rowMenuTarget) onOpenDrawer(rowMenuTarget);
          onClose();
        }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <VisibilityRoundedIcon fontSize="small" />
          <Typography sx={{ fontSize: 14 }}>ดูรายละเอียด</Typography>
        </Stack>
      </MenuItem>
      <MenuItem
        onClick={() => {
          if (rowMenuTarget) printDocument(rowMenuTarget, 'receipt');
          onClose();
        }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <PrintRoundedIcon fontSize="small" />
          <Typography sx={{ fontSize: 14 }}>พิมพ์ใบเสร็จ</Typography>
        </Stack>
      </MenuItem>
      <MenuItem
        onClick={() => {
          if (rowMenuTarget) printDocument(rowMenuTarget, 'invoice');
          onClose();
        }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <ReceiptRoundedIcon fontSize="small" />
          <Typography sx={{ fontSize: 14 }}>พิมพ์ใบกำกับภาษี</Typography>
        </Stack>
      </MenuItem>
      <MenuItem
        disabled={confirmPaymentDisabled}
        onClick={() => {
          if (rowMenuTarget) {
            onMarkAsPaid(rowMenuTarget.id);
          }
          onClose();
        }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CheckCircleRoundedIcon fontSize="small" />
          <Typography sx={{ fontSize: 14 }}>ยืนยันการชำระเงิน</Typography>
        </Stack>
      </MenuItem>
      <MenuItem
        sx={{ color: '#D73A49' }}
        disabled={cancelOrderDisabled}
        onClick={() => {
          if (rowMenuTarget) {
            onCancelOrder(rowMenuTarget.id);
          }
          onClose();
        }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CancelRoundedIcon fontSize="small" />
          <Typography sx={{ fontSize: 14 }}>ยกเลิกงาน</Typography>
        </Stack>
      </MenuItem>
    </Menu>
  );
}

type OrderDetailDrawerProps = {
  drawerOpen: boolean;
  selectedOrder: OrderRow | null;
  isMobile: boolean;
  isCompactDrawer: boolean;
  updatingOrderId: string | null;
  onClose: () => void;
  onMarkAsPaid: (id: string) => void;
  onOpenPayRemaining: (order: OrderRow) => void;
  onCancelOrder: (id: string) => void;
};

function getOrderDetailDrawerPaperSx(isMobile: boolean) {
  return {
    width: isMobile ? '100%' : { sm: 420, md: 480, lg: 560 },
    maxHeight: isMobile ? '94vh' : '100vh',
    height: isMobile ? 'min(94vh, 860px)' : '100%',
    borderTopLeftRadius: isMobile ? 18 : 22,
    borderTopRightRadius: isMobile ? 18 : 0,
    borderBottomLeftRadius: isMobile ? 0 : 22,
    borderBottomRightRadius: 0,
    background: 'linear-gradient(180deg, #FBFDFF 0%, #FFFFFF 100%)',
    overflow: 'hidden',
  };
}

function OrderDetailDrawer({ drawerOpen, selectedOrder, isMobile, isCompactDrawer, updatingOrderId, onClose, onMarkAsPaid, onOpenPayRemaining, onCancelOrder }: Readonly<OrderDetailDrawerProps>) {
  const drawerAnchor = isMobile ? 'bottom' : 'right';
  const drawerPaperSx = getOrderDetailDrawerPaperSx(isMobile);

  return (
    <Drawer
      anchor={drawerAnchor}
      open={drawerOpen}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: drawerPaperSx,
        },
      }}>
      {selectedOrder ? (
        <Stack sx={{ height: '100%' }}>
          <Box
            sx={{
              px: { xs: 2, sm: 2.5, md: 3 },
              py: { xs: 1.8, sm: 2.2 },
              borderBottom: '1px solid #E8EFF8',
              bgcolor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(10px)',
            }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
              <Box>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>รายละเอียดงาน</Typography>
                <Typography sx={{ mt: 0.4, color: '#64748B' }}>
                  {selectedOrder.orderNumber} | {selectedOrder.customerName}
                </Typography>
              </Box>
              {statusChip(selectedOrder.status)}
            </Stack>
          </Box>

          <Box
            sx={{
              px: { xs: 2, sm: 2.5, md: 3 },
              py: { xs: 2, sm: 2.3 },
              overflowY: 'auto',
              overflowX: 'hidden',
              flex: 1,
            }}>
            <Stack spacing={isCompactDrawer ? 1.25 : 1.5}>
              {selectedOrder.status === 'pending' || selectedOrder.status === 'partial' ? (
                <Card sx={{ borderRadius: 3, border: '1px solid #FFD8A8', bgcolor: '#FFF8ED', boxShadow: 'none' }}>
                  <CardContent sx={{ py: 1.2 }}>
                    <Typography sx={{ color: '#B9650A', fontWeight: 700 }}>
                      {selectedOrder.status === 'partial' ? 'งานนี้ชำระบางส่วน' : 'งานนี้รอชำระเงิน'}: คงเหลือ ฿{formatMoney(Math.max(selectedOrder.total - selectedOrder.paidAmount, 0))}
                    </Typography>
                  </CardContent>
                </Card>
              ) : null}

              <Card
                sx={{
                  borderRadius: 3.8,
                  border: '1px solid #E6EDF7',
                  boxShadow: 'none',
                }}>
                <CardContent>
                  <Stack spacing={1.1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar
                        sx={{
                          width: 30,
                          height: 30,
                          bgcolor: alpha('#1E5EFF', 0.14),
                          color: '#2156D8',
                        }}>
                        <ReceiptLongRoundedIcon sx={{ fontSize: 18 }} />
                      </Avatar>

                      <Typography sx={{ fontWeight: 700 }}>ข้อมูลรายการสั่งผลิต</Typography>
                    </Stack>

                    <Typography sx={{ color: '#334155' }}>
                      <strong>เลขที่งาน :</strong> {selectedOrder.orderNumber}
                    </Typography>

                    <Typography sx={{ color: '#334155' }}>
                      <strong>วันที่รับงาน :</strong> {dayjs(selectedOrder.date).format('DD/MM/YYYY HH:mm')}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Card
                sx={{
                  borderRadius: 3.8,
                  border: '1px solid #E6EDF7',
                  boxShadow: 'none',
                }}>
                <CardContent>
                  <Stack spacing={1.1}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar
                        sx={{
                          width: 30,
                          height: 30,
                          bgcolor: alpha('#4F46E5', 0.14),
                          color: '#4F46E5',
                        }}>
                        <AccountCircleRoundedIcon sx={{ fontSize: 18 }} />
                      </Avatar>

                      <Typography sx={{ fontWeight: 700 }}>ข้อมูลลูกค้า</Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <PersonRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                      <Typography>ชื่อลูกค้า : {selectedOrder.customerName}</Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <PhoneRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                      <Typography>เบอร์โทรศัพท์ : {selectedOrder.phoneNumber}</Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <DescriptionRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                      <Typography>LINE ID : {selectedOrder.lineId}</Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                      <Typography>อีเมล : {selectedOrder.email}</Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <HomeRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                      <Typography>ที่อยู่ : {selectedOrder.address}</Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
              <Card sx={{ borderRadius: 3.8, border: '1px solid #E6EDF7', boxShadow: 'none' }}>
                <CardContent>
                  <Stack spacing={1.05}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar sx={{ width: 30, height: 30, bgcolor: alpha('#1F9D63', 0.14), color: '#1F9D63' }}>
                        <AttachMoneyRoundedIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                        <Typography sx={{ fontWeight: 700 }}>สรุปยอดชำระ</Typography>
                        <Chip label={PAYMENT_METHOD_LABELS_TH[selectedOrder.paymentMethod]} sx={{ ...statusChipSx, width: 'fit-content', bgcolor: '#EEF8FF', color: '#1D4ED8' }} />
                      </Stack>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">ยอดก่อนส่วนลด</Typography>
                      <Typography>฿{formatMoney(selectedOrder.subtotal)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">ส่วนลด</Typography>
                      <Typography>-฿{formatMoney(selectedOrder.discount)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">VAT</Typography>
                      <Typography>฿{formatMoney(selectedOrder.vat)}</Typography>
                    </Stack>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ fontWeight: 700 }}>ยอดสุทธิ</Typography>
                      <Typography sx={{ fontWeight: 800 }}>฿{formatMoney(selectedOrder.total)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">ยอดที่ชำระแล้ว</Typography>
                      <Typography sx={{ color: '#18794E', fontWeight: 700 }}>฿{formatMoney(selectedOrder.paidAmount)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">ยอดคงเหลือ</Typography>
                      <Typography sx={{ color: '#B9650A', fontWeight: 700 }}>฿{formatMoney(Math.max(selectedOrder.total - selectedOrder.paidAmount, 0))}</Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <JobTimelineCard items={buildOrderTimelineItems(selectedOrder)} />
            </Stack>
          </Box>

          <Divider />
          <Box
            sx={{
              position: 'sticky',
              bottom: 0,
              px: { xs: 2, sm: 2.5, md: 3 },
              py: { xs: 1.5, sm: 1.8 },
              borderTop: '1px solid #E8EFF8',
              bgcolor: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(10px)',
            }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} flexWrap="wrap" gap={1}>
              {selectedOrder.status === 'partial' ? (
                <Button
                  variant="outlined"
                  startIcon={<PaymentsRoundedIcon />}
                  disabled={updatingOrderId === selectedOrder.id}
                  onClick={() => {
                    onOpenPayRemaining(selectedOrder);
                  }}
                  sx={{ ...commonButtonSx, flex: '1 1 auto', width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}>
                  รับชำระยอดคงเหลือ
                </Button>
              ) : null}
              <Button
                variant="contained"
                startIcon={<CheckCircleRoundedIcon />}
                disabled={!['pending', 'partial'].includes(selectedOrder.status) || updatingOrderId === selectedOrder.id}
                onClick={() => {
                  onMarkAsPaid(selectedOrder.id);
                }}
                sx={{ ...commonButtonSx, flex: '1 1 auto', width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}>
                ยืนยันการชำระเงิน
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelRoundedIcon />}
                disabled={updatingOrderId === selectedOrder.id}
                onClick={() => {
                  onCancelOrder(selectedOrder.id);
                }}
                sx={{ ...commonButtonSx, flex: '1 1 auto', width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}>
                ยกเลิกงาน
              </Button>
            </Stack>
          </Box>
        </Stack>
      ) : null}
    </Drawer>
  );
}

export default function OrderManagementPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isCompactDrawer = useMediaQuery(theme.breakpoints.down('lg'));

  const [rows, setRows] = React.useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [missingApiBase, setMissingApiBase] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | PaymentStatus>('all');
  const [monthFilter, setMonthFilter] = React.useState<string>('all');
  const [sort, setSort] = React.useState<SortOrder>('newest');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(8);

  const [selectedOrder, setSelectedOrder] = React.useState<OrderRow | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [rowMenuAnchor, setRowMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [menuOrderId, setMenuOrderId] = React.useState<string | null>(null);
  const [exportAnchor, setExportAnchor] = React.useState<null | HTMLElement>(null);
  const [lastUpdated, setLastUpdated] = React.useState<dayjs.Dayjs | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = React.useState<string | null>(null);
  const [payRemainingTarget, setPayRemainingTarget] = React.useState<OrderRow | null>(null);

  const loadOrders = React.useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    setMissingApiBase(false);

    try {
      const mappedRows = await fetchOrderRows();
      setRows(mappedRows);
      setLastUpdated(dayjs());
    } catch (error) {
      setRows([]);
      if (isMissingApiBaseError(error)) {
        setMissingApiBase(true);
      } else {
        setLoadError(getLoadOrdersErrorMessage(error));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const months = React.useMemo(() => {
    const unique = Array.from(new Set(rows.map(row => row.month)));
    return unique.sort((a, b) => b.localeCompare(a));
  }, [rows]);

  const rowsById = React.useMemo(() => new Map(rows.map(row => [row.id, row])), [rows]);

  const filteredRows = React.useMemo(() => {
    return filterOrderRows(rows, search, statusFilter, monthFilter, sort);
  }, [monthFilter, rows, search, sort, statusFilter]);

  const pagedRows = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  React.useEffect(() => {
    setPage(0);
  }, [search, statusFilter, monthFilter, sort]);

  const stats = React.useMemo(() => {
    return buildOrderStats(rows);
  }, [rows]);

  const rowMenuTarget = React.useMemo(() => (menuOrderId ? (rowsById.get(menuOrderId) ?? null) : null), [menuOrderId, rowsById]);

  const openRowMenu = (event: React.MouseEvent<HTMLButtonElement>, orderId: string) => {
    event.stopPropagation();
    setRowMenuAnchor(event.currentTarget);
    setMenuOrderId(orderId);
  };

  const closeRowMenu = () => {
    setRowMenuAnchor(null);
    setMenuOrderId(null);
  };

  const openDrawer = (row: OrderRow) => {
    setSelectedOrder(row);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const markAsPaid = React.useCallback(
    async (targetId: string) => {
      const target = rowsById.get(targetId);
      if (!target || target.status === 'cancelled') return;

      setUpdatingOrderId(targetId);
      try {
        await updateOrderStatus(targetId, 'paid');
        await loadOrders();
      } catch (error) {
        setLoadError(error instanceof Error && error.message ? error.message : 'อัปเดตสถานะชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [loadOrders, rowsById]
  );

  const cancelOrder = React.useCallback(
    async (targetId: string) => {
      const target = rowsById.get(targetId);
      if (!target) return;

      setUpdatingOrderId(targetId);
      try {
        await updateOrderStatus(targetId, 'cancelled');
        await loadOrders();
      } catch (error) {
        setLoadError(error instanceof Error && error.message ? error.message : 'ยกเลิกรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [loadOrders, rowsById]
  );

  const handlePayRemainingSuccess = React.useCallback(
    async (updatedOrder: ApiOrder) => {
      const updatedRow = mapApiOrderToRow(updatedOrder);
      setRows(prev => prev.map(row => (row.id === updatedRow.id ? updatedRow : row)));
      setSelectedOrder(prev => (prev && prev.id === updatedRow.id ? updatedRow : prev));
      setPayRemainingTarget(null);
      await loadOrders();
    },
    [loadOrders]
  );

  React.useEffect(() => {
    if (selectedOrder?.id == null) return;
    const latest = rowsById.get(selectedOrder.id) ?? null;
    setSelectedOrder(latest);
  }, [rowsById, selectedOrder]);

  const labelDisplayedRows = React.useCallback(({ from, to, count }: { from: number; to: number; count: number }) => {
    const totalLabel = count === -1 ? `เธกเธฒเธเธเธงเนเธฒ ${to}` : `${count}`;
    return `${from}-${to} เธเธฒเธ ${totalLabel}`;
  }, []);

  return (
    <AdminPageContainer>
      <Stack spacing={2.5}>
        <MotionDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Card
            sx={{
              borderRadius: 5.6,
              border: '1px solid #E6EDF8',
              boxShadow: '0 20px 45px rgba(18, 45, 82, 0.08)',
              background: 'linear-gradient(145deg, #FFFFFF 0%, #F7FAFF 100%)',
            }}>
            <CardContent sx={{ p: { xs: 2.1, md: 2.8 } }}>
              {missingApiBase ? (
                <Box sx={{ mb: 2.2 }}>
                  <MissingApiConfigState subtitle="กรุณาตั้งค่า NEXT_PUBLIC_API_URL เพื่อให้หน้ารายการงานดึงข้อมูลจากระบบได้" />
                </Box>
              ) : null}

              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2.2} alignItems={{ xs: 'stretch', md: 'flex-start' }}>
                <Box sx={{ flex: 1, minHeight: { md: 110 } }}>
                  <Typography sx={{ color: '#101828', fontWeight: 800, fontSize: { xs: 30, md: 38 }, lineHeight: 1.06 }}>Orders</Typography>
                  <Typography sx={{ mt: 1, color: '#475467', fontSize: { xs: 14, md: 16 } }}>ติดตามรายการงานลูกค้า สถานะการชำระเงิน งานพิมพ์ และเอกสารการขายได้ในหน้าจอเดียว</Typography>
                  <Typography sx={{ mt: 1, color: '#94A3B8', fontSize: 12.5 }}>อัปเดตล่าสุด {lastUpdated ? lastUpdated.format('DD/MM/YYYY HH:mm') : '-'}</Typography>
                  <Typography sx={{ mt: 0.5, color: '#94A3B8', fontSize: 12.5 }}>{formatThaiFullDate(lastUpdated)}</Typography>
                  {loadError ? <Typography sx={{ mt: 0.8, color: '#C62828', fontSize: 12.5 }}>{loadError}</Typography> : null}
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.1} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ minHeight: { md: 110 } }}>
                  <Tooltip title="การแจ้งเตือน">
                    <IconButton
                      sx={{
                        borderRadius: 3,
                        border: '1px solid #DFE8F5',
                        bgcolor: '#FFFFFF',
                        width: 44,
                        height: 44,
                        boxShadow: '0 10px 20px rgba(12, 56, 110, 0.08)',
                      }}>
                      <Badge color="error" variant="dot">
                        <NotificationsRoundedIcon sx={{ color: '#2A4365' }} />
                      </Badge>
                    </IconButton>
                  </Tooltip>

                  <Button
                    onClick={() => {
                      void loadOrders();
                    }}
                    startIcon={<RefreshRoundedIcon />}
                    variant="outlined"
                    disabled={isLoading}
                    sx={{
                      ...commonButtonSx,
                      borderRadius: 3,
                      borderColor: '#D7E3F4',
                      bgcolor: '#FFFFFF',
                      color: '#2A4365',
                      textTransform: 'none',
                    }}>
                    {isLoading ? 'กำลังรีเฟรช...' : 'รีเฟรช'}
                  </Button>

                  <Button
                    onClick={event => setExportAnchor(event.currentTarget)}
                    startIcon={<FileDownloadRoundedIcon />}
                    variant="outlined"
                    sx={{
                      ...commonButtonSx,
                      borderRadius: 3,
                      borderColor: '#D7E3F4',
                      bgcolor: '#FFFFFF',
                      color: '#2A4365',
                      textTransform: 'none',
                    }}>
                    ส่งออกรายงาน
                  </Button>

                  <Button
                    component={Link}
                    href="/home/posseller"
                    startIcon={<AddShoppingCartRoundedIcon />}
                    variant="contained"
                    sx={{
                      ...commonButtonSx,
                      borderRadius: 3,
                      textTransform: 'none',
                      bgcolor: '#2B62EE',
                      boxShadow: '0 14px 28px rgba(43, 98, 238, 0.34)',
                    }}>
                    สร้างรายการงานใหม่
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </MotionDiv>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))' },
            gap: 1.4,
          }}>
          <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
            <StatCard title="ยอดขายรวม" value={`฿${formatMoney(stats.totalSales)}`} subtitle="ยอดขายรวมทั้งหมด" tone="#1E5EFF" icon={<AttachMoneyRoundedIcon />} />
          </MotionDiv>
          <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}>
            <StatCard title="ยอดรอชำระ" value={`฿${formatMoney(stats.pendingPayments)}`} subtitle="ยอดที่รอชำระเงิน" tone="#F08C00" icon={<PaymentsRoundedIcon />} />
          </MotionDiv>
          <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            <StatCard title="งานที่ชำระแล้ว" value={`${stats.paidOrders}`} subtitle="จำนวนงานที่ชำระเรียบร้อย" tone="#1F9D63" icon={<FactCheckRoundedIcon />} />
          </MotionDiv>
          <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}>
            <StatCard title="งานวันนี้" value={`${stats.ordersToday}`} subtitle="จำนวนงานที่รับวันนี้" tone="#5C6AC4" icon={<TodayRoundedIcon />} />
          </MotionDiv>
          <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
            <StatCard title="งานเดือนนี้" value={`${stats.ordersThisMonth}`} subtitle="จำนวนงานประจำเดือน" tone="#2563EB" icon={<CalendarMonthRoundedIcon />} />
          </MotionDiv>
        </Box>

        <Card
          sx={{
            borderRadius: 4.6,
            border: '1px solid #E7EDF7',
            boxShadow: '0 12px 30px rgba(15, 37, 74, 0.08)',
            background: '#FFFFFF',
          }}>
          <CardContent sx={{ p: { xs: 1.8, md: 2.3 } }}>
            <Stack spacing={1.6}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <TuneRoundedIcon sx={{ color: '#3866E8', fontSize: 20 }} />
                <Typography sx={{ color: '#102A43', fontWeight: 800, fontSize: 15 }}>ค้นหารายการงาน</Typography>
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.65fr 0.65fr 0.65fr auto' },
                  gap: 1.2,
                }}>
                <TextField
                  size="small"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="ค้นหาชื่อลูกค้า / เลขที่งาน / เบอร์โทรศัพท์"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon sx={{ color: '#6B7A90' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      height: 46,
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 8px 18px rgba(38, 63, 102, 0.08)',
                    },
                  }}
                />

                <FormControl size="small">
                  <InputLabel id="status-filter">สถานะ</InputLabel>
                  <Select<'all' | PaymentStatus>
                    labelId="status-filter"
                    value={statusFilter}
                    label="สถานะ"
                    onChange={event => setStatusFilter(event.target.value)}
                    sx={{ borderRadius: 3, height: 46, bgcolor: '#FFFFFF', boxShadow: '0 8px 18px rgba(38, 63, 102, 0.08)' }}>
                    <MenuItem value="all">{FILTER_STATUS_LABELS.all}</MenuItem>
                    <MenuItem value="paid">{FILTER_STATUS_LABELS.paid}</MenuItem>
                    <MenuItem value="pending">{FILTER_STATUS_LABELS.pending}</MenuItem>
                    <MenuItem value="partial">{FILTER_STATUS_LABELS.partial}</MenuItem>
                    <MenuItem value="cancelled">{FILTER_STATUS_LABELS.cancelled}</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel id="month-filter">เดือน</InputLabel>
                  <Select<string>
                    labelId="month-filter"
                    value={monthFilter}
                    label="เดือน"
                    onChange={event => setMonthFilter(event.target.value)}
                    sx={{ borderRadius: 3, height: 46, bgcolor: '#FFFFFF', boxShadow: '0 8px 18px rgba(38, 63, 102, 0.08)' }}>
                    <MenuItem value="all">ทั้งหมด</MenuItem>
                    {months.map(month => (
                      <MenuItem key={month} value={month}>
                        {formatMonthFilterLabel(month)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel id="sort-filter">เรียงลำดับ</InputLabel>
                  <Select<SortOrder>
                    labelId="sort-filter"
                    value={sort}
                    label="เรียงลำดับ"
                    onChange={event => setSort(event.target.value)}
                    sx={{ borderRadius: 3, height: 46, bgcolor: '#FFFFFF', boxShadow: '0 8px 18px rgba(38, 63, 102, 0.08)' }}>
                    <MenuItem value="newest">{SORT_ORDER_LABELS.newest}</MenuItem>
                    <MenuItem value="oldest">{SORT_ORDER_LABELS.oldest}</MenuItem>
                    <MenuItem value="high">{SORT_ORDER_LABELS.high}</MenuItem>
                    <MenuItem value="low">{SORT_ORDER_LABELS.low}</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          sx={{
            ...uiCardSx,
            borderRadius: 4.5,
            overflow: 'hidden',
            boxShadow: '0 12px 30px rgba(15, 37, 74, 0.08)',
          }}>
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              py: { xs: 2, md: 2.6 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
              borderBottom: '1px solid #F3F4F6',
              bgcolor: '#FFFFFF',
            }}>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#1A1035', letterSpacing: '-0.2px' }}>รายการงานทั้งหมด</Typography>
              <Typography sx={{ mt: 0.35, fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{filteredRows.length} รายการตามตัวกรองล่าสุด</Typography>
            </Box>
            <Chip label={`${filteredRows.length} รายการ`} sx={{ borderRadius: '999px', bgcolor: '#F5F0FF', color: '#6C4DFF', fontWeight: 700 }} />
          </Box>

          {isMobile ? (
            <Stack spacing={1.2} sx={{ p: 1.4 }}>
              {pagedRows.length === 0 ? (
                <EmptyState
                  compact
                  icon={<SearchRoundedIcon fontSize="small" />}
                  eyebrow="รายการงาน"
                  title="ไม่พบรายการงานที่ตรงกับเงื่อนไข"
                  subtitle="ลองเปลี่ยนคำค้นหา ตัวกรอง หรือช่วงเวลาเพื่อดูรายการงานเพิ่มเติม"
                  sx={{ py: 4.5 }}
                />
              ) : null}

              {pagedRows.map(row => (
                <Card key={row.id} variant="outlined" sx={{ borderRadius: 3, borderColor: '#E8EDF5' }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Stack spacing={1.2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack>
                          <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>{row.orderNumber}</Typography>
                          <Typography sx={{ color: '#64748B', fontSize: 12.5 }}>{dayjs(row.date).format('DD/MM/YYYY HH:mm')}</Typography>
                        </Stack>
                        {statusChip(row.status)}
                      </Stack>
                      <Typography sx={{ fontWeight: 700 }}>{row.customerName}</Typography>
                      <Typography sx={{ color: '#64748B', fontSize: 13 }}>{row.phoneNumber}</Typography>
                      <Typography sx={{ fontWeight: 800, color: '#1D4ED8' }}>฿{formatMoney(row.total)}</Typography>
                      <Stack direction="row" spacing={1}>
                        <Button variant="outlined" size="small" onClick={() => openDrawer(row)} sx={{ ...commonButtonSx, minHeight: 34 }}>
                          ดูรายละเอียด
                        </Button>
                        <IconButton size="small" onClick={event => openRowMenu(event, row.id)}>
                          <MoreHorizRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      '& th': {
                        background: '#FAFAFA',
                        color: '#9CA3AF',
                        fontSize: 11.5,
                        fontWeight: 700,
                        letterSpacing: '0.3px',
                        borderBottom: '1px solid #F3F4F6',
                        py: 1.5,
                        px: 2,
                        whiteSpace: 'nowrap',
                      },
                    }}>
                    <TableCell>เลขที่งาน</TableCell>
                    <TableCell>ลูกค้า</TableCell>
                    <TableCell>รายการ</TableCell>
                    <TableCell>สถานะ</TableCell>
                    <TableCell align="right">ยอดรวม</TableCell>
                    <TableCell align="right">ยอดคงเหลือ</TableCell>
                    <TableCell>วิธีชำระเงิน</TableCell>
                    <TableCell>วันที่รับงาน</TableCell>
                    <TableCell align="right">จัดการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <EmptyState
                          compact
                          icon={<SearchRoundedIcon fontSize="small" />}
                          eyebrow="รายการงาน"
                          title="ไม่พบรายการงานที่ตรงกับเงื่อนไข"
                          subtitle="ลองเปลี่ยนคำค้นหา ตัวกรอง หรือช่วงเวลาเพื่อดูรายการงานเพิ่มเติม"
                        />
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {pagedRows.map((row, index) => {
                    const summary = buildOrderLineSummary(row);
                    const createdAt = formatOrderRowTime(row.date);
                    const remaining = Math.max(row.total - row.paidAmount, 0);
                    const statusUi = ORDER_TABLE_STATUS_UI[row.status];
                    const avatarHue = (index * 47) % 360;

                    return (
                      <TableRow
                        key={row.id}
                        hover
                        onClick={() => openDrawer(row)}
                        sx={{
                          cursor: 'pointer',
                          '& td': {
                            py: 1.6,
                            px: 2,
                            borderBottom: '1px solid #F9FAFB',
                            fontSize: 13,
                            verticalAlign: 'top',
                          },
                          '&:hover': { bgcolor: '#FBFCFF' },
                        }}>
                        <TableCell>
                          <Typography sx={{ display: 'inline-block', fontWeight: 700, color: '#6C4DFF', fontVariantNumeric: 'tabular-nums' }}>{row.orderNumber}</Typography>
                          <Typography sx={{ mt: 0.35, fontSize: 11.5, color: '#9CA3AF', whiteSpace: 'nowrap' }}>{row.vat > 0 ? 'ใบกำกับภาษี' : 'ใบเสร็จทั่วไป'}</Typography>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.2, minWidth: 180 }}>
                            <Box
                              sx={{
                                width: 30,
                                height: 30,
                                borderRadius: '9px',
                                background: `hsl(${avatarHue}, 65%, 92%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 12,
                                fontWeight: 700,
                                color: `hsl(${avatarHue}, 55%, 38%)`,
                                flexShrink: 0,
                              }}>
                              {getCustomerInitial(row.customerName)}
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#374151', lineHeight: 1.3 }}>{row.customerName}</Typography>
                              <Typography sx={{ mt: 0.35, fontSize: 11.5, color: '#9CA3AF', whiteSpace: 'nowrap' }}>{row.phoneNumber || 'ไม่มีเบอร์โทรศัพท์'}</Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ minWidth: 220 }}>
                            <Typography sx={{ fontSize: 12.8, fontWeight: 700, color: '#374151', lineHeight: 1.35 }}>{summary.primary}</Typography>
                            <Typography sx={{ mt: 0.35, fontSize: 11.5, color: '#9CA3AF', lineHeight: 1.35 }}>{summary.secondary}</Typography>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.6,
                              fontSize: 12.2,
                              fontWeight: 700,
                              color: '#374151',
                              whiteSpace: 'nowrap',
                            }}>
                            <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusUi.dot, flexShrink: 0 }} />
                            {statusUi.label}
                          </Box>
                        </TableCell>

                        <TableCell align="right">
                          <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#1A1035', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{formatTableCurrency(row.total)}</Typography>
                          {row.discount > 0 ? <Typography sx={{ mt: 0.35, fontSize: 11.5, color: '#9CA3AF', whiteSpace: 'nowrap' }}>ส่วนลด ฿ {row.discount.toLocaleString('th-TH')}</Typography> : null}
                        </TableCell>

                        <TableCell align="right">
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: remaining > 0 ? '#B45309' : '#16A34A',
                              fontVariantNumeric: 'tabular-nums',
                              whiteSpace: 'nowrap',
                            }}>
                            {remaining > 0 ? formatTableCurrency(remaining) : 'ไม่มีคงเหลือ'}
                          </Typography>
                          {row.vat > 0 ? <Typography sx={{ mt: 0.35, fontSize: 11.5, color: '#9CA3AF', whiteSpace: 'nowrap' }}>VAT {formatTableCurrency(row.vat)}</Typography> : null}
                        </TableCell>

                        <TableCell>
                          <Typography sx={{ fontSize: 12.2, color: '#374151', whiteSpace: 'nowrap', fontWeight: 600 }}>{ORDER_TABLE_PAYMENT_LABEL[row.paymentMethod]}</Typography>
                        </TableCell>

                        <TableCell>
                          <Typography sx={{ fontSize: 11.8, color: '#6B7280', whiteSpace: 'nowrap', fontWeight: 600 }}>{createdAt.relative}</Typography>
                          <Typography sx={{ mt: 0.35, fontSize: 11.2, color: '#9CA3AF', whiteSpace: 'nowrap' }}>{createdAt.exact}</Typography>
                        </TableCell>

                        <TableCell align="right" onClick={event => event.stopPropagation()}>
                          <Stack direction="row" spacing={0.4} justifyContent="flex-end">
                            <Tooltip title="ดูรายละเอียด">
                              <IconButton size="small" onClick={() => openDrawer(row)}>
                                <VisibilityRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="จัดการ">
                              <IconButton size="small" onClick={event => openRowMenu(event, row.id)}>
                                <MoreHorizRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}

          <TablePagination
            component="div"
            count={filteredRows.length}
            page={page}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={event => {
              setRowsPerPage(Number.parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 8, 10, 20]}
            labelRowsPerPage="จำนวนรายการต่อหน้า"
            labelDisplayedRows={labelDisplayedRows}
          />
        </Card>
      </Stack>

      <ExportMenu anchorEl={exportAnchor} rows={filteredRows} onClose={() => setExportAnchor(null)} />

      <RowActionsMenu
        anchorEl={rowMenuAnchor}
        rowMenuTarget={rowMenuTarget}
        updatingOrderId={updatingOrderId}
        onClose={closeRowMenu}
        onOpenDrawer={openDrawer}
        onMarkAsPaid={targetId => {
          void markAsPaid(targetId);
        }}
        onCancelOrder={targetId => {
          void cancelOrder(targetId);
        }}
      />

      <OrderDetailDrawer
        drawerOpen={drawerOpen}
        selectedOrder={selectedOrder}
        isMobile={isMobile}
        isCompactDrawer={isCompactDrawer}
        updatingOrderId={updatingOrderId}
        onClose={closeDrawer}
        onMarkAsPaid={targetId => {
          void markAsPaid(targetId);
        }}
        onOpenPayRemaining={order => {
          setPayRemainingTarget(order);
        }}
        onCancelOrder={targetId => {
          void cancelOrder(targetId);
        }}
      />
      <PayRemainingModal
        open={Boolean(payRemainingTarget)}
        orderId={payRemainingTarget?.id ?? ''}
        remaining={payRemainingTarget ? Math.max(payRemainingTarget.total - payRemainingTarget.paidAmount, 0) : 0}
        onClose={() => setPayRemainingTarget(null)}
        onSuccess={updatedOrder => {
          void handlePayRemainingSuccess(updatedOrder);
        }}
      />
    </AdminPageContainer>
  );
}
