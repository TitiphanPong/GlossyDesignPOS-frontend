'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import PublishRoundedIcon from '@mui/icons-material/PublishRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import AdminPageContainer from '@/app/home/components/AdminPageContainer';
import AdminHeroHeader, { formatAdminLastSynced, formatAdminThaiDate } from '@/app/home/components/AdminHeroHeader';
import DocumentServiceConfigurator from '../../quick-sale-v2/DocumentServiceConfigurator';
import { fetchQuickProductsForAdmin } from '@/lib/products';
import type { Product } from '@/lib/contracts';
import {
  DEFAULT_QUICK_SALE_V2_DOCUMENT_DEFAULTS,
  documentMappingKey,
  fetchQuickSaleV2Draft,
  publishQuickSaleV2Draft,
  updateQuickSaleV2Draft,
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
const TOTAL_DOCUMENT_COMBINATIONS = WORK_TYPES.length * SIZES.length * COLORS.length;

function productLabel(product: Product): string {
  const price = product.variants.find(variant => variant.active)?.price;
  return `${product.name}${price != null ? ` · ฿${price.toFixed(2)}` : ''}`;
}

function MappingSelect({
  id,
  value,
  products,
  onChange,
}: {
  id: string;
  value: string;
  products: Product[];
  onChange: (quickProductId: string) => void;
}) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel id={`${id}-label`}>Quick Product</InputLabel>
      <Select
        labelId={`${id}-label`}
        label="Quick Product"
        value={value}
        onChange={event => onChange(String(event.target.value))}
      >
        <MenuItem value=""><em>ยังไม่ผูก — ปิดตัวเลือกนี้</em></MenuItem>
        {products.map(product => (
          <MenuItem key={product.quickProductId || product.id} value={product.quickProductId || ''}>
            {productLabel(product)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function QuickSaleV2SettingsPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [mappings, setMappings] = React.useState<QuickSaleV2DocumentMapping[]>([]);
  const [defaults, setDefaults] = React.useState<QuickSaleV2DocumentDefaults>({ ...DEFAULT_QUICK_SALE_V2_DOCUMENT_DEFAULTS });
  const [version, setVersion] = React.useState(0);
  const [updatedAt, setUpdatedAt] = React.useState<Date | null>(null);
  const [tab, setTab] = React.useState(0);
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
        setDefaults(config.defaults);
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
      const saved = await updateQuickSaleV2Draft(mappings, defaults);
      setMappings(saved.mappings);
      setDefaults(saved.defaults);
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
      await updateQuickSaleV2Draft(mappings, defaults);
      const published = await publishQuickSaleV2Draft();
      setDefaults(published.defaults);
      setVersion(published.version);
      setUpdatedAt(published.updatedAt ? new Date(published.updatedAt) : null);
      setNotice(`Publish V2 สำเร็จ (version ${published.version})`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Publish ไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const mappedCount = mappings.length;
  const familyEnabled = mappedCount > 0;

  return (
    <AdminPageContainer>
      <AdminHeroHeader
        title="Quick Seller V2 Settings"
        description="จัดหน้าขาย ราคา/ตัวเลือก และ Preview จาก Draft เดียวกัน โดยไม่กระทบ Quick Seller V1"
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
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={1.5} alignItems={{ md: 'center' }}>
              <Box>
                <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                  <Typography fontWeight={900}>V2 Layout Draft</Typography>
                  <Chip size="small" label={`Published v${version}`} variant="outlined" />
                  <Chip size="small" color={familyEnabled ? 'success' : 'default'} label={familyEnabled ? 'งานเอกสารพร้อมแสดง' : 'งานเอกสารยังไม่มี mapping'} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  ผูกแล้ว {mappedCount}/{TOTAL_DOCUMENT_COMBINATIONS} ตัวเลือก · ราคาอ่านจาก Quick Product ปัจจุบัน
                </Typography>
              </Box>
              <Stack direction="row" gap={1} flexWrap="wrap">
                <Button startIcon={<SaveRoundedIcon />} variant="outlined" disabled={saving || loading} onClick={() => void saveDraft()}>
                  Save Draft
                </Button>
                <Button startIcon={<PublishRoundedIcon />} variant="contained" disabled={saving || loading} onClick={() => void publish()}>
                  Publish
                </Button>
              </Stack>
            </Stack>
          </Box>
          <Divider />
          <Tabs value={tab} onChange={(_, value: number) => setTab(value)} variant="scrollable" allowScrollButtonsMobile sx={{ px: 1 }}>
            <Tab label="จัดหน้าขาย" />
            <Tab label="ราคาและตัวเลือก" />
            <Tab label="Preview" />
          </Tabs>
        </Paper>

        {loading ? (
          <Paper variant="outlined" sx={{ borderRadius: 3 }}>
            <Stack alignItems="center" sx={{ py: 7 }}><CircularProgress /></Stack>
          </Paper>
        ) : null}

        {!loading && tab === 0 ? (
          <Stack spacing={1.5}>
            <Typography fontWeight={900}>จัดหน้าขาย</Typography>
            <Typography variant="body2" color="text.secondary">
              Pilot นี้มี Service Family เดียว จึงล็อกลำดับไว้ที่ 1 ก่อน เมื่อเพิ่มหลาย Family ค่อยเปิด drag/drop โดยไม่เปลี่ยน contract ของ V1
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1.5} alignItems={{ sm: 'center' }}>
                <Stack direction="row" gap={1.5} alignItems="center">
                  <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: 'action.hover', display: 'grid', placeItems: 'center', fontWeight: 900 }}>1</Box>
                  <Box>
                    <Stack direction="row" gap={0.75} alignItems="center" flexWrap="wrap">
                      <Typography fontWeight={900}>งานเอกสาร</Typography>
                      <Chip size="small" label="Pilot" color="primary" variant="outlined" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">Print / Copy / Scan · A4 / A3 · ขาวดำ / สี</Typography>
                  </Box>
                </Stack>
                <Stack alignItems={{ sm: 'flex-end' }} gap={0.25}>
                  <Chip size="small" color={familyEnabled ? 'success' : 'default'} label={familyEnabled ? 'แสดงใน V2' : 'ยังไม่พร้อมแสดง'} />
                  <Typography variant="caption" color="text.secondary">{mappedCount}/{TOTAL_DOCUMENT_COMBINATIONS} mapping</Typography>
                </Stack>
              </Stack>
            </Paper>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography fontWeight={900}>ค่าเริ่มต้นเมื่อเปิดงานเอกสาร</Typography>
                  <Typography variant="body2" color="text.secondary">Published defaults จะถูกใช้จริงเมื่อเปิด configurator ในหน้าขาย V2 ส่วน Preview ด้านล่างใช้ค่า Draft นี้ทันที</Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 1 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel id="default-work-type-label">ประเภทงาน</InputLabel>
                    <Select labelId="default-work-type-label" label="ประเภทงาน" value={defaults.workType} onChange={event => setDefaults(current => ({ ...current, workType: event.target.value as DocumentWorkType }))}>
                      {WORK_TYPES.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl size="small" fullWidth>
                    <InputLabel id="default-size-label">ขนาด</InputLabel>
                    <Select labelId="default-size-label" label="ขนาด" value={defaults.size} onChange={event => setDefaults(current => ({ ...current, size: event.target.value as DocumentSize }))}>
                      {SIZES.map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl size="small" fullWidth>
                    <InputLabel id="default-color-label">โหมดสี</InputLabel>
                    <Select labelId="default-color-label" label="โหมดสี" value={defaults.colorMode} onChange={event => setDefaults(current => ({ ...current, colorMode: event.target.value as DocumentColorMode }))}>
                      {COLORS.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <FormControl size="small" fullWidth>
                    <InputLabel id="default-quantity-label">จำนวน</InputLabel>
                    <Select labelId="default-quantity-label" label="จำนวน" value={defaults.quantity} onChange={event => setDefaults(current => ({ ...current, quantity: Number(event.target.value) }))}>
                      {[1, 5, 10, 20, 50].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
                {!valueFor(defaults.workType, defaults.size, defaults.colorMode) ? <Alert severity="warning">ค่าเริ่มต้นนี้ยังไม่มี mapping — Save Draft ได้ แต่ Publish จะถูกปฏิเสธจนกว่าจะผูก Quick Product</Alert> : null}
              </Stack>
            </Paper>
            <Alert severity="warning" variant="outlined">
              การเปิด/ปิด Family แบบแยก state และการเรียงหลาย Family จะเพิ่มเมื่อมี Family ที่สอง เพื่อไม่สร้าง config field ที่ยังไม่มี consumer จริง
            </Alert>
          </Stack>
        ) : null}

        {!loading && tab === 1 ? (
          <Stack spacing={1.5}>
            <Box>
              <Typography fontWeight={900}>ราคาและตัวเลือก · งานเอกสาร</Typography>
              <Typography variant="body2" color="text.secondary">
                จัด mapping เป็น matrix ตามประเภทงาน แทนรายการ SKU ยาว ๆ ราคาแสดงจาก Quick Product ที่เลือกและไม่ถูกคัดลอกมาเก็บใน V2
              </Typography>
            </Box>
            {WORK_TYPES.map(workType => (
              <Paper key={workType.value} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ px: 2, py: 1.5, bgcolor: 'action.hover' }}>
                  <Typography fontWeight={900}>{workType.label}</Typography>
                </Box>
                <Divider />
                <Stack divider={<Divider flexItem />}>
                  {SIZES.map(size => (
                    <Box key={size} sx={{ p: 2 }}>
                      <Typography fontWeight={850} sx={{ mb: 1 }}>{size}</Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 1.25 }}>
                        {COLORS.map(color => {
                          const id = `${workType.value}-${size}-${color.value}`;
                          return (
                            <Stack key={id} spacing={0.5}>
                              <Typography variant="caption" fontWeight={800} color="text.secondary">{color.label}</Typography>
                              <MappingSelect
                                id={id}
                                products={products}
                                value={valueFor(workType.value, size, color.value)}
                                onChange={quickProductId => setMapping(workType.value, size, color.value, quickProductId)}
                              />
                            </Stack>
                          );
                        })}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : null}

        {!loading && tab === 2 ? (
          <Stack spacing={1.5}>
            <Box>
              <Typography fontWeight={900}>Preview จาก Draft</Typography>
              <Typography variant="body2" color="text.secondary">
                ทดลองเปลี่ยน Print / Copy / Scan, ขนาด, สี และจำนวนได้จาก Draft ปัจจุบัน โดย Preview นี้จะไม่เพิ่มสินค้าเข้าตะกร้าหรือแก้ Published config
              </Typography>
            </Box>
            <DocumentServiceConfigurator products={products} mappings={mappings} defaults={defaults} onAdd={() => undefined} previewOnly />
          </Stack>
        ) : null}
      </Stack>
    </AdminPageContainer>
  );
}
