'use client';

import * as React from 'react';
import {
  Box, Container, Stack, Typography, TextField, InputAdornment,
  Tabs, Tab, Card, CardContent, CardActions, Button, Chip, IconButton,
  Divider, List, ListItem, ListItemText, Drawer, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Select, Skeleton, Alert, Badge,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import StickyNote2RoundedIcon from '@mui/icons-material/StickyNote2Rounded';

type Variant = { name: string; price: number; note?: string };
type Category =
  | 'นามบัตร'
  | 'Postcard'
  | 'Print A3/A4'
  | 'Photo'
  | 'Sticker Laser'
  | (string & {}); // รองรับหมวดใหม่จาก backend
type Product = {
  id: string;
  name: string;
  cover: string;
  tint: string;
  badge?: 'NEW' | 'HIT';
  category: Category;
  variants: Variant[];
};

type CartItem = {
  key: string;
  productId: string;
  name: string;
  variant: string;
  unitPrice: number;
  qty: number;
};

const money = (n: number) =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(n);

// debounce helper
function useDebouncedValue<T>(value: T, ms = 250) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function SellPage() {
  const [activeCat, setActiveCat] = React.useState<Category | 'ทั้งหมด'>('ทั้งหมด');
  const [q, setQ] = React.useState('');
  const qDebounced = useDebouncedValue(q, 200);

  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [drawer, setDrawer] = React.useState(false);
  const [variantDlg, setVariantDlg] = React.useState<{ p: Product | null; v: string }>({ p: null, v: '' });

  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // load cart from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('glossy-pos-cart');
      if (raw) setCart(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);
  React.useEffect(() => {
    try {
      localStorage.setItem('glossy-pos-cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // fetch products
  React.useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_BASE ?? '';
    if (!base) {
      setErrorMsg('ยังไม่ได้ตั้งค่า NEXT_PUBLIC_API_BASE ใน .env');
      setLoading(false);
      return;
    }
    fetch(`${base}/products`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Product[];
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
        setErrorMsg('โหลดสินค้าล้มเหลว กรุณาลองใหม่');
        setLoading(false);
      });
  }, []);

  // categories from data
  const categories = React.useMemo(() => {
    const set = new Set<Category>();
    products.forEach((p) => set.add(p.category));
    const list = Array.from(set);
    // ถ้า activeCat ไม่มีในรายการแล้วให้รีเซ็ตกลับ 'ทั้งหมด'
    if (activeCat !== 'ทั้งหมด' && !set.has(activeCat)) setActiveCat('ทั้งหมด');
    return list;
  }, [products]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.qty * i.unitPrice, 0);

  const filtered = React.useMemo(() => {
    return products
      .filter((p) => (activeCat === 'ทั้งหมด' ? true : p.category === activeCat))
      .filter((p) => p.name.toLowerCase().includes(qDebounced.toLowerCase()));
  }, [products, activeCat, qDebounced]);

  const add = (p: Product, vName: string) => {
    const v = p.variants.find((vv) => vv.name === vName);
    if (!v) return;
    const key = `${p.id}::${encodeURIComponent(v.name)}`;
    setCart((prev) => {
      const ex = prev.find((i) => i.key === key);
      if (ex) return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { key, productId: p.id, name: p.name, variant: v.name, unitPrice: v.price, qty: 1 }];
    });
  };

  const subQty = (key: string) =>
    setCart((prev) => prev.map((i) => (i.key === key ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0));

  const addQty = (key: string) =>
    setCart((prev) => prev.map((i) => (i.key === key ? { ...i, qty: i.qty + 1 } : i)));

  const removeItem = (key: string) => setCart((prev) => prev.filter((i) => i.key !== key));

  const quickAdd = (p: Product) => {
    if (p.variants.length === 0) return;
    if (p.variants.length === 1) add(p, p.variants[0].name);
    else setVariantDlg({ p, v: p.variants[0].name }); // set ค่าเริ่มต้นทันที กันกดแล้วยังว่าง
  };

  // icon per category (สวยๆ + กันกรณีหมวดใหม่)
  const catIcon = (cat: Category) => {
    if (cat === 'นามบัตร') return <CreditCardRoundedIcon />;
    if (cat === 'Postcard' || cat === 'Photo') return <ImageRoundedIcon />;
    if (cat === 'Print A3/A4') return <PrintRoundedIcon />;
    if (cat === 'Sticker Laser') return <StickyNote2RoundedIcon />;
    return <LayersRoundedIcon />;
  };

  return (
    <Box sx={{ minHeight: '100dvh', }}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <ReceiptLongRoundedIcon />
          <Typography variant="h5" fontWeight={800}>หน้าขาย (POS)</Typography>
          <Box sx={{ flex: 1 }} />
          <TextField
            size="small"
            placeholder="ค้นหา…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> }}
            sx={{ minWidth: 260 }}
          />
          <Badge
            color="primary"
            badgeContent={totalQty || 0}
            overlap="circular"
            sx={{ ml: 1 }}
          >
            <Button
              startIcon={<ShoppingBagRoundedIcon />}
              variant="contained"
              onClick={() => setDrawer(true)}
            >
              ตะกร้า
            </Button>
          </Badge>
        </Stack>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>
        )}

        {/* Layout */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* LEFT: product area */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* category tabs (dinamic + 'ทั้งหมด') */}
            <Tabs
              value={activeCat}
              onChange={(_, v) => setActiveCat(v)}
              variant="scrollable"
              allowScrollButtonsMobile
              sx={{ mb: 2, '& .MuiTabs-indicator': { height: 3 } }}
            >
              <Tab value="ทั้งหมด" icon={<LayersRoundedIcon />} iconPosition="start" label="ทั้งหมด" />
              {categories.map((c) => (
                <Tab key={c} value={c} icon={catIcon(c)} iconPosition="start" label={c} />
              ))}
            </Tabs>

            {/* cards list (NO Grid) */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              {loading && (
                Array.from({ length: 8 }).map((_, i) => (
                  <Card
                    key={`sk-${i}`}
                    variant="outlined"
                    sx={{
                      width: { xs: 'calc(50% - 8px)', sm: 260, md: 280 },
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <Skeleton variant="rectangular" width="100%" height={120} />
                    <CardContent>
                      <Skeleton width="80%" />
                      <Skeleton width="40%" />
                    </CardContent>
                    <CardActions sx={{ p: 1.5, pt: 0.5 }}>
                      <Skeleton variant="rectangular" width="100%" height={36} />
                    </CardActions>
                  </Card>
                ))
              )}

              {!loading && filtered.length === 0 && (
                <Box sx={{ p: 4, width: '100%', textAlign: 'center', color: 'text.secondary' }}>
                  <Typography>ไม่พบสินค้าในหมวดนี้ / คำค้นนี้</Typography>
                </Box>
              )}

              {!loading && filtered.map((p) => (
                <Card
                  key={p.id}
                  variant="outlined"
                  sx={{
                    width: { xs: 'calc(50% - 8px)', sm: 260, md: 280 },
                    borderRadius: 3,
                    overflow: 'hidden',
                    backdropFilter: 'blur(4px)',
                    boxShadow: '0 6px 24px rgba(0,0,0,.06)',
                    '&:hover': { boxShadow: '0 10px 28px rgba(0,0,0,.10)', transform: 'translateY(-1px)' },
                    transition: 'all .2s',
                  }}
                >
                  <Box
                    sx={{
                      height: 120,
                      bgcolor: p.tint || '#f5f5f5',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 56,
                    }}
                    aria-label={p.name}
                    role="img"
                    title={p.name}
                  >
                    {p.cover}
                  </Box>
                  <CardContent sx={{ pb: 0.5 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography sx={{ fontWeight: 700, flex: 1 }} noWrap>{p.name}</Typography>
                      {p.badge && (
                        <Chip
                          size="small"
                          label={p.badge}
                          color={p.badge === 'NEW' ? 'secondary' : 'primary'}
                        />
                      )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {p.variants.length > 1 ? `${money(p.variants[0].price)}` : money(p.variants[0].price)}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 1.5, pt: 0.5 }}>
                    <Button fullWidth variant="contained" onClick={() => quickAdd(p)}>
                      เพิ่มลงรายการ
                    </Button>
                  </CardActions>
                </Card>
              ))}
            </Box>
          </Box>

          {/* RIGHT: summary */}
          <Box
            sx={{
              width: { xs: 320, md: 380 },
              position: 'sticky',
              top: 16,
              alignSelf: 'flex-start',
              borderRadius: 3,
              p: 2,
              background: 'linear-gradient(180deg,rgba(255,255,255,.65),rgba(255,255,255,.9))',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 8px 36px rgba(0,0,0,.08)',
              maxHeight: 'calc(100dvh - 32px)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <LayersRoundedIcon />
              <Typography variant="h6" fontWeight={800}>รายการที่เลือก</Typography>
              <Chip label={`${totalQty} รายการ`} size="small" sx={{ ml: 'auto' }} />
            </Stack>
            <Divider sx={{ mb: 1 }} />

            <Box sx={{ overflowY: 'auto', flex: 1, pr: 0.5 }}>
              <List dense>
                {cart.map((i) => (
                  <ListItem
                    key={i.key}
                    sx={{
                      py: 1,
                      '& .qtyControls': { opacity: 0.9 },
                    }}
                    secondaryAction={
                      <Stack className="qtyControls" direction="row" alignItems="center" spacing={0.5}>
                        <IconButton size="small" onClick={() => subQty(i.key)} aria-label="ลดจำนวน"><RemoveRoundedIcon fontSize="small" /></IconButton>
                        <Typography minWidth={20} textAlign="center">{i.qty}</Typography>
                        <IconButton size="small" onClick={() => addQty(i.key)} aria-label="เพิ่มจำนวน"><AddRoundedIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => removeItem(i.key)} aria-label="ลบรายการ"><DeleteRoundedIcon fontSize="small" /></IconButton>
                      </Stack>
                    }
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                          <Typography fontWeight={700} noWrap>{i.name}</Typography>
                          <Chip
                            size="small"
                            label={i.variant}
                            variant="outlined"
                            sx={{
                              maxWidth: 180,
                              '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
                            }}
                          />
                        </Stack>
                      }
                      secondary={
                        <Stack direction="row" justifyContent="space-between">
                          <Typography color="text.secondary">{money(i.unitPrice)}</Typography>
                          <Typography fontWeight={700}>{money(i.unitPrice * i.qty)}</Typography>
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Stack spacing={2}>
              <Stack direction="row">
                <Typography sx={{ flex: 1, color: 'text.secondary' }}>ยอดรวม</Typography>
                <Typography fontWeight={800}>{money(totalPrice)}</Typography>
              </Stack>

              <TextField
                size="small"
                placeholder="ส่วนลด/โค้ด"
                InputProps={{ startAdornment: <InputAdornment position="start"><LocalOfferRoundedIcon /></InputAdornment> }}
              />

              <Button
                variant="contained"
                color="success"
                startIcon={<ShoppingBagRoundedIcon />}
                disabled={cart.length === 0}
                onClick={() => setDrawer(true)}
              >
                ชำระเงิน
              </Button>
            </Stack>
          </Box>
        </Box>
      </Container>

      {/* Drawer (mobile/tablet) */}
      <Drawer anchor="right" open={drawer} onClose={() => setDrawer(false)}>
        <Box sx={{ width: { xs: 320, sm: 420 }, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>สรุปรายการ</Typography>
          <Divider />
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <List dense>
              {cart.map((i) => (
                <ListItem key={i.key} sx={{ py: 1 }}>
                  <ListItemText
                    primary={`${i.name} — ${i.variant}`}
                    secondary={`${money(i.unitPrice)} × ${i.qty}`}
                  />
                  <Typography fontWeight={700}>{money(i.unitPrice * i.qty)}</Typography>
                </ListItem>
              ))}
            </List>
          </Box>
          <Divider />
          <Stack direction="row" sx={{ mt: 1 }}>
            <Typography sx={{ flex: 1 }}>ยอดรวม</Typography>
            <Typography fontWeight={800}>{money(totalPrice)}</Typography>
          </Stack>
          <Button
            fullWidth
            sx={{ mt: 2 }}
            variant="contained"
            color="success"
            onClick={() => alert('ไปขั้นตอนชำระเงิน (demo)')}
          >
            ดำเนินการชำระเงิน
          </Button>
        </Box>
      </Drawer>

      {/* เลือก Variant (กรณีหลายราคา) */}
      <Dialog
        open={!!variantDlg.p}
        onClose={() => setVariantDlg({ p: null, v: '' })}
        fullWidth
      >
        <DialogTitle fontWeight={800}>{variantDlg.p?.name}</DialogTitle>
        <DialogContent>
          <Select
            fullWidth
            size="small"
            value={variantDlg.v}
            onChange={(e) => setVariantDlg((s) => ({ ...s, v: e.target.value as string }))}
          >
            {variantDlg.p?.variants.map((v) => (
              <MenuItem key={v.name} value={v.name}>
                {v.name} — {money(v.price)} {v.note ? `(${v.note})` : ''}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVariantDlg({ p: null, v: '' })}>ยกเลิก</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!variantDlg.p || !variantDlg.v) return;
              add(variantDlg.p, variantDlg.v);
              setVariantDlg({ p: null, v: '' });
            }}
          >
            เพิ่มลงรายการ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}