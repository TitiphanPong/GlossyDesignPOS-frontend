'use client';

import * as React from 'react';
import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControlLabel, IconButton, MenuItem, Stack, Switch, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import type { Product } from '@/lib/contracts';
import type { QuickProductPayload } from '@/lib/products';
import QuickSellerProductTile from '../../../quick-sale/components/QuickSellerProductTile';
import QuickSellerStatusChip from './QuickSellerStatusChip';
import { commonButtonSx, uiCardSx } from '../../../components/adminUi';

type Props = { open: boolean; initial: QuickProductPayload; editing: Product | null; canonicalProducts: Product[]; busy: boolean; onClose: () => void; onSave: (value: QuickProductPayload) => Promise<void> };

const Section = ({ title, description, children }: Readonly<{ title: string; description: string; children: React.ReactNode }>) => (
  <Card sx={uiCardSx}><CardContent sx={{ p: { xs: 2, md: 2.5 } }}><Typography variant="h6" fontWeight={800}>{title}</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{description}</Typography>{children}</CardContent></Card>
);

export default function QuickSellerEditor({ open, initial, editing, canonicalProducts, busy, onClose, onSave }: Readonly<Props>) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [form, setForm] = React.useState(initial);
  const [confirmClose, setConfirmClose] = React.useState(false);
  React.useEffect(() => setForm(initial), [initial, open]);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const close = () => dirty ? setConfirmClose(true) : onClose();
  const mappedProduct = canonicalProducts.find(product => product.id === form.productId);
  const mappedVariants = mappedProduct?.variants.filter(variant => variant.active) ?? [];
  const valid = form.name.trim() && form.code.trim() && form.category.trim() && form.price >= 0 && (!form.productId || Boolean(form.variantId));
  const preview: Product = { id: 'preview', name: form.name, code: form.code, typeCode: form.typeCode || form.code, category: form.category, active: form.active !== false, emoji: form.emoji, tint: form.tint, isHotMenu: form.isHotMenu, quickSaleEnabled: true, quickSaleSortOrder: form.quickSaleSortOrder, unitLabel: form.unitLabel, variants: [{ name: 'ราคาปกติ', price: form.price, active: true }] };
  const field = <K extends keyof QuickProductPayload>(key: K, value: QuickProductPayload[K]) => setForm(current => ({ ...current, [key]: value }));
  const mapProduct = (productId: string) => {
    const product = canonicalProducts.find(candidate => candidate.id === productId);
    const onlyVariant = product?.variants.filter(variant => variant.active).length === 1 ? product.variants.find(variant => variant.active) : undefined;
    setForm(current => ({
      ...current,
      productId: productId || undefined,
      variantId: onlyVariant?.id || onlyVariant?._id || undefined,
      ...(product ? { name: product.name, category: product.category } : {}),
      ...(onlyVariant ? { price: onlyVariant.price } : {}),
    }));
  };
  const mapVariant = (variantId: string) => {
    const variant = mappedVariants.find(candidate => (candidate.id || candidate._id) === variantId);
    setForm(current => ({ ...current, variantId: variantId || undefined, ...(variant ? { price: variant.price } : {}) }));
  };

  return <>
    <Dialog open={open} onClose={(_, reason) => reason !== 'backdropClick' && close()} fullScreen={fullScreen} fullWidth maxWidth="lg" PaperProps={{ sx: { borderRadius: { xs: 0, md: 4 }, bgcolor: '#F7F9FC' } }}>
      <DialogTitle sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', px: { xs: 2, md: 3 } }}>
        <Stack direction="row" alignItems="center" gap={1.5}><IconButton onClick={close} aria-label="ย้อนกลับ"><ArrowBackRoundedIcon /></IconButton><Box flex={1}><Typography variant="h6" fontWeight={900}>{editing ? 'แก้ไขรายการขายด่วน' : 'เพิ่มรายการขายด่วน'}</Typography><Typography variant="caption" color="text.secondary">จัดข้อมูลเป็นหมวดหมู่และตรวจสอบตัวอย่างก่อนบันทึก</Typography></Box><QuickSellerStatusChip active={form.active !== false} /></Stack>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.7fr) minmax(280px, .8fr)' }, gap: 2.5 }}>
          <Stack spacing={2.5} minWidth={0}>
            <Section title="ข้อมูลทั่วไป" description="ชื่อ หมวดหมู่ และภาพจำของรายการบนหน้าขาย">
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}><TextField label="ชื่อรายการ" required value={form.name} onChange={e => field('name', e.target.value)} /><TextField label="รหัสรายการ" required value={form.code} onChange={e => field('code', e.target.value)} /><TextField label="หมวดหมู่" required value={form.category} onChange={e => field('category', e.target.value)} /><TextField label="ไอคอน Emoji" inputProps={{ maxLength: 8 }} value={form.emoji || ''} onChange={e => field('emoji', e.target.value)} helperText="เช่น 🖨️ หรือ 📄" /></Box>
            </Section>
            <Section title="เชื่อมกับแคตตาล็อกหลัก" description="เลือก Product/Variant เมื่อต้องการให้ Quick Seller ใช้ราคาและตัวตนจากแคตตาล็อกหลัก โดยรายการเดิมที่ไม่เชื่อมยังทำงานแบบเดิม">
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField select label="Product หลัก" value={form.productId || ''} onChange={e => mapProduct(e.target.value)} helperText={editing?.productId ? 'รายการที่เชื่อมแล้วสามารถเปลี่ยน Product ได้ แต่ยังไม่เปิดการยกเลิก mapping ใน migration นี้' : 'ไม่เลือก = Quick menu แบบ legacy/custom'}>
                  <MenuItem value="" disabled={Boolean(editing?.productId)}>ไม่เชื่อมแคตตาล็อก</MenuItem>
                  {canonicalProducts.map(product => <MenuItem key={product.id} value={product.id}>{product.name} ({product.code})</MenuItem>)}
                </TextField>
                <TextField select label="Variant หลัก" value={form.variantId || ''} onChange={e => mapVariant(e.target.value)} disabled={!mappedProduct} helperText={mappedProduct && mappedVariants.length > 1 ? 'ต้องเลือก variant ที่ชัดเจน' : 'ใช้ variant ที่ Quick Seller จะขาย'}>
                  <MenuItem value="">เลือก Variant</MenuItem>
                  {mappedVariants.map(variant => {
                    const variantId = variant.id || variant._id || '';
                    return <MenuItem key={variantId || variant.name} value={variantId}>{variant.name} — ฿{variant.price.toLocaleString('th-TH')}</MenuItem>;
                  })}
                </TextField>
              </Box>
            </Section>
            <Section title="ราคาและหน่วย" description="ราคาที่แสดงและใช้เมื่อเพิ่มรายการลงตะกร้า">
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}><TextField label="ราคา" required type="number" value={form.price} inputProps={{ min: 0 }} onChange={e => field('price', Number(e.target.value))} /><TextField label="หน่วย" value={form.unitLabel || ''} onChange={e => field('unitLabel', e.target.value)} placeholder="ชิ้น" /></Box>
            </Section>
            <Section title="การแสดงผล" description="ควบคุมสถานะ ความเด่น และลำดับในหน้าขายด่วน">
              <Stack spacing={1.5}><FormControlLabel control={<Switch checked={form.active !== false} onChange={e => field('active', e.target.checked)} />} label="เปิดใช้งานใน Quick Seller" /><FormControlLabel control={<Switch checked={Boolean(form.isHotMenu)} onChange={e => field('isHotMenu', e.target.checked)} />} label="เมนูแนะนำ" /><Divider /><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}><TextField label="ลำดับการแสดงผล" type="number" value={form.quickSaleSortOrder ?? 0} inputProps={{ min: 0 }} onChange={e => field('quickSaleSortOrder', Number(e.target.value))} helperText="เลขน้อยแสดงก่อน" /><TextField label="สีพื้นไอคอน" type="color" value={form.tint || '#E2E8F0'} onChange={e => field('tint', e.target.value)} /></Box></Stack>
            </Section>
          </Stack>
          <Box sx={{ minWidth: 0 }}><Box sx={{ position: { lg: 'sticky' }, top: 0 }}><Typography fontWeight={800} sx={{ mb: .5 }}>ตัวอย่างบนหน้าขายด่วน</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>ตัวอย่างจะเปลี่ยนตามข้อมูลที่กรอกทันที</Typography><QuickSellerProductTile product={preview} disabled={!preview.active} /></Box></Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ position: { xs: 'sticky', md: 'static' }, bottom: 0, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', p: 2 }}><Button onClick={close} disabled={busy} sx={commonButtonSx}>ยกเลิก</Button><Button variant="contained" startIcon={<SaveRoundedIcon />} disabled={busy || !valid} onClick={() => void onSave(form)} sx={commonButtonSx}>{busy ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</Button></DialogActions>
    </Dialog>
    <Dialog open={confirmClose} onClose={() => setConfirmClose(false)} maxWidth="xs" fullWidth><DialogTitle>ยังไม่ได้บันทึกการเปลี่ยนแปลง</DialogTitle><DialogContent><Typography color="text.secondary">หากออกตอนนี้ ข้อมูลที่แก้ไขจะหายไป</Typography></DialogContent><DialogActions><Button onClick={() => setConfirmClose(false)}>แก้ไขต่อ</Button><Button color="error" onClick={() => { setConfirmClose(false); onClose(); }}>ออกโดยไม่บันทึก</Button></DialogActions></Dialog>
  </>;
}
