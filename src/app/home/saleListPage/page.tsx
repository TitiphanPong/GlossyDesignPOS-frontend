'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Button,
} from '@mui/material';
import dayjs from 'dayjs';

type CartItem = {
  name: string;
  unitPrice: number;
  totalPrice: number;
  deposit?: number; // ✅ เงินมัดจำ
  remaining?: number; // ✅ ยอดคงเหลือ
  fullPayment?: boolean; // ✅ true ถ้าชำระเต็มจำนวน
  extra?: Record<string, any>;
};

type Order = {
  _id: string;
  orderId: string;
  customerName?: string;
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
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={800} mb={3}>
        📋 ใบรายการขาย (Sales Orders)
      </Typography>

      {loading ? (
        <Box textAlign="center" py={5}>
          <CircularProgress />
          <Typography mt={2}>กำลังโหลดข้อมูล...</Typography>
        </Box>
      ) : orders.length === 0 ? (
        <Typography align="center" color="text.secondary" mt={5}>
          ❌ ยังไม่มีออเดอร์
        </Typography>
      ) : (
        <Stack spacing={3}>
          {orders.map(order => {
            const depositTotal = order.cart.reduce((s, i) => s + (i.deposit || 0), 0);
            const remainingTotal = order.cart.reduce((s, i) => s + (i.remaining || 0), 0);

            return (
              <Card
                key={order._id}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}>
                <CardHeader
                  title={`🧾 หมายเลขออเดอร์ : ${order.orderId}`}
                  subheader={dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}
                  action={
                    <Chip
                      label={order.status.toUpperCase()}
                      color={statusColor(order.status) as any}
                    />
                  }
                />
                <CardContent>
                  {/* Customer Info */}
                  <Stack spacing={0.5} mb={2}>
                    <Typography>👤 ลูกค้า: {order.customerName || '-'}</Typography>
                    <Typography>📌 หมวดสินค้า: {order.category}</Typography>
                    {order.note && <Typography color="text.secondary">📝 {order.note}</Typography>}
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Cart Items */}
                  <Stack spacing={1.5}>
                    {order.cart.map((item, i) => (
                      <Box
                        key={i}
                        sx={{
                          bgcolor: '#f9f9f9',
                          p: 1.5,
                          borderRadius: 2,
                          border: '1px solid #eee',
                        }}>
                        <Typography fontWeight={600}>
                          {item.name} — ฿{item.totalPrice.toLocaleString('th-TH')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.unitPrice.toLocaleString('th-TH')} × {item.extra?.qty ?? 1}
                        </Typography>

                        {/* ✅ มัดจำรายสินค้า */}
                        {!item.fullPayment && (item.deposit || item.remaining) && (
                          <Typography variant="body2" color="warning.main" mt={0.5}>
                            💵 มัดจำ {item.deposit?.toLocaleString('th-TH') || 0}฿{'  '}| คงเหลือ{' '}
                            {item.remaining?.toLocaleString('th-TH') || 0}฿
                          </Typography>
                        )}

                        {item.extra && (
                          <Box sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
                            {item.extra.variant && <div>🔖 {item.extra.variant}</div>}
                            {item.extra.sides && <div>📑 พิมพ์ {item.extra.sides} ด้าน</div>}
                            {item.extra.material && <div>📄 กระดาษ: {item.extra.material}</div>}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Summary */}
                  <Stack spacing={0.5}>
                    {order.discount ? (
                      <Typography color="error">💸 ส่วนลด: -฿{order.discount}</Typography>
                    ) : null}

                    {depositTotal > 0 && (
                      <>
                        <Typography color="info.main" fontWeight={600}>
                          💰 มัดจำรวม: ฿{depositTotal.toLocaleString('th-TH')}
                        </Typography>
                        <Typography color="warning.main" fontWeight={700}>
                          📌 คงเหลือ: ฿{remainingTotal.toLocaleString('th-TH')}
                        </Typography>
                      </>
                    )}

                    <Typography variant="h6" fontWeight={700}>
                      💰 รวมสุทธิ: ฿{order.total.toLocaleString('th-TH')}
                    </Typography>
                    <Typography>
                      💳 การชำระ: {order.payment === 'cash' ? '💵 เงินสด' : '📱 PromptPay'}
                    </Typography>
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Actions */}
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button variant="outlined" color="primary">
                      พิมพ์ใบเสร็จ
                    </Button>
                    <Button variant="contained" color="success">
                      ทำเครื่องหมายว่าชำระแล้ว
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Container>
  );
}
