'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Divider, List, Stack } from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import generatePayload from 'promptpay-qr';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
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
  status: 'pending' | 'paid' | 'partial';
  cart: any[];
  taxInvoice?: 'yes' | 'no';
  vatAmount?: number;
  remainingTotal: number;
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
    if (order?.status === 'paid' || (order?.status === 'partial' && order.remainingTotal === 0)) {
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
        <Swiper modules={[Autoplay]} autoplay={{ delay: 5000 }} loop style={{ width: '100%', height: '100vh' }}>
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

  // 1) Subtotal
  const subtotal = order.total;

  // 2) Discount
  const discount = order.discount || 0;

  // 3) Net total
  const netTotal = subtotal - discount;

  // 4) VAT
  const vat = order.taxInvoice === 'yes' ? (order.vatAmount ?? netTotal * 0.07) : 0;

  // 5) Grand total (รวมทุกอย่าง)
  const grandTotal = netTotal + vat;

  // 6) Deposit/Remaining
  const deposit = order.cart.reduce((s, i) => s + (i.deposit || 0), 0);
  const remaining = order.cart.reduce((s, i) => s + (i.remaining || 0), 0);

  // ✅ ถ้ามีมัดจำให้เก็บเฉพาะมัดจำ, ถ้าไม่ → จ่ายเต็ม grandTotal
  const amountToPay = order.cart.some(i => i.deposit) && deposit > 0 ? deposit : grandTotal;

  if (order.status === 'paid' || order?.status === 'partial') {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          bgcolor: '#ffffff', // ✅ พื้นหลังขาว
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
        }}>
        {/* การ์ด animation */}
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} style={{ marginBottom: '20px' }}>
          <CheckOutPass />
        </motion.div>

        {/* ข้อความหลัก */}
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom color="success.main">
            ✅ ชำระเงินเรียบร้อย
          </Typography>
        </motion.div>

        {/* ข้อความรอง */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }}>
          <Typography variant="h6" gutterBottom color="text.primary">
            ขอบคุณที่ใช้บริการ <strong>Glossy Design</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            หน้าจอจะกลับไปโฆษณาภายใน 5 วินาที...
          </Typography>
        </motion.div>

        {/* เอฟเฟกต์เส้นแสงด้านล่าง */}
        <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: '60%', opacity: 1 }} transition={{ delay: 1, duration: 0.8 }}>
          <Divider
            sx={{
              mt: 4,
              borderColor: 'rgba(0,0,0,0.2)', // ✅ เทาอ่อน บนพื้นหลังขาวมองเห็นชัด
              borderBottomWidth: 2,
            }}
          />
        </motion.div>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f9fafc',
        fontFamily: 'Prompt, sans-serif',
      }}>
      {/* Content */}
      <Box
        sx={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        }}>
        {/* ซ้าย: รายการสินค้า */}
        <Box sx={{ p: 4, overflowY: 'auto' }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom color="black" sx={{ ml: 10, mt: 3 }}>
            🧾 ใบสั่งซื้อ #{order.orderId}
          </Typography>
          <Typography variant="h4" color="black">
            คุณ : {order.customerName || '-'}
          </Typography>
          <Typography variant="h4" color="black">
            เบอร์โทรศัพท์ : {order.phoneNumber || '-'}
          </Typography>
          <Typography variant="h4" color="black">
            หมายเหตุ : {order.note || '-'}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <List>
            {order.cart.map((item, idx) => (
              <CartItemDetails key={idx} item={item} />
            ))}
          </List>
        </Box>

        {/* ขวา: รวมยอด */}
        <Box
          sx={{
            bgcolor: '#fff',
            p: 4,
            borderLeft: '1px solid #eee',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom color="success">
            ยอดทั้งหมด
          </Typography>

          <Typography variant="h2" color="primary" fontWeight="bold" sx={{ fontSize: { xs: '2.5rem', md: '3rem' } }}>
            {Math.round(grandTotal).toLocaleString('th-TH')} บาท
          </Typography>

          {order.taxInvoice === 'yes' && (
            <Typography variant="h5" color="red">
              VAT 7%: {(order.vatAmount ?? 0).toLocaleString('th-TH')} บาท
            </Typography>
          )}

          {order.discount > 0 && (
            <Typography variant="h5" color="success" gutterBottom>
              ส่วนลด: - {order.discount.toLocaleString('th-TH')} บาท
            </Typography>
          )}

          {order.cart.some(i => !i.fullPayment && i.deposit) && (
            <Stack spacing={1} mt={2} alignItems="center">
              <Typography variant="h5" color="warning.main">
                ยอดมัดจำ : {Math.round(deposit).toLocaleString('th-TH')} บาท
              </Typography>
              <Typography variant="h5" color="error.main" fontWeight="bold">
                คงเหลือ : {Math.round(remaining).toLocaleString('th-TH')} บาท
              </Typography>
            </Stack>
          )}

          <Divider sx={{ my: 3, width: '75%' }} />

          {/* Payment section */}
          {order.payment === 'promptpay' ? (
            <Box textAlign="center">
              <Typography variant="h5" mt={2} color="black">
                📱 กรุณาชำระด้วย PromptPay
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 0 }}>
                <QRCodeCanvas value={generatePayload(promptpayId, { amount: Math.round(amountToPay) })} size={420} includeMargin />
              </Box>
              <Typography variant="h4" mt={0} fontWeight="bold" color="success">
                ต้องชำระตอนนี้ : {Math.round(amountToPay).toLocaleString('th-TH')} บาท
              </Typography>
            </Box>
          ) : (
            <Box textAlign="center">
              <Typography variant="h4" color="success.main" fontWeight="bold" sx={{ mb: 2 }}>
                💵 ชำระด้วยเงินสด
              </Typography>
              <Typography variant="h4" mt={0} fontWeight="bold" color="success">
                ต้องชำระตอนนี้ : {Math.round(amountToPay).toLocaleString('th-TH')} บาท
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
