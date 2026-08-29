'use client';

import * as React from 'react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  createCustomer,
  getCustomerPhoneNumbers,
  updateCustomer,
  type CustomerProfile,
} from '@/lib/customers';
import { buildCustomerFieldSx, customerDialogPaperSx } from './customerFormUi';

type CustomerForm = {
  displayName: string;
  companyName: string;
  phoneNumbers: string[];
  email: string;
  taxId: string;
  branchType: string;
  branchNo: string;
  address: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  shippingAddress: string;
  active: boolean;
};

const EMPTY_FORM: CustomerForm = {
  displayName: '',
  companyName: '',
  phoneNumbers: [''],
  email: '',
  taxId: '',
  branchType: '',
  branchNo: '',
  address: '',
  subDistrict: '',
  district: '',
  province: '',
  postalCode: '',
  shippingAddress: '',
  active: true,
};

const STANDARD_BRANCH_TYPES = new Set(['', 'headquarters', 'branch']);

function normalizeBranchType(value?: string): string {
  if (!value) return '';
  const normalized = value.trim().toLowerCase();
  if (['headquarters', 'head_office', 'head-office', 'สำนักงานใหญ่'].includes(normalized)) return 'headquarters';
  if (['branch', 'สาขา'].includes(normalized)) return 'branch';
  return value;
}

function toForm(customer?: CustomerProfile | null): CustomerForm {
  if (!customer) return EMPTY_FORM;
  const phones = getCustomerPhoneNumbers(customer);
  return {
    displayName: customer.displayName ?? '',
    companyName: customer.companyName ?? '',
    phoneNumbers: phones.length ? phones : [''],
    email: customer.email ?? '',
    taxId: customer.taxId ?? '',
    branchType: normalizeBranchType(customer.branchType),
    branchNo: customer.branchNo ?? '',
    address: customer.address ?? '',
    subDistrict: customer.subDistrict ?? '',
    district: customer.district ?? '',
    province: customer.province ?? '',
    postalCode: customer.postalCode ?? '',
    shippingAddress: customer.shippingAddress ?? '',
    active: customer.active,
  };
}

function optional(value: string): string | undefined {
  return value.trim() || undefined;
}

function nullable(value: string): string | null {
  return value.trim() || null;
}

function buildAddress(form: CustomerForm): string {
  return [form.address, form.subDistrict, form.district, form.province, form.postalCode]
    .map(value => value.trim())
    .filter(Boolean)
    .join(' ');
}

function validateForm(form: CustomerForm): string | null {
  if (!form.displayName.trim()) return 'กรุณาระบุชื่อลูกค้า';
  if (form.displayName.trim().length > 120) return 'ชื่อลูกค้าต้องยาวไม่เกิน 120 ตัวอักษร';
  if (form.companyName.trim().length > 160) return 'ชื่อบริษัทต้องยาวไม่เกิน 160 ตัวอักษร';
  const phones = form.phoneNumbers.map(value => value.trim()).filter(Boolean);
  if (phones.some(phone => phone.length > 20)) return 'เบอร์โทรศัพท์แต่ละเบอร์ต้องยาวไม่เกิน 20 ตัวอักษร';
  if (form.email.trim().length > 160) return 'อีเมลต้องยาวไม่เกิน 160 ตัวอักษร';
  if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) return 'รูปแบบอีเมลไม่ถูกต้อง';
  if (form.taxId.trim().length > 13) return 'เลขประจำตัวผู้เสียภาษีต้องยาวไม่เกิน 13 ตัวอักษร';
  if (form.branchType.trim().length > 80) return 'ประเภทสาขาต้องยาวไม่เกิน 80 ตัวอักษร';
  if (form.branchNo.trim().length > 20) return 'เลขที่สาขาต้องยาวไม่เกิน 20 ตัวอักษร';
  if (form.address.trim().length > 500) return 'ที่อยู่ต้องยาวไม่เกิน 500 ตัวอักษร';
  if (form.subDistrict.trim().length > 120) return 'แขวง/ตำบลต้องยาวไม่เกิน 120 ตัวอักษร';
  if (form.district.trim().length > 120) return 'เขต/อำเภอต้องยาวไม่เกิน 120 ตัวอักษร';
  if (form.province.trim().length > 120) return 'จังหวัดต้องยาวไม่เกิน 120 ตัวอักษร';
  if (form.postalCode.trim().length > 10) return 'รหัสไปรษณีย์ต้องยาวไม่เกิน 10 ตัวอักษร';
  if (form.shippingAddress.trim().length > 500) return 'ที่อยู่จัดส่งต้องยาวไม่เกิน 500 ตัวอักษร';
  return null;
}

type CustomerCreateDialogProps = Readonly<{
  open: boolean;
  onClose: () => void;
  customer?: CustomerProfile | null;
  onCreated?: (customer: CustomerProfile) => void;
  onSaved?: (customer: CustomerProfile) => void;
}>;

export default function CustomerCreateDialog({ open, onClose, customer, onCreated, onSaved }: CustomerCreateDialogProps) {
  const editing = Boolean(customer);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<CustomerForm>(() => toForm(customer));
  const [sameShippingAddress, setSameShippingAddress] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setForm(toForm(customer));
    setSameShippingAddress(false);
    setError(null);
  }, [customer, open]);

  const resetAndClose = React.useCallback(() => {
    if (saving) return;
    setForm(toForm(customer));
    setSameShippingAddress(false);
    setError(null);
    onClose();
  }, [customer, onClose, saving]);

  const updatePhone = (index: number, value: string) => {
    setForm(previous => ({
      ...previous,
      phoneNumbers: previous.phoneNumbers.map((phone, phoneIndex) => (phoneIndex === index ? value : phone)),
    }));
  };

  const addPhone = () => {
    setForm(previous => ({ ...previous, phoneNumbers: [...previous.phoneNumbers, ''] }));
  };

  const removePhone = (index: number) => {
    setForm(previous => {
      const phoneNumbers = previous.phoneNumbers.filter((_phone, phoneIndex) => phoneIndex !== index);
      return { ...previous, phoneNumbers: phoneNumbers.length ? phoneNumbers : [''] };
    });
  };

  const submitCustomer = async () => {
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    const phoneNumbers = form.phoneNumbers
      .map(phone => phone.trim())
      .filter((phone, index, phones) => phone && phones.indexOf(phone) === index);
    const shippingAddress = sameShippingAddress ? buildAddress(form) : form.shippingAddress.trim();

    setSaving(true);
    setError(null);
    try {
      const saved = customer
        ? await updateCustomer(customer._id, {
            displayName: form.displayName.trim(),
            companyName: nullable(form.companyName),
            phoneNumbers,
            email: nullable(form.email),
            taxId: nullable(form.taxId),
            branchType: nullable(form.branchType),
            branchNo: form.branchType === 'branch' ? nullable(form.branchNo) : null,
            address: nullable(form.address),
            subDistrict: nullable(form.subDistrict),
            district: nullable(form.district),
            province: nullable(form.province),
            postalCode: nullable(form.postalCode),
            shippingAddress: nullable(shippingAddress),
            active: form.active,
          })
        : await createCustomer({
            displayName: form.displayName.trim(),
            phoneNumbers,
            ...(optional(form.companyName) ? { companyName: optional(form.companyName) } : {}),
            ...(optional(form.email) ? { email: optional(form.email) } : {}),
            ...(optional(form.taxId) ? { taxId: optional(form.taxId) } : {}),
            ...(optional(form.branchType) ? { branchType: optional(form.branchType) } : {}),
            ...(form.branchType === 'branch' && optional(form.branchNo) ? { branchNo: optional(form.branchNo) } : {}),
            ...(optional(form.address) ? { address: optional(form.address) } : {}),
            ...(optional(form.subDistrict) ? { subDistrict: optional(form.subDistrict) } : {}),
            ...(optional(form.district) ? { district: optional(form.district) } : {}),
            ...(optional(form.province) ? { province: optional(form.province) } : {}),
            ...(optional(form.postalCode) ? { postalCode: optional(form.postalCode) } : {}),
            ...(optional(shippingAddress) ? { shippingAddress: optional(shippingAddress) } : {}),
          });
      onSaved?.(saved);
      if (!customer) onCreated?.(saved);
      setForm(EMPTY_FORM);
      setSameShippingAddress(false);
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : editing ? 'บันทึกการแก้ไขไม่สำเร็จ' : 'บันทึกลูกค้าไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const branchTypeIsCustom = Boolean(form.branchType && !STANDARD_BRANCH_TYPES.has(form.branchType));

  return (
    <Dialog
      open={open}
      onClose={resetAndClose}
      fullWidth
      maxWidth="md"
      slotProps={{ paper: { sx: customerDialogPaperSx } }}>
      <DialogTitle sx={{ px: { xs: 2.25, sm: 3 }, py: { xs: 2, sm: 2.6 }, borderBottom: '1px solid #E9EFF7' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: 22, sm: 24 }, fontWeight: 800, color: '#112033', lineHeight: 1.08 }}>
              {editing ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้า'}
            </Typography>
            <Typography sx={{ mt: 0.65, fontSize: { xs: 12.5, sm: 13.5 }, color: '#61758A', lineHeight: 1.45 }}>
              {editing ? 'อัปเดตโปรไฟล์สำหรับใช้กับรายการขายครั้งถัดไป โดยไม่เปลี่ยนข้อมูลในบิลเก่า' : 'บันทึกโปรไฟล์สำหรับใช้ซ้ำตอนขายครั้งถัดไป'}
            </Typography>
          </Box>
          <Chip label={editing ? customer?.customerCode : 'โปรไฟล์ลูกค้า'} size="small" sx={{ mt: 0.2, flexShrink: 0, bgcolor: '#EEF4FB', color: '#4E647B', fontWeight: 700 }} />
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: { xs: 2.25, sm: 3 }, py: { xs: 2, sm: 2.4 }, bgcolor: '#FBFDFF' }}>
        <Stack spacing={{ xs: 2.4, sm: 2.8 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Box sx={{ px: 1.5, py: 1.2, borderRadius: 2.75, bgcolor: 'rgba(43, 98, 238, 0.07)', border: '1px solid rgba(43, 98, 238, 0.10)' }}>
            <Typography sx={{ color: '#254D8C', fontSize: 12.5, fontWeight: 700 }}>ข้อมูลนี้ใช้ช่วยกรอก POS และเอกสารให้เร็วขึ้น</Typography>
            <Typography sx={{ mt: 0.25, color: '#718096', fontSize: 11.75, lineHeight: 1.45 }}>การแก้โปรไฟล์ภายหลังจะไม่ย้อนแก้ข้อมูลในบิลเก่า</Typography>
          </Box>

          <Stack spacing={1.45}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#2C4258', letterSpacing: '0.02em' }}>ข้อมูลทั่วไป</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.4 }}>
              <TextField
                required
                fullWidth
                label="ชื่อลูกค้า"
                value={form.displayName}
                onChange={event => setForm(previous => ({ ...previous, displayName: event.target.value }))}
                slotProps={{ htmlInput: { maxLength: 120 } }}
                helperText="ชื่อบุคคลหรือชื่อที่ใช้ค้นหาในระบบ"
                sx={buildCustomerFieldSx()}
              />
              <TextField
                fullWidth
                label="ชื่อบริษัท"
                value={form.companyName}
                onChange={event => setForm(previous => ({ ...previous, companyName: event.target.value }))}
                slotProps={{ htmlInput: { maxLength: 160 } }}
                helperText="เว้นว่างได้ หากเป็นลูกค้าบุคคล"
                sx={buildCustomerFieldSx()}
              />
            </Box>
            {editing ? (
              <Box sx={{ px: 1.2, py: 0.9, border: '1px solid #E4EAF2', borderRadius: 2.5, bgcolor: '#FFFFFF' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.active}
                      onChange={event => setForm(previous => ({ ...previous, active: event.target.checked }))}
                    />
                  }
                  label={
                    <Box>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#26364A' }}>
                        {form.active ? 'Active — ใช้งานลูกค้ารายนี้' : 'Inactive — ซ่อนจากรายการลูกค้าที่ใช้งาน'}
                      </Typography>
                      <Typography sx={{ mt: 0.1, fontSize: 11.5, color: '#7A8A9E' }}>
                        ประวัติออเดอร์เดิมยังคงอยู่ แม้ตั้งสถานะเป็น Inactive
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, alignItems: 'center' }}
                />
              </Box>
            ) : null}
          </Stack>

          <Stack spacing={1.45}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#2C4258', letterSpacing: '0.02em' }}>ข้อมูลติดต่อ</Typography>
              <Button size="small" startIcon={<AddRoundedIcon />} onClick={addPhone} sx={{ textTransform: 'none', fontWeight: 700 }}>เพิ่มเบอร์</Button>
            </Stack>
            <Stack spacing={1.1}>
              {form.phoneNumbers.map((phone, index) => (
                <Stack key={`phone-${index}`} direction="row" spacing={0.75} alignItems="flex-start">
                  <TextField
                    fullWidth
                    label={index === 0 ? 'เบอร์โทรศัพท์หลัก' : `เบอร์โทรศัพท์ ${index + 1}`}
                    value={phone}
                    onChange={event => updatePhone(index, event.target.value)}
                    slotProps={{ htmlInput: { inputMode: 'tel', maxLength: 20 } }}
                    sx={buildCustomerFieldSx()}
                  />
                  <IconButton aria-label={`ลบเบอร์โทรศัพท์ ${index + 1}`} onClick={() => removePhone(index)} sx={{ mt: 0.65 }}>
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
            <TextField
              fullWidth
              label="อีเมล"
              type="email"
              value={form.email}
              onChange={event => setForm(previous => ({ ...previous, email: event.target.value }))}
              slotProps={{ htmlInput: { inputMode: 'email', maxLength: 160 } }}
              sx={buildCustomerFieldSx()}
            />
          </Stack>

          <Stack spacing={1.45}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#2C4258', letterSpacing: '0.02em' }}>ข้อมูลออกเอกสาร / ภาษี</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1.3fr) minmax(0, 1fr)' }, gap: 1.4 }}>
              <TextField
                fullWidth
                label="เลขประจำตัวผู้เสียภาษี"
                value={form.taxId}
                onChange={event => setForm(previous => ({ ...previous, taxId: event.target.value }))}
                helperText="ไม่บังคับ"
                slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 13 } }}
                sx={buildCustomerFieldSx()}
              />
              <TextField
                select
                fullWidth
                label="ประเภทสาขา"
                value={form.branchType}
                onChange={event => setForm(previous => ({ ...previous, branchType: event.target.value, branchNo: event.target.value === 'branch' ? previous.branchNo : '' }))}
                sx={buildCustomerFieldSx()}>
                <MenuItem value="">ไม่ระบุ</MenuItem>
                <MenuItem value="headquarters">สำนักงานใหญ่</MenuItem>
                <MenuItem value="branch">สาขา</MenuItem>
                {branchTypeIsCustom ? <MenuItem value={form.branchType}>{form.branchType}</MenuItem> : null}
              </TextField>
            </Box>
            {form.branchType === 'branch' ? (
              <TextField
                fullWidth
                label="เลขที่สาขา"
                value={form.branchNo}
                onChange={event => setForm(previous => ({ ...previous, branchNo: event.target.value }))}
                slotProps={{ htmlInput: { maxLength: 20 } }}
                sx={buildCustomerFieldSx()}
              />
            ) : null}
          </Stack>

          <Stack spacing={1.45}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#2C4258', letterSpacing: '0.02em' }}>ที่อยู่</Typography>
            <TextField
              fullWidth
              label="ที่อยู่"
              multiline
              minRows={2}
              value={form.address}
              onChange={event => setForm(previous => ({ ...previous, address: event.target.value }))}
              slotProps={{ htmlInput: { maxLength: 500 } }}
              sx={buildCustomerFieldSx(true)}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.4 }}>
              <TextField label="แขวง / ตำบล" value={form.subDistrict} onChange={event => setForm(previous => ({ ...previous, subDistrict: event.target.value }))} slotProps={{ htmlInput: { maxLength: 120 } }} sx={buildCustomerFieldSx()} />
              <TextField label="เขต / อำเภอ" value={form.district} onChange={event => setForm(previous => ({ ...previous, district: event.target.value }))} slotProps={{ htmlInput: { maxLength: 120 } }} sx={buildCustomerFieldSx()} />
              <TextField label="จังหวัด" value={form.province} onChange={event => setForm(previous => ({ ...previous, province: event.target.value }))} slotProps={{ htmlInput: { maxLength: 120 } }} sx={buildCustomerFieldSx()} />
              <TextField label="รหัสไปรษณีย์" value={form.postalCode} onChange={event => setForm(previous => ({ ...previous, postalCode: event.target.value }))} slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 10 } }} sx={buildCustomerFieldSx()} />
            </Box>
          </Stack>

          <Stack spacing={1.1}>
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#2C4258', letterSpacing: '0.02em' }}>ที่อยู่จัดส่ง</Typography>
            <FormControlLabel
              control={<Checkbox checked={sameShippingAddress} onChange={event => setSameShippingAddress(event.target.checked)} />}
              label={<Typography fontSize={13}>ใช้ที่อยู่เดียวกับข้อมูลด้านบน</Typography>}
            />
            {!sameShippingAddress ? (
              <TextField
                fullWidth
                label="ที่อยู่จัดส่ง"
                multiline
                minRows={2}
                value={form.shippingAddress}
                onChange={event => setForm(previous => ({ ...previous, shippingAddress: event.target.value }))}
                slotProps={{ htmlInput: { maxLength: 500 } }}
                sx={buildCustomerFieldSx(true)}
              />
            ) : null}
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2.25, sm: 3 }, py: { xs: 1.75, sm: 2.2 }, borderTop: '1px solid #E9EFF7', justifyContent: 'space-between', gap: 1.25 }}>
        <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontSize: 12.5, color: '#6A7D92' }}>กรอกเฉพาะข้อมูลที่ต้องการบันทึกได้</Typography>
        <Stack direction="row" spacing={1.1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button onClick={resetAndClose} variant="outlined" disabled={saving} sx={{ flex: { xs: 1, sm: 'initial' }, minWidth: { sm: 96 }, minHeight: 44, borderRadius: 999, borderColor: '#D7E3F4', color: '#355070', fontWeight: 700, textTransform: 'none' }}>
            ยกเลิก
          </Button>
          <Button variant="contained" disabled={saving || !form.displayName.trim()} onClick={() => void submitCustomer()} sx={{ flex: { xs: 1, sm: 'initial' }, minWidth: { sm: 138 }, minHeight: 44, borderRadius: 999, bgcolor: '#2B62EE', boxShadow: '0 12px 28px rgba(43, 98, 238, 0.24)', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#2156D8' } }}>
            {saving ? 'กำลังบันทึก...' : editing ? 'บันทึกการแก้ไข' : 'บันทึกลูกค้า'}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
