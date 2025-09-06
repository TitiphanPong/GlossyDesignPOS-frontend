'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import generatePayload from 'promptpay-qr';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import CheckOutFail from './components/checkoutfail';
import CheckOutPass from './components/checkoutpass';

type Order = {
  orderId: string;
  customerName?: string;
  companyName?: string;
  total: number;
  discount: number;
  grandTotal: number;
  payment: 'cash' | 'promptpay';
  status: 'pending' | 'paid';
  cart: { name: string; unitPrice: number; totalPrice: number; extra?: any }[];
};

export default function CustomerScreen() {
  const [order, setOrder] = useState<Order | null>(null);
  const promptpayId = process.env.NEXT_PUBLIC_PROMPTPAY_ID || '0625624598';

  // โหลดจาก localStorage + subscribe event
  useEffect(() => {
    const handleStorage = () => {
      const str = localStorage.getItem('pendingOrder');
      if (str) {
        setOrder(JSON.parse(str));
      } else {
        setOrder(null);
      }
    };
    handleStorage();
    window.addEventListener('storage', handleStorage);

    const interval = setInterval(handleStorage, 500);

    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  // 👉 ลบ order ออกหลังจากจ่ายเสร็จ 5 วิ
  useEffect(() => {
    if (order?.status === 'paid') {
      const timer = setTimeout(() => {
        localStorage.removeItem('pendingOrder');
        setOrder(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [order]);

  // 👉 State 1: Banner
  if (!order) {
    const banners = [
      { title: 'Heat Transfer เสื้อ', img: '/banners/Banner1.jpg' },
      { title: 'Heat Transfer สีสด', img: '/banners/Banner2.jpg' },
      { title: 'สติ๊กเกอร์ งานด่วน', img: '/banners/Banner3.jpg' },
      { title: 'โปสเตอร์ ป้าย โฆษณา', img: '/banners/Banner4.jpg' },
      { title: 'แบบเขียนแบบ ออกแบบพิมพ์', img: '/banners/Banner5.jpg' },
      { title: 'งานพิมพ์คุณภาพสูง', img: '/banners/Banner6.jpg' },
      { title: 'Glossy Design โปรโมชัน', img: '/banners/Banner7.jpg' },
      { title: 'งานสติ๊กเกอร์ครบวงจร', img: '/banners/Banner8.jpg' },
      { title: 'บริการออกแบบฟรี', img: '/banners/Banner9.jpg' },
      { title: 'งานสติ๊กเกอร์สินค้า', img: '/banners/Banner10.jpg' },
      { title: 'สติ๊กเกอร์ราคาพิเศษ', img: '/banners/Banner11.jpg' },
      { title: 'งานด่วนรอรับได้', img: '/banners/Banner12.jpg' },
      { title: 'สติ๊กเกอร์พรีเมียม', img: '/banners/Banner13.jpg' },
      { title: 'พิมพ์เสื้อสีสดใส', img: '/banners/Banner14.jpg' },
    ];
    return (
      <Box sx={{ width: '100%', height: '100vh', bgcolor: '#000' }}>
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 5000 }}
          loop
          style={{ width: '100%', height: '100%' }}>
          {banners.map((item, idx) => (
            <SwiperSlide key={idx}>
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  background: `url(${item.img}) center/cover no-repeat`,
                  color: '#fff',
                  textShadow: '0 2px 6px rgba(0,0,0,0.7)',
                }}>
                <Typography variant="h3" fontWeight="bold">
                  {item.title}
                </Typography>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    );
  }

  const total = Math.max(order.grandTotal ?? order.total, 0);

  // 👉 State 3: Paid
  if (order.status === 'paid') {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          bgcolor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: '#fff',
        }}>
        <CheckOutPass />
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 1 }}
          transition={{ duration: 0.6 }}>
          <Typography variant="h3" color="success.main" fontWeight="bold">
            ✅ ชำระเงินเรียบร้อย
          </Typography>
        </motion.div>
        <Typography variant="h6" mt={2}>
          ขอบคุณที่ใช้บริการ Glossy Design
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          หน้าจอจะกลับไปโฆษณาภายใน 5 วินาที...
        </Typography>
      </Box>
    );
  }

  // 👉 State 2: Pending
  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🧾 ใบสั่งซื้อ #{order.orderId}
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1">ลูกค้า: {order.customerName || '-'}</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            บริษัท: {order.companyName || '-'}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <List>
            {order.cart?.map((item, idx) => (
              <ListItem key={idx} disableGutters>
                <ListItemText
                  primary={`${item.name} x${item.extra?.qty ?? 1}`}
                  secondary={`฿${item.totalPrice.toLocaleString('th-TH')}`}
                />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h5" textAlign="right">
            รวมสุทธิ: ฿{total.toLocaleString('th-TH')}
          </Typography>
        </CardContent>
      </Card>

      {order.payment === 'promptpay' ? (
        <Box textAlign="center">
          <Typography variant="h6" gutterBottom>
            📱 สแกนเพื่อชำระเงิน
          </Typography>
          <QRCodeCanvas
            value={generatePayload(promptpayId, { amount: total })}
            size={240}
            includeMargin
          />
        </Box>
      ) : (
        <Typography variant="h5" textAlign="center" color="success.main">
          💵 ชำระด้วยเงินสด
        </Typography>
      )}
    </Box>
  );
}
