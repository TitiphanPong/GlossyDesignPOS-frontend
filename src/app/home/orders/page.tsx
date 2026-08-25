'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Snackbar,
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
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';

import AdminPageContainer from '../components/AdminPageContainer';
import { commonButtonSx, uiCardSx } from '../components/adminUi';
import { EmptyState, MissingApiConfigState } from '../components/dashboardUi';
import PayRemainingModal from '../saleListPage/components/PayRemainingModal';
import { isMissingApiBaseError } from '../../../lib/api';
import { type NormalizedOrder, type PaymentMethod } from '../../../lib/contracts';
import { convertOrderToTaxInvoice, deleteOrder, downloadOrdersExport, type OrderListSummary, updateOrderCustomerInfo } from '../../../lib/orders';
import type { ExportType, OrderRow, SortOrder } from './orderManagementTypes';
import { ExportMenu, OrderDetailDrawer, RowActionsMenu, StatCard } from './orderManagementPanels';
import {
  ORDER_TABLE_PAYMENT_LABEL,
  ORDER_TABLE_STATUS_UI,
  PAYMENT_METHOD_LABELS_TH,
  SORT_ORDER_LABELS,
  buildOrderLineSummary,
  fetchOrderRows,
  formatMoney,
  formatMonthFilterLabel,
  formatOrderRowTime,
  formatTableCurrency,
  formatThaiFullDate,
  getCustomerInitial,
  getLoadOrdersErrorMessage,
  getPrintDocumentPath,
  mapApiOrderToRow,
  statusChip,
  updateOrderStatus,
} from './orderManagementUtils';

type TaxInvoiceFilter = 'all' | 'yes' | 'no';
type DatePreset = 'all' | 'today' | 'last7' | 'last30' | 'month' | 'custom';

const DATE_PRESET_LABELS: Record<Exclude<DatePreset, 'custom'>, string> = {
  all: 'ทั้งหมด',
  today: 'วันนี้',
  last7: 'ย้อนหลัง 7 วัน',
  last30: '30 วัน',
  month: 'เดือนนี้',
};

function bangkokDateParam(value: dayjs.Dayjs, endOfDay = false): string {
  return `${value.format('YYYY-MM-DD')}T${endOfDay ? '23:59:59' : '00:00:00'}+07:00`;
}

function resolveDatePreset(preset: Exclude<DatePreset, 'custom'>): { start: dayjs.Dayjs | null; end: dayjs.Dayjs | null } {
  const today = dayjs();
  if (preset === 'all') return { start: null, end: null };
  if (preset === 'today') return { start: today, end: today };
  if (preset === 'last7') return { start: today.subtract(6, 'day'), end: today };
  if (preset === 'last30') return { start: today.subtract(29, 'day'), end: today };
  return { start: today.startOf('month'), end: today };
}

type ReportDateRangePanelProps = {
  preset: DatePreset;
  startDate: dayjs.Dayjs | null;
  endDate: dayjs.Dayjs | null;
  onPresetChange: (preset: Exclude<DatePreset, 'custom'>) => void;
  onStartDateChange: (value: dayjs.Dayjs | null) => void;
  onEndDateChange: (value: dayjs.Dayjs | null) => void;
};

function ReportDateRangePanel({ preset, startDate, endDate, onPresetChange, onStartDateChange, onEndDateChange }: Readonly<ReportDateRangePanelProps>) {
  const dateFieldSx = {
    '& .MuiOutlinedInput-root': {
      height: 48,
      borderRadius: 1.5,
      bgcolor: '#FFFFFF',
      '& fieldset': { borderColor: '#E2E8F0', borderWidth: 1 },
      '&:hover fieldset': { borderColor: '#94A3B8' },
      '&.Mui-focused fieldset': { borderColor: '#2563EB' },
    },
    '& .MuiInputBase-input': { fontSize: 13, py: 0 },
  };

  return (
    <Box
      sx={{
        gridColumn: { xs: 'auto', lg: 2 },
        gridRow: { xs: 'auto', lg: '1 / span 2' },
        border: '1px solid #E2E8F0',
        borderRadius: 2.5,
        p: { xs: 1.5, sm: 2.25 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minWidth: 0,
      }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: 1.5, display: 'grid', placeItems: 'center', bgcolor: '#EFF6FF', color: '#2563EB' }}>
          <CalendarMonthRoundedIcon sx={{ fontSize: 19 }} />
        </Box>
        <Typography sx={{ color: '#0F172A', fontWeight: 700, fontSize: 15 }}>ช่วงวันที่</Typography>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.5, p: 0.5, border: '1px solid #E2E8F0', borderRadius: 1.75, mb: 2 }}>
        {(['today', 'last7', 'month'] as const).map(item => (
          <Button
            key={item}
            variant="text"
            onClick={() => onPresetChange(item)}
            aria-pressed={preset === item}
            sx={{
              minWidth: 0,
              minHeight: 38,
              px: 0.5,
              borderRadius: 1.25,
              textTransform: 'none',
              color: preset === item ? '#1D4ED8' : '#64748B',
              bgcolor: preset === item ? '#EFF6FF' : 'transparent',
              fontSize: 12.5,
              fontWeight: preset === item ? 700 : 600,
              '&:hover': { bgcolor: '#F8FAFC' },
            }}>
            {DATE_PRESET_LABELS[item]}
          </Button>
        ))}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) auto minmax(0, 1fr)' }, alignItems: 'end', gap: 0.75 }}>
        <DatePicker
          label="วันที่เริ่มต้น"
          value={startDate}
          maxDate={endDate ?? dayjs()}
          format="DD/MM/YYYY"
          onChange={onStartDateChange}
          slotProps={{ textField: { size: 'small', fullWidth: true, sx: dateFieldSx } }}
        />
        <Typography sx={{ display: { xs: 'none', sm: 'block' }, pb: 1.6, color: '#94A3B8', fontSize: 18 }}>→</Typography>
        <DatePicker
          label="วันที่สิ้นสุด"
          value={endDate}
          minDate={startDate ?? undefined}
          maxDate={dayjs()}
          format="DD/MM/YYYY"
          onChange={onEndDateChange}
          slotProps={{ textField: { size: 'small', fullWidth: true, sx: dateFieldSx } }}
        />
      </Box>
      {preset === 'custom' ? <Typography sx={{ mt: 0.75, color: '#2563EB', fontSize: 12, fontWeight: 600 }}>กำหนดเอง</Typography> : null}
    </Box>
  );
}

const TAX_INVOICE_FILTER_LABELS: Record<TaxInvoiceFilter, string> = {
  all: 'ทั้งหมด',
  yes: 'ใบกำกับภาษี',
  no: 'ใบเสร็จทั่วไป',
};

export default function OrderManagementPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isCompactDrawer = useMediaQuery(theme.breakpoints.down('lg'));

  const [rows, setRows] = React.useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [missingApiBase, setMissingApiBase] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [monthFilter, setMonthFilter] = React.useState<string>('all');
  const [datePreset, setDatePreset] = React.useState<DatePreset>('all');
  const [startDate, setStartDate] = React.useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = React.useState<dayjs.Dayjs | null>(null);
  const [paymentMethodFilter, setPaymentMethodFilter] = React.useState<'all' | PaymentMethod>('all');
  const [taxInvoiceFilter, setTaxInvoiceFilter] = React.useState<TaxInvoiceFilter>('all');
  const [filtersReady, setFiltersReady] = React.useState(false);
  const [sort, setSort] = React.useState<SortOrder>('newest');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(8);
  const [totalRows, setTotalRows] = React.useState(0);
  const [stats, setStats] = React.useState<OrderListSummary>({ sales: 0, collections: 0, outstanding: 0, orders: 0, paidOrders: 0, cancelledOrders: 0 });

  const [selectedOrder, setSelectedOrder] = React.useState<OrderRow | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [rowMenuAnchor, setRowMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [menuOrderId, setMenuOrderId] = React.useState<string | null>(null);
  const [exportAnchor, setExportAnchor] = React.useState<null | HTMLElement>(null);
  const [exporting, setExporting] = React.useState<ExportType | null>(null);
  const [exportError, setExportError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<dayjs.Dayjs | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = React.useState<string | null>(null);
  const [payRemainingTarget, setPayRemainingTarget] = React.useState<OrderRow | null>(null);
  const [cancelTarget, setCancelTarget] = React.useState<OrderRow | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<OrderRow | null>(null);
  const [deletePassword, setDeletePassword] = React.useState('');
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const loadRequestRef = React.useRef(0);

  const loadOrders = React.useCallback(async () => {
    const requestId = ++loadRequestRef.current;
    setIsLoading(true);
    setLoadError(null);
    setMissingApiBase(false);

    try {
      const result = await fetchOrderRows({
        page: page + 1,
        limit: rowsPerPage,
        search,
        saleMonth: datePreset === 'month' ? monthFilter : undefined,
        period: datePreset === 'today' ? 'today' : undefined,
        saleFrom: datePreset !== 'all' && datePreset !== 'today' && datePreset !== 'month' && startDate ? bangkokDateParam(startDate) : undefined,
        saleTo: datePreset !== 'all' && datePreset !== 'today' && datePreset !== 'month' && endDate ? bangkokDateParam(endDate, true) : undefined,
        paymentMethod: paymentMethodFilter === 'all' ? undefined : paymentMethodFilter,
        taxInvoice: taxInvoiceFilter === 'all' ? undefined : taxInvoiceFilter,
        sort: sort === 'high' ? 'amount_desc' : sort === 'low' ? 'amount_asc' : sort,
      });
      if (requestId !== loadRequestRef.current) return;
      setRows(result.rows);
      setTotalRows(result.total);
      setStats(result.summary);
      setLastUpdated(dayjs());
    } catch (error) {
      if (requestId !== loadRequestRef.current) return;
      setRows([]);
      setTotalRows(0);
      setStats({ sales: 0, collections: 0, outstanding: 0, orders: 0, paidOrders: 0, cancelledOrders: 0 });
      if (isMissingApiBaseError(error)) {
        setMissingApiBase(true);
      } else {
        setLoadError(getLoadOrdersErrorMessage(error));
      }
    } finally {
      if (requestId === loadRequestRef.current) setIsLoading(false);
    }
  }, [datePreset, endDate, monthFilter, page, paymentMethodFilter, rowsPerPage, search, sort, startDate, taxInvoiceFilter]);

  React.useEffect(() => {
    const requestedMonth = new URLSearchParams(window.location.search).get('month');
    if (requestedMonth && /^\d{4}-(0[1-9]|1[0-2])$/.test(requestedMonth)) {
      setMonthFilter(requestedMonth);
      setDatePreset('month');
      const requestedDate = dayjs(`${requestedMonth}-01`);
      setStartDate(requestedDate);
      setEndDate(requestedDate.endOf('month'));
    }
    setFiltersReady(true);
  }, []);

  React.useEffect(() => {
    if (filtersReady) void loadOrders();
  }, [filtersReady, loadOrders]);

  const rowsById = React.useMemo(() => new Map(rows.map(row => [row.id, row])), [rows]);

  const pagedRows = rows;

  React.useEffect(() => {
    setPage(0);
  }, [search, monthFilter, datePreset, startDate, endDate, paymentMethodFilter, taxInvoiceFilter, sort]);

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

  const printDocument = React.useCallback(
    (row: OrderRow, mode: 'receipt' | 'invoice') => {
      const targetPath = getPrintDocumentPath(row, mode);
      if (targetPath) router.push(targetPath);
    },
    [router]
  );

  const cancelOrder = React.useCallback(
    async (targetId: string) => {
      const target = rowsById.get(targetId);
      if (!target) return false;

      setUpdatingOrderId(targetId);
      try {
        await updateOrderStatus(targetId, 'cancelled');
        await loadOrders();
        return true;
      } catch (error) {
        setLoadError(error instanceof Error && error.message ? error.message : 'ยกเลิกรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        return false;
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [loadOrders, rowsById]
  );

  const saveCustomer = React.useCallback(
    async (order: OrderRow, customer: Pick<OrderRow, 'customerName' | 'phoneNumber' | 'taxId' | 'address'>) => {
      setUpdatingOrderId(order.id);
      setLoadError(null);
      try {
        const updatedOrder = await updateOrderCustomerInfo(order.id, customer);
        const updatedRow = mapApiOrderToRow(updatedOrder);
        setRows(prev => prev.map(row => (row.id === updatedRow.id ? updatedRow : row)));
        setSelectedOrder(updatedRow);
        await loadOrders();
      } catch (error) {
        setLoadError(error instanceof Error && error.message ? error.message : 'แก้ไขข้อมูลลูกค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        throw error;
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [loadOrders]
  );

  const convertToTaxInvoice = React.useCallback(async (order: OrderRow) => {
    setUpdatingOrderId(order.id);
    setLoadError(null);
    try {
      const updatedOrder = await convertOrderToTaxInvoice(order.id);
      const updatedRow = mapApiOrderToRow(updatedOrder);
      setRows(prev => prev.map(row => (row.id === updatedRow.id ? updatedRow : row)));
      setSelectedOrder(updatedRow);
    } catch (error) {
      setLoadError(error instanceof Error && error.message ? error.message : 'ออกใบกำกับภาษีไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      throw error;
    } finally {
      setUpdatingOrderId(null);
    }
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget || !deletePassword) return;
    setUpdatingOrderId(deleteTarget.id);
    setDeleteError(null);
    try {
      await deleteOrder(deleteTarget.id, deletePassword);
      setDeleteTarget(null);
      setDeletePassword('');
      setDrawerOpen(false);
      await loadOrders();
    } catch {
      setDeleteError('รหัสผ่านไม่ถูกต้อง หรือไม่สามารถลบรายการได้');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    const targetId = cancelTarget.id;
    setUpdatingOrderId(targetId);
    setLoadError(null);
    try {
      if (await cancelOrder(targetId)) setCancelTarget(null);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handlePayRemainingSuccess = React.useCallback(
    async (updatedOrder: NormalizedOrder) => {
      const updatedRow = mapApiOrderToRow(updatedOrder);
      setRows(prev => prev.map(row => (row.id === updatedRow.id ? updatedRow : row)));
      setSelectedOrder(prev => (prev?.id === updatedRow.id ? updatedRow : prev));
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

  const handleExport = React.useCallback(
    async (format: ExportType) => {
      setExportAnchor(null);
      setExportError(null);
      setExporting(format);
      try {
        await downloadOrdersExport(
          {
            search,
            saleMonth: datePreset === 'month' ? monthFilter : undefined,
            period: datePreset === 'today' ? 'today' : undefined,
            saleFrom: datePreset !== 'all' && datePreset !== 'today' && datePreset !== 'month' && startDate ? bangkokDateParam(startDate) : undefined,
            saleTo: datePreset !== 'all' && datePreset !== 'today' && datePreset !== 'month' && endDate ? bangkokDateParam(endDate, true) : undefined,
            paymentMethod: paymentMethodFilter === 'all' ? undefined : paymentMethodFilter,
            taxInvoice: taxInvoiceFilter === 'all' ? undefined : taxInvoiceFilter,
            sort: sort === 'high' ? 'amount_desc' : sort === 'low' ? 'amount_asc' : sort,
          },
          format
        );
      } catch {
        setExportError('ไม่สามารถสร้างไฟล์รายงานได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setExporting(null);
      }
    },
    [datePreset, endDate, monthFilter, paymentMethodFilter, search, sort, startDate, taxInvoiceFilter]
  );

  const labelDisplayedRows = React.useCallback(({ from, to, count }: { from: number; to: number; count: number }) => {
    const totalLabel = count === -1 ? `มากกว่า ${to}` : `${count}`;
    return `${from}-${to} จาก ${totalLabel}`;
  }, []);

  const hasActiveFilters = Boolean(search.trim()) || datePreset !== 'all' || paymentMethodFilter !== 'all' || taxInvoiceFilter !== 'all' || sort !== 'newest';
  const resetFilters = () => {
    setSearch('');
    setMonthFilter('all');
    setDatePreset('all');
    setStartDate(null);
    setEndDate(null);
    setPaymentMethodFilter('all');
    setTaxInvoiceFilter('all');
    setSort('newest');
  };

  return (
    <AdminPageContainer>
      <Stack spacing={2.5}>
        <Box>
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
                    disabled={Boolean(exporting)}
                    sx={{
                      ...commonButtonSx,
                      borderRadius: 3,
                      borderColor: '#D7E3F4',
                      bgcolor: '#FFFFFF',
                      color: '#2A4365',
                      textTransform: 'none',
                    }}>
                    {exporting ? 'กำลังสร้างรายงาน...' : 'ส่งออกรายงาน'}
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
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))' },
            gap: 1.4,
          }}>
          <Box>
            <StatCard
              title="ยอดขาย"
              value={`฿${formatMoney(stats.sales)}`}
              subtitle={monthFilter === 'all' ? 'ยอดขายทั้งหมด' : monthFilter === 'today' ? 'ยอดขายวันนี้' : `ยอดขายเดือน ${formatMonthFilterLabel(monthFilter)}`}
              tone="#1E5EFF"
              icon={<AttachMoneyRoundedIcon />}
            />
          </Box>
          <Box>
            <StatCard title="ยอดรอชำระ" value={`฿${formatMoney(stats.outstanding)}`} subtitle="ยอดค้างของรายการตามตัวกรอง" tone="#F08C00" icon={<PaymentsRoundedIcon />} />
          </Box>
          <Box>
            <StatCard title="งานที่ชำระแล้ว" value={`${stats.paidOrders}`} subtitle="จำนวนงานที่ชำระเรียบร้อย" tone="#1F9D63" icon={<FactCheckRoundedIcon />} />
          </Box>
          <Box>
            <StatCard title="งานทั้งหมด" value={`${stats.orders}`} subtitle="จำนวนงานตามตัวกรอง" tone="#5C6AC4" icon={<TodayRoundedIcon />} />
          </Box>
          <Box>
            <StatCard title="งานยกเลิก" value={`${stats.cancelledOrders}`} subtitle="ไม่นับรวมในยอดขาย" tone="#2563EB" icon={<CalendarMonthRoundedIcon />} />
          </Box>
        </Box>

        <Card
          sx={{
            borderRadius: 5,
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
            background: '#FFFFFF',
          }}>
          <CardContent sx={{ p: { xs: 1.5, md: 2.25 } }}>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <TuneRoundedIcon sx={{ color: '#2563EB', fontSize: 19 }} />
                  <Box>
                    <Typography sx={{ color: '#0F172A', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>ค้นหารายงาน</Typography>
                    <Typography sx={{ color: '#64748B', fontSize: 12, mt: 0.25 }}>ค้นหาและกรองรายการขายย้อนหลัง</Typography>
                  </Box>
                </Stack>
                <Button
                  size="small"
                  disabled={!hasActiveFilters}
                  onClick={resetFilters}
                  startIcon={<RefreshRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{ minHeight: 32, px: 1, color: '#64748B', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#F8FAFC', color: '#2563EB' } }}>
                  ล้างตัวกรอง
                </Button>
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.7fr) minmax(360px, 1fr)' },
                  gridTemplateRows: { xs: 'auto', lg: 'auto auto' },
                  gap: { xs: 1.5, lg: 2 },
                  alignItems: 'stretch',
                }}>
                <TextField
                  size="small"
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                  placeholder="ค้นหาชื่อลูกค้า / เลขที่งาน / เบอร์โทรศัพท์ / รายการ"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon sx={{ color: '#6B7A90' }} />
                        </InputAdornment>
                      ),
                      endAdornment: search ? (
                        <InputAdornment position="end">
                          <IconButton aria-label="ล้างคำค้นหา" size="small" onClick={() => setSearch('')} edge="end">
                            <ClearRoundedIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : undefined,
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2.5,
                      height: 64,
                      bgcolor: '#FFFFFF',
                      '& input': { fontSize: 15, color: '#0F172A' },
                      '& fieldset': { borderColor: '#E2E8F0', borderWidth: 1 },
                      '&:hover fieldset': { borderColor: '#94A3B8' },
                      '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)' },
                      '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                    },
                  }}
                />

                <ReportDateRangePanel
                  preset={datePreset}
                  startDate={startDate}
                  endDate={endDate}
                  onPresetChange={preset => {
                    const range = resolveDatePreset(preset);
                    setDatePreset(preset);
                    setStartDate(range.start);
                    setEndDate(range.end);
                    if (preset === 'month' && range.start) setMonthFilter(range.start.format('YYYY-MM'));
                    else setMonthFilter('all');
                  }}
                  onStartDateChange={value => {
                    if (!value || !value.isValid()) return;
                    setDatePreset('custom');
                    setMonthFilter('all');
                    setStartDate(value);
                    if (endDate && value.isAfter(endDate, 'day')) setEndDate(value);
                  }}
                  onEndDateChange={value => {
                    if (!value || !value.isValid()) return;
                    setDatePreset('custom');
                    setMonthFilter('all');
                    setEndDate(value);
                    if (startDate && value.isBefore(startDate, 'day')) setStartDate(value);
                  }}
                />

                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    justifyContent: { xs: 'stretch', sm: 'flex-end' },
                    gridColumn: { xs: 'auto', lg: 1 },
                    gridRow: { xs: 'auto', lg: 2 },
                  }}>
                  <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 190 } }}>
                    <Typography sx={{ mb: 0.4, color: '#475569', fontSize: 12.5, fontWeight: 600, lineHeight: 1.2 }}>วิธีชำระเงิน</Typography>
                    <Select<'all' | PaymentMethod>
                      labelId="payment-method-filter"
                      value={paymentMethodFilter}
                      label="วิธีชำระเงิน"
                      inputProps={{ 'aria-label': 'วิธีชำระเงิน' }}
                      onChange={event => setPaymentMethodFilter(event.target.value as 'all' | PaymentMethod)}
                      startAdornment={
                        <InputAdornment position="start">
                          <PaymentsRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                        </InputAdornment>
                      }
                      sx={{
                        borderRadius: 2,
                        height: 48,
                        bgcolor: '#FFFFFF',
                        '& fieldset': { borderColor: '#E2E8F0', borderWidth: 1 },
                        '&:hover fieldset': { borderColor: '#94A3B8' },
                        '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: 1 },
                      }}>
                      <MenuItem value="all">ทั้งหมด</MenuItem>
                      <MenuItem value="cash">{PAYMENT_METHOD_LABELS_TH.cash}</MenuItem>
                      <MenuItem value="promptpay">{PAYMENT_METHOD_LABELS_TH.promptpay}</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 190 } }}>
                    <Typography sx={{ mb: 0.4, color: '#475569', fontSize: 12.5, fontWeight: 600, lineHeight: 1.2 }}>ประเภทเอกสาร</Typography>
                    <Select<TaxInvoiceFilter>
                      labelId="tax-invoice-filter"
                      value={taxInvoiceFilter}
                      label="ประเภทเอกสาร"
                      inputProps={{ 'aria-label': 'ประเภทเอกสาร' }}
                      onChange={event => setTaxInvoiceFilter(event.target.value as TaxInvoiceFilter)}
                      startAdornment={
                        <InputAdornment position="start">
                          <DescriptionRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                        </InputAdornment>
                      }
                      sx={{
                        borderRadius: 2,
                        height: 48,
                        bgcolor: '#FFFFFF',
                        '& fieldset': { borderColor: '#E2E8F0', borderWidth: 1 },
                        '&:hover fieldset': { borderColor: '#94A3B8' },
                        '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: 1 },
                      }}>
                      <MenuItem value="all">{TAX_INVOICE_FILTER_LABELS.all}</MenuItem>
                      <MenuItem value="yes">{TAX_INVOICE_FILTER_LABELS.yes}</MenuItem>
                      <MenuItem value="no">{TAX_INVOICE_FILTER_LABELS.no}</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 190 } }}>
                    <Typography sx={{ mb: 0.4, color: '#475569', fontSize: 12.5, fontWeight: 600, lineHeight: 1.2 }}>เรียงลำดับ</Typography>
                    <Select<SortOrder>
                      labelId="sort-filter"
                      value={sort}
                      label="เรียงลำดับ"
                      inputProps={{ 'aria-label': 'เรียงลำดับ' }}
                      onChange={event => setSort(event.target.value)}
                      startAdornment={
                        <InputAdornment position="start">
                          <SortRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                        </InputAdornment>
                      }
                      sx={{
                        borderRadius: 2,
                        height: 48,
                        bgcolor: '#FFFFFF',
                        '& fieldset': { borderColor: '#E2E8F0', borderWidth: 1 },
                        '&:hover fieldset': { borderColor: '#94A3B8' },
                        '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: 1 },
                      }}>
                      <MenuItem value="newest">{SORT_ORDER_LABELS.newest}</MenuItem>
                      <MenuItem value="oldest">{SORT_ORDER_LABELS.oldest}</MenuItem>
                      <MenuItem value="high">{SORT_ORDER_LABELS.high}</MenuItem>
                      <MenuItem value="low">{SORT_ORDER_LABELS.low}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {hasActiveFilters ? (
                <Stack direction="row" alignItems="center" flexWrap="wrap" gap={0.75} sx={{ pt: 1.35, borderTop: '1px solid #F1F5F9' }}>
                  <Typography sx={{ color: '#64748B', fontSize: 12, fontWeight: 600, mr: 0.25 }}>ตัวกรองที่ใช้:</Typography>
                  {search.trim() ? (
                    <Chip size="small" label={`ค้นหา: ${search.trim()}`} onDelete={() => setSearch('')} sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', borderRadius: 1.5, maxWidth: '100%' }} />
                  ) : null}
                  {datePreset !== 'all' ? (
                    <Chip
                      size="small"
                      label={datePreset === 'month' ? `เดือน ${formatMonthFilterLabel(monthFilter)}` : datePreset === 'custom' ? 'กำหนดเอง' : DATE_PRESET_LABELS[datePreset]}
                      onDelete={() => {
                        setDatePreset('all');
                        setMonthFilter('all');
                        setStartDate(null);
                        setEndDate(null);
                      }}
                      sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', borderRadius: 1.5 }}
                    />
                  ) : null}
                  {paymentMethodFilter !== 'all' ? (
                    <Chip
                      size="small"
                      label={`ชำระเงิน: ${PAYMENT_METHOD_LABELS_TH[paymentMethodFilter]}`}
                      onDelete={() => setPaymentMethodFilter('all')}
                      sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', borderRadius: 1.5 }}
                    />
                  ) : null}
                  {taxInvoiceFilter !== 'all' ? (
                    <Chip
                      size="small"
                      label={`เอกสาร: ${TAX_INVOICE_FILTER_LABELS[taxInvoiceFilter]}`}
                      onDelete={() => setTaxInvoiceFilter('all')}
                      sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', borderRadius: 1.5 }}
                    />
                  ) : null}
                  {sort !== 'newest' ? (
                    <Chip size="small" label={`เรียง: ${SORT_ORDER_LABELS[sort]}`} onDelete={() => setSort('newest')} sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', borderRadius: 1.5 }} />
                  ) : null}
                </Stack>
              ) : null}
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
              <Typography sx={{ mt: 0.35, fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>{totalRows} รายการตามตัวกรองล่าสุด</Typography>
            </Box>
            <Chip label={`${totalRows} รายการ`} sx={{ borderRadius: '999px', bgcolor: '#F5F0FF', color: '#6C4DFF', fontWeight: 700 }} />
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
                          <Stack direction="row" spacing={0.7} alignItems="center">
                            <Typography sx={{ fontWeight: 800, color: '#0F172A' }}>{row.orderNumber}</Typography>
                            <Chip
                              size="small"
                              label={row.orderType === 'QUICK_SALE' ? 'งานด่วน' : 'งานปกติ'}
                              color={row.orderType === 'QUICK_SALE' ? 'warning' : 'default'}
                              sx={{ height: 22, fontSize: 10.5, fontWeight: 700 }}
                            />
                          </Stack>
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
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ReceiptRoundedIcon fontSize="small" />}
                          disabled={row.taxInvoice !== 'yes'}
                          onClick={() => printDocument(row, 'invoice')}
                          sx={{ ...commonButtonSx, minHeight: 34 }}>
                          ใบกำกับภาษี
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
                          <Chip
                            size="small"
                            label={row.orderType === 'QUICK_SALE' ? 'งานด่วน' : 'งานปกติ'}
                            color={row.orderType === 'QUICK_SALE' ? 'warning' : 'default'}
                            sx={{ ml: 0.7, height: 20, fontSize: 10, fontWeight: 700 }}
                          />
                          {row.isBackdated ? <Chip size="small" label="ย้อนหลัง" color="warning" sx={{ ml: 0.7, height: 20, fontSize: 10, fontWeight: 700 }} /> : null}
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
                          {row.isBackdated ? <Typography sx={{ mt: 0.25, fontSize: 10.5, color: '#9A6700', whiteSpace: 'nowrap' }}>บันทึก {formatOrderRowTime(row.createdAt).exact}</Typography> : null}
                        </TableCell>

                        <TableCell align="right" onClick={event => event.stopPropagation()}>
                          <Stack direction="row" spacing={0.4} justifyContent="flex-end">
                            <Tooltip title="ดูรายละเอียด">
                              <IconButton size="small" onClick={() => openDrawer(row)}>
                                <VisibilityRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="ใบกำกับภาษี">
                              <IconButton size="small" disabled={row.taxInvoice !== 'yes'} onClick={() => printDocument(row, 'invoice')}>
                                <ReceiptRoundedIcon fontSize="small" />
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
            count={totalRows}
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

      <ExportMenu anchorEl={exportAnchor} exporting={exporting} onClose={() => setExportAnchor(null)} onExport={format => void handleExport(format)} />

      <Snackbar open={Boolean(exportError)} autoHideDuration={5000} onClose={() => setExportError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setExportError(null)}>
          {exportError}
        </Alert>
      </Snackbar>

      <RowActionsMenu
        anchorEl={rowMenuAnchor}
        rowMenuTarget={rowMenuTarget}
        updatingOrderId={updatingOrderId}
        onClose={closeRowMenu}
        onOpenDrawer={openDrawer}
        onCancelOrder={targetId => {
          const target = rowsById.get(targetId);
          if (target) setCancelTarget(target);
        }}
        onDeleteOrder={order => {
          setDeleteTarget(order);
          setDeletePassword('');
          setDeleteError(null);
        }}
        onPrintDocument={printDocument}
      />

      <OrderDetailDrawer
        drawerOpen={drawerOpen}
        selectedOrder={selectedOrder}
        isMobile={isMobile}
        isCompactDrawer={isCompactDrawer}
        updatingOrderId={updatingOrderId}
        onClose={closeDrawer}
        onSaveCustomer={saveCustomer}
        onOpenPayRemaining={order => {
          setPayRemainingTarget(order);
        }}
        onConvertToTaxInvoice={convertToTaxInvoice}
        onCancelOrder={targetId => {
          const target = rowsById.get(targetId);
          if (target) setCancelTarget(target);
        }}
        onPrintDocument={printDocument}
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
      <Dialog open={Boolean(cancelTarget)} onClose={() => (updatingOrderId ? undefined : setCancelTarget(null))} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, color: '#B42318' }}>ยืนยันการยกเลิกงาน</DialogTitle>
        <DialogContent>
          <Typography>
            ต้องการยกเลิกงาน <strong>{cancelTarget?.orderNumber}</strong> ใช่หรือไม่? การยกเลิกงานนี้ไม่สามารถย้อนกลับได้
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCancelTarget(null)} disabled={Boolean(updatingOrderId)}>
            ยกเลิก
          </Button>
          <Button color="error" variant="contained" disabled={Boolean(updatingOrderId)} onClick={() => void confirmCancel()}>
            {updatingOrderId ? 'กำลังยกเลิก...' : 'ยืนยันยกเลิกงาน'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(deleteTarget)} onClose={() => (updatingOrderId ? undefined : setDeleteTarget(null))} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800, color: '#B42318' }}>ยืนยันการลบรายการ</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            ต้องการลบงาน <strong>{deleteTarget?.orderNumber}</strong> ใช่หรือไม่? การลบนี้ไม่สามารถกู้คืนได้
          </Typography>
          <TextField
            autoFocus
            fullWidth
            type="password"
            label="รหัสผ่านผู้ใช้งานปัจจุบัน"
            value={deletePassword}
            onChange={event => setDeletePassword(event.target.value)}
            error={Boolean(deleteError)}
            helperText={deleteError}
            onKeyDown={event => {
              if (event.key === 'Enter' && deletePassword) void confirmDelete();
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} disabled={Boolean(updatingOrderId)}>
            ยกเลิก
          </Button>
          <Button color="error" variant="contained" disabled={!deletePassword || Boolean(updatingOrderId)} onClick={() => void confirmDelete()}>
            {updatingOrderId ? 'กำลังลบ...' : 'ลบรายการถาวร'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageContainer>
  );
}
