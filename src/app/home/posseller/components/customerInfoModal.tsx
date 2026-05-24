'use client';

import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';

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

const CUSTOMER_NAME_MAX_LENGTH = 120;
const CUSTOMER_NOTE_MAX_LENGTH = 500;
const PHONE_MIN_DIGITS = 9;
const PHONE_MAX_DIGITS = 20;

function normalizePhoneDigits(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, '');
}

export default function CustomerInfoModal({ open, onClose, onSubmit, customer }: Props) {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [note, setNote] = useState('');
  const [touched, setTouched] = useState({
    customerName: false,
    phoneNumber: false,
    note: false,
  });

  useEffect(() => {
    setCustomerName(customer.customerName);
    setPhoneNumber(customer.phoneNumber);
    setNote(customer.note);
    setTouched({
      customerName: false,
      phoneNumber: false,
      note: false,
    });
  }, [customer, open]);

  const trimmedCustomerName = customerName.trim();
  const trimmedPhoneNumber = phoneNumber.trim();
  const trimmedNote = note.trim();
  const normalizedPhoneNumber = normalizePhoneDigits(trimmedPhoneNumber);

  const customerNameError =
    !trimmedCustomerName
      ? 'กรุณากรอกชื่อลูกค้า'
      : trimmedCustomerName.length > CUSTOMER_NAME_MAX_LENGTH
        ? `ชื่อลูกค้ายาวได้ไม่เกิน ${CUSTOMER_NAME_MAX_LENGTH} ตัวอักษร`
        : '';

  const phoneNumberError =
    !trimmedPhoneNumber
      ? 'กรุณากรอกเบอร์โทรศัพท์'
      : normalizedPhoneNumber.length < PHONE_MIN_DIGITS || normalizedPhoneNumber.length > PHONE_MAX_DIGITS
        ? `เบอร์โทรควรมี ${PHONE_MIN_DIGITS}-${PHONE_MAX_DIGITS} ตัวเลข`
        : '';

  const noteError = trimmedNote.length > CUSTOMER_NOTE_MAX_LENGTH ? `หมายเหตุยาวได้ไม่เกิน ${CUSTOMER_NOTE_MAX_LENGTH} ตัวอักษร` : '';
  const hasValidationError = Boolean(customerNameError || phoneNumberError || noteError);

  const handleConfirm = () => {
    setTouched({
      customerName: true,
      phoneNumber: true,
      note: true,
    });

    if (hasValidationError) {
      return;
    }

    onSubmit({
      customerName: trimmedCustomerName,
      phoneNumber: trimmedPhoneNumber,
      note: trimmedNote,
    });
    setCustomerName('');
    setPhoneNumber('');
    setNote('');
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>ข้อมูลลูกค้า</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="ชื่อลูกค้า"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, customerName: true }))}
            error={touched.customerName && Boolean(customerNameError)}
            helperText={touched.customerName && customerNameError ? customerNameError : `${trimmedCustomerName.length}/${CUSTOMER_NAME_MAX_LENGTH}`}
            fullWidth
            slotProps={{ htmlInput: { maxLength: CUSTOMER_NAME_MAX_LENGTH } }}
          />
          <TextField
            label="เบอร์โทรศัพท์"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, phoneNumber: true }))}
            error={touched.phoneNumber && Boolean(phoneNumberError)}
            helperText={touched.phoneNumber && phoneNumberError ? phoneNumberError : 'รองรับตัวเลข 9-20 หลัก'}
            fullWidth
            slotProps={{ htmlInput: { inputMode: 'tel', maxLength: PHONE_MAX_DIGITS + 4 } }}
          />
          <TextField
            label="หมายเหตุ"
            value={note}
            onChange={e => setNote(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, note: true }))}
            error={touched.note && Boolean(noteError)}
            helperText={touched.note && noteError ? noteError : `${trimmedNote.length}/${CUSTOMER_NOTE_MAX_LENGTH}`}
            fullWidth
            multiline
            rows={2}
            slotProps={{ htmlInput: { maxLength: CUSTOMER_NOTE_MAX_LENGTH } }}
          />
          <Typography variant="body2" color="text.secondary">
            กรุณากรอกข้อมูลลูกค้าก่อนยืนยันการสั่งซื้อ
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button variant="contained" onClick={handleConfirm} disabled={hasValidationError}>
          ยืนยัน
        </Button>
      </DialogActions>
    </Dialog>
  );
}
