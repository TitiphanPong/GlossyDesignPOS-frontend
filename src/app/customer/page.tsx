'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Divider, List } from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import generatePayload from 'promptpay-qr';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import CheckOutPass from './components/checkoutpass';
import CartItemDetails from './components/CartItemDetails';

type Order = {
  orderId: string;
  customerName?: string;
  phoneNumber?: string;
  note?: string;
  total: number;
  discount: number;
  grandTotal: number;
  payment: 'cash' | 'promptpay';
  status: 'pending' | 'paid';
  cart: any[];
};

export default function CustomerScreen() {
  const [order, setOrder] = useState<Order | null>(null);
  const promptpayId = process.env.NEXT_PUBLIC_PROMPTPAY_ID || '0625624598';

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

  useEffect(() => {
    if (order?.status === 'paid') {
      const timer = setTimeout(() => {
        localStorage.removeItem('pendingOrder');
        setOrder(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [order]);

  if (!order) {
    const banners = [
      { title: 'Heat Transfer เสื้อ', img: '/banners/Banner1.jpg' },
      { title: 'งานสติ๊กเกอร์ครบวงจร', img: '/banners/Banner8.jpg' },
      { title: 'งานด่วนรอรับได้', img: '/banners/Banner12.jpg' },
      { title: 'พิมพ์เสื้อสีสดใส', img: '/banners/Banner14.jpg' },
    ];
    return (
      <Box sx={{ width: '100%', height: '100vh', bgcolor: '#000' }}>
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 5000 }}
          loop
          style={{ width: '100%', height: '100vh' }}>
          {banners.map((item, idx) => (
            <SwiperSlide key={idx}>
              <Box
                sx={{
                  width: '100%',
                  height: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  backgroundImage: `url(${item.img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
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
  const deposit = order.cart.reduce((s, i) => s + (i.deposit || 0), 0);
  const remaining = order.cart.reduce((s, i) => s + (i.remaining || 0), 0);
  const amountToPay = order.cart.some(i => i.deposit) && deposit > 0 ? deposit : total;

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

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#fdfdfd' }}>
      <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' } }}>
        <Box sx={{ p: 4, overflowY: 'auto' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            🧾 ใบสั่งซื้อ #{order.orderId}
          </Typography>
          <Typography variant="h6">คุณ : {order.customerName || '-'}</Typography>
          <Typography variant="h6">เบอร์โทรศัพท์ : {order.phoneNumber || '-'}</Typography>
          <Typography variant="h6">หมายเหตุ : {order.note || '-'}</Typography>

          <Divider sx={{ my: 2 }} />

          <List>
            {order.cart.map((item, idx) => (
              <CartItemDetails key={idx} item={item} />
            ))}
          </List>
        </Box>

        <Box
          sx={{
            bgcolor: '#fff',
            p: 4,
            borderLeft: '1px solid #eee',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <Typography variant="h4" fontWeight="bold">
            รวมสุทธิ
          </Typography>
          <Typography variant="h2" color="primary" fontWeight="bold">
            ฿{total.toLocaleString('th-TH')}
          </Typography>

          {order.discount > 0 && (
            <Typography variant="h6" color="error" gutterBottom>
              🔖 ส่วนลด: -฿{order.discount.toLocaleString('th-TH')}
            </Typography>
          )}

          {order.cart.some(i => i.deposit) && (
            <>
              <Typography variant="h6" color="warning.main">
                มัดจำ: ฿{deposit.toLocaleString('th-TH')}
              </Typography>
              <Typography variant="h6" color="error.main" fontWeight="bold">
                คงเหลือ: ฿{remaining.toLocaleString('th-TH')}
              </Typography>
            </>
          )}

          <Divider sx={{ my: 3, width: '100%' }} />

          {order.payment === 'promptpay' ? (
            <>
              <Typography variant="h6" gutterBottom>
                📱 ชำระด้วย PromptPay
              </Typography>
              <QRCodeCanvas
                value={generatePayload(promptpayId, { amount: amountToPay })}
                size={280}
                includeMargin
              />
              <Typography variant="body1" mt={2} fontWeight="bold">
                ต้องชำระตอนนี้: ฿{amountToPay.toLocaleString('th-TH')}
              </Typography>
            </>
          ) : (
            <Typography variant="h4" color="success.main" fontWeight="bold">
              💵 ชำระด้วยเงินสด
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
