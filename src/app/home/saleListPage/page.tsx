'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
} from '@mui/material';
import dayjs from 'dayjs';

type CartItem = {
  name: string;
  unitPrice: number;
  totalPrice: number;
  extra?: Record<string, any>;
};

type Order = {
  _id: string;
  orderId: string;
  customerName?: string;
  companyName?: string;
  note?: string;
  category: string;
  total: number;
  discount?: number;
  payment: 'cash' | 'promptpay';
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
  cart: CartItem[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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

  const statusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} mb={2}>
        📋 รายการออเดอร์
      </Typography>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box textAlign="center" py={5}>
            <CircularProgress />
            <Typography mt={2}>กำลังโหลดข้อมูล...</Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>ชื่อลูกค้า</TableCell>
                <TableCell>บริษัท</TableCell>
                <TableCell>หมวด</TableCell>
                <TableCell>ยอดรวม</TableCell>
                <TableCell>การชำระเงิน</TableCell>
                <TableCell>สถานะ</TableCell>
                <TableCell>วันที่สร้าง</TableCell>
                <TableCell>การทำงาน</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">❌ ยังไม่มีออเดอร์</Typography>
                  </TableCell>
                </TableRow>
              )}
              {orders.map(order => (
                <TableRow key={order._id}>
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>{order.customerName || '-'}</TableCell>
                  <TableCell>{order.companyName || '-'}</TableCell>
                  <TableCell>{order.category}</TableCell>
                  <TableCell>฿{order.total.toLocaleString('th-TH')}</TableCell>
                  <TableCell>{order.payment === 'cash' ? '💵 เงินสด' : '📱 PromptPay'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={order.status}
                      color={statusColor(order.status) as any}
                    />
                  </TableCell>
                  <TableCell>{dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => setSelectedOrder(order)}>
                      รายละเอียด
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Modal แสดงรายละเอียด */}
      <Dialog open={!!selectedOrder} onClose={() => setSelectedOrder(null)} maxWidth="md" fullWidth>
        <DialogTitle>รายละเอียดออเดอร์</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                🆔 {selectedOrder.orderId}
              </Typography>
              <Typography>👤 ลูกค้า: {selectedOrder.customerName || '-'}</Typography>
              <Typography>🏢 บริษัท: {selectedOrder.companyName || '-'}</Typography>
              <Typography>📌 หมวด: {selectedOrder.category}</Typography>
              <Typography>💰 ยอดรวม: ฿{selectedOrder.total.toLocaleString('th-TH')}</Typography>
              {selectedOrder.discount ? (
                <Typography>💸 ส่วนลด: ฿{selectedOrder.discount}</Typography>
              ) : null}
              <Typography>
                💳 ชำระเงิน: {selectedOrder.payment === 'cash' ? 'เงินสด' : 'PromptPay'}
              </Typography>
              <Typography>
                📅 วันที่สร้าง: {dayjs(selectedOrder.createdAt).format('DD/MM/YYYY HH:mm')}
              </Typography>
              <Typography>📄 หมายเหตุ: {selectedOrder.note || '-'}</Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                🛒 รายการสินค้า
              </Typography>
              <Stack spacing={1}>
                {selectedOrder.cart.map((item, i) => (
                  <Paper key={i} sx={{ p: 1.5 }}>
                    <Typography fontWeight={600}>{item.name}</Typography>
                    <Typography variant="body2">
                      ราคา: ฿{item.unitPrice} × {item.extra?.qty ?? 1} = ฿{item.totalPrice}
                    </Typography>
                    {item.extra && (
                      <Box sx={{ fontSize: 13, color: 'text.secondary' }}>
                        {item.extra.variant && <div>🔖 ตัวเลือก: {item.extra.variant}</div>}
                        {item.extra.sides && <div>📑 การพิมพ์: {item.extra.sides}</div>}
                        {item.extra.material && <div>📄 กระดาษ: {item.extra.material}</div>}
                        {item.extra.note && <div>📝 หมายเหตุ: {item.extra.note}</div>}
                      </Box>
                    )}
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedOrder(null)}>ปิด</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
