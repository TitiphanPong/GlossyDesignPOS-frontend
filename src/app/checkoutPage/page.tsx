'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { Box, Typography, TextField, Button, Divider, Stack, Paper } from '@mui/material';

type CheckoutItem = {
  name: string;
  qty: number;
  price: number;
};

export default function CheckoutPage() {
  const router = useRouter();

  // สมมติข้อมูลมาจาก cart หรือ localStorage
  const cart: CheckoutItem[] = [
    { name: 'นามบัตร', qty: 100, price: 3 },
    { name: 'สติ๊กเกอร์ A5', qty: 10, price: 20 },
  ];
  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  const handleConfirm = () => {
    // TODO: ส่งข้อมูลไป backend
    alert('สั่งซื้อสำเร็จ!');
    router.push('/'); // กลับไปหน้าแรก
  };

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        🧾 หน้าชำระเงิน
      </Typography>

      {/* สรุปรายการ */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">📦 รายการสินค้า</Typography>
        {cart.map((item, idx) => (
          <Stack key={idx} direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
            <span>
              {item.name} x{item.qty}
            </span>
            <span>฿{(item.qty * item.price).toFixed(2)}</span>
          </Stack>
        ))}
        <Divider sx={{ my: 1 }} />
        <Typography align="right" fontWeight="bold">
          รวมทั้งหมด: ฿{total.toFixed(2)}
        </Typography>
      </Paper>

      {/* ข้อมูลลูกค้า */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">👤 ข้อมูลลูกค้า</Typography>
        <TextField label="ชื่อลูกค้า" fullWidth sx={{ mt: 2 }} />
        <TextField label="เบอร์โทร" fullWidth sx={{ mt: 2 }} />
        <TextField label="ที่อยู่จัดส่ง" fullWidth multiline rows={3} sx={{ mt: 2 }} />
      </Paper>

      {/* วิธีชำระเงิน */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">💳 วิธีการชำระเงิน</Typography>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Button variant="outlined">PromptPay QR</Button>
          <Button variant="outlined">โอนธนาคาร</Button>
          <Button variant="outlined">ชำระที่ร้าน</Button>
        </Stack>
      </Paper>

      {/* ปุ่มยืนยัน */}
      <Button variant="contained" color="primary" fullWidth size="large" onClick={handleConfirm}>
        ✅ ยืนยันคำสั่งซื้อ
      </Button>
    </Box>
  );
}
