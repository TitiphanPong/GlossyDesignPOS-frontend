'use client';

import React, { useEffect, useState } from 'react';
import { alpha, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, TextField, Typography } from '@mui/material';

type Props = {
  open: boolean;
  taxInvoice: 'yes' | 'no';
  onClose: () => void;
  customer: {
    customerName: string;
    phoneNumber: string;
    taxId: string;
    address: string;
    note: string;
  };
  onSubmit: (customer: { customerName: string; phoneNumber: string; taxId: string; address: string; note: string }) => void;
};

const CUSTOMER_NAME_MAX_LENGTH = 120;
const CUSTOMER_NOTE_MAX_LENGTH = 500;
const ADDRESS_MAX_LENGTH = 500;
const TAX_ID_DIGITS = 13;
const PHONE_MIN_DIGITS = 9;
const PHONE_MAX_DIGITS = 20;
const LINE_OA_SUFFIX = ' (Line OA)';

function normalizePhoneDigits(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, '');
}

function normalizeTaxIdDigits(taxId: string): string {
  return taxId.replace(/\D/g, '');
}

function stripLineOASuffix(customerName: string): string {
  return customerName.endsWith(LINE_OA_SUFFIX) ? customerName.slice(0, -LINE_OA_SUFFIX.length) : customerName;
}

function buildFieldSx(multiline = false) {
  return {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      alignItems: multiline ? 'flex-start' : 'center',
      backgroundColor: '#FFFFFF',
      transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
      '& fieldset': {
        borderColor: '#D7E3F4',
      },
      '&:hover fieldset': {
        borderColor: '#AFC3E6',
      },
      '&.Mui-focused': {
        boxShadow: '0 0 0 4px rgba(43, 98, 238, 0.10)',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#5B6B82',
      fontWeight: 600,
    },
    '& .MuiFormHelperText-root': {
      marginLeft: 0.25,
      marginTop: 0.85,
    },
  };
}

export default function CustomerInfoModal({ open, taxInvoice, onClose, onSubmit, customer }: Props) {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [isLineOA, setIsLineOA] = useState(false);
  const [touched, setTouched] = useState({
    customerName: false,
    phoneNumber: false,
    taxId: false,
    address: false,
    note: false,
  });

  useEffect(() => {
    setCustomerName(stripLineOASuffix(customer.customerName));
    setPhoneNumber(customer.phoneNumber);
    setTaxId(customer.taxId);
    setAddress(customer.address);
    setNote(customer.note);
    setIsLineOA(customer.customerName.endsWith(LINE_OA_SUFFIX));
    setTouched({
      customerName: false,
      phoneNumber: false,
      taxId: false,
      address: false,
      note: false,
    });
  }, [customer, open]);

  const trimmedCustomerName = customerName.trim();
  const trimmedPhoneNumber = phoneNumber.trim();
  const trimmedTaxId = taxId.trim();
  const trimmedAddress = address.trim();
  const trimmedNote = note.trim();
  const normalizedPhoneNumber = normalizePhoneDigits(trimmedPhoneNumber);
  const normalizedTaxId = normalizeTaxIdDigits(trimmedTaxId);

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

  const taxIdError = trimmedTaxId && normalizedTaxId.length !== TAX_ID_DIGITS ? `เลขประจำตัวผู้เสียภาษีต้องมี ${TAX_ID_DIGITS} หลัก` : '';
  const addressError = trimmedAddress.length > ADDRESS_MAX_LENGTH ? `ที่อยู่ยาวได้ไม่เกิน ${ADDRESS_MAX_LENGTH} ตัวอักษร` : '';
  const noteError = trimmedNote.length > CUSTOMER_NOTE_MAX_LENGTH ? `หมายเหตุยาวได้ไม่เกิน ${CUSTOMER_NOTE_MAX_LENGTH} ตัวอักษร` : '';
  const hasValidationError = Boolean(customerNameError || phoneNumberError || taxIdError || addressError || noteError);

  const handleConfirm = () => {
    setTouched({
      customerName: true,
      phoneNumber: true,
      taxId: true,
      address: true,
      note: true,
    });

    if (hasValidationError) {
      return;
    }

    onSubmit({
      customerName: `${trimmedCustomerName}${isLineOA ? LINE_OA_SUFFIX : ''}`,
      phoneNumber: trimmedPhoneNumber,
      taxId: normalizedTaxId,
      address: trimmedAddress,
      note: trimmedNote,
    });
    setCustomerName('');
    setPhoneNumber('');
    setTaxId('');
    setAddress('');
    setNote('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 5,
            overflow: 'hidden',
            border: '1px solid #E7EEF8',
            boxShadow: '0 28px 70px rgba(15, 23, 42, 0.18)',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FBFDFF 100%)',
          },
        },
      }}>
      <DialogTitle sx={{ px: 3, py: 2.6, borderBottom: '1px solid #E9EFF7' }}>
        <Stack spacing={1.4}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box>
              <Typography sx={{ fontSize: 24, fontWeight: 800, color: '#112033', lineHeight: 1.05 }}>ข้อมูลลูกค้า</Typography>
              <Typography sx={{ mt: 0.7, fontSize: 13.5, color: '#61758A' }}>กรอกข้อมูลติดต่อก่อนยืนยันออเดอร์</Typography>
            </Box>
            <Chip
              label={taxInvoice === 'yes' ? 'ออกใบกำกับภาษี' : 'ไม่บังคับข้อมูลภาษี'}
              sx={{
                mt: 0.25,
                bgcolor: taxInvoice === 'yes' ? alpha('#2B62EE', 0.12) : '#EEF4FB',
                color: taxInvoice === 'yes' ? '#1D4ED8' : '#4E647B',
                fontWeight: 700,
              }}
            />
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ mt: 1.5, px: 3, py: 2 }}>
        <Stack spacing={2.2}>
          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#2C4258', letterSpacing: '0.02em' }}>ข้อมูลติดต่อ</Typography>
              <FormControlLabel
                control={<Checkbox size="small" checked={isLineOA} onChange={event => setIsLineOA(event.target.checked)} />}
                label="Line OA"
                sx={{
                  mr: 0,
                  '& .MuiFormControlLabel-label': {
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#61758A',
                  },
                }}
              />
            </Stack>
            <TextField
              label="ชื่อลูกค้า"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, customerName: true }))}
              error={touched.customerName && Boolean(customerNameError)}
              helperText={touched.customerName && customerNameError ? customerNameError : `${trimmedCustomerName.length}/${CUSTOMER_NAME_MAX_LENGTH}`}
              fullWidth
              sx={buildFieldSx()}
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
              sx={buildFieldSx()}
              slotProps={{ htmlInput: { inputMode: 'tel', maxLength: PHONE_MAX_DIGITS + 4 } }}
            />
          </Stack>

          <Stack spacing={1.5}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#2C4258', letterSpacing: '0.02em' }}>ข้อมูลภาษีและที่อยู่</Typography>
            <TextField
              label="เลขประจำตัวผู้เสียภาษี"
              value={taxId}
              onChange={e => setTaxId(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, taxId: true }))}
              error={touched.taxId && Boolean(taxIdError)}
              helperText={touched.taxId && taxIdError ? taxIdError : `ไม่บังคับ ถ้ากรอกควรมี ${TAX_ID_DIGITS} หลัก`}
              fullWidth
              sx={buildFieldSx()}
              slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: TAX_ID_DIGITS } }}
            />
            <TextField
              label="ที่อยู่"
              value={address}
              onChange={e => setAddress(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, address: true }))}
              error={touched.address && Boolean(addressError)}
              helperText={touched.address && addressError ? addressError : `${trimmedAddress.length}/${ADDRESS_MAX_LENGTH}`}
              fullWidth
              multiline
              minRows={3}
              sx={buildFieldSx(true)}
              slotProps={{ htmlInput: { maxLength: ADDRESS_MAX_LENGTH } }}
            />
          </Stack>

          <Stack spacing={1.5}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#2C4258', letterSpacing: '0.02em' }}>รายละเอียดเพิ่มเติม</Typography>
            <TextField
              label="หมายเหตุ"
              value={note}
              onChange={e => setNote(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, note: true }))}
              error={touched.note && Boolean(noteError)}
              helperText={touched.note && noteError ? noteError : `${trimmedNote.length}/${CUSTOMER_NOTE_MAX_LENGTH}`}
              fullWidth
              multiline
              minRows={2}
              sx={buildFieldSx(true)}
              slotProps={{ htmlInput: { maxLength: CUSTOMER_NOTE_MAX_LENGTH } }}
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.2, borderTop: '1px solid #E9EFF7', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: 12.5, color: '#6A7D92' }}>ระบบจะบันทึกเฉพาะข้อมูลที่กรอกจริง</Typography>
        <Stack direction="row" spacing={1.2}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              minWidth: 96,
              minHeight: 42,
              borderRadius: 999,
              borderColor: '#D7E3F4',
              color: '#355070',
              fontWeight: 700,
              textTransform: 'none',
            }}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={hasValidationError}
            sx={{
              minWidth: 124,
              minHeight: 42,
              borderRadius: 999,
              bgcolor: '#2B62EE',
              boxShadow: '0 12px 28px rgba(43, 98, 238, 0.28)',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#2156D8',
              },
            }}>
            ยืนยันข้อมูล
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
