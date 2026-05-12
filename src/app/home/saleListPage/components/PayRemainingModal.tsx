'use client';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, Stack, Typography } from '@mui/material';
import { ApiOrder, PaymentMethod } from '../../../../lib/contracts';

type Props = {
  open: boolean;
  orderId: string;
  remaining: number;
  onClose: () => void;
  onSuccess: (updated: ApiOrder) => void;
};

export default function PayRemainingModal({ open, orderId, remaining, onClose, onSuccess }: Readonly<Props>) {
  const [amount, setAmount] = useState(remaining);
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setAmount(remaining);
  }, [remaining, open]);

  const handleConfirm = async () => {
    setLoading(true);
    if (amount > remaining) {
      alert('❌ ยอดเกินกว่ายอดคงเหลือ');
      setLoading(false);
      return;
    }
    try {
      const base = process.env.NEXT_PUBLIC_API_URL ?? '';
      const res = await fetch(`${base}/orders/${orderId}/payments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method }),
      });
      if (!res.ok) throw new Error('Payment failed');
      const updated = (await res.json()) as ApiOrder;
      onSuccess(updated);
      onClose();
    } catch {
      alert('❌ เกิดข้อผิดพลาดในการชำระเงิน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>💵 ชำระยอดคงเหลือ</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography color="warning.main">คงเหลือ: ฿{remaining.toLocaleString('th-TH')}</Typography>
          <TextField label="จำนวนเงิน" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} fullWidth />
          <Select value={method} onChange={e => setMethod(e.target.value)} fullWidth>
            <MenuItem value="cash">เงินสด</MenuItem>
            <MenuItem value="promptpay">PromptPay</MenuItem>
          </Select>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button variant="contained" onClick={handleConfirm} disabled={loading}>
          ยืนยันการชำระ
        </Button>
      </DialogActions>
    </Dialog>
  );
}
