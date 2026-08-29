'use client';

import * as React from 'react';
import Link from 'next/link';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { Alert, Box, Button, Card, CardActionArea, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Drawer, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import AdminPageContainer from '../components/AdminPageContainer';
import AdminHeroHeader, { formatAdminLastSynced, formatAdminThaiDate, heroPrimaryButtonSx } from '../components/AdminHeroHeader';
import { createCustomer, fetchCustomerDetail, fetchCustomers, type CustomerDetail, type CustomerProfile } from '@/lib/customers';
import { buildCustomerFieldSx, customerDialogPaperSx } from '@/components/customers/customerFormUi';

const money = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 2 });

type CustomerForm = { displayName: string; phoneNumber: string; email: string; taxId: string; address: string };
const EMPTY_FORM: CustomerForm = { displayName: '', phoneNumber: '', email: '', taxId: '', address: '' };

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<CustomerProfile[]>([]);
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<Date | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState<CustomerForm>(EMPTY_FORM);

  const loadCustomers = React.useCallback(async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      setCustomers(await fetchCustomers(search, 50));
      setLastSyncedAt(new Date());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'โหลดข้อมูลลูกค้าไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = globalThis.setTimeout(() => void loadCustomers(query), 250);
    return () => globalThis.clearTimeout(timer);
  }, [loadCustomers, query]);

  const openCustomer = async (customer: CustomerProfile) => {
    setDetailLoading(true);
    setError(null);
    try {
      setSelected(await fetchCustomerDetail(customer._id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'โหลดรายละเอียดลูกค้าไม่สำเร็จ');
    } finally {
      setDetailLoading(false);
    }
  };

  const submitCustomer = async () => {
    if (!form.displayName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createCustomer({
        displayName: form.displayName.trim(),
        phoneNumber: form.phoneNumber.trim() || undefined,
        email: form.email.trim() || undefined,
        taxId: form.taxId.trim() || undefined,
        address: form.address.trim() || undefined,
      });
      setCreateOpen(false);
      setForm(EMPTY_FORM);
      await loadCustomers(query);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'บันทึกลูกค้าไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageContainer>
      <AdminHeroHeader
        title="ลูกค้า"
        description="ค้นหาลูกค้าประจำ ใช้ข้อมูลเดิมตอนขาย และดูประวัติงานโดยไม่เปลี่ยนข้อมูลในบิลเก่า"
        lastSynced={formatAdminLastSynced(lastSyncedAt)}
        thaiDate={formatAdminThaiDate(lastSyncedAt)}
        actions={
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreateOpen(true)} sx={heroPrimaryButtonSx}>
            เพิ่มลูกค้า
          </Button>
        }
      />

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <TextField
        fullWidth
        value={query}
        onChange={event => setQuery(event.target.value)}
        placeholder="ค้นหาชื่อ รหัสลูกค้า เบอร์โทร อีเมล หรือเลขผู้เสียภาษี"
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> } }}
        sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: '#fff' } }}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5 }}>
        {customers.map(customer => (
          <Card key={customer._id} variant="outlined" sx={{ borderRadius: 3, minWidth: 0 }}>
            <CardActionArea onClick={() => void openCustomer(customer)} sx={{ height: '100%', textAlign: 'left' }}>
              <CardContent>
                <Typography fontWeight={850} fontSize={17} noWrap>{customer.displayName}</Typography>
                <Typography color="text.secondary" fontSize={12.5}>{customer.customerCode}</Typography>
                <Stack spacing={0.45} sx={{ mt: 1.5 }}>
                  <Typography fontSize={13.5}>{customer.phoneNumber || 'ไม่มีเบอร์โทร'}</Typography>
                  {customer.email ? <Typography fontSize={13.5} noWrap>{customer.email}</Typography> : null}
                  {customer.taxId ? <Typography fontSize={12.5} color="text.secondary">Tax ID {customer.taxId}</Typography> : null}
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
      {!loading && customers.length === 0 ? <Typography sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>ยังไม่พบลูกค้าที่ตรงกับการค้นหา</Typography> : null}
      {loading ? <Typography sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>กำลังโหลด...</Typography> : null}

      <Drawer anchor="right" open={Boolean(selected) || detailLoading} onClose={() => setSelected(null)} PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, p: { xs: 2, sm: 3 } } }}>
        {detailLoading && !selected ? <Typography>กำลังโหลดรายละเอียด...</Typography> : null}
        {selected ? (
          <Stack spacing={2.25}>
            <Box>
              <Typography variant="h5" fontWeight={900}>{selected.customer.displayName}</Typography>
              <Typography color="text.secondary">{selected.customer.customerCode}</Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
              <Card variant="outlined" sx={{ flex: 1, borderRadius: 3 }}><CardContent><Typography color="text.secondary" fontSize={12}>ออเดอร์</Typography><Typography variant="h5" fontWeight={850}>{selected.summary.orderCount}</Typography></CardContent></Card>
              <Card variant="outlined" sx={{ flex: 1, borderRadius: 3 }}><CardContent><Typography color="text.secondary" fontSize={12}>ยอดค้างรวม</Typography><Typography variant="h5" fontWeight={850}>{money.format(selected.summary.outstandingTotal)}</Typography></CardContent></Card>
            </Stack>
            <Divider />
            <Box>
              <Typography fontWeight={800} sx={{ mb: 1 }}>ประวัติการขาย</Typography>
              <Stack spacing={1}>
                {selected.orders.slice(0, 10).map(order => (
                  <Button key={order._id} component={Link} href={`/home/orders?search=${encodeURIComponent(order.orderNumber || order.orderId || '')}`} variant="outlined" sx={{ justifyContent: 'space-between', borderRadius: 2.5 }}>
                    <span>{order.orderNumber || order.orderId || '-'}</span><span>{money.format(Number(order.remainingTotal || 0))} ค้าง</span>
                  </Button>
                ))}
                {selected.orders.length === 0 ? <Typography color="text.secondary" fontSize={13}>ยังไม่มีประวัติการขายที่เชื่อมกับโปรไฟล์นี้</Typography> : null}
              </Stack>
            </Box>
            <Box>
              <Typography fontWeight={800} sx={{ mb: 1 }}>งานผลิตที่ยัง Active</Typography>
              <Stack spacing={0.75}>{selected.activeProductionJobs.map(job => <Typography key={job._id} fontSize={13.5}>{job.jobNumber} · {job.workSummary} · {job.stage}</Typography>)}</Stack>
              {selected.activeProductionJobs.length === 0 ? <Typography color="text.secondary" fontSize={13}>ไม่มีงานผลิตที่กำลังดำเนินการ</Typography> : null}
            </Box>
            <Box>
              <Typography fontWeight={800} sx={{ mb: 1 }}>ไฟล์ลูกค้าที่เชื่อมแล้ว</Typography>
              <Stack spacing={0.75}>{selected.linkedUploads.map(upload => <Button key={upload._id} component={Link} href={`/home/storage?order=${encodeURIComponent(upload.linkedOrderNumber || '')}`} variant="text" sx={{ justifyContent: 'flex-start' }}>{upload.orderCode} · {upload.jobType}</Button>)}</Stack>
              {selected.linkedUploads.length === 0 ? <Typography color="text.secondary" fontSize={13}>ยังไม่มีไฟล์ที่เชื่อมกับออเดอร์ของลูกค้ารายนี้</Typography> : null}
            </Box>
          </Stack>
        ) : null}
      </Drawer>

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
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
                  value={form.phoneNumber}
                  onChange={event => setForm(previous => ({ ...previous, phoneNumber: event.target.value }))}
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
              onClick={() => setCreateOpen(false)}
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
    </AdminPageContainer>
  );
}
