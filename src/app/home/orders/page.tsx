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
import AdminPageContainer from '../components/AdminPageContainer';
import { commonButtonSx, statusChipSx, tableShellSx, uiCardSx } from '../components/adminUi';
import { EmptyState, MissingApiConfigState } from '../components/dashboardUi';
import { getApiBaseUrl, isMissingApiBaseError } from '../../../lib/api';
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
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import { ApiOrder } from '../../../lib/contracts';

type PaymentStatus = 'paid' | 'pending' | 'cancelled';
type SortOrder = 'newest' | 'oldest' | 'high' | 'low';
type ExportType = 'excel' | 'pdf' | 'sales';

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
  paymentMethod: 'Cash' | 'PromptPay' | 'Bank Transfer';
  products: OrderProduct[];
  timeline: TimelineEvent[];
};

const isApiOrderArray = (value: unknown): value is ApiOrder[] => Array.isArray(value);

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

function toPaymentStatus(status: ApiOrder['status']): PaymentStatus {
  if (status === 'paid') return 'paid';
  if (status === 'cancelled') return 'cancelled';
  return 'pending';
}

function toPaymentMethod(payment: ApiOrder['payment']): OrderRow['paymentMethod'] {
  if (payment === 'cash') return 'Cash';
  if (payment === 'promptpay') return 'PromptPay';
  return 'Bank Transfer';
}

function mapApiOrderToRow(order: ApiOrder): OrderRow {
  const createdAt = order.createdAt || dayjs().toISOString();
  const products = (order.cart ?? []).map(item => {
    const qty = Math.max(1, toNumber(item.quantity ?? item.qty));
    const lineTotal = toNumber(item.totalPrice) || toNumber(item.price ?? item.unitPrice) * qty;
    const unitPrice = qty > 0 ? lineTotal / qty : 0;
    return {
      name: item.name || item.category || 'Untitled product',
      qty,
      price: unitPrice,
    };
  });

  const subtotal = products.reduce((sum, item) => sum + item.qty * item.price, 0);
  const discount = toNumber(order.discount);
  const vat = toNumber(order.vatAmount);
  const fallbackTotal = Math.max(subtotal - discount + vat, 0);
  const total = toNumber(order.grandTotal ?? order.total) || fallbackTotal;
  const remaining = Math.max(toNumber(order.remainingTotal), 0);
  const paidAmount = Math.min(total, Math.max(total - remaining, 0));
  const status = toPaymentStatus(order.status);
  const timeline: TimelineEvent[] = [{ title: 'Order created', at: createdAt }];

  if (status === 'paid') {
    timeline.push({ title: 'Payment completed', at: createdAt });
  }
  if (status === 'pending') {
    timeline.push({ title: 'Pending payment', at: createdAt });
  }
  if (status === 'cancelled') {
    timeline.push({ title: 'Order cancelled', at: createdAt });
  }

  return {
    id: order._id || order.orderId,
    orderId: order.orderId,
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
    subtotal,
    discount,
    vat,
    total,
    paidAmount,
    paymentMethod: toPaymentMethod(order.payment),
    products,
    timeline,
  };
}

async function fetchOrderRows(): Promise<OrderRow[]> {
  const base = getApiBaseUrl();
  const response = await fetch(`${base}/orders`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`failed_with_status_${response.status}`);
  }

  const payload: unknown = await response.json();
  if (!isApiOrderArray(payload)) {
    throw new Error('invalid_orders_payload');
  }

  return payload.map(mapApiOrderToRow);
}

async function updateOrderStatus(orderId: string, status: PaymentStatus): Promise<void> {
  const base = getApiBaseUrl();
  const endpoints = [`${base}/orders/${orderId}/status`, `${base}/orders/${orderId}`];
  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        return;
      }

      lastError = new Error(`failed_with_status_${response.status}`);
    } catch {
      lastError = new Error('update_request_failed');
    }
  }

  throw lastError ?? new Error('update_request_failed');
}

const MotionDiv = motion.div;

function formatMoney(amount: number) {
  return amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusChip(status: PaymentStatus) {
  if (status === 'paid') {
    return <Chip label="Paid" color="success" size="small" sx={statusChipSx} />;
  }
  if (status === 'pending') {
    return <Chip label="Pending" color="warning" size="small" sx={statusChipSx} />;
  }
  return <Chip label="Cancelled" color="error" size="small" sx={statusChipSx} />;
}

function downloadCsv(rows: OrderRow[], label: ExportType) {
  const headers = ['Order ID', 'Customer', 'Phone', 'Date', 'Status', 'Total'];
  const lines = rows.map(row => [row.orderId, row.customerName, row.phoneNumber, dayjs(row.date).format('DD/MM/YYYY HH:mm'), row.status, row.total]);
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
        <title>${mode === 'receipt' ? 'Receipt' : 'Tax Invoice'} ${row.orderId}</title>
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
          <div class="title">CashierPrint - ${mode === 'receipt' ? 'Receipt' : 'Tax Invoice'}</div>
          <div class="meta">Order: ${row.orderId} | Customer: ${row.customerName} | Date: ${dayjs(row.date).format('DD/MM/YYYY HH:mm')}</div>
        </div>
        <table>
          <thead>
            <tr><th>Product</th><th>Qty</th><th>Price</th></tr>
          </thead>
          <tbody>
            ${row.products.map(product => `<tr><td>${product.name}</td><td>${product.qty}</td><td>${formatMoney(product.price)}</td></tr>`).join('')}
          </tbody>
        </table>
        <div class="sum">Total: ${formatMoney(row.total)} THB</div>
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
        setLoadError('โหลดรายการออเดอร์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
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

  const filteredRows = React.useMemo(() => {
    return rows
      .filter(row => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return row.customerName.toLowerCase().includes(q) || row.orderId.toLowerCase().includes(q) || row.phoneNumber.toLowerCase().includes(q);
      })
      .filter(row => (statusFilter === 'all' ? true : row.status === statusFilter))
      .filter(row => (monthFilter === 'all' ? true : row.month === monthFilter))
      .sort((a, b) => {
        if (sort === 'high') return b.total - a.total;
        if (sort === 'low') return a.total - b.total;
        const t1 = dayjs(a.date).valueOf();
        const t2 = dayjs(b.date).valueOf();
        return sort === 'newest' ? t2 - t1 : t1 - t2;
      });
  }, [monthFilter, rows, search, sort, statusFilter]);

  const pagedRows = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, page, rowsPerPage]);

  React.useEffect(() => {
    setPage(0);
  }, [search, statusFilter, monthFilter, sort]);

  const stats = React.useMemo(() => {
    const todayKey = dayjs().format('YYYY-MM-DD');
    const totalSales = rows.reduce((acc, row) => acc + row.total, 0);
    const pendingPayments = rows.filter(row => row.status === 'pending').reduce((acc, row) => acc + Math.max(row.total - row.paidAmount, 0), 0);
    const paidOrders = rows.filter(row => row.status === 'paid').length;
    const ordersToday = rows.filter(row => dayjs(row.date).format('YYYY-MM-DD') === todayKey).length;
    const currentMonth = dayjs().format('YYYY-MM');
    const ordersThisMonth = rows.filter(row => row.month === currentMonth).length;
    return { totalSales, pendingPayments, paidOrders, ordersToday, ordersThisMonth };
  }, [rows]);

  const rowMenuTarget = React.useMemo(() => rows.find(row => row.id === menuOrderId) ?? null, [menuOrderId, rows]);

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
      const target = rows.find(row => row.id === targetId);
      if (!target || target.status === 'cancelled') return;

      setUpdatingOrderId(targetId);
      try {
        await updateOrderStatus(targetId, 'paid');
        await loadOrders();
      } catch {
        setLoadError('อัปเดตสถานะชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [loadOrders, rows]
  );

  const cancelOrder = React.useCallback(
    async (targetId: string) => {
      const target = rows.find(row => row.id === targetId);
      if (!target) return;

      setUpdatingOrderId(targetId);
      try {
        await updateOrderStatus(targetId, 'cancelled');
        await loadOrders();
      } catch {
        setLoadError('ยกเลิกรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [loadOrders, rows]
  );

  React.useEffect(() => {
    if (!selectedOrder) return;
    const latest = rows.find(row => row.id === selectedOrder.id) ?? null;
    setSelectedOrder(latest);
  }, [rows, selectedOrder]);

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
                  <MissingApiConfigState subtitle="กรุณาตั้งค่า NEXT_PUBLIC_API_URL เพื่อให้หน้ารายการออเดอร์ดึงข้อมูลจากระบบได้" />
                </Box>
              ) : null}

              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2.2}>
                <Box>
                  <Typography sx={{ color: '#101828', fontWeight: 800, fontSize: { xs: 30, md: 38 }, lineHeight: 1.06 }}>Orders</Typography>
                  <Typography sx={{ mt: 1, color: '#475467', fontSize: { xs: 14, md: 16 } }}>ติดตามออเดอร์ลูกค้า สถานะการชำระเงิน งานพิมพ์ และจัดการเอกสารการขายแบบครบวงจร</Typography>
                  <Typography sx={{ mt: 1, color: '#94A3B8', fontSize: 12.5 }}>Last synced {lastUpdated ? lastUpdated.format('DD/MM/YYYY HH:mm') : '-'}</Typography>
                  {loadError ? <Typography sx={{ mt: 0.8, color: '#C62828', fontSize: 12.5 }}>{loadError}</Typography> : null}
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                  <Tooltip title="Notifications">
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
                    {isLoading ? 'Refreshing...' : 'Refresh'}
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
                    Export Report
                  </Button>

                  <Button
                    startIcon={<AddShoppingCartRoundedIcon />}
                    variant="contained"
                    sx={{
                      ...commonButtonSx,
                      borderRadius: 3,
                      textTransform: 'none',
                      bgcolor: '#2B62EE',
                      boxShadow: '0 14px 28px rgba(43, 98, 238, 0.34)',
                    }}>
                    Create New Order
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
            <StatCard title="Total Sales" value={`฿${formatMoney(stats.totalSales)}`} subtitle="ยอดขายรวมทั้งหมด" tone="#1E5EFF" icon={<AttachMoneyRoundedIcon />} />
          </MotionDiv>
          <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}>
            <StatCard title="Pending Payments" value={`฿${formatMoney(stats.pendingPayments)}`} subtitle="ยอดที่รอยืนยันการชำระ" tone="#F08C00" icon={<PaymentsRoundedIcon />} />
          </MotionDiv>
          <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            <StatCard title="Paid Orders" value={`${stats.paidOrders}`} subtitle="รายการที่ชำระแล้ว" tone="#1F9D63" icon={<FactCheckRoundedIcon />} />
          </MotionDiv>
          <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}>
            <StatCard title="Orders Today" value={`${stats.ordersToday}`} subtitle="ออเดอร์ในวันนี้" tone="#5C6AC4" icon={<TodayRoundedIcon />} />
          </MotionDiv>
          <MotionDiv initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
            <StatCard title="Orders This Month" value={`${stats.ordersThisMonth}`} subtitle="ออเดอร์ประจำเดือน" tone="#2563EB" icon={<CalendarMonthRoundedIcon />} />
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
                <Typography sx={{ color: '#102A43', fontWeight: 800, fontSize: 15 }}>Search & Filter</Typography>
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
                  placeholder="ค้นหาชื่อลูกค้า / Order ID / เบอร์โทร"
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
                  <InputLabel id="status-filter">Status</InputLabel>
                  <Select<'all' | PaymentStatus>
                    labelId="status-filter"
                    value={statusFilter}
                    label="Status"
                    onChange={event => setStatusFilter(event.target.value)}
                    sx={{ borderRadius: 3, height: 46, bgcolor: '#FFFFFF', boxShadow: '0 8px 18px rgba(38, 63, 102, 0.08)' }}>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="paid">Paid</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel id="month-filter">Month</InputLabel>
                  <Select<string>
                    labelId="month-filter"
                    value={monthFilter}
                    label="Month"
                    onChange={event => setMonthFilter(event.target.value)}
                    sx={{ borderRadius: 3, height: 46, bgcolor: '#FFFFFF', boxShadow: '0 8px 18px rgba(38, 63, 102, 0.08)' }}>
                    <MenuItem value="all">All</MenuItem>
                    {months.map(month => (
                      <MenuItem key={month} value={month}>
                        {dayjs(`${month}-01`).format('MMM YYYY')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel id="sort-filter">Sort</InputLabel>
                  <Select<SortOrder>
                    labelId="sort-filter"
                    value={sort}
                    label="Sort"
                    onChange={event => setSort(event.target.value)}
                    sx={{ borderRadius: 3, height: 46, bgcolor: '#FFFFFF', boxShadow: '0 8px 18px rgba(38, 63, 102, 0.08)' }}>
                    <MenuItem value="newest">Newest</MenuItem>
                    <MenuItem value="oldest">Oldest</MenuItem>
                    <MenuItem value="high">Highest Total</MenuItem>
                    <MenuItem value="low">Lowest Total</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    px: 1.9,
                    textTransform: 'none',
                    fontWeight: 700,
                    minHeight: 46,
                    borderColor: '#D7E3F4',
                  }}>
                  ตัวกรองเพิ่มเติม
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ ...uiCardSx, borderRadius: 4.5, overflow: 'hidden' }}>
          <Box sx={{ px: 2.2, py: 1.6, borderBottom: '1px solid #ECF1F8', bgcolor: '#FCFDFF' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontWeight: 800, color: '#102A43' }}>Order Management</Typography>
              <Chip label={`${filteredRows.length} รายการ`} sx={{ borderRadius: 2, bgcolor: '#ECF3FF', color: '#2957D8', fontWeight: 700 }} />
            </Stack>
          </Box>

          {isMobile ? (
            <Stack spacing={1.2} sx={{ p: 1.4 }}>
              {pagedRows.length === 0 ? (
                <EmptyState
                  compact
                  icon={<SearchRoundedIcon fontSize="small" />}
                  eyebrow="Orders"
                  title="ไม่พบรายการออเดอร์ที่ตรงกับเงื่อนไข"
                  subtitle="ลองเปลี่ยนคำค้นหา ตัวกรอง หรือช่วงเวลาเพื่อดูรายการเพิ่มเติม"
                  sx={{ py: 4.5 }}
                />
              ) : null}

              {pagedRows.map(row => (
                <Card key={row.id} variant="outlined" sx={{ borderRadius: 3, borderColor: '#E8EDF5' }}>
                  <CardContent sx={{ p: 1.5 }}>
                    <Stack spacing={1.2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack>
                          <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>{row.orderId}</Typography>
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
            <Box sx={{ width: '100%', overflowX: 'auto', ...tableShellSx }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagedRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <EmptyState
                          compact
                          icon={<SearchRoundedIcon fontSize="small" />}
                          eyebrow="Orders"
                          title="ไม่พบรายการออเดอร์ที่ตรงกับเงื่อนไข"
                          subtitle="ลองเปลี่ยนคำค้นหา ตัวกรอง หรือช่วงเวลาเพื่อดูรายการเพิ่มเติม"
                        />
                      </TableCell>
                    </TableRow>
                  ) : null}

                  {pagedRows.map(row => (
                    <TableRow
                      key={row.id}
                      hover
                      onClick={() => openDrawer(row)}
                      sx={{
                        cursor: 'pointer',
                        '& td': { borderBottomColor: '#EEF2F7' },
                        '&:hover': { bgcolor: '#F7FAFF' },
                      }}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>{row.orderId}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700 }}>{row.customerName}</Typography>
                      </TableCell>
                      <TableCell>{row.phoneNumber}</TableCell>
                      <TableCell>{dayjs(row.date).format('DD/MM/YYYY HH:mm')}</TableCell>
                      <TableCell>{statusChip(row.status)}</TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 800 }}>฿{formatMoney(row.total)}</Typography>
                      </TableCell>
                      <TableCell align="right" onClick={event => event.stopPropagation()}>
                        <Stack direction="row" spacing={0.7} justifyContent="flex-end">
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => openDrawer(row)}>
                              <VisibilityRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Actions">
                            <IconButton size="small" onClick={event => openRowMenu(event, row.id)}>
                              <MoreHorizRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
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
            labelRowsPerPage="Rows per page"
          />
        </Card>
      </Stack>

      <Menu
        open={Boolean(exportAnchor)}
        anchorEl={exportAnchor}
        onClose={() => setExportAnchor(null)}
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
        <MenuItem
          onClick={() => {
            downloadCsv(filteredRows, 'excel');
            setExportAnchor(null);
          }}>
          Export Excel
        </MenuItem>
        <MenuItem
          onClick={() => {
            downloadCsv(filteredRows, 'pdf');
            setExportAnchor(null);
          }}>
          Export PDF
        </MenuItem>
        <MenuItem
          onClick={() => {
            downloadCsv(filteredRows, 'sales');
            setExportAnchor(null);
          }}>
          Export Sales Report
        </MenuItem>
      </Menu>

      <Menu
        open={Boolean(rowMenuAnchor)}
        anchorEl={rowMenuAnchor}
        onClose={closeRowMenu}
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
            if (rowMenuTarget) openDrawer(rowMenuTarget);
            closeRowMenu();
          }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <VisibilityRoundedIcon fontSize="small" />
            <Typography sx={{ fontSize: 14 }}>View Details</Typography>
          </Stack>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (rowMenuTarget) printDocument(rowMenuTarget, 'receipt');
            closeRowMenu();
          }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <PrintRoundedIcon fontSize="small" />
            <Typography sx={{ fontSize: 14 }}>Print Receipt</Typography>
          </Stack>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (rowMenuTarget) printDocument(rowMenuTarget, 'invoice');
            closeRowMenu();
          }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <ReceiptRoundedIcon fontSize="small" />
            <Typography sx={{ fontSize: 14 }}>Print Tax Invoice</Typography>
          </Stack>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (rowMenuTarget) {
              void markAsPaid(rowMenuTarget.id);
            }
            closeRowMenu();
          }}
          disabled={rowMenuTarget?.status !== 'pending' || updatingOrderId === (rowMenuTarget?.id ?? '')}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircleRoundedIcon fontSize="small" />
            <Typography sx={{ fontSize: 14 }}>Confirm Payment</Typography>
          </Stack>
        </MenuItem>
        <MenuItem
          sx={{ color: '#D73A49' }}
          onClick={() => {
            if (rowMenuTarget) {
              void cancelOrder(rowMenuTarget.id);
            }
            closeRowMenu();
          }}
          disabled={!rowMenuTarget || updatingOrderId === (rowMenuTarget?.id ?? '')}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CancelRoundedIcon fontSize="small" />
            <Typography sx={{ fontSize: 14 }}>Cancel Order</Typography>
          </Stack>
        </MenuItem>
      </Menu>

      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={drawerOpen}
        onClose={closeDrawer}
        slotProps={{
          paper: {
            sx: {
              width: isMobile ? '100%' : { sm: 420, md: 480, lg: 560 },
              maxHeight: isMobile ? '94vh' : '100vh',
              height: isMobile ? 'min(94vh, 860px)' : '100%',
              borderTopLeftRadius: isMobile ? 18 : 22,
              borderTopRightRadius: isMobile ? 18 : 0,
              borderBottomLeftRadius: isMobile ? 0 : 22,
              borderBottomRightRadius: 0,
              background: 'linear-gradient(180deg, #FBFDFF 0%, #FFFFFF 100%)',
              overflow: 'hidden',
            },
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
                  <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>Order Detail</Typography>
                  <Typography sx={{ mt: 0.4, color: '#64748B' }}>
                    {selectedOrder.orderId} • {selectedOrder.customerName}
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
                {selectedOrder.status === 'pending' ? (
                  <Card sx={{ borderRadius: 3, border: '1px solid #FFD8A8', bgcolor: '#FFF8ED', boxShadow: 'none' }}>
                    <CardContent sx={{ py: 1.2 }}>
                      <Typography sx={{ color: '#B9650A', fontWeight: 700 }}>Pending payment order: Remaining ฿{formatMoney(Math.max(selectedOrder.total - selectedOrder.paidAmount, 0))}</Typography>
                    </CardContent>
                  </Card>
                ) : null}

                <Card sx={{ borderRadius: 3.8, border: '1px solid #E6EDF7', boxShadow: 'none' }}>
                  <CardContent>
                    <Stack spacing={1.1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: alpha('#1E5EFF', 0.14), color: '#2156D8' }}>
                          <ReceiptLongRoundedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography sx={{ fontWeight: 700 }}>Order Information</Typography>
                      </Stack>
                      <Typography sx={{ color: '#334155' }}>
                        <strong>Order ID:</strong> {selectedOrder.orderId}
                      </Typography>
                      <Typography sx={{ color: '#334155' }}>
                        <strong>Order Date:</strong> {dayjs(selectedOrder.date).format('DD/MM/YYYY HH:mm')}
                      </Typography>
                      <Typography sx={{ color: '#334155' }}>
                        <strong>Sales Channel:</strong> {selectedOrder.salesChannel}
                      </Typography>
                      <Typography sx={{ color: '#334155' }}>
                        <strong>Staff Name:</strong> {selectedOrder.staffName}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 3.8, border: '1px solid #E6EDF7', boxShadow: 'none' }}>
                  <CardContent>
                    <Stack spacing={1.1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: alpha('#4F46E5', 0.14), color: '#4F46E5' }}>
                          <AccountCircleRoundedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography sx={{ fontWeight: 700 }}>Customer Information</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                        <Typography>{selectedOrder.customerName}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PhoneRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                        <Typography>{selectedOrder.phoneNumber}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <DescriptionRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                        <Typography>{selectedOrder.lineId}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <EmailRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                        <Typography>{selectedOrder.email}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <HomeRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                        <Typography>{selectedOrder.address}</Typography>
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
                        <Typography sx={{ fontWeight: 700 }}>Payment Summary</Typography>
                      </Stack>

                      <Stack direction="row" justifyContent="space-between">
                        <Typography color="text.secondary">Subtotal</Typography>
                        <Typography>฿{formatMoney(selectedOrder.subtotal)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography color="text.secondary">Discount</Typography>
                        <Typography>-฿{formatMoney(selectedOrder.discount)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography color="text.secondary">VAT</Typography>
                        <Typography>฿{formatMoney(selectedOrder.vat)}</Typography>
                      </Stack>
                      <Divider />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontWeight: 700 }}>Final Total</Typography>
                        <Typography sx={{ fontWeight: 800 }}>฿{formatMoney(selectedOrder.total)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography color="text.secondary">Paid Amount</Typography>
                        <Typography sx={{ color: '#18794E', fontWeight: 700 }}>฿{formatMoney(selectedOrder.paidAmount)}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography color="text.secondary">Remaining Balance</Typography>
                        <Typography sx={{ color: '#B9650A', fontWeight: 700 }}>฿{formatMoney(Math.max(selectedOrder.total - selectedOrder.paidAmount, 0))}</Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 3.8, border: '1px solid #E6EDF7', boxShadow: 'none' }}>
                  <CardContent>
                    <Stack spacing={1.1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: alpha('#0EA5A3', 0.14), color: '#0EA5A3' }}>
                          <StorefrontRoundedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Typography sx={{ fontWeight: 700 }}>Payment Method</Typography>
                      </Stack>
                      <Chip label={selectedOrder.paymentMethod} sx={{ ...statusChipSx, width: 'fit-content', bgcolor: '#EEF8FF', color: '#1D4ED8' }} />
                    </Stack>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 3.8, border: '1px solid #E6EDF7', boxShadow: 'none' }}>
                  <CardContent>
                    <Stack spacing={1.1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TimelineRoundedIcon sx={{ color: '#3A73F7', fontSize: 19 }} />
                        <Typography sx={{ fontWeight: 700 }}>Order Timeline</Typography>
                      </Stack>
                      {selectedOrder.timeline.map((event, index) => (
                        <Stack key={`${event.title}-${event.at}-${index}`} direction="row" spacing={1.1} alignItems="flex-start">
                          <Box sx={{ width: 9, height: 9, borderRadius: 99, mt: 0.85, bgcolor: '#3A73F7', flexShrink: 0 }} />
                          <Box>
                            <Typography sx={{ color: '#1E293B', fontWeight: 600 }}>{event.title}</Typography>
                            <Typography sx={{ color: '#94A3B8', fontSize: 12 }}>{dayjs(event.at).format('DD/MM/YYYY HH:mm')}</Typography>
                            {event.note ? <Typography sx={{ color: '#64748B', fontSize: 12.4 }}>{event.note}</Typography> : null}
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
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
                <Button
                  variant="contained"
                  startIcon={<CheckCircleRoundedIcon />}
                  disabled={selectedOrder.status !== 'pending' || updatingOrderId === selectedOrder.id}
                  onClick={() => {
                    void markAsPaid(selectedOrder.id);
                  }}
                  sx={{ ...commonButtonSx, flex: '1 1 auto', width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}>
                  Confirm Payment
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelRoundedIcon />}
                  disabled={updatingOrderId === selectedOrder.id}
                  onClick={() => {
                    void cancelOrder(selectedOrder.id);
                  }}
                  sx={{ ...commonButtonSx, flex: '1 1 auto', width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}>
                  Cancel Order
                </Button>
              </Stack>
            </Box>
          </Stack>
        ) : null}
      </Drawer>
    </AdminPageContainer>
  );
}
