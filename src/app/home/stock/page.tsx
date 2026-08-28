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
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AdminPageContainer from '../components/AdminPageContainer';
import AdminHeroHeader, { formatAdminLastSynced, formatAdminThaiDate } from '../components/AdminHeroHeader';
import { fetchCurrentAdminRole, type AdminRole } from '@/lib/admin-capabilities';
import { fetchApiJson } from '@/lib/api';
import {
  fetchStockOverview,
  isLowStock,
  listStockItems,
  listStockMovements,
  stockMutationKey,
  type StockItem,
  type StockMovement,
  type StockMovementType,
  type StockOverview,
} from '@/lib/inventory';

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
  const [focusedItemId, setFocusedItemId] = React.useState<string | null>(null);
  const [overview, setOverview] = React.useState<StockOverview | null>(null);
  const [movements, setMovements] = React.useState<StockMovement[]>([]);
  const [movementPage, setMovementPage] = React.useState(1);
  const [movementPages, setMovementPages] = React.useState(1);
  const [movementTotal, setMovementTotal] = React.useState(0);
  const [movementSearch, setMovementSearch] = React.useState('');
  const [movementFilter, setMovementFilter] = React.useState<StockMovementType | ''>('');
  const [movementItemFilter, setMovementItemFilter] = React.useState('');
  const [movementFrom, setMovementFrom] = React.useState('');
  const [movementTo, setMovementTo] = React.useState('');

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

  const loadHistory = React.useCallback(async () => {
    try {
      const [stockOverview, history] = await Promise.all([
        fetchStockOverview(),
        listStockMovements({
          page: movementPage,
          limit: 25,
          itemId: movementItemFilter || undefined,
          type: movementFilter,
          from: movementFrom ? `${movementFrom}T00:00:00.000+07:00` : undefined,
          to: movementTo ? `${movementTo}T23:59:59.999+07:00` : undefined,
          q: movementSearch,
        }),
      ]);
      setOverview(stockOverview);
      setMovements(history.items);
      setMovementPages(history.totalPages);
      setMovementTotal(history.total);
    } catch (historyError) {
      setError(historyError instanceof Error ? historyError.message : 'โหลดประวัติสต็อกไม่สำเร็จ');
    }
  }, [movementFilter, movementFrom, movementItemFilter, movementPage, movementSearch, movementTo]);

  React.useEffect(() => {
    const handle = window.setTimeout(() => void loadHistory(), 250);
    return () => window.clearTimeout(handle);
  }, [loadHistory]);

  React.useEffect(() => {
    const focus = new URLSearchParams(window.location.search).get('focus');
    setFocusedItemId(focus);
  }, []);

  React.useEffect(() => {
    if (!focusedItemId || loading) return;
    document.getElementById(`stock-item-${focusedItemId}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [focusedItemId, loading, items]);

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
      await Promise.all([load(), loadHistory()]);
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
      await Promise.all([load(), loadHistory()]);
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
      await Promise.all([load(), loadHistory()]);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'อัปเดตรายการไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const lowCount = overview?.lowStockCount ?? items.filter(isLowStock).length;

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
          <Summary label="วัสดุที่ใช้งาน" value={overview?.totalActiveItems ?? items.filter(item => item.active).length} />
          <Summary label="ใกล้หมด/ต่ำกว่าขั้นต่ำ" value={lowCount} />
          <Summary label="ประวัติการเคลื่อนไหว" value={movementTotal} />
        </Box>

        <TextField
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="ค้นหารหัส ชื่อ หรือหน่วย"
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> } }}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2,minmax(0,1fr))', xl: 'repeat(3,minmax(0,1fr))' }, gap: 2 }}>
          {items.map(item => (
            <Card
              key={item._id}
              id={`stock-item-${item._id}`}
              variant="outlined"
              sx={{
                borderRadius: 3,
                opacity: item.active ? 1 : 0.65,
                borderColor: focusedItemId === item._id ? 'warning.main' : undefined,
                boxShadow: focusedItemId === item._id ? '0 0 0 3px rgba(237, 108, 2, 0.12)' : undefined,
              }}
            >
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

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={900}>วัสดุที่เคลื่อนไหวล่าสุด</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>ดูว่าวัสดุใดมีการรับเข้า เบิกใช้ หรือปรับยอดล่าสุด</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2,minmax(0,1fr))' }, gap: 1.5 }}>
              {(overview?.recentlyMovedItems ?? []).map(entry => (
                <Box key={entry.item._id} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography fontWeight={800}>{entry.item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{entry.item.code} · {entry.item.onHand} {entry.item.unit}</Typography>
                  <Typography variant="caption" color="text.secondary">{entry.lastMovementType ? movementTypeLabel(entry.lastMovementType) : '-'} · {formatMovementDate(entry.lastMovementAt)}</Typography>
                </Box>
              ))}
              {overview && overview.recentlyMovedItems.length === 0 && <Typography color="text.secondary">ยังไม่มีประวัติการเคลื่อนไหว</Typography>}
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={900}>ประวัติการเคลื่อนไหวสต็อก</Typography>
                <Typography variant="body2" color="text.secondary">ค้นหาและกรองประวัติจากข้อมูลทั้งหมดก่อนแบ่งหน้า พร้อมผู้ทำรายการ เหตุผล และเลขอ้างอิง</Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr 1fr' }, gap: 1 }}>
                <TextField size="small" label="ค้นหา" value={movementSearch} onChange={event => { setMovementSearch(event.target.value); setMovementPage(1); }} />
                <TextField size="small" select label="วัสดุ" value={movementItemFilter} onChange={event => { setMovementItemFilter(event.target.value); setMovementPage(1); }}>
                  <MenuItem value="">ทั้งหมด</MenuItem>
                  {items.map(item => <MenuItem key={item._id} value={item._id}>{item.code} · {item.name}</MenuItem>)}
                </TextField>
                <TextField size="small" select label="ประเภท" value={movementFilter} onChange={event => { setMovementFilter(event.target.value as StockMovementType | ''); setMovementPage(1); }}>
                  <MenuItem value="">ทั้งหมด</MenuItem>
                  <MenuItem value="receive">รับเข้า</MenuItem>
                  <MenuItem value="issue">เบิกใช้</MenuItem>
                  <MenuItem value="adjustment_in">ปรับเพิ่ม</MenuItem>
                  <MenuItem value="adjustment_out">ปรับลด</MenuItem>
                  <MenuItem value="waste">ของเสีย</MenuItem>
                </TextField>
                <TextField size="small" label="ตั้งแต่วันที่" type="date" value={movementFrom} onChange={event => { setMovementFrom(event.target.value); setMovementPage(1); }} slotProps={{ inputLabel: { shrink: true } }} />
                <TextField size="small" label="ถึงวันที่" type="date" value={movementTo} onChange={event => { setMovementTo(event.target.value); setMovementPage(1); }} slotProps={{ inputLabel: { shrink: true } }} />
              </Box>
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 900 }}>
                  <TableHead><TableRow><TableCell>เวลา</TableCell><TableCell>วัสดุ</TableCell><TableCell>ประเภท</TableCell><TableCell align="right">จำนวน</TableCell><TableCell align="right">คงเหลือ</TableCell><TableCell>ผู้ทำรายการ</TableCell><TableCell>เหตุผล / อ้างอิง</TableCell></TableRow></TableHead>
                  <TableBody>
                    {movements.map(movement => (
                      <TableRow key={movement._id} hover>
                        <TableCell>{formatMovementDate(movement.occurredAt)}</TableCell>
                        <TableCell><Typography variant="body2" fontWeight={700}>{movement.stockItem?.name ?? 'วัสดุที่ถูกลบ/ไม่พบ'}</Typography><Typography variant="caption" color="text.secondary">{movement.stockItem?.code ?? movement.stockItemId}</Typography></TableCell>
                        <TableCell>{movementTypeLabel(movement.type)}</TableCell>
                        <TableCell align="right"><Typography color={movement.delta >= 0 ? 'success.main' : 'error.main'} fontWeight={700}>{movement.delta >= 0 ? '+' : ''}{movement.delta} {movement.stockItem?.unit ?? ''}</Typography></TableCell>
                        <TableCell align="right">{movement.balanceAfter} {movement.stockItem?.unit ?? ''}</TableCell>
                        <TableCell>{movement.actorUsername}</TableCell>
                        <TableCell><Typography variant="body2">{movement.reason}</Typography>{movement.referenceType && movement.referenceId ? <Typography variant="caption" color="text.secondary">{movement.referenceType}: {movement.referenceId}</Typography> : null}</TableCell>
                      </TableRow>
                    ))}
                    {movements.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>ไม่พบประวัติที่ตรงกับตัวกรอง</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={1}>
                <Typography variant="body2" color="text.secondary">ทั้งหมด {movementTotal.toLocaleString('th-TH')} รายการ</Typography>
                <Pagination page={movementPage} count={movementPages} onChange={(_, page) => setMovementPage(page)} color="primary" />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
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

function movementTypeLabel(type: StockMovementType): string {
  return ({
    receive: 'รับเข้า',
    issue: 'เบิกใช้',
    adjustment_in: 'ปรับเพิ่ม',
    adjustment_out: 'ปรับลด',
    waste: 'ของเสีย',
  } as const)[type];
}

function formatMovementDate(value: string | null | undefined): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Bangkok',
  }).format(new Date(value));
}

function Summary({ label, value }: Readonly<{ label: string; value: number }>) {
  return <Card variant="outlined" sx={{ borderRadius: 3 }}><CardContent><Typography color="text.secondary" variant="body2">{label}</Typography><Typography variant="h4" fontWeight={900}>{value}</Typography></CardContent></Card>;
}
