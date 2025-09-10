'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
} from '@mui/material';

type Props = {
  open: boolean;
  onClose: () => void;
  customer: {
    customerName: string;
    phoneNumber: string;
    note: string;
  };
  onSubmit: (customer: { customerName: string; phoneNumber: string; note: string }) => void;
};

export default function CustomerInfoModal({ open, onClose, onSubmit, customer }: Props) {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    // preload state จาก parent
    setCustomerName(customer.customerName);
    setPhoneNumber(customer.phoneNumber);
    setNote(customer.note);
  }, [customer, open]);

  const handleConfirm = () => {
    onSubmit({
      customerName,
      phoneNumber,
      note,
    });
    setCustomerName('');
    setPhoneNumber('');
    setNote('');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>🧑 ข้อมูลลูกค้า</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="ชื่อลูกค้า"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            fullWidth
          />
          <TextField
            label="เบอร์โทรศัพท์"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            fullWidth
          />
          <TextField
            label="หมายเหตุ"
            value={note}
            onChange={e => setNote(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
          <Typography variant="body2" color="text.secondary">
            * กรอกข้อมูลลูกค้าก่อนยืนยันการสั่งซื้อ
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button variant="contained" onClick={handleConfirm}>
          ยืนยัน
        </Button>
      </DialogActions>
    </Dialog>
  );
}
