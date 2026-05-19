'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Stack, Divider, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { PaymentMethod, PendingOrderDraft } from '../../../../lib/contracts';

type Props = {
  open: boolean;
  payment: PaymentMethod;
  onClose: () => void;
  onPaid: () => void;
  onNewOrder: () => void;
};

export default function SuccessModal({ open, payment, onClose, onPaid, onNewOrder }: Readonly<Props>) {
  const [isPaid, setIsPaid] = useState(false);
  const [orderData, setOrderData] = useState<PendingOrderDraft | null>(null);
  const remainingTotal = orderData?.remainingTotal ?? 0;
  const depositTotal = orderData?.depositTotal ?? 0;
  const grandTotal = orderData?.grandTotal ?? 0;
  const amountToShow = remainingTotal > 0 ? depositTotal : grandTotal;

  useEffect(() => {
    if (open) {
      setIsPaid(false);
      const orderStr = localStorage.getItem('pendingOrder');
      if (orderStr) {
        const order = JSON.parse(orderStr) as PendingOrderDraft;
        setOrderData(order);
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
      const order = JSON.parse(orderStr) as PendingOrderDraft;
      const isPartial = (order.remainingTotal ?? 0) > 0;

      const base = process.env.NEXT_PUBLIC_API_URL ?? '';
      const res = await fetch(`${base}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...order,
          status: isPartial ? 'partial' : 'paid',
          taxInvoice: order.taxInvoice,
          vatAmount: order.vatAmount,
          grandTotal: order.grandTotal,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('Backend error:', res.status, text);
        throw new Error('บันทึกออเดอร์ไม่สำเร็จ');
      }
      await res.json();

      localStorage.setItem(
        'pendingOrder',
        JSON.stringify({
          ...order,
          status: isPartial ? 'partial' : 'paid',
          taxInvoice: order.taxInvoice,
          vatAmount: order.vatAmount,
        })
      );
      globalThis.dispatchEvent(new Event('storage'));
      setIsPaid(true);
      onPaid();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการยืนยันการชำระเงิน');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, p: 0.5 } } }}>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          {isPaid ? <CheckCircleIcon color="success" fontSize="large" /> : <HourglassEmptyIcon color="warning" fontSize="large" />}
          <Typography variant="h6" fontWeight={800}>
            {isPaid ? 'ชำระเงินเรียบร้อย' : 'รอชำระเงิน'}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Box textAlign="center" py={1}>
          <Typography variant="h3" fontWeight={800} color={isPaid ? 'success.main' : 'warning.main'}>
            {Number(amountToShow).toFixed(2)} บาท
          </Typography>

          {remainingTotal > 0 && (
            <Typography color="error" fontWeight={700} mt={1}>
              คงเหลือ: {remainingTotal.toFixed(2)} บาท
            </Typography>
          )}

          {orderData?.taxInvoice === 'yes' && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              (รวม VAT 7% = {(orderData.vatAmount ?? 0).toFixed(2)} บาท)
            </Typography>
          )}

          <Typography variant="body1" color="text.secondary" mt={1}>
            วิธีชำระเงิน: {payment === 'cash' ? 'เงินสด' : 'PromptPay'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Divider sx={{ my: 2, width: '80%' }} />
        </Box>

        <Typography variant="body2" color="text.secondary" align="center">
          {isPaid ? 'ชำระเงินเสร็จสิ้น ระบบจะปิดอัตโนมัติใน 5 วินาที' : 'โปรดยืนยันการชำระเงินก่อนปิดบิล'}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'space-between', px: 2.5, pb: 2, pt: 2 }}>
        {!isPaid && (
          <Button variant="contained" color={payment === 'cash' ? 'success' : 'warning'} startIcon={<DoneAllIcon />} onClick={handleConfirm}>
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

