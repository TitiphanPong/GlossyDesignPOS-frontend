'use client';

import * as React from 'react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AdminPageContainer from '../components/AdminPageContainer';
import AdminHeroHeader, { formatAdminLastSynced, formatAdminThaiDate } from '../components/AdminHeroHeader';
import { fetchCurrentAdminRole, type AdminRole } from '@/lib/admin-capabilities';
import { fetchApiJson } from '@/lib/api';
import { isLowStock, listStockItems, stockMutationKey, type StockItem, type StockMovementType } from '@/lib/inventory';

export default function StockPage() {
  const [items, setItems] = React.useState<StockItem[]>([]);
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<Date | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [role, setRole] = React.useState<AdminRole | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [movementItem, setMovementItem] = React.useState<StockItem | null>(null);
  const [movementType, setMovementType] = React.useState<StockMovementType>('receive');
  const [quantity, setQuantity] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const privileged = role === 'manager' || role === 'admin';

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rows, currentRole] = await Promise.all([listStockItems(search, true), fetchCurrentAdminRole()]);
      setItems(rows);
      setRole(currentRole);
      setLastSyncedAt(new Date());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'โหลดข้อมูลสต็อกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, [search]);

  React.useEffect(() => {
    const handle = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(handle);
  }, [load]);

  const createItem = async (form: FormData) => {
    setSaving(true);
    setError(null);
    try {
      await fetchApiJson('/inventory/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: String(form.get('code') ?? ''),
          name: String(form.get('name') ?? ''),
          unit: String(form.get('unit') ?? ''),
          minimumLevel: Number(form.get('minimumLevel') ?? 0),
        }),
      });
      setCreateOpen(false);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'สร้างรายการสต็อกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const submitMovement = async () => {
    if (!movementItem) return;
    setSaving(true);
    setError(null);
    try {
      await fetchApiJson(`/inventory/items/${movementItem._id}/movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: movementType, quantity: Number(quantity), reason, idempotencyKey: stockMutationKey() }),
      });
      setMovementItem(null);
      setQuantity('');
      setReason('');
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'บันทึกการเคลื่อนไหวสต็อกไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: StockItem) => {
    if (!privileged) return;
    setSaving(true);
    try {
      await fetchApiJson(`/inventory/items/${item._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !item.active }),
      });
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'อัปเดตรายการไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const lowCount = items.filter(isLowStock).length;

  return (
    <AdminPageContainer>
      <Stack spacing={2.5}>
        <AdminHeroHeader
          title="Stock Management"
          description="จัดการวัสดุคงคลัง รับเข้า เบิกใช้ และปรับยอดโดยมีหลักฐานทุกครั้ง"
          lastSynced={formatAdminLastSynced(lastSyncedAt)}
          thaiDate={formatAdminThaiDate(lastSyncedAt)}
          actions={privileged ? <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreateOpen(true)}>เพิ่มวัสดุ</Button> : undefined}
        />

        {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3,1fr)' }, gap: 2 }}>
          <Summary label="รายการทั้งหมด" value={items.length} />
          <Summary label="ใกล้หมด/ต่ำกว่าขั้นต่ำ" value={lowCount} />
          <Summary label="กำลังใช้งาน" value={items.filter(item => item.active).length} />
        </Box>

        <TextField
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="ค้นหารหัส ชื่อ หรือหน่วย"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> } }}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2,minmax(0,1fr))', xl: 'repeat(3,minmax(0,1fr))' }, gap: 2 }}>
          {items.map(item => (
            <Card key={item._id} variant="outlined" sx={{ borderRadius: 3, opacity: item.active ? 1 : 0.65 }}>
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" gap={1}>
                    <Box>
                      <Typography fontWeight={900}>{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.code}</Typography>
                    </Box>
                    <Chip label={item.active ? 'ใช้งาน' : 'ปิดใช้งาน'} color={item.active ? 'success' : 'default'} size="small" />
                  </Stack>
                  <Stack direction="row" alignItems="end" spacing={1}>
                    <Inventory2RoundedIcon color={isLowStock(item) ? 'warning' : 'primary'} />
                    <Typography variant="h4" fontWeight={900}>{item.onHand}</Typography>
                    <Typography color="text.secondary" sx={{ pb: 0.5 }}>{item.unit}</Typography>
                  </Stack>
                  <Typography variant="body2" color={isLowStock(item) ? 'warning.main' : 'text.secondary'}>ขั้นต่ำ {item.minimumLevel} {item.unit}</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button fullWidth variant="outlined" startIcon={<AddRoundedIcon />} disabled={!item.active} onClick={() => { setMovementItem(item); setMovementType('receive'); }}>รับเข้า</Button>
                    <Button fullWidth variant="outlined" startIcon={<RemoveRoundedIcon />} disabled={!item.active} onClick={() => { setMovementItem(item); setMovementType('issue'); }}>เบิกใช้</Button>
                    {privileged && <Button fullWidth variant="text" startIcon={<TuneRoundedIcon />} onClick={() => void toggleActive(item)} disabled={saving}>{item.active ? 'ปิดใช้' : 'เปิดใช้'}</Button>}
                  </Stack>
                  {privileged && item.active && (
                    <Button size="small" onClick={() => { setMovementItem(item); setMovementType('adjustment_in'); }}>ปรับยอดด้วยสิทธิ์ผู้จัดการ</Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
        {!loading && items.length === 0 && <Typography color="text.secondary" textAlign="center" sx={{ py: 6 }}>ไม่พบรายการสต็อก</Typography>}
      </Stack>

      <Dialog open={createOpen} onClose={() => !saving && setCreateOpen(false)} fullWidth maxWidth="sm">
        <Box component="form" action={form => void createItem(form)}>
          <DialogTitle>เพิ่มวัสดุสต็อก</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField name="code" label="รหัสวัสดุ" required />
              <TextField name="name" label="ชื่อวัสดุ" required />
              <TextField name="unit" label="หน่วย เช่น แผ่น / ม้วน / ขวด" required />
              <TextField name="minimumLevel" label="ระดับขั้นต่ำ" type="number" defaultValue="0" slotProps={{ htmlInput: { min: 0, step: 'any' } }} />
            </Stack>
          </DialogContent>
          <DialogActions><Button onClick={() => setCreateOpen(false)}>ยกเลิก</Button><Button type="submit" variant="contained" disabled={saving}>บันทึก</Button></DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(movementItem)} onClose={() => !saving && setMovementItem(null)} fullWidth maxWidth="sm">
        <DialogTitle>{movementItem?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="ประเภท" value={movementType} onChange={event => setMovementType(event.target.value as StockMovementType)}>
              <MenuItem value="receive">รับเข้า</MenuItem>
              <MenuItem value="issue">เบิกใช้</MenuItem>
              {privileged && <MenuItem value="adjustment_in">ปรับเพิ่ม</MenuItem>}
              {privileged && <MenuItem value="adjustment_out">ปรับลด</MenuItem>}
            </TextField>
            <TextField label="จำนวน" type="number" value={quantity} onChange={event => setQuantity(event.target.value)} slotProps={{ htmlInput: { min: 0.000001, step: 'any' } }} />
            <TextField label="เหตุผล" multiline minRows={3} value={reason} onChange={event => setReason(event.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions><Button onClick={() => setMovementItem(null)}>ยกเลิก</Button><Button variant="contained" onClick={() => void submitMovement()} disabled={saving || !(Number(quantity) > 0) || !reason.trim()}>บันทึก</Button></DialogActions>
      </Dialog>
    </AdminPageContainer>
  );
}

function Summary({ label, value }: Readonly<{ label: string; value: number }>) {
  return <Card variant="outlined" sx={{ borderRadius: 3 }}><CardContent><Typography color="text.secondary" variant="body2">{label}</Typography><Typography variant="h4" fontWeight={900}>{value}</Typography></CardContent></Card>;
}
