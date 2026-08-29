'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { createCustomer, parseCustomerPhoneInput, type CustomerProfile } from '@/lib/customers';
import { buildCustomerFieldSx, customerDialogPaperSx } from './customerFormUi';

type CustomerForm = {
  displayName: string;
  phoneNumbers: string;
  email: string;
  taxId: string;
  address: string;
};

const EMPTY_FORM: CustomerForm = {
  displayName: '',
  phoneNumbers: '',
  email: '',
  taxId: '',
  address: '',
};

type CustomerCreateDialogProps = Readonly<{
  open: boolean;
  onClose: () => void;
  onCreated?: (customer: CustomerProfile) => void;
}>;

export default function CustomerCreateDialog({ open, onClose, onCreated }: CustomerCreateDialogProps) {
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<CustomerForm>(EMPTY_FORM);

  const resetAndClose = React.useCallback(() => {
    if (saving) return;
    setForm(EMPTY_FORM);
    setError(null);
    onClose();
  }, [onClose, saving]);

  const submitCustomer = async () => {
    if (!form.displayName.trim()) return;
    const phoneNumbers = parseCustomerPhoneInput(form.phoneNumbers);
    if (phoneNumbers.some(phone => phone.length > 20)) {
      setError('เบอร์โทรศัพท์แต่ละเบอร์ต้องยาวไม่เกิน 20 ตัวอักษร');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await createCustomer({
        displayName: form.displayName.trim(),
        phoneNumbers: phoneNumbers.length > 0 ? phoneNumbers : undefined,
        email: form.email.trim() || undefined,
        taxId: form.taxId.trim() || undefined,
        address: form.address.trim() || undefined,
      });
      setForm(EMPTY_FORM);
      onCreated?.(created);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'บันทึกลูกค้าไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={resetAndClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: customerDialogPaperSx } }}>
      <DialogTitle sx={{ px: { xs: 2.25, sm: 3 }, py: { xs: 2, sm: 2.6 }, borderBottom: '1px solid #E9EFF7' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: 22, sm: 24 }, fontWeight: 800, color: '#112033', lineHeight: 1.08 }}>
              เพิ่มลูกค้า
            </Typography>
            <Typography sx={{ mt: 0.65, fontSize: { xs: 12.5, sm: 13.5 }, color: '#61758A', lineHeight: 1.45 }}>
              บันทึกโปรไฟล์สำหรับใช้ซ้ำตอนขายครั้งถัดไป
            </Typography>
          </Box>
          <Chip label="โปรไฟล์ลูกค้า" size="small" sx={{ mt: 0.2, flexShrink: 0, bgcolor: '#EEF4FB', color: '#4E647B', fontWeight: 700 }} />
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2.25, sm: 3 }, py: { xs: 2, sm: 2.4 }, bgcolor: '#FBFDFF' }}>
        <Stack spacing={{ xs: 2.2, sm: 2.5 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Box sx={{ px: 1.5, py: 1.2, borderRadius: 2.75, bgcolor: 'rgba(43, 98, 238, 0.07)', border: '1px solid rgba(43, 98, 238, 0.10)' }}>
            <Typography sx={{ color: '#254D8C', fontSize: 12.5, fontWeight: 700 }}>ข้อมูลนี้ใช้ช่วยกรอก POS ให้เร็วขึ้น</Typography>
            <Typography sx={{ mt: 0.25, color: '#718096', fontSize: 11.75, lineHeight: 1.45 }}>การแก้โปรไฟล์ภายหลังจะไม่ย้อนแก้ข้อมูลในบิลเก่า</Typography>
          </Box>

          <Stack spacing={1.45}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#2C4258', letterSpacing: '0.02em' }}>ข้อมูลติดต่อ</Typography>
            <TextField
              required
              fullWidth
              label="ชื่อลูกค้า"
              value={form.displayName}
              onChange={event => setForm(previous => ({ ...previous, displayName: event.target.value }))}
              helperText="ชื่อบุคคลหรือชื่อบริษัทที่ใช้ค้นหาในระบบ"
              sx={buildCustomerFieldSx()}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.4 }}>
              <TextField
                fullWidth
                label="เบอร์โทรศัพท์"
                value={form.phoneNumbers}
                onChange={event => setForm(previous => ({ ...previous, phoneNumbers: event.target.value }))}
                helperText="ใส่หลายเบอร์ได้ โดยคั่นด้วยจุลภาคหรือขึ้นบรรทัดใหม่"
                multiline
                minRows={2}
                slotProps={{ htmlInput: { inputMode: 'tel' } }}
                sx={buildCustomerFieldSx()}
              />
              <TextField
                fullWidth
                label="อีเมล"
                type="email"
                value={form.email}
                onChange={event => setForm(previous => ({ ...previous, email: event.target.value }))}
                slotProps={{ htmlInput: { inputMode: 'email' } }}
                sx={buildCustomerFieldSx()}
              />
            </Box>
          </Stack>

          <Stack spacing={1.45}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#2C4258', letterSpacing: '0.02em' }}>ข้อมูลภาษีและที่อยู่</Typography>
            <TextField
              fullWidth
              label="เลขประจำตัวผู้เสียภาษี"
              value={form.taxId}
              onChange={event => setForm(previous => ({ ...previous, taxId: event.target.value }))}
              helperText="ไม่บังคับ สำหรับลูกค้าที่ต้องใช้ข้อมูลออกเอกสารภาษี"
              slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 13 } }}
              sx={buildCustomerFieldSx()}
            />
            <TextField
              fullWidth
              label="ที่อยู่"
              multiline
              minRows={2}
              value={form.address}
              onChange={event => setForm(previous => ({ ...previous, address: event.target.value }))}
              sx={buildCustomerFieldSx(true)}
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2.25, sm: 3 },
          py: { xs: 1.75, sm: 2.2 },
          borderTop: '1px solid #E9EFF7',
          justifyContent: 'space-between',
          gap: 1.25,
        }}>
        <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontSize: 12.5, color: '#6A7D92' }}>กรอกเฉพาะข้อมูลที่ต้องการบันทึกได้</Typography>
        <Stack direction="row" spacing={1.1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            onClick={resetAndClose}
            variant="outlined"
            disabled={saving}
            sx={{ flex: { xs: 1, sm: 'initial' }, minWidth: { sm: 96 }, minHeight: 42, borderRadius: 999, borderColor: '#D7E3F4', color: '#355070', fontWeight: 700, textTransform: 'none' }}>
            ยกเลิก
          </Button>
          <Button
            variant="contained"
            disabled={saving || !form.displayName.trim()}
            onClick={() => void submitCustomer()}
            sx={{
              flex: { xs: 1, sm: 'initial' },
              minWidth: { sm: 124 },
              minHeight: 42,
              borderRadius: 999,
              bgcolor: '#2B62EE',
              boxShadow: '0 12px 28px rgba(43, 98, 238, 0.24)',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { bgcolor: '#2156D8' },
            }}>
            {saving ? 'กำลังบันทึก...' : 'บันทึกลูกค้า'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
