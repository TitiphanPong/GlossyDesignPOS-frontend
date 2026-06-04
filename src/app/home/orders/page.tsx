'use client';

import * as React from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
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
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';

import AdminPageContainer from '../components/AdminPageContainer';
import { commonButtonSx, uiCardSx } from '../components/adminUi';
import { EmptyState, MissingApiConfigState } from '../components/dashboardUi';
import PayRemainingModal from '../saleListPage/components/PayRemainingModal';
import { isMissingApiBaseError } from '../../../lib/api';
import { type NormalizedOrder } from '../../../lib/contracts';
import type { OrderRow, PaymentStatus, SortOrder } from './orderManagementTypes';
import { ExportMenu, OrderDetailDrawer, RowActionsMenu, StatCard } from './orderManagementPanels';
import {
  FILTER_STATUS_LABELS,
  ORDER_TABLE_PAYMENT_LABEL,
  ORDER_TABLE_STATUS_UI,
  SORT_ORDER_LABELS,
  buildOrderLineSummary,
  buildOrderStats,
  fetchOrderRows,
  filterOrderRows,
  formatMoney,
  formatMonthFilterLabel,
  formatOrderRowTime,
  formatTableCurrency,
  formatThaiFullDate,
  getCustomerInitial,
  getLoadOrdersErrorMessage,
  mapApiOrderToRow,
  printDocument,
  statusChip,
  updateOrderStatus,
} from './orderManagementUtils';

const MotionDiv = motion.div;

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
      if (!target || target.status !== 'pending') return;

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
    async (updatedOrder: NormalizedOrder) => {
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
    const totalLabel = count === -1 ? `มากกว่า ${to}` : `${count}`;
    return `${from}-${to} จาก ${totalLabel}`;
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
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ReceiptRoundedIcon fontSize="small" />}
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
                            <Tooltip title="ใบกำกับภาษี">
                              <IconButton size="small" onClick={() => printDocument(row, 'invoice')}>
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
        onOpenPayRemaining={order => {
          setPayRemainingTarget(order);
        }}
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
