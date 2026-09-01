'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import PublishRoundedIcon from '@mui/icons-material/PublishRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import AdminPageContainer from '@/app/home/components/AdminPageContainer';
import AdminHeroHeader, { formatAdminLastSynced, formatAdminThaiDate } from '@/app/home/components/AdminHeroHeader';
import { fetchQuickProductsForAdmin } from '@/lib/products';
import type { Product } from '@/lib/contracts';
import {
  documentMappingKey,
  fetchQuickSaleV2Draft,
  publishQuickSaleV2Draft,
  updateQuickSaleV2Draft,
  type DocumentColorMode,
  type DocumentSize,
  type DocumentWorkType,
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

const combinations = WORK_TYPES.flatMap(workType =>
  SIZES.flatMap(size =>
    COLORS.map(colorMode => ({ workType: workType.value, workTypeLabel: workType.label, size, colorMode: colorMode.value, colorLabel: colorMode.label })),
  ),
);

function productLabel(product: Product): string {
  const price = product.variants.find(variant => variant.active)?.price;
  return `${product.name}${price != null ? ` · ฿${price.toFixed(2)}` : ''}`;
}

export default function QuickSaleV2SettingsPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [mappings, setMappings] = React.useState<QuickSaleV2DocumentMapping[]>([]);
  const [version, setVersion] = React.useState(0);
  const [updatedAt, setUpdatedAt] = React.useState<Date | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    void Promise.all([fetchQuickProductsForAdmin(), fetchQuickSaleV2Draft()])
      .then(([nextProducts, config]) => {
        if (!active) return;
        setProducts(nextProducts.filter(product => Boolean(product.quickProductId) && product.active));
        setMappings(config.mappings);
        setVersion(config.version);
        setUpdatedAt(config.updatedAt ? new Date(config.updatedAt) : null);
      })
      .catch(cause => active && setError(cause instanceof Error ? cause.message : 'โหลด Settings V2 ไม่สำเร็จ'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const valueFor = React.useCallback(
    (workType: DocumentWorkType, size: DocumentSize, colorMode: DocumentColorMode) =>
      mappings.find(mapping => documentMappingKey(mapping) === documentMappingKey({ workType, size, colorMode }))?.quickProductId ?? '',
    [mappings],
  );

  const setMapping = (workType: DocumentWorkType, size: DocumentSize, colorMode: DocumentColorMode, quickProductId: string) => {
    const key = documentMappingKey({ workType, size, colorMode });
    setMappings(previous => {
      const without = previous.filter(mapping => documentMappingKey(mapping) !== key);
      return quickProductId ? [...without, { workType, size, colorMode, quickProductId }] : without;
    });
    setNotice(null);
    setError(null);
  };

  const saveDraft = async () => {
    setSaving(true);
    setNotice(null);
    setError(null);
    try {
      const saved = await updateQuickSaleV2Draft(mappings);
      setMappings(saved.mappings);
      setVersion(saved.version);
      setUpdatedAt(saved.updatedAt ? new Date(saved.updatedAt) : null);
      setNotice('บันทึก Draft แล้ว — หน้าขาย V2 ยังไม่เปลี่ยนจนกว่าจะกด Publish');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'บันทึก Draft ไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setSaving(true);
    setNotice(null);
    setError(null);
    try {
      await updateQuickSaleV2Draft(mappings);
      const published = await publishQuickSaleV2Draft();
      setVersion(published.version);
      setUpdatedAt(published.updatedAt ? new Date(published.updatedAt) : null);
      setNotice(`Publish V2 สำเร็จ (version ${published.version})`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Publish ไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageContainer>
      <AdminHeroHeader
        title="Quick Seller V2 Settings"
        description="Pilot งานเอกสาร · Mapping ตัวเลือกไปยัง Quick Product เดิม โดยไม่สร้างราคาหรือ financial logic ชุดใหม่"
        lastSynced={formatAdminLastSynced(updatedAt)}
        thaiDate={formatAdminThaiDate(updatedAt ?? new Date())}
      />

      <Stack spacing={2}>
        <Alert severity="info">
          V1 ไม่ได้รับผลกระทบจากหน้านี้ Draft แก้ได้อิสระ และ `/home/quick-sale-v2` จะอ่านเฉพาะ Published mapping เท่านั้น
        </Alert>
        {notice ? <Alert severity="success">{notice}</Alert> : null}
        {error ? <Alert severity="error">{error}</Alert> : null}

        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1} alignItems={{ sm: 'center' }}>
              <Box>
                <Typography fontWeight={900}>งานเอกสาร · Explicit SKU mapping</Typography>
                <Typography variant="body2" color="text.secondary">Published version: {version}</Typography>
              </Box>
              <Stack direction="row" gap={1}>
                <Button startIcon={<SaveRoundedIcon />} variant="outlined" disabled={saving || loading} onClick={() => void saveDraft()}>Save Draft</Button>
                <Button startIcon={<PublishRoundedIcon />} variant="contained" disabled={saving || loading} onClick={() => void publish()}>Publish</Button>
              </Stack>
            </Stack>
          </Box>
          <Divider />

          {loading ? (
            <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress /></Stack>
          ) : (
            <Stack divider={<Divider flexItem />}>
              {combinations.map(combo => {
                const id = `${combo.workType}-${combo.size}-${combo.colorMode}`;
                return (
                  <Stack key={id} direction={{ xs: 'column', md: 'row' }} gap={1.5} alignItems={{ md: 'center' }} sx={{ p: 2 }}>
                    <Box sx={{ width: { md: 210 }, flexShrink: 0 }}>
                      <Typography fontWeight={850}>{combo.workTypeLabel} · {combo.size}</Typography>
                      <Typography variant="body2" color="text.secondary">{combo.colorLabel}</Typography>
                    </Box>
                    <FormControl fullWidth size="small">
                      <InputLabel id={`${id}-label`}>Quick Product</InputLabel>
                      <Select
                        labelId={`${id}-label`}
                        label="Quick Product"
                        value={valueFor(combo.workType, combo.size, combo.colorMode)}
                        onChange={event => setMapping(combo.workType, combo.size, combo.colorMode, String(event.target.value))}
                      >
                        <MenuItem value=""><em>ยังไม่ผูก — ปิดตัวเลือกนี้</em></MenuItem>
                        {products.map(product => (
                          <MenuItem key={product.quickProductId || product.id} value={product.quickProductId || ''}>
                            {productLabel(product)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                );
              })}
            </Stack>
          )}
        </Paper>
      </Stack>
    </AdminPageContainer>
  );
}
