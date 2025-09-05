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
  total: number;
  payment: 'cash' | 'promptpay';
  onClose: () => void;
  onConfirmPaid: () => void;
  onNewOrder: () => void;
};

export default function SuccessModal({
  open,
  total,
  payment,
  onClose,
  onConfirmPaid,
  onNewOrder,
}: Props) {
  const [isPaid, setIsPaid] = useState(false);

  // reset state ทุกครั้งที่เปิดใหม่
  useEffect(() => {
    if (open) setIsPaid(false);
  }, [open]);

  // auto close หลังจากชำระแล้ว 5 วิ
  useEffect(() => {
    if (isPaid) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isPaid, onClose]);

  const handleConfirm = () => {
    setIsPaid(true);
    onConfirmPaid();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
        },
      }}>
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
            ฿{total.toFixed(2)}
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

        <Button variant="outlined" color="primary" startIcon={<ReplayIcon />} onClick={onNewOrder}>
          ทำรายการใหม่
        </Button>
      </DialogActions>
    </Dialog>
  );
}
