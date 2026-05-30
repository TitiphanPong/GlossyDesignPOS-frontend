'use client';

import React, { useEffect, useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import type { ApiOrder, PaymentMethod } from '../../../../lib/contracts';
import { isMissingApiBaseError } from '../../../../lib/api';
import { payRemainingBalance } from '../../../../lib/orders';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setAmount(remaining);
    setMethod('cash');
    setErrorMessage(null);
  }, [open, remaining]);

  const normalizedAmount = Number.isFinite(amount) ? amount : Number.NaN;
  const amountError =
    Number.isNaN(normalizedAmount) || normalizedAmount <= 0
      ? 'กรุณากรอกจำนวนเงินที่มากกว่า 0'
      : normalizedAmount > remaining
        ? 'จำนวนเงินต้องไม่เกินยอดคงเหลือ'
        : '';

  const handleConfirm = async () => {
    if (loading) return;

    if (amountError) {
      setErrorMessage(amountError);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const updated = await payRemainingBalance(orderId, {
        amount: normalizedAmount,
        method,
      });
      onSuccess(updated);
      onClose();
    } catch (error) {
      setErrorMessage(
        isMissingApiBaseError(error)
          ? 'กรุณาตั้งค่า NEXT_PUBLIC_API_URL ก่อนบันทึกการชำระเงิน'
          : error instanceof Error && error.message
            ? error.message
            : 'เกิดข้อผิดพลาดในการชำระเงิน'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>ชำระยอดคงเหลือ</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography color="warning.main">คงเหลือ: ฿{remaining.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
          <TextField
            label="จำนวนเงิน"
            type="number"
            value={amount}
            onChange={event => setAmount(Number(event.target.value))}
            error={Boolean(amountError)}
            helperText={amountError || 'จำนวนเงินต้องมากกว่า 0 และไม่เกินยอดคงเหลือ'}
            fullWidth
            slotProps={{ htmlInput: { min: 0.01, max: remaining, step: 0.01 } }}
          />
          <Select value={method} onChange={event => setMethod(event.target.value as PaymentMethod)} fullWidth>
            <MenuItem value="cash">เงินสด</MenuItem>
            <MenuItem value="promptpay">PromptPay</MenuItem>
          </Select>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          ยกเลิก
        </Button>
        <Button variant="contained" onClick={handleConfirm} disabled={loading || Boolean(amountError)}>
          ยืนยันการชำระ
        </Button>
      </DialogActions>
    </Dialog>
  );
}
