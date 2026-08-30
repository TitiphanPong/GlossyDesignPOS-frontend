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
  IconButton,
  Snackbar,
  Stack,
  TablePagination,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
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
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';

import AdminPageContainer from '../components/AdminPageContainer';
import AdminHeroHeader, { heroOutlineButtonSx, heroPrimaryButtonSx } from '../components/AdminHeroHeader';
import ReportFilterPanel, { DATE_PRESET_LABELS, bangkokDateParam, resolveDatePreset, type DatePreset } from '../components/ReportFilterPanel';
import { commonButtonSx, uiCardSx } from '../components/adminUi';
import { EmptyState, MissingApiConfigState } from '../components/dashboardUi';
import DataTable, { DataTableSectionHeader, type DataTableColumn } from '../components/DataTable';
import PayRemainingModal from '../saleListPage/components/PayRemainingModal';
import { isMissingApiBaseError } from '../../../lib/api';
import { type NormalizedOrder, type PaymentMethod, type ProductionWorkflowStatus } from '../../../lib/contracts';
import { convertOrderToTaxInvoice, deleteOrder, downloadOrdersExport, fetchOrderById, type OrderListSummary, updateOrderCustomerInfo } from '../../../lib/orders';
import type { ExportType, OrderRow, SortOrder } from './orderManagementTypes';
import { ExportMenu, OrderDetailDrawer, RowActionsMenu, StatCard } from './orderManagementPanels';
import { parseOrderDrilldownFilters, type OutstandingPaymentFilter } from './orderDrilldownFilters';
import {
  FILTER_WORKFLOW_STATUS_LABELS,
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
  const [workflowStatusFilter, setWorkflowStatusFilter] = React.useState<'all' | ProductionWorkflowStatus>('all');
  const [outstandingPaymentFilter, setOutstandingPaymentFilter] = React.useState<OutstandingPaymentFilter>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = React.useState<'all' | PaymentMethod>('all');
  const [taxInvoiceFilter, setTaxInvoiceFilter] = React.useState<TaxInvoiceFilter>('all');
  const [filtersReady, setFiltersReady] = React.useState(false);
  const [sort, setSort] = React.useState<SortOrder>('newest');
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
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
  const focusedOrderRef = React.useRef<string | null>(null);

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
        workflowStatus: workflowStatusFilter === 'all' ? undefined : workflowStatusFilter,
        payment: outstandingPaymentFilter === 'unpaid' ? 'unpaid' : undefined,
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
  }, [datePreset, endDate, monthFilter, outstandingPaymentFilter, page, paymentMethodFilter, rowsPerPage, search, sort, startDate, taxInvoiceFilter, workflowStatusFilter]);

  React.useEffect(() => {
    const parsed = parseOrderDrilldownFilters(window.location.search);
    setWorkflowStatusFilter(parsed.workflowStatus);
    setOutstandingPaymentFilter(parsed.payment);

    if (parsed.period === 'today') {
      const today = dayjs();
      setDatePreset('today');
      setStartDate(today);
      setEndDate(today);
    } else if (parsed.month) {
      setMonthFilter(parsed.month);
      setDatePreset('month');
      const requestedDate = dayjs(`${parsed.month}-01`);
      setStartDate(requestedDate);
      setEndDate(requestedDate.endOf('month'));
    } else if (parsed.startDate && parsed.endDate) {
      setDatePreset('custom');
      setStartDate(dayjs(parsed.startDate));
      setEndDate(dayjs(parsed.endDate));
    }

    const currentSearch = new URLSearchParams(window.location.search).toString();
    if (parsed.sanitizedSearch !== currentSearch) {
      router.replace(`${window.location.pathname}${parsed.sanitizedSearch ? `?${parsed.sanitizedSearch}` : ''}`);
    }
    setFiltersReady(true);
  }, [router]);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const focusedOrderId = params.get('focus')?.trim();
    if (!focusedOrderId || focusedOrderRef.current === focusedOrderId) return;
    focusedOrderRef.current = focusedOrderId;

    void fetchOrderById(focusedOrderId)
      .then(order => {
        const focusedRow = mapApiOrderToRow(order);
        setSelectedOrder(focusedRow);
        setDrawerOpen(true);
        if (params.get('action') === 'payment' && focusedRow.total > focusedRow.paidAmount) {
          setPayRemainingTarget(focusedRow);
        }
      })
      .catch(error => {
        focusedOrderRef.current = null;
        setLoadError(error instanceof Error && error.message ? error.message : 'ไม่สามารถเปิดรายการจากศูนย์งานได้');
      });
  }, []);

  React.useEffect(() => {
    if (filtersReady) void loadOrders();
  }, [filtersReady, loadOrders]);

  React.useEffect(() => {
    if (!filtersReady) return;
    const params = new URLSearchParams(window.location.search);
    params.delete('status');
    if (workflowStatusFilter === 'all') params.delete('workflowStatus');
    else params.set('workflowStatus', workflowStatusFilter);
    if (outstandingPaymentFilter === 'unpaid') params.set('payment', 'unpaid');
    else params.delete('payment');
    params.delete('period');
    params.delete('month');
    params.delete('startDate');
    params.delete('endDate');
    if (datePreset === 'today') params.set('period', 'today');
    if (datePreset === 'month' && monthFilter !== 'all') params.set('month', monthFilter);
    if (datePreset !== 'all' && datePreset !== 'today' && datePreset !== 'month' && startDate && endDate) {
      params.set('startDate', startDate.format('YYYY-MM-DD'));
      params.set('endDate', endDate.format('YYYY-MM-DD'));
    }

    const nextSearch = params.toString();
    const currentSearch = new URLSearchParams(window.location.search).toString();
    if (nextSearch !== currentSearch) {
      router.replace(`${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}`);
    }
  }, [datePreset, endDate, filtersReady, monthFilter, outstandingPaymentFilter, router, startDate, workflowStatusFilter]);

  const rowsById = React.useMemo(() => new Map(rows.map(row => [row.id, row])), [rows]);

  const pagedRows = rows;

  React.useEffect(() => {
    setPage(0);
  }, [search, monthFilter, datePreset, startDate, endDate, workflowStatusFilter, outstandingPaymentFilter, paymentMethodFilter, taxInvoiceFilter, sort]);

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

  const advanceWorkflow = React.useCallback(
    async (order: OrderRow, status: ProductionWorkflowStatus) => {
      setUpdatingOrderId(order.id);
      setLoadError(null);
      try {
        await updateOrderStatus(order.id, status);
        await loadOrders();
      } catch (error) {
        setLoadError(error instanceof Error && error.message ? error.message : 'อัปเดตสถานะงานไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
        throw error;
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [loadOrders]
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
            workflowStatus: workflowStatusFilter === 'all' ? undefined : workflowStatusFilter,
            payment: outstandingPaymentFilter === 'unpaid' ? 'unpaid' : undefined,
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
    [datePreset, endDate, monthFilter, outstandingPaymentFilter, paymentMethodFilter, search, sort, startDate, taxInvoiceFilter, workflowStatusFilter]
  );

  const labelDisplayedRows = React.useCallback(({ from, to, count }: { from: number; to: number; count: number }) => {
    const totalLabel = count === -1 ? `มากกว่า ${to}` : `${count}`;
    return `${from}-${to} จาก ${totalLabel}`;
  }, []);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    datePreset !== 'all' ||
    workflowStatusFilter !== 'all' ||
    outstandingPaymentFilter !== 'all' ||
    paymentMethodFilter !== 'all' ||
    taxInvoiceFilter !== 'all' ||
    sort !== 'newest';
  const resetFilters = () => {
    setSearch('');
    setMonthFilter('all');
    setDatePreset('all');
    setStartDate(null);
    setEndDate(null);
    setWorkflowStatusFilter('all');
    setOutstandingPaymentFilter('all');
    setPaymentMethodFilter('all');
    setTaxInvoiceFilter('all');
    setSort('newest');
  };

  const orderTableColumns: DataTableColumn<OrderRow>[] = [
    {
      key: 'orderNumber',
      header: 'เลขที่งาน',
      render: row => (
        <>
          <Typography sx={{ display: 'inline-block', fontWeight: 700, color: '#6C4DFF', fontVariantNumeric: 'tabular-nums' }}>{row.orderNumber}</Typography>
          <Chip
            size="small"
            label={row.orderType === 'QUICK_SALE' ? 'งานด่วน' : 'งานปกติ'}
            color={row.orderType === 'QUICK_SALE' ? 'warning' : 'default'}
            sx={{ ml: 0.7, height: 20, fontSize: 10, fontWeight: 700 }}
          />
          {row.isBackdated ? <Chip size="small" label="ย้อนหลัง" color="warning" sx={{ ml: 0.7, height: 20, fontSize: 10, fontWeight: 700 }} /> : null}
          <Typography sx={{ mt: 0.35, fontSize: 11.5, color: '#9CA3AF', whiteSpace: 'nowrap' }}>{row.vat > 0 ? 'ใบกำกับภาษี' : 'ใบเสร็จทั่วไป'}</Typography>
        </>
      ),
    },
    {
      key: 'customer',
      header: 'ลูกค้า',
      render: (row, index) => {
        const avatarHue = (index * 47) % 360;
        return (
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
        );
      },
    },
    {
      key: 'summary',
      header: 'รายการ',
      render: row => {
        const summary = buildOrderLineSummary(row);
        return (
          <Box sx={{ minWidth: 220 }}>
            <Typography sx={{ fontSize: 12.8, fontWeight: 700, color: '#374151', lineHeight: 1.35 }}>{summary.primary}</Typography>
            <Typography sx={{ mt: 0.35, fontSize: 11.5, color: '#9CA3AF', lineHeight: 1.35 }}>{summary.secondary}</Typography>
          </Box>
        );
      },
    },
    {
      key: 'status',
      header: 'สถานะ',
      render: row => {
        const statusUi = ORDER_TABLE_STATUS_UI[row.status];
        return (
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, fontSize: 12.2, fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>
            <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusUi.dot, flexShrink: 0 }} />
            {statusUi.label}
          </Box>
        );
      },
    },
    {
      key: 'total',
      header: 'ยอดรวม',
      align: 'right',
      render: row => (
        <>
          <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#1A1035', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{formatTableCurrency(row.total)}</Typography>
          {row.discount > 0 ? (
            <Typography sx={{ mt: 0.35, fontSize: 11.5, color: '#9CA3AF', whiteSpace: 'nowrap' }}>ส่วนลด ฿ {row.discount.toLocaleString('th-TH')}</Typography>
          ) : null}
        </>
      ),
    },
    {
      key: 'remaining',
      header: 'ยอดคงเหลือ',
      align: 'right',
      render: row => {
        const remaining = Math.max(row.total - row.paidAmount, 0);
        return (
          <>
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
          </>
        );
      },
    },
    {
      key: 'paymentMethod',
      header: 'วิธีชำระเงิน',
      render: row => <Typography sx={{ fontSize: 12.2, color: '#374151', whiteSpace: 'nowrap', fontWeight: 600 }}>{ORDER_TABLE_PAYMENT_LABEL[row.paymentMethod]}</Typography>,
    },
    {
      key: 'createdAt',
      header: 'วันที่รับงาน',
      render: row => {
        const createdAt = formatOrderRowTime(row.date);
        return (
          <>
            <Typography sx={{ fontSize: 11.8, color: '#6B7280', whiteSpace: 'nowrap', fontWeight: 600 }}>{createdAt.relative}</Typography>
            <Typography sx={{ mt: 0.35, fontSize: 11.2, color: '#9CA3AF', whiteSpace: 'nowrap' }}>{createdAt.exact}</Typography>
            {row.isBackdated ? (
              <Typography sx={{ mt: 0.25, fontSize: 10.5, color: '#9A6700', whiteSpace: 'nowrap' }}>บันทึก {formatOrderRowTime(row.createdAt).exact}</Typography>
            ) : null}
          </>
        );
      },
    },
    {
      key: 'actions',
      header: 'จัดการ',
      align: 'right',
      render: row => (
        <Stack direction="row" spacing={0.4} justifyContent="flex-end" onClick={event => event.stopPropagation()}>
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
      ),
    },
  ];

  return (
    <AdminPageContainer>
      <Stack spacing={2.5}>
        <Box>
          <AdminHeroHeader
            title="Orders"
            description="ติดตามรายการงานลูกค้า สถานะการชำระเงิน งานพิมพ์ และเอกสารการขายได้ในหน้าจอเดียว"
            lastSynced={lastUpdated ? lastUpdated.format('DD/MM/YYYY HH:mm') : '-'}
            thaiDate={formatThaiFullDate(lastUpdated)}
            notice={
              missingApiBase || loadError ? (
                <Stack spacing={1}>
                  {missingApiBase ? <MissingApiConfigState subtitle="กรุณาตั้งค่า NEXT_PUBLIC_API_URL เพื่อให้หน้ารายการงานดึงข้อมูลจากระบบได้" /> : null}
                  {loadError ? <Alert severity="warning">{loadError}</Alert> : null}
                </Stack>
              ) : undefined
            }
            actions={
              <>
                <Button
                  onClick={() => {
                    void loadOrders();
                  }}
                  startIcon={<RefreshRoundedIcon />}
                  variant="outlined"
                  disabled={isLoading}
                  sx={heroOutlineButtonSx}>
                  {isLoading ? 'กำลังรีเฟรช...' : 'รีเฟรช'}
                </Button>
                <Button onClick={event => setExportAnchor(event.currentTarget)} startIcon={<FileDownloadRoundedIcon />} variant="outlined" disabled={Boolean(exporting)} sx={heroOutlineButtonSx}>
                  {exporting ? 'กำลังสร้างรายงาน...' : 'ส่งออกรายงาน'}
                </Button>
                <Button component={Link} href="/home/posseller" startIcon={<AddShoppingCartRoundedIcon />} variant="contained" sx={heroPrimaryButtonSx}>
                  สร้างรายการงานใหม่
                </Button>
              </>
            }
            mb={0}
          />
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

        <ReportFilterPanel
          subtitle="ค้นหาและกรองรายการขายย้อนหลัง"
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="ค้นหาชื่อลูกค้า / เลขที่งาน / เบอร์โทรศัพท์ / รายการ"
          onReset={resetFilters}
          resetDisabled={!hasActiveFilters}
          dateRange={{
            preset: datePreset,
            startDate,
            endDate,
            onPresetChange: preset => {
              const range = resolveDatePreset(preset);
              setDatePreset(preset);
              setStartDate(range.start);
              setEndDate(range.end);
              if (preset === 'month' && range.start) setMonthFilter(range.start.format('YYYY-MM'));
              else setMonthFilter('all');
            },
            onStartDateChange: value => {
              if (!value?.isValid()) return;
              setDatePreset('custom');
              setMonthFilter('all');
              setStartDate(value);
              if (endDate && value.isAfter(endDate, 'day')) setEndDate(value);
            },
            onEndDateChange: value => {
              if (!value?.isValid()) return;
              setDatePreset('custom');
              setMonthFilter('all');
              setEndDate(value);
              if (startDate && value.isBefore(startDate, 'day')) setStartDate(value);
            },
          }}
          filters={[
            {
              id: 'status-filter',
              label: 'สถานะงาน',
              value: workflowStatusFilter,
              onChange: value => setWorkflowStatusFilter(value as 'all' | ProductionWorkflowStatus),
              options: Object.entries(FILTER_WORKFLOW_STATUS_LABELS).map(([value, label]) => ({ value, label })),
            },
            {
              id: 'payment-method-filter',
              label: 'วิธีชำระเงิน',
              value: paymentMethodFilter,
              icon: <PaymentsRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />,
              onChange: value => setPaymentMethodFilter(value as 'all' | PaymentMethod),
              options: [
                { value: 'all', label: 'ทั้งหมด' },
                { value: 'cash', label: PAYMENT_METHOD_LABELS_TH.cash },
                { value: 'promptpay', label: PAYMENT_METHOD_LABELS_TH.promptpay },
              ],
            },
            {
              id: 'tax-invoice-filter',
              label: 'ประเภทเอกสาร',
              value: taxInvoiceFilter,
              icon: <DescriptionRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />,
              onChange: value => setTaxInvoiceFilter(value as TaxInvoiceFilter),
              options: [
                { value: 'all', label: TAX_INVOICE_FILTER_LABELS.all },
                { value: 'yes', label: TAX_INVOICE_FILTER_LABELS.yes },
                { value: 'no', label: TAX_INVOICE_FILTER_LABELS.no },
              ],
            },
            {
              id: 'sort-filter',
              label: 'เรียงลำดับ',
              value: sort,
              icon: <SortRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />,
              onChange: value => setSort(value as SortOrder),
              options: [
                { value: 'newest', label: SORT_ORDER_LABELS.newest },
                { value: 'oldest', label: SORT_ORDER_LABELS.oldest },
                { value: 'high', label: SORT_ORDER_LABELS.high },
                { value: 'low', label: SORT_ORDER_LABELS.low },
              ],
            },
          ]}>
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
              {workflowStatusFilter !== 'all' ? (
                <Chip
                  size="small"
                  label={`สถานะงาน: ${FILTER_WORKFLOW_STATUS_LABELS[workflowStatusFilter]}`}
                  onDelete={() => setWorkflowStatusFilter('all')}
                  sx={{ bgcolor: '#EFF6FF', color: '#1D4ED8', borderRadius: 1.5 }}
                />
              ) : null}
              {outstandingPaymentFilter === 'unpaid' ? (
                <Chip size="small" label="ยอดชำระ: มียอดค้าง" onDelete={() => setOutstandingPaymentFilter('all')} sx={{ bgcolor: '#FFF7ED', color: '#C2410C', borderRadius: 1.5 }} />
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
        </ReportFilterPanel>

        <Card
          sx={{
            ...uiCardSx,
            borderRadius: 4.5,
            overflow: 'hidden',
            boxShadow: '0 12px 30px rgba(15, 37, 74, 0.08)',
          }}>
          <DataTableSectionHeader
            title="รายการงานทั้งหมด"
            subtitle={`${totalRows.toLocaleString('th-TH')} รายการตามตัวกรองล่าสุด`}
            countLabel={`${totalRows.toLocaleString('th-TH')} รายการ`}
          />

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
            <DataTable
              columns={orderTableColumns}
              rows={pagedRows}
              getRowKey={row => row.id}
              onRowClick={openDrawer}
              emptyState={{
                icon: <SearchRoundedIcon fontSize="small" />,
                eyebrow: 'รายการงาน',
                title: 'ไม่พบรายการงานที่ตรงกับเงื่อนไข',
                subtitle: 'ลองเปลี่ยนคำค้นหา ตัวกรอง หรือช่วงเวลาเพื่อดูรายการงานเพิ่มเติม',
              }}
            />
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
            rowsPerPageOptions={[10, 25, 50, 100]}
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
        onAdvanceWorkflow={advanceWorkflow}
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
