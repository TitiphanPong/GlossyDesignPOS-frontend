'use client';

import * as React from 'react';
import {
  Box,
  Container,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import StickyNote2RoundedIcon from '@mui/icons-material/StickyNote2Rounded';
import NamecardModal from './components/NamecardModal';
import CheckOutRight from './components/checkoutRight';
import SuccessModal from './components/successModal';

type Variant = { name: string; price: number; note?: string };
type Category = 'นามบัตร' | 'Postcard' | 'Print A3/A4' | 'Photo' | 'Sticker Laser' | (string & {});
type Product = {
  id: string;
  name: string;
  cover: string;
  tint: string;
  badge?: 'NEW' | 'HIT';
  category: Category;
  variants: Variant[];
};

const money = (n: number) =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(n);

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

  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Modal Product
  const [activeProduct, setActiveProduct] = React.useState<Product | null>(null);
  const [openModal, setOpenModal] = React.useState(false);

  const [discount, setDiscount] = React.useState(0); // เก็บเป็นจำนวนเงิน หรือ %
  const [cart, setCart] = React.useState<any[]>([]);
  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

  const grandTotal = total - discount;

  // หลังกดชำระสินค้า

  const [successOpen, setSuccessOpen] = React.useState(false);
  const [lastPayment, setLastPayment] = React.useState<'cash' | 'promptpay'>('cash');

  const handleCheckout = (payment: 'cash' | 'promptpay') => {
    setLastPayment(payment);
    setSuccessOpen(true); // เปิด Modal
  };

  React.useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? '';
    if (!base) {
      setErrorMsg('ยังไม่ได้ตั้งค่า NEXT_PUBLIC_API_URL ใน .env');
      setLoading(false);
      return;
    }
    fetch(`${base}/products`)
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Product[];
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setErrorMsg('โหลดสินค้าล้มเหลว กรุณาลองใหม่');
        setLoading(false);
      });
  }, []);

  const categories = React.useMemo(() => {
    const set = new Set<Category>();
    products.forEach(p => set.add(p.category));
    if (activeCat !== 'ทั้งหมด' && !set.has(activeCat)) setActiveCat('ทั้งหมด');
    return Array.from(set);
  }, [products]);

  const filtered = React.useMemo(() => {
    return products
      .filter(p => (activeCat === 'ทั้งหมด' ? true : p.category === activeCat))
      .filter(p => p.name.toLowerCase().includes(qDebounced.toLowerCase()));
  }, [products, activeCat, qDebounced]);

  const catIcon = (cat: Category) => {
    if (cat === 'นามบัตร') return <CreditCardRoundedIcon />;
    if (cat === 'Postcard' || cat === 'Photo') return <ImageRoundedIcon />;
    if (cat === 'Print A3/A4') return <PrintRoundedIcon />;
    if (cat === 'Sticker Laser') return <StickyNote2RoundedIcon />;
    return <LayersRoundedIcon />;
  };

  return (
    <Box sx={{ minHeight: '100dvh' }}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <ReceiptLongRoundedIcon />
          <Typography variant="h5" color="black" fontWeight={800}>
            หน้าขาย (POS)
          </Typography>
        </Stack>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <TextField
          size="small"
          placeholder="ค้นหา…"
          value={q}
          onChange={e => setQ(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 750 }}
        />

        {/* Layout: Left (Products) + Right (Checkout) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '3fr 1fr' },
            gap: 3,
            mt: 2,
          }}>
          {/* LEFT: Product List */}
          <Box>
            <Tabs
              value={activeCat}
              onChange={(_, v) => setActiveCat(v)}
              variant="scrollable"
              allowScrollButtonsMobile
              sx={{
                mb: 2,
                '& .MuiTabs-indicator': { height: 3 },
              }}>
              <Tab
                value="ทั้งหมด"
                icon={<LayersRoundedIcon />}
                iconPosition="start"
                label="ทั้งหมด"
              />
              {categories.map(c => (
                <Tab key={c} value={c} icon={catIcon(c)} iconPosition="start" label={c} />
              ))}
            </Tabs>

            <Box
              pr={{ md: 2 }}
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(140px, 1fr))', // mobile
                  sm: 'repeat(3, minmax(160px, 1fr))', // tablet
                  md: 'repeat(3, minmax(180px, 1fr))', // desktop
                },
              }}>
              {loading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <Card
                    key={`sk-${i}`}
                    variant="outlined"
                    sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    <Skeleton variant="rectangular" width="100%" height={120} />
                    <CardContent>
                      <Skeleton width="80%" />
                      <Skeleton width="40%" />
                    </CardContent>
                    <CardActions sx={{ p: 1.5, pt: 0.5 }}>
                      <Skeleton variant="rectangular" width="100%" height={36} />
                    </CardActions>
                  </Card>
                ))}

              {!loading && filtered.length === 0 && (
                <Box p={4} width="100%" textAlign="center" color="text.secondary">
                  <Typography>ไม่พบสินค้าในหมวดนี้ / คำค้นนี้</Typography>
                </Box>
              )}

              {!loading &&
                filtered.map(p => (
                  <Card
                    key={p.id}
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      backdropFilter: 'blur(4px)',
                      boxShadow: '0 6px 24px rgba(0,0,0,.06)',
                      '&:hover': {
                        boxShadow: '0 10px 28px rgba(0,0,0,.1)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all .2s',
                    }}>
                    <Box
                      sx={{
                        height: 120,
                        bgcolor: p.tint || '#f5f5f5',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 56,
                      }}>
                      {p.cover}
                    </Box>

                    <CardContent sx={{ pb: 0.5 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography fontWeight={700} flex={1} noWrap>
                          {p.name}
                        </Typography>
                        {p.badge && (
                          <Chip
                            size="small"
                            label={p.badge}
                            color={p.badge === 'NEW' ? 'secondary' : 'primary'}
                          />
                        )}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {money(p.variants[0].price)}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ p: 1.5, pt: 0.5 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => {
                          setActiveProduct(p);
                          setOpenModal(true);
                        }}>
                        เพิ่มรายการ
                      </Button>
                    </CardActions>
                  </Card>
                ))}
            </Box>
          </Box>

          {/* RIGHT: Checkout Sidebar (เฉพาะ desktop) */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <CheckOutRight
              cart={cart}
              total={total}
              onCheckout={handleCheckout}
              discount={discount}
              onDiscountChange={setDiscount}
              onPaymentChange={setLastPayment}
            />
          </Box>
        </Box>
      </Container>

      {/* Modal สำหรับสินค้าประเภทนามบัตร */}
      {activeProduct?.category === 'นามบัตร' && (
        <NamecardModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          productName={activeProduct?.name || ''}
          onSelect={order => {
            // push เข้า cart
            setCart(prev => [
              ...prev,
              {
                key: `${activeProduct?.id}-${Date.now()}`,
                name: activeProduct?.name,
                category: activeProduct?.category,
                variant: order.variant.name,
                qty: order.quantity,
                unitPrice: order.totalPrice / order.quantity,
                note: order.note,
                customerName: order.customerName,
                companyName: order.companyName,
                sides: order.sides,
                material: order.material,
                totalPrice: order.totalPrice,
              },
            ]);

            setOpenModal(false);
          }}
        />
      )}

      <SuccessModal
        open={successOpen}
        total={grandTotal}
        payment={lastPayment} // หรือผูกกับ state payment ที่เลือกไว้
        onClose={() => setSuccessOpen(false)}
        onConfirmPaid={async () => {
          const order = {
            // 👉 Base fields
            customerName: cart[0]?.customerName ?? '',
            companyName: cart[0]?.companyName ?? '',
            note: cart[0]?.note ?? '',
            category: cart[0]?.category ?? '', // 👈 ประเภทงาน
            total: grandTotal, // ใช้ราคาหลังหักส่วนลด
            discount: discount, // เพิ่มส่วนลดเข้าไป
            payment: lastPayment,
            status: 'paid',

            // 👉 Cart รายการสินค้า
            cart: cart.map(item => ({
              name: item.name,

              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              extra: {
                sides: item.sides,
                material: item.material,
                variant: item.variant,
                qty: item.qty,
              },
            })),
          };

          try {
            const base = process.env.NEXT_PUBLIC_API_URL ?? '';
            const res = await fetch(`${base}/orders`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(order),
            });

            if (!res.ok) throw new Error('บันทึกไม่สำเร็จ');
            const savedOrder = await res.json();
            console.log('✅ Saved Order:', savedOrder);

            setCart([]); // ล้างตะกร้า

            setTimeout(() => {
              setSuccessOpen(false);
            }, 5000);
          } catch (err) {
            console.error(err);
            alert('เกิดข้อผิดพลาดในการบันทึกการชำระเงิน');
          }
        }}
        onNewOrder={() => {
          setCart([]); // ล้างตะกร้า
          setSuccessOpen(false);
        }}
      />
    </Box>
  );
}
