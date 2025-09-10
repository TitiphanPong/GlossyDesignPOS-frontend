'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Divider,
  Box,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

type Props = {
  open: boolean;
  payment: 'cash' | 'promptpay';
  onClose: () => void;
  onPaid: () => void; // callback หลังอัปเดตเป็น paid สำเร็จ
  onNewOrder: () => void; // กดทำรายการใหม่
};

export default function SuccessModal({ open, payment, onClose, onPaid, onNewOrder }: Props) {
  const [isPaid, setIsPaid] = useState(false);
  const [amountToPay, setAmountToPay] = useState(0);

  useEffect(() => {
    if (open) {
      setIsPaid(false);

      // ✅ โหลดข้อมูล order จาก localStorage
      const orderStr = localStorage.getItem('pendingOrder');
      if (orderStr) {
        const order = JSON.parse(orderStr);

        const deposit = order.cart.reduce((sum: number, i: any) => sum + (i.deposit || 0), 0);
        const amount =
          order.cart.some((i: any) => i.deposit) && deposit > 0 ? deposit : order.total;

        setAmountToPay(amount);
      }
    }
  }, [open]);

  useEffect(() => {
    if (isPaid) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isPaid, onClose]);

  const handleConfirm = async () => {
    try {
      const orderStr = localStorage.getItem('pendingOrder');
      if (!orderStr) return;
      const order = JSON.parse(orderStr);

      const base = process.env.NEXT_PUBLIC_API_URL ?? '';
      const res = await fetch(`${base}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...order, status: 'paid' }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('❌ Backend error:', res.status, text);
        throw new Error('บันทึกออเดอร์ไม่สำเร็จ');
      }
      await res.json();

      // 👉 update localStorage → paid
      localStorage.setItem('pendingOrder', JSON.stringify({ ...order, status: 'paid' }));
      window.dispatchEvent(new Event('storage')); // ✅ บังคับให้ CustomerScreen รับรู้
      setIsPaid(true);
      onPaid();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการยืนยันการชำระเงิน');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          {isPaid ? (
            <CheckCircleIcon color="success" fontSize="large" />
          ) : (
            <HourglassEmptyIcon color="warning" fontSize="large" />
          )}
          <Typography variant="h6" fontWeight={700}>
            {isPaid ? 'ชำระเงินเรียบร้อย' : 'รอชำระเงิน'}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Box textAlign="center" py={2}>
          <Typography
            variant="h4"
            fontWeight={800}
            color={isPaid ? 'success.main' : 'warning.main'}>
            ฿{amountToPay.toFixed(2)}
          </Typography>
          <Typography variant="body1" color="text.secondary" mt={1}>
            วิธีชำระเงิน: {payment === 'cash' ? '💵 เงินสด' : '📱 PromptPay'}
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          {isPaid ? 'ชำระเงินเสร็จสิ้น ระบบจะปิดอัตโนมัติใน 5 วินาที' : 'โปรดยืนยันการชำระเงิน'}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'space-between',
          px: 3,
          pb: 2,
        }}>
        {!isPaid && (
          <Button
            variant="contained"
            color={payment === 'cash' ? 'success' : 'warning'}
            startIcon={<DoneAllIcon />}
            onClick={handleConfirm}>
            {payment === 'cash' ? 'รับเงินแล้ว' : 'ยืนยันการโอนแล้ว'}
          </Button>
        )}
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ReplayIcon />}
          onClick={() => {
            localStorage.removeItem('pendingOrder');
            onNewOrder();
          }}>
          ทำรายการใหม่
        </Button>
      </DialogActions>
    </Dialog>
  );
}
