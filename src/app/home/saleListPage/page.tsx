'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Stack,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  TablePagination,
} from '@mui/material';
import dayjs from 'dayjs';
import PayRemainingModal from './components/PayRemainingModal';
import { ApiCartItem, ApiOrder, OrderStatus } from '../../../lib/contracts';
import AdminPageContainer from '../components/AdminPageContainer';
import { commonButtonSx, sectionTitleSx, statusChipSx, tableShellSx, uiCardSx } from '../components/adminUi';
import { EmptyState, LoadingState, SearchToolbar } from '../components/dashboardUi';

type Order = ApiOrder & { cart: ApiCartItem[] };
type OrderFilter = 'all' | 'paid' | 'debt' | OrderStatus;
type SortOrder = 'newest' | 'oldest' | 'high';

const toOrder = (order: ApiOrder): Order => ({ ...order, cart: order.cart ?? [] });
const formatMoney = (amount?: number) => (amount ?? 0).toLocaleString('th-TH');
const isApiOrderArray = (value: unknown): value is ApiOrder[] => Array.isArray(value);

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOrder>('newest');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getPaymentChip = (order: Order) => {
    const remainingTotal = order.remainingTotal ?? order.cart.reduce((s, i) => s + (i.remaining || 0), 0);

    if (order.status === 'cancelled') return <Chip label="ยกเลิก" color="error" size="small" sx={statusChipSx} />;
    if (remainingTotal === 0) return <Chip label="ชำระครบ" color="success" size="small" sx={statusChipSx} />;
    if (order.status === 'pending') return <Chip label="รอดำเนินการ" color="info" size="small" sx={statusChipSx} />;
    return <Chip label="ค้างชำระ" color="warning" size="small" sx={statusChipSx} />;
  };

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? '';
    if (!base) return;

    fetch(`${base}/orders`)
      .then(async (res) => {
        if (!res.ok) throw new Error('โหลดข้อมูลล้มเหลว');
        return res.json();
      })
      .then((data) => {
        const normalized = isApiOrderArray(data) ? data.map(toOrder) : [];
        setOrders(normalized);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const remaining = order.cart.reduce((s, i) => s + (i.remaining || 0), 0);
        const q = search.trim().toLowerCase();

        if (filter === 'debt' && (order.status === 'cancelled' || remaining <= 0)) return false;
        if (filter === 'paid' && (order.status === 'cancelled' || remaining > 0)) return false;
        if (filter === 'cancelled' && order.status !== 'cancelled') return false;
        if (filter === 'pending' && order.status !== 'pending') return false;

        if (!q) return true;
        return order.orderId.toLowerCase().includes(q) || order.customerName?.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        if (sort === 'high') return (b.total ?? 0) - (a.total ?? 0);
        const t1 = new Date(a.createdAt || '').getTime();
        const t2 = new Date(b.createdAt || '').getTime();
        return sort === 'newest' ? t2 - t1 : t1 - t2;
      });
  }, [orders, filter, search, sort]);

  const pagedOrders = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredOrders.slice(start, start + rowsPerPage);
  }, [filteredOrders, page, rowsPerPage]);

  useEffect(() => {
    setPage(0);
  }, [filter, search, sort]);

  const paidCount = orders.filter((order) => (order.remainingTotal ?? 0) === 0 && order.status !== 'cancelled').length;
  const debtCount = orders.filter((order) => (order.remainingTotal ?? 0) > 0 && order.status !== 'cancelled').length;
  const totalAmount = orders.reduce((sum, order) => sum + (order.total ?? 0), 0);

  if (loading) {
    return (
      <AdminPageContainer title="รายการออเดอร์" subtitle="ติดตามยอดขายและสถานะการชำระเงิน">
        <LoadingState />
      </AdminPageContainer>
    );
  }

  return (
    <AdminPageContainer title="รายการออเดอร์" subtitle="ติดตามยอดขาย สถานะการชำระเงิน และประวัติรายการย้อนหลังแบบอ่านง่าย">
      <Stack spacing={2.5}>
        <SearchToolbar>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
            <TextField
              size="small"
              placeholder="ค้นหาเลขออเดอร์ / ชื่อลูกค้า..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 170 } }}>
              <InputLabel id="status-select-label">สถานะ</InputLabel>
              <Select<OrderFilter> labelId="status-select-label" value={filter} label="สถานะ" onChange={(e) => setFilter(e.target.value)}>
                <MenuItem value="all">ทั้งหมด</MenuItem>
                <MenuItem value="paid">ชำระแล้ว</MenuItem>
                <MenuItem value="debt">ค้างชำระ</MenuItem>
                <MenuItem value="pending">รอดำเนินการ</MenuItem>
                <MenuItem value="cancelled">ยกเลิก</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 } }}>
              <InputLabel id="sort-select-label">เรียง</InputLabel>
              <Select<SortOrder> labelId="sort-select-label" value={sort} label="เรียง" onChange={(e) => setSort(e.target.value)}>
                <MenuItem value="newest">ล่าสุดก่อน</MenuItem>
                <MenuItem value="oldest">เก่าสุดก่อน</MenuItem>
                <MenuItem value="high">ยอดสูงสุด</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </SearchToolbar>

        <Card sx={{ ...uiCardSx, p: 2 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
            <Typography sx={{ ...sectionTitleSx, fontSize: { xs: '1.15rem', md: '1.3rem' } }}>สรุปภาพรวม</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`ยอดขายรวม ฿${formatMoney(totalAmount)}`} sx={{ ...statusChipSx, fontWeight: 700, bgcolor: '#eef6ff' }} />
              <Chip label={`ชำระแล้ว ${paidCount} รายการ`} color="success" sx={statusChipSx} />
              <Chip label={`ค้างชำระ ${debtCount} รายการ`} color="warning" sx={statusChipSx} />
              <Chip label={`ทั้งหมด ${filteredOrders.length} รายการ`} color="default" sx={statusChipSx} />
            </Stack>
          </Stack>
        </Card>

        <Card sx={uiCardSx}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ px: 2, pt: 2, gap: 1 }}>
            <Typography sx={{ ...sectionTitleSx, fontSize: { xs: '1.15rem', md: '1.3rem' } }}>ประวัติรายการออเดอร์</Typography>
            <Typography sx={{ fontSize: 14 }}>หน้า {page + 1}</Typography>
          </Stack>

          <Box sx={{ width: '100%', overflowX: 'auto', ...tableShellSx }}>
            <Table size="medium" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>ลูกค้า</TableCell>
                  <TableCell>เบอร์โทร</TableCell>
                  <TableCell>วันที่</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell align="right">ยอดรวม</TableCell>
                  <TableCell align="right">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagedOrders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>{order.orderId}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{order.customerName || '-'}</Typography>
                    </TableCell>
                    <TableCell>{order.phoneNumber || '-'}</TableCell>
                    <TableCell>{order.createdAt ? dayjs(order.createdAt).format('DD/MM/YYYY HH:mm') : '-'}</TableCell>
                    <TableCell>{getPaymentChip(order)}</TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 700 }}>฿{formatMoney(order.total)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" variant="outlined" onClick={() => setSelectedOrder(order)} sx={commonButtonSx}>
                        ดูรายละเอียด
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {pagedOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <EmptyState title="ไม่พบรายการที่ตรงกับเงื่อนไข" subtitle="ลองปรับคำค้นหา ตัวกรอง หรือรูปแบบการเรียงลำดับ" />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          <TablePagination
            component="div"
            count={filteredOrders.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number.parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50]}
            labelRowsPerPage="แถวต่อหน้า"
          />
        </Card>
      </Stack>

      <Dialog open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>รายละเอียดออเดอร์ #{selectedOrder?.orderId}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1} mb={2}>
            <Typography><strong>ลูกค้า:</strong> {selectedOrder?.customerName || '-'}</Typography>
            <Typography><strong>เบอร์โทร:</strong> {selectedOrder?.phoneNumber || '-'}</Typography>
            <Typography><strong>หมายเหตุ:</strong> {selectedOrder?.note || '-'}</Typography>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Typography fontWeight={700} gutterBottom>รายการสินค้า</Typography>
          <Stack spacing={1.5}>
            {selectedOrder?.cart.map((item, i) => (
              <Box key={`${item.category}-${item.name}-${item.qty}-${item.totalPrice}-${item.productNote ?? 'none'}`} sx={{ p: 1.6, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'grey.50' }}>
                <Typography fontWeight={600}>{i + 1}. {item.category} {item.productNote ? `(${item.productNote})` : ''}</Typography>
                <Typography variant="body2">จำนวน: {item.qty} x ราคา: {formatMoney(item.totalPrice)} บาท</Typography>
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          {selectedOrder && (selectedOrder.remainingTotal ?? 0) > 0 && (
            <Button variant="contained" color="success" onClick={() => setPayDialogOpen(true)} sx={commonButtonSx}>ชำระยอดคงเหลือ</Button>
          )}
          <Button onClick={() => setSelectedOrder(null)} sx={commonButtonSx}>ปิด</Button>
        </DialogActions>
      </Dialog>
      <PayRemainingModal
        open={payDialogOpen}
        orderId={selectedOrder?._id || ''}
        remaining={selectedOrder?.cart.reduce((s, i) => s + (i.remaining || 0), 0) || 0}
        onClose={() => setPayDialogOpen(false)}
        onSuccess={(updated) => {
          const normalized = toOrder(updated);
          setOrders((prev) => prev.map((o) => (o._id === normalized._id ? normalized : o)));
          setSelectedOrder(normalized);
        }}
      />
    </AdminPageContainer>
  );
}


