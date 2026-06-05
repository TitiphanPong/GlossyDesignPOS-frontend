'use client';

import * as React from 'react';
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
  Divider,
  IconButton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import AdminPageContainer from '../components/AdminPageContainer';
import AdminHeroHeader, { heroOutlineButtonSx, heroPrimaryButtonSx } from '../components/AdminHeroHeader';
import { commonButtonSx, uiCardSx } from '../components/adminUi';
import { EmptyState, MissingApiConfigState } from '../components/dashboardUi';
import { isMissingApiBaseError } from '@/lib/api';
import { createProduct, deleteProduct, fetchProducts, updateProduct, type ProductPayload } from '@/lib/products';
import type { Product, ProductVariant } from '@/lib/contracts';

type ProductFormState = {
  id?: string;
  name: string;
  category: string;
  code: string;
  typeCode: string;
  cover: string;
  icon: string;
  emoji: string;
  tint: string;
  badge: string;
  active: boolean;
  variants: ProductVariant[];
};

const emptyVariant = (): ProductVariant => ({
  name: '',
  price: 0,
  note: '',
  material: '',
  sides: '',
  size: '',
  active: true,
});

const emptyForm = (): ProductFormState => ({
  name: '',
  category: '',
  code: '',
  typeCode: '',
  cover: '',
  icon: '',
  emoji: '',
  tint: '#F4F7FB',
  badge: '',
  active: true,
  variants: [emptyVariant()],
});

const DAYS_TH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const MONTHS_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

function formatLastSynced(date: Date | null) {
  if (!date) return '-';
  return date.toLocaleString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatThaiFullDate(date: Date | null) {
  if (!date) return 'กำลังโหลดวันที่';
  return `วัน${DAYS_TH[date.getDay()]}ที่ ${date.getDate()} ${MONTHS_TH[date.getMonth()]} พ.ศ. ${date.getFullYear() + 543}`;
}

function productToForm(product: Product): ProductFormState {
  return {
    id: product._id ?? product.id,
    name: product.name,
    category: product.category,
    code: product.code,
    typeCode: product.typeCode,
    cover: product.cover ?? '',
    icon: product.icon ?? '',
    emoji: product.emoji ?? '',
    tint: product.tint ?? '#F4F7FB',
    badge: product.badge ?? '',
    active: product.active,
    variants: product.variants.length > 0 ? product.variants : [emptyVariant()],
  };
}

function formToPayload(form: ProductFormState): ProductPayload {
  return {
    name: form.name.trim(),
    category: form.category.trim(),
    code: form.code.trim(),
    typeCode: form.typeCode.trim() || form.code.trim(),
    cover: form.cover.trim() || undefined,
    icon: form.icon.trim() || undefined,
    emoji: form.emoji.trim() || undefined,
    tint: form.tint.trim() || undefined,
    badge: form.badge.trim() || undefined,
    active: form.active,
    variants: form.variants.map(variant => ({
      ...variant,
      name: variant.name.trim(),
      price: Number(variant.price) || 0,
      note: variant.note?.trim() || undefined,
      material: variant.material?.trim() || undefined,
      sides: variant.sides?.trim() || undefined,
      size: variant.size?.trim() || undefined,
      active: variant.active,
    })),
  };
}

function validateForm(form: ProductFormState): string | null {
  if (!form.name.trim()) return 'กรุณาระบุชื่อสินค้า';
  if (!form.category.trim()) return 'กรุณาระบุหมวดหมู่';
  if (!form.code.trim() && !form.typeCode.trim()) return 'กรุณาระบุ product code หรือ typeCode';
  if (form.variants.some(variant => !variant.name.trim())) return 'กรุณาระบุชื่อ variant ให้ครบ';
  return null;
}

export default function ProductManagementPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [missingApiBase, setMissingApiBase] = React.useState(false);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [form, setForm] = React.useState<ProductFormState>(emptyForm);
  const [search, setSearch] = React.useState('');

  const loadProducts = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setMissingApiBase(false);
    try {
      setProducts(await fetchProducts());
      setLastSyncedAt(new Date());
    } catch (loadError) {
      setProducts([]);
      if (isMissingApiBaseError(loadError)) {
        setMissingApiBase(true);
      } else {
        setError(loadError instanceof Error && loadError.message ? loadError.message : 'โหลดสินค้าไม่สำเร็จ');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filteredProducts = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter(product => [product.name, product.category, product.code, product.typeCode].some(value => value.toLowerCase().includes(query)));
  }, [products, search]);

  const openCreateDialog = () => {
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setForm(productToForm(product));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (form.id) {
        await updateProduct(form.id, formToPayload(form));
      } else {
        await createProduct(formToPayload(form));
      }
      setDialogOpen(false);
      await loadProducts();
    } catch (saveError) {
      setError(saveError instanceof Error && saveError.message ? saveError.message : 'บันทึกสินค้าไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await updateProduct(product._id ?? product.id, { ...product, active: !product.active });
      await loadProducts();
    } catch (toggleError) {
      setError(toggleError instanceof Error && toggleError.message ? toggleError.message : 'อัปเดตสถานะสินค้าไม่สำเร็จ');
    }
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`ลบสินค้า ${product.name}?`)) return;
    try {
      await deleteProduct(product._id ?? product.id);
      await loadProducts();
    } catch (deleteError) {
      setError(deleteError instanceof Error && deleteError.message ? deleteError.message : 'ลบสินค้าไม่สำเร็จ');
    }
  };

  const updateVariant = (index: number, patch: Partial<ProductVariant>) => {
    setForm(prev => ({
      ...prev,
      variants: prev.variants.map((variant, currentIndex) => (currentIndex === index ? { ...variant, ...patch } : variant)),
    }));
  };

  return (
    <AdminPageContainer>
      <AdminHeroHeader
        title="Products"
        description="จัดการสินค้า หมวดหมู่ รหัสสินค้า และราคา variant สำหรับหน้าขาย POS"
        lastSynced={formatLastSynced(lastSyncedAt)}
        thaiDate={formatThaiFullDate(lastSyncedAt)}
        notice={missingApiBase ? <MissingApiConfigState subtitle="กรุณาตั้งค่า NEXT_PUBLIC_API_URL เพื่อจัดการสินค้า" /> : null}
        actions={
          <>
            <Button onClick={() => void loadProducts()} startIcon={<RefreshRoundedIcon />} variant="outlined" disabled={loading} sx={heroOutlineButtonSx}>
              Refresh
            </Button>
            <Button onClick={openCreateDialog} startIcon={<AddRoundedIcon />} variant="contained" sx={heroPrimaryButtonSx}>
              New Product
            </Button>
          </>
        }
      />

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Card sx={{ ...uiCardSx, overflow: 'hidden' }}>
        <CardContent sx={{ p: { xs: 1.6, md: 2.2 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A' }}>Product Catalog</Typography>
              <Typography sx={{ mt: 0.35, fontSize: 12.5, color: '#64748B' }}>{products.length} products synced from backend</Typography>
            </Box>
            <TextField size="small" value={search} onChange={event => setSearch(event.target.value)} placeholder="ค้นหาชื่อสินค้า หมวดหมู่ หรือ code" sx={{ minWidth: { md: 340 } }} />
          </Stack>

          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Codes</TableCell>
                  <TableCell>Variants</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading && filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <EmptyState compact icon={<Inventory2RoundedIcon fontSize="small" />} eyebrow="Products" title="ยังไม่มีสินค้า" subtitle="สร้างสินค้าแรกหรือปรับคำค้นหาเพื่อดูรายการสินค้า" />
                    </TableCell>
                  </TableRow>
                ) : null}
                {filteredProducts.map(product => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Box sx={{ width: 38, height: 38, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: product.tint ?? '#F4F7FB', fontSize: 20 }}>
                          {product.emoji || product.icon || '•'}
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 750 }}>{product.name}</Typography>
                          <Typography sx={{ color: '#64748B', fontSize: 12 }}>{product.cover || 'No cover'}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Chip size="small" label={`code: ${product.code}`} />
                        <Chip size="small" label={`type: ${product.typeCode}`} variant="outlined" />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>{product.variants.length} variants</Typography>
                      <Typography sx={{ color: '#64748B', fontSize: 12 }}>
                        เริ่มต้น ฿{(product.variants.length > 0 ? Math.min(...product.variants.map(variant => variant.price)) : 0).toLocaleString('th-TH')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Switch checked={product.active} onChange={() => void handleToggleActive(product)} />
                        <Chip size="small" color={product.active ? 'success' : 'default'} label={product.active ? 'Enabled' : 'Disabled'} />
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton onClick={() => openEditDialog(product)}>
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => void handleDelete(product)}>
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{form.id ? 'Edit Product' : 'Create Product'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
              <TextField label="Product name" value={form.name} onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))} />
              <TextField label="Category" value={form.category} onChange={event => setForm(prev => ({ ...prev, category: event.target.value }))} />
              <TextField label="Product code" value={form.code} onChange={event => setForm(prev => ({ ...prev, code: event.target.value }))} helperText="Stable backend/product code" />
              <TextField label="typeCode" value={form.typeCode} onChange={event => setForm(prev => ({ ...prev, typeCode: event.target.value }))} helperText="Used by POS modal routing" />
              <TextField label="Cover URL" value={form.cover} onChange={event => setForm(prev => ({ ...prev, cover: event.target.value }))} />
              <TextField label="Icon / emoji" value={form.emoji} onChange={event => setForm(prev => ({ ...prev, emoji: event.target.value }))} />
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              <Switch checked={form.active} onChange={event => setForm(prev => ({ ...prev, active: event.target.checked }))} />
              <Typography>Enable product in POS</Typography>
            </Stack>

            <Divider />

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontWeight: 800 }}>Variants and Prices</Typography>
              <Button startIcon={<AddRoundedIcon />} onClick={() => setForm(prev => ({ ...prev, variants: [...prev.variants, emptyVariant()] }))}>
                Add Variant
              </Button>
            </Stack>

            {form.variants.map((variant, index) => (
              <Card key={`${variant.id ?? 'variant'}-${index}`} variant="outlined" sx={{ borderRadius: 2.5 }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 140px 1fr' }, gap: 1.2 }}>
                    <TextField size="small" label="Name" value={variant.name} onChange={event => updateVariant(index, { name: event.target.value })} />
                    <TextField size="small" label="Price" type="number" value={variant.price} onChange={event => updateVariant(index, { price: Number(event.target.value) })} />
                    <TextField size="small" label="Note" value={variant.note ?? ''} onChange={event => updateVariant(index, { note: event.target.value })} />
                    <TextField size="small" label="Material" value={variant.material ?? ''} onChange={event => updateVariant(index, { material: event.target.value })} />
                    <TextField size="small" label="Sides" value={variant.sides ?? ''} onChange={event => updateVariant(index, { sides: event.target.value })} />
                    <TextField size="small" label="Size" value={variant.size ?? ''} onChange={event => updateVariant(index, { size: event.target.value })} />
                  </Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Switch checked={variant.active} onChange={event => updateVariant(index, { active: event.target.checked })} />
                      <Typography sx={{ fontSize: 13 }}>Active variant</Typography>
                    </Stack>
                    <IconButton disabled={form.variants.length === 1} onClick={() => setForm(prev => ({ ...prev, variants: prev.variants.filter((_, currentIndex) => currentIndex !== index) }))}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={commonButtonSx}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving} startIcon={<SaveRoundedIcon />} variant="contained" sx={commonButtonSx}>
            {saving ? 'Saving...' : 'Save Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminPageContainer>
  );
}
