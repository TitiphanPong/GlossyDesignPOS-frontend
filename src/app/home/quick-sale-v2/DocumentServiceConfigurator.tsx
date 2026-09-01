'use client';

import * as React from 'react';
import { Alert, Box, Button, ButtonGroup, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import type { Product } from '@/lib/contracts';
import {
  resolveDocumentMapping,
  type DocumentColorMode,
  type DocumentSize,
  type DocumentWorkType,
  type QuickSaleV2DocumentDefaults,
  type QuickSaleV2DocumentMapping,
} from '@/lib/quickSaleV2';

const WORK_TYPES: Array<{ value: DocumentWorkType; label: string }> = [
  { value: 'print', label: 'Print' },
  { value: 'copy', label: 'Copy' },
  { value: 'scan', label: 'Scan' },
];
const SIZES: DocumentSize[] = ['A4', 'A3'];
const COLORS: Array<{ value: DocumentColorMode; label: string }> = [
  { value: 'bw', label: 'ขาวดำ' },
  { value: 'color', label: 'สี' },
];
const PRESETS = [1, 5, 10, 20, 50];
const money = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function activeVariant(product: Product) {
  return product.variants.find(variant => variant.active);
}

export default function DocumentServiceConfigurator({
  products,
  mappings,
  defaults,
  onAdd,
  previewOnly = false,
}: {
  products: Product[];
  mappings: QuickSaleV2DocumentMapping[];
  defaults: QuickSaleV2DocumentDefaults;
  onAdd: (product: Product, quantity: number) => void;
  previewOnly?: boolean;
}) {
  const [workType, setWorkType] = React.useState<DocumentWorkType>(defaults.workType);
  const [size, setSize] = React.useState<DocumentSize>(defaults.size);
  const [colorMode, setColorMode] = React.useState<DocumentColorMode>(defaults.colorMode);
  const [quantity, setQuantity] = React.useState(defaults.quantity);

  React.useEffect(() => {
    setWorkType(defaults.workType);
    setSize(defaults.size);
    setColorMode(defaults.colorMode);
    setQuantity(defaults.quantity);
  }, [defaults.colorMode, defaults.quantity, defaults.size, defaults.workType]);

  const mapping = React.useMemo(
    () => resolveDocumentMapping(mappings, { workType, size, colorMode }),
    [colorMode, mappings, size, workType],
  );
  const product = React.useMemo(
    () =>
      mapping
        ? products.find(item => (item.quickProductId || item.id) === mapping.quickProductId && item.active && activeVariant(item)) ?? null
        : null,
    [mapping, products],
  );
  const variant = product ? activeVariant(product) : null;
  const total = variant ? variant.price * quantity : 0;

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 1.5, sm: 2 }, borderColor: '#DCE4EF' }}>
      <Stack spacing={2}>
        <Box>
          <Typography fontSize={18} fontWeight={900} color="#0F172A">
            งานเอกสาร
          </Typography>
          <Typography variant="body2" color="text.secondary">
            เลือกรายละเอียดให้ครบก่อนเพิ่มลงรายการ ระบบจะใช้ SKU/ราคาจาก Quick Product ที่ผูกไว้เท่านั้น
          </Typography>
        </Box>

        <Box>
          <Typography fontWeight={800} sx={{ mb: 0.75 }}>ประเภทงาน</Typography>
          <Stack direction="row" gap={0.75} flexWrap="wrap">
            {WORK_TYPES.map(option => (
              <Chip key={option.value} label={option.label} clickable color={workType === option.value ? 'primary' : 'default'} variant={workType === option.value ? 'filled' : 'outlined'} onClick={() => setWorkType(option.value)} />
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography fontWeight={800} sx={{ mb: 0.75 }}>ขนาด</Typography>
          <Stack direction="row" gap={0.75}>
            {SIZES.map(value => (
              <Chip key={value} label={value} clickable color={size === value ? 'primary' : 'default'} variant={size === value ? 'filled' : 'outlined'} onClick={() => setSize(value)} />
            ))}
          </Stack>
        </Box>

        <Box>
          <Typography fontWeight={800} sx={{ mb: 0.75 }}>โหมดสี</Typography>
          <Stack direction="row" gap={0.75}>
            {COLORS.map(option => (
              <Chip key={option.value} label={option.label} clickable color={colorMode === option.value ? 'primary' : 'default'} variant={colorMode === option.value ? 'filled' : 'outlined'} onClick={() => setColorMode(option.value)} />
            ))}
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography fontWeight={800} sx={{ mb: 0.75 }}>จำนวน</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ sm: 'center' }}>
            <ButtonGroup variant="outlined" aria-label="จำนวน">
              <Button aria-label="ลดจำนวน" onClick={() => setQuantity(value => Math.max(1, value - 1))}><RemoveRoundedIcon /></Button>
              <Button disabled sx={{ minWidth: 70, '&.Mui-disabled': { color: '#0F172A' } }}>{quantity}</Button>
              <Button aria-label="เพิ่มจำนวน" onClick={() => setQuantity(value => Math.min(999, value + 1))}><AddRoundedIcon /></Button>
            </ButtonGroup>
            <Stack direction="row" gap={0.5} flexWrap="wrap">
              {PRESETS.map(value => <Chip key={value} size="small" label={value} clickable onClick={() => setQuantity(value)} />)}
            </Stack>
          </Stack>
        </Box>

        {!mapping ? (
          <Alert severity="warning">ตัวเลือกนี้ยังไม่ได้ผูก SKU ใน Settings V2 จึงยังเพิ่มลงรายการไม่ได้</Alert>
        ) : !product || !variant ? (
          <Alert severity="error">SKU ที่ผูกไว้ไม่พร้อมขายหรือหาไม่พบ กรุณาตรวจ Settings V2</Alert>
        ) : (
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#F8FAFC' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={900}>{product.name}</Typography>
                <Typography variant="body2" color="text.secondary">{workType.toUpperCase()} · {size} · {colorMode === 'bw' ? 'ขาวดำ' : 'สี'} · {quantity} {product.unitLabel || 'ชิ้น'}</Typography>
              </Box>
              <Box sx={{ textAlign: { sm: 'right' }, flexShrink: 0 }}>
                <Typography variant="body2" color="text.secondary">฿{money.format(variant.price)} / {product.unitLabel || 'ชิ้น'}</Typography>
                <Typography fontSize={20} fontWeight={900} color="primary.main">฿{money.format(total)}</Typography>
              </Box>
            </Stack>
          </Paper>
        )}

        <Button
          variant="contained"
          size="large"
          disabled={!product || !variant || previewOnly}
          onClick={() => product && !previewOnly && onAdd(product, quantity)}
          sx={{ minHeight: 48, borderRadius: 2.5, fontWeight: 900 }}
        >
          {previewOnly ? 'Preview เท่านั้น' : 'เพิ่มลงรายการ'}
        </Button>
      </Stack>
    </Paper>
  );
}
