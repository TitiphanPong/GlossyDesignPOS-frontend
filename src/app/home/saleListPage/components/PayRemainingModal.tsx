'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, alpha, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import type { NormalizedOrder, PaymentMethod } from '../../../../lib/contracts';
import { isMissingApiBaseError } from '../../../../lib/api';
import { payRemainingBalance } from '../../../../lib/orders';

type Props = {
  open: boolean;
  orderId: string;
  remaining: number;
  onClose: () => void;
  onSuccess: (updated: NormalizedOrder) => void;
};

function validateRemainingPaymentAmount(rawAmount: string, remaining: number): string {
  const trimmed = rawAmount.trim();

  if (trimmed.length === 0) {
    return 'กรุณากรอกจำนวนเงินที่ต้องการรับชำระ';
  }

  const amount = Number(trimmed);

  if (Number.isNaN(amount)) {
    return 'กรุณากรอกจำนวนเงินเป็นตัวเลข';
  }

  if (!Number.isFinite(amount)) {
    return 'จำนวนเงินต้องเป็นตัวเลขที่ถูกต้อง';
  }

  if (amount <= 0) {
    return 'จำนวนเงินต้องมากกว่า 0 บาท';
  }

  if (amount > remaining) {
    return 'จำนวนเงินต้องไม่เกินยอดคงเหลือ';
  }

  return '';
}

export default function PayRemainingModal({ open, orderId, remaining, onClose, onSuccess }: Readonly<Props>) {
  const [amountInput, setAmountInput] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setAmountInput(remaining > 0 ? String(remaining) : '');
    setMethod('cash');
    setErrorMessage(null);
  }, [open, remaining]);

  const amountError = useMemo(() => validateRemainingPaymentAmount(amountInput, remaining), [amountInput, remaining]);
  const normalizedAmount = Number(amountInput.trim());

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
          : error instanceof Error && error.message /* NOSONAR */
            ? error.message
            : 'เกิดข้อผิดพลาดในการชำระเงิน'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 4, boxShadow: '0 24px 70px rgba(15, 23, 42, 0.22)', overflow: 'hidden' } } }}>
      <DialogTitle sx={{ px: 3, pt: 2.75, pb: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box sx={{ width: 42, height: 42, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: alpha('#2563EB', 0.11), color: '#2563EB' }}>
              <AccountBalanceWalletRoundedIcon />
            </Box>
            <Box>
              <Typography sx={{ color: '#0F172A', fontSize: 19, fontWeight: 800 }}>รับชำระยอดคงเหลือ</Typography>
              <Typography sx={{ color: '#64748B', fontSize: 12.5, fontWeight: 400 }}>ระบุยอดและช่องทางการรับชำระ</Typography>
            </Box>
          </Stack>
          <IconButton aria-label="ปิด" onClick={onClose} disabled={loading} sx={{ bgcolor: '#F1F5F9', color: '#64748B', '&:hover': { bgcolor: '#E2E8F0' } }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 2.5 }}>
        <Stack spacing={2.25}>
          <Box sx={{ p: 2, borderRadius: 3, background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFBEB 100%)', border: '1px solid #FED7AA' }}>
            <Typography sx={{ color: '#9A5B00', fontSize: 12.5, fontWeight: 700 }}>ยอดคงเหลือที่ต้องชำระ</Typography>
            <Typography sx={{ mt: 0.35, color: '#C2410C', fontSize: 27, lineHeight: 1.15, fontWeight: 800 }}>
              ฿{remaining.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
          <TextField
            label="ยอดที่รับชำระ"
            type="number"
            value={amountInput}
            onChange={event => setAmountInput(event.target.value)}
            error={Boolean(amountError)}
            helperText={amountError || 'รับชำระได้ไม่เกินยอดคงเหลือ'}
            fullWidth
            slotProps={{
              input: { startAdornment: <InputAdornment position="start"><Typography sx={{ color: '#334155', fontWeight: 800 }}>฿</Typography></InputAdornment> },
              htmlInput: { min: 0.01, max: remaining, step: 0.01 },
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.75, bgcolor: '#FFFFFF' } }}
          />
          <Box>
            <Typography sx={{ mb: 1, color: '#334155', fontSize: 13, fontWeight: 700 }}>ช่องทางการชำระเงิน</Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={method}
              onChange={(_, value: PaymentMethod | null) => { if (value) setMethod(value); }}
              sx={{ gap: 1, '& .MuiToggleButtonGroup-grouped': { m: 0, border: '1px solid #DCE5F1 !important', borderRadius: '12px !important' } }}>
              <ToggleButton value="cash" sx={{ py: 1.25, gap: 1, color: '#475569', fontWeight: 700, textTransform: 'none', '&.Mui-selected': { color: '#166534', bgcolor: '#ECFDF3', borderColor: '#86EFAC !important' } }}>
                <PaymentsRoundedIcon fontSize="small" /> เงินสด
              </ToggleButton>
              <ToggleButton value="promptpay" sx={{ py: 1.25, gap: 1, color: '#475569', fontWeight: 700, textTransform: 'none', '&.Mui-selected': { color: '#1D4ED8', bgcolor: '#EFF6FF', borderColor: '#93C5FD !important' } }}>
                <QrCode2RoundedIcon fontSize="small" /> พร้อมเพย์
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E8EFF8', bgcolor: '#FAFCFF', gap: 1 }}>
        <Button onClick={onClose} disabled={loading} sx={{ color: '#64748B', fontWeight: 700 }}>ยกเลิก</Button>
        <Button
          variant="contained"
          startIcon={<CheckCircleRoundedIcon />}
          onClick={handleConfirm}
          disabled={loading || Boolean(amountError)}
          sx={{ minWidth: 170, borderRadius: 2.5, py: 1.05, fontWeight: 800, boxShadow: '0 8px 18px rgba(37, 99, 235, 0.24)' }}>
          {loading ? 'กำลังบันทึก...' : 'ยืนยันรับชำระ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
