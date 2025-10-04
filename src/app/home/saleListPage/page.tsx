'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  Divider,
  Paper,
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
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import PayRemainingModal from './components/PayRemainingModal';

type CartItem = {
  name: string;
  unitPrice: number;
  totalPrice: number;
  deposit?: number;
  remaining?: number;
  fullPayment?: boolean;
  extra?: Record<string, any>;
  productNote?: string;
  category: string;
  qty: number;
  sides: string;
  colorMode: string;
  material: string;
  size: string;
  shape: string;
  type: string;
};

type Order = {
  _id: string;
  orderId: string;
  customerName?: string;
  phoneNumber?: string;
  note?: string;
  category: string;
  total: number;
  remainingTotal: number;
  discount?: number;
  payment: 'cash' | 'promptpay';
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  cart: CartItem[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'debt' | 'pending' | 'cancelled'>('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [page, setPage] = useState(0);
  const pageSize = 6;

  //PayRemainingModal

  const [payDialogOpen, setPayDialogOpen] = useState(false);

  const getPaymentChip = (order: Order) => {
    const remainingTotal = order.remainingTotal ?? order.cart.reduce((s, i) => s + (i.remaining || 0), 0);

    if (order.status === 'cancelled') {
      return <Chip label="ยกเลิก" color="error" size="small" />;
    }
    if (remainingTotal === 0) {
      return <Chip label="ชำระแล้ว" color="success" size="small" />;
    }
    return <Chip label="ค้างชำระ" color="warning" size="small" />;
  };

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? '';
    if (!base) return;

    fetch(`${base}/orders`)
      .then(async res => {
        if (!res.ok) throw new Error('โหลดข้อมูลล้มเหลว');
        return res.json();
      })
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter(order => {
    const remaining = order.cart.reduce((s, i) => s + (i.remaining || 0), 0);

    if (filter === 'debt') {
      return order.status !== 'cancelled' && remaining > 0;
    }

    if (filter === 'paid') {
      return order.status !== 'cancelled' && remaining === 0;
    }

    if (filter === 'cancelled') {
      return order.status === 'cancelled';
    }

    if (filter === 'pending') {
      return order.status === 'pending';
    }

    if (search) {
      return order.orderId.toLowerCase().includes(search.toLowerCase()) || order.customerName?.toLowerCase().includes(search.toLowerCase());
    }

    return true;
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice(page * pageSize, page * pageSize + pageSize);

  if (loading) {
    return (
      <Box textAlign="center" py={5}>
        <CircularProgress />
        <Typography mt={2}>กำลังโหลดข้อมูล...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} mb={3} color="black">
        📋 ใบรายการขาย (Sales Orders)
      </Typography>

      {/* 🔎 Search + Filter */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} mb={3} flexWrap="wrap">
        <TextField size="small" placeholder="ค้นหาออเดอร์ / ชื่อลูกค้า..." value={search} onChange={e => setSearch(e.target.value)} sx={{ flex: 1, maxWidth: 300 }} />

        <Select size="small" value={filter} onChange={e => setFilter(e.target.value as any)} sx={{ minWidth: 160 }}>
          <MenuItem value="all">ทั้งหมด</MenuItem>
          <MenuItem value="paid">ชำระแล้ว</MenuItem>
          <MenuItem value="debt">ค้างชำระ</MenuItem>
          <MenuItem value="pending">รอดำเนินการ</MenuItem>
          <MenuItem value="cancelled">ยกเลิก</MenuItem>
        </Select>
      </Stack>

      {orders.length === 0 ? (
        <Typography align="center" color="text.secondary" mt={5}>
          ❌ ยังไม่มีออเดอร์
        </Typography>
      ) : (
        <>
          {/* ✅ Cards (animate) */}
          <Box position="relative" mb={4}>
            {/* ปุ่มซ้าย */}
            <IconButton
              onClick={() => setPage(p => Math.max(p - 1, 0))}
              disabled={page === 0}
              sx={{
                position: 'absolute',
                top: '40%',
                left: -60,
                zIndex: 1,
                bgcolor: 'white',
                boxShadow: 2,
              }}>
              <ArrowBackIosNewIcon />
            </IconButton>

            {/* การ์ด 6 ใบ */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
                gap: 2,
              }}>
              <AnimatePresence mode="wait">
                {paginatedOrders.map(order => {
                  const depositTotal = order.cart.reduce((s, it) => s + (it.deposit || 0), 0);
                  const remainingTotal = order.cart.reduce((s, it) => s + (it.remaining || 0), 0);

                  return (
                    <motion.div key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onClick={() => setSelectedOrder(order)} exit={{ opacity: 0, y: -20 }}>
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: 3,
                          boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          minHeight: 450,
                        }}>
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" mb={0.5}>
                            <Typography variant="subtitle2" color="text.secondary">
                              {dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}
                            </Typography>
                            {getPaymentChip(order)}
                          </Stack>

                          <Typography variant="subtitle1" fontWeight={700}>
                            รายการ : {order.orderId}
                          </Typography>

                          <Divider sx={{ my: 1 }} />

                          <Typography variant="body2">ชื่อลูกค้า : {order.customerName || '-'}</Typography>

                          <Typography variant="body2">เบอร์โทรศัพท์ : {order.phoneNumber || '-'}</Typography>
                          <Typography variant="body2">หมายเหตุ : {order.note}</Typography>
                          {depositTotal > 0 ? (
                            remainingTotal === 0 ? (
                              <Typography variant="body2" color="success.main">
                                ชำระเต็มจำนวน : ฿{order.total.toLocaleString('th-TH')}
                              </Typography>
                            ) : (
                              <>
                                <Typography variant="body2" color="info.main">
                                  ยอดมัดจำรวม: ฿{depositTotal.toLocaleString('th-TH')}
                                </Typography>
                              </>
                            )
                          ) : null}

                          <Divider sx={{ my: 1 }} />
                          {Object.entries(
                            order.cart.reduce((acc: Record<string, CartItem[]>, item) => {
                              if (!acc[item.category]) acc[item.category] = [];
                              acc[item.category].push(item);
                              return acc;
                            }, {})
                          ).map(([category, items]) => (
                            <Box key={category} sx={{ mb: 1 }}>
                              <Typography variant="body2" fontWeight={600}>
                                ประเภทงาน : {category}
                              </Typography>
                              {items.map((item, i) => (
                                <Typography key={i} variant="body2" sx={{ pl: 3 }}>
                                  - {item.productNote || item.name} {item.totalPrice.toLocaleString('th-TH')}฿
                                </Typography>
                              ))}
                            </Box>
                          ))}
                        </CardContent>

                        <Box
                          sx={{
                            bgcolor: 'grey.50',
                            borderTop: '1px solid #eee',
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                          }}>
                          <Typography fontWeight={700} color="success.main">
                            ยอดรวมทั้งหมด : ฿{order.total.toLocaleString('th-TH')}
                          </Typography>

                          {remainingTotal > 0 ? (
                            <Typography variant="body2" color="warning.main">
                              คงเหลือ: ฿{remainingTotal.toLocaleString('th-TH')}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="success.main">
                              ✅ ชำระเต็มจำนวน
                            </Typography>
                          )}
                          <Typography variant="body2">วิธีการชำระ : {order.payment === 'cash' ? 'เงินสด' : 'PromptPay'}</Typography>
                        </Box>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </Box>

            {/* ปุ่มขวา */}
            <IconButton
              onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
              disabled={page >= totalPages - 1}
              sx={{
                position: 'absolute',
                top: '40%',
                right: -60,
                zIndex: 1,
                bgcolor: 'white',
                boxShadow: 2,
              }}>
              <ArrowForwardIosIcon />
            </IconButton>

            {/* ตัวบอกหน้า */}
            <Box textAlign="center" mt={2}>
              <Typography variant="body2" color="text.secondary">
                หน้า {page + 1} / {totalPages}
              </Typography>
            </Box>
          </Box>

          {/* ✅ Table (animate) */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Typography variant="h6" fontWeight={700} sx={{ p: 2 }}>
                📋 รายการทั้งหมด
              </Typography>
              <Paper sx={{ width: '100%', overflowX: 'auto' }}>
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
                    {filteredOrders.map(order => (
                      <TableRow key={order._id} hover>
                        <TableCell>{order.orderId}</TableCell>
                        <TableCell>{order.customerName || '-'}</TableCell>
                        <TableCell>{order.phoneNumber || '-'}</TableCell>
                        <TableCell>{order.category || order.cart?.[0]?.name || '-'}</TableCell>
                        <TableCell>{getPaymentChip(order)}</TableCell>
                        <TableCell>฿{order.total.toLocaleString('th-TH')}</TableCell>
                        <TableCell>{order.createdAt ? dayjs(order.createdAt).format('DD/MM/YYYY HH:mm') : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Card>
          </motion.div>
        </>
      )}
      <Dialog open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>รายละเอียดออเดอร์ #{selectedOrder?.orderId}</DialogTitle>

        <DialogContent dividers>
          {/* ข้อมูลลูกค้า */}
          <Stack spacing={1} mb={2}>
            <Typography>
              <strong>ลูกค้า:</strong> {selectedOrder?.customerName}
            </Typography>
            <Typography>
              <strong>เบอร์โทร:</strong> {selectedOrder?.phoneNumber}
            </Typography>
            <Typography>
              <strong>หมายเหตุ:</strong> {selectedOrder?.note || '-'}
            </Typography>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* รายการสินค้า */}
          <Typography fontWeight={700} gutterBottom>
            🛒 รายการสินค้า
          </Typography>

          <Stack spacing={2}>
            {selectedOrder?.cart.map((item, i) => (
              <Box
                key={i}
                sx={{
                  p: 2,
                  border: '1px solid #eee',
                  borderRadius: 2,
                  bgcolor: 'grey.50',
                }}>
                <Typography fontWeight={600} gutterBottom>
                  {i + 1}. {item.category} {item.productNote ? `(${item.productNote})` : ''}
                </Typography>

                {/* นามบัตร */}
                {item.category === 'นามบัตร' && (
                  <Stack spacing={0.5} pl={2}>
                    <Typography variant="body2">• จำนวน: {item.qty} ใบ</Typography>
                    <Typography variant="body2">• ด้าน: {item.sides} ด้าน</Typography>
                    <Typography variant="body2">• โหมดสี: {item.colorMode === 'bw' ? 'ขาวดำ' : item.colorMode === 'color' ? 'สี' : item.colorMode}</Typography>
                    <Typography variant="body2">• วัสดุ: {item.material}</Typography>
                    <Typography variant="body2">• ราคา : {item.totalPrice.toLocaleString()} บาท</Typography>
                  </Stack>
                )}

                {/* ตรายาง */}
                {item.category === 'ตรายาง' && (
                  <Stack spacing={0.5} pl={2}>
                    <Typography variant="body2">• ชนิด: {item.type === 'normal' ? 'ธรรมดา' : item.type === 'inked' ? 'หมึกในตัว' : item.type}</Typography>
                    <Typography variant="body2">• รูปทรง: {item.shape === 'square' ? 'สี่เหลี่ยม' : item.shape === 'circle' ? 'วงกลม' : item.shape}</Typography>
                    <Typography variant="body2">• ขนาด: {item.size}</Typography>
                    <Typography variant="body2">• จำนวน: {item.qty} ชิ้น</Typography>
                    <Typography variant="body2">• ราคา : {item.totalPrice.toLocaleString()} บาท</Typography>
                  </Stack>
                )}
                {/* ปริ้นท์เอกสาร */}
                {item.category === 'ปริ้นท์เอกสาร' && (
                  <Stack spacing={0.5} pl={2}>
                    <Typography variant="body2">• จำนวน: {item.qty} ใบ</Typography>
                    <Typography variant="body2">• ด้าน: {item.sides} ด้าน</Typography>
                    <Typography variant="body2">• โหมดสี: {item.colorMode === 'bw' ? 'ขาวดำ' : item.colorMode === 'color' ? 'สี' : item.colorMode}</Typography>
                    <Typography variant="body2">• วัสดุ: {item.material}</Typography>
                    <Typography variant="body2">• ราคา : {item.totalPrice.toLocaleString()} บาท</Typography>
                  </Stack>
                )}
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          {selectedOrder && selectedOrder.remainingTotal > 0 && (
            <Button variant="contained" color="success" onClick={() => setPayDialogOpen(true)}>
              ชำระยอดคงเหลือ
            </Button>
          )}
          <Button onClick={() => setSelectedOrder(null)}>ปิด</Button>
        </DialogActions>
      </Dialog>
      <PayRemainingModal
        open={payDialogOpen}
        orderId={selectedOrder?._id || ''}
        remaining={selectedOrder?.cart.reduce((s, i) => s + (i.remaining || 0), 0) || 0}
        onClose={() => setPayDialogOpen(false)}
        onSuccess={updated => {
          setOrders(prev => prev.map(o => (o._id === updated._id ? updated : o)));
          setSelectedOrder(updated);
        }}
      />
    </Container>
  );
}
