'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import PayRemainingModal from './components/PayRemainingModal';
import { ApiCartItem, ApiOrder, OrderStatus } from '../../../lib/contracts';
import AdminPageContainer from '../components/AdminPageContainer';
import { commonButtonSx, interactiveCardSx, sectionTitleSx, statusChipSx, tableShellSx, topActionBarSx, uiCardSx } from '../components/adminUi';

type Order = ApiOrder & { cart: ApiCartItem[] };
const toOrder = (order: ApiOrder): Order => ({ ...order, cart: order.cart ?? [] });
const formatMoney = (amount?: number) => (amount ?? 0).toLocaleString('th-TH');

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'debt' | OrderStatus>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'high'>('newest');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(0);
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const pageSize = 6;

  const getPaymentChip = (order: Order) => {
    const remainingTotal = order.remainingTotal ?? order.cart.reduce((s, i) => s + (i.remaining || 0), 0);

    if (order.status === 'cancelled') return <Chip label="Error" color="error" size="small" sx={statusChipSx} />;
    if (remainingTotal === 0) return <Chip label="Success" color="success" size="small" sx={statusChipSx} />;
    if (order.status === 'pending') return <Chip label="Processing" color="info" size="small" sx={statusChipSx} />;
    return <Chip label="Warning" color="warning" size="small" sx={statusChipSx} />;
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
        const normalized = Array.isArray(data) ? (data as ApiOrder[]).map(toOrder) : [];
        setOrders(normalized);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredOrders = orders
    .filter((order) => {
      const remaining = order.cart.reduce((s, i) => s + (i.remaining || 0), 0);
      if (filter === 'debt') return order.status !== 'cancelled' && remaining > 0;
      if (filter === 'paid') return order.status !== 'cancelled' && remaining === 0;
      if (filter === 'cancelled') return order.status === 'cancelled';
      if (filter === 'pending') return order.status === 'pending';
      if (search) return order.orderId.toLowerCase().includes(search.toLowerCase()) || order.customerName?.toLowerCase().includes(search.toLowerCase());
      return true;
    })
    .sort((a, b) => {
      if (sort === 'high') return (b.total ?? 0) - (a.total ?? 0);
      const t1 = new Date(a.createdAt || '').getTime();
      const t2 = new Date(b.createdAt || '').getTime();
      return sort === 'newest' ? t2 - t1 : t1 - t2;
    });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice(page * pageSize, page * pageSize + pageSize);

  const paidCount = orders.filter((order) => (order.remainingTotal ?? 0) === 0 && order.status !== 'cancelled').length;
  const debtCount = orders.filter((order) => (order.remainingTotal ?? 0) > 0 && order.status !== 'cancelled').length;
  const totalAmount = orders.reduce((sum, order) => sum + (order.total ?? 0), 0);

  if (loading) {
    return (
      <Box textAlign="center" py={5}>
        <CircularProgress />
        <Typography mt={2}>กำลังโหลดข้อมูล...</Typography>
      </Box>
    );
  }

  return (
    <AdminPageContainer title="Sales Orders" subtitle="ติดตามประวัติการขาย การชำระเงิน และรายการย้อนหลังแบบมืออาชีพ">
      <Stack spacing={2.5}>
        <Card sx={topActionBarSx}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
            <TextField size="small" placeholder="ค้นหาออเดอร์ / ชื่อลูกค้า..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ flex: 1 }} />
            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 170 } }}>
              <InputLabel id="status-select-label">Filter</InputLabel>
              <Select labelId="status-select-label" value={filter} label="Filter" onChange={(e) => setFilter(e.target.value as 'all' | 'paid' | 'debt' | OrderStatus)}>
                <MenuItem value="all">ทั้งหมด</MenuItem>
                <MenuItem value="paid">ชำระแล้ว</MenuItem>
                <MenuItem value="debt">ค้างชำระ</MenuItem>
                <MenuItem value="pending">รอดำเนินการ</MenuItem>
                <MenuItem value="cancelled">ยกเลิก</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 170 } }}>
              <InputLabel id="sort-select-label">Sort</InputLabel>
              <Select labelId="sort-select-label" value={sort} label="Sort" onChange={(e) => setSort(e.target.value as 'newest' | 'oldest' | 'high')}>
                <MenuItem value="newest">ล่าสุดก่อน</MenuItem>
                <MenuItem value="oldest">เก่าสุดก่อน</MenuItem>
                <MenuItem value="high">ยอดสูงสุด</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" sx={commonButtonSx}>Export</Button>
          </Stack>
        </Card>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
          {[
            { label: 'ยอดขายรวม', value: `฿${formatMoney(totalAmount)}` },
            { label: 'ชำระแล้ว', value: `${paidCount} รายการ` },
            { label: 'ค้างชำระ', value: `${debtCount} รายการ` },
          ].map((item) => (
            <Card key={item.label} sx={{ ...uiCardSx, p: 2 }}>
              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
              <Typography variant="h6" fontWeight={800}>{item.value}</Typography>
            </Card>
          ))}
        </Box>

        <Box position="relative">
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography sx={sectionTitleSx}>Recent Transactions</Typography>
            <Typography variant="body2" color="text.secondary">หน้า {page + 1} / {totalPages}</Typography>
          </Stack>
          <IconButton onClick={() => setPage((p) => Math.max(p - 1, 0))} disabled={page === 0} sx={{ position: 'absolute', top: '46%', left: { xs: -8, md: -16 }, zIndex: 1, bgcolor: 'background.paper', boxShadow: 1 }}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 1.5 }}>
            <AnimatePresence mode="wait">
              {paginatedOrders.map((order) => {
                const depositTotal = order.cart.reduce((s, it) => s + (it.deposit || 0), 0);
                const remainingTotal = order.cart.reduce((s, it) => s + (it.remaining || 0), 0);

                return (
                  <motion.div key={order._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} onClick={() => setSelectedOrder(order)}>
                    <Card sx={{ ...interactiveCardSx, minHeight: 340 }}>
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                          <Typography variant="caption" color="text.secondary">{dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}</Typography>
                          {getPaymentChip(order)}
                        </Stack>
                        <Typography variant="subtitle1" fontWeight={700}>{order.orderId}</Typography>
                        <Typography variant="body2" color="text.secondary" mt={0.4}>{order.customerName || '-'} • {order.phoneNumber || '-'}</Typography>
                        <Divider sx={{ my: 1.2 }} />
                        {depositTotal > 0 && <Typography variant="body2">มัดจำ: ฿{formatMoney(depositTotal)}</Typography>}
                        <Typography variant="body2" color={remainingTotal > 0 ? 'warning.main' : 'success.main'}>
                          {remainingTotal > 0 ? `ค้างชำระ: ฿${formatMoney(remainingTotal)}` : 'ชำระครบแล้ว'}
                        </Typography>
                        <Typography variant="body2" mt={0.6}>วิธีชำระ: {order.payment === 'cash' ? 'เงินสด' : 'PromptPay'}</Typography>
                        <Typography variant="h6" fontWeight={800} mt={1.1}>฿{formatMoney(order.total)}</Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </Box>

          <IconButton onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))} disabled={page >= totalPages - 1} sx={{ position: 'absolute', top: '46%', right: { xs: -8, md: -16 }, zIndex: 1, bgcolor: 'background.paper', boxShadow: 1 }}>
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>

        <Card sx={uiCardSx}>
          <Typography sx={{ ...sectionTitleSx, p: 2 }}>Transaction History</Typography>
          <Box sx={{ width: '100%', overflowX: 'auto', ...tableShellSx }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>ลูกค้า</TableCell>
                  <TableCell>เบอร์โทรศัพท์</TableCell>
                  <TableCell>หมวดสินค้า</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>ยอดรวม</TableCell>
                  <TableCell>วันที่</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id} hover>
                    <TableCell>{order.orderId}</TableCell>
                    <TableCell>{order.customerName || '-'}</TableCell>
                    <TableCell>{order.phoneNumber || '-'}</TableCell>
                    <TableCell>{order.category || order.cart?.[0]?.name || '-'}</TableCell>
                    <TableCell>{getPaymentChip(order)}</TableCell>
                    <TableCell>฿{formatMoney(order.total)}</TableCell>
                    <TableCell>{order.createdAt ? dayjs(order.createdAt).format('DD/MM/YYYY HH:mm') : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Card>
      </Stack>

      <Dialog open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>รายละเอียดออเดอร์ #{selectedOrder?.orderId}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1} mb={2}>
            <Typography><strong>ลูกค้า:</strong> {selectedOrder?.customerName}</Typography>
            <Typography><strong>เบอร์โทร:</strong> {selectedOrder?.phoneNumber}</Typography>
            <Typography><strong>หมายเหตุ:</strong> {selectedOrder?.note || '-'}</Typography>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Typography fontWeight={700} gutterBottom>รายการสินค้า</Typography>
          <Stack spacing={1.5}>
            {selectedOrder?.cart.map((item, i) => (
              <Box key={`${item.category}-${item.name}-${item.qty}-${item.totalPrice}-${item.productNote ?? 'none'}`} sx={{ p: 1.6, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'grey.50' }}>
                <Typography fontWeight={600}>{i + 1}. {item.category} {item.productNote ? `(${item.productNote})` : ''}</Typography>
                <Typography variant="body2">จำนวน: {item.qty} • ราคา: {formatMoney(item.totalPrice)} บาท</Typography>
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

