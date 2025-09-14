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

//COMPONENTS

import CheckOutRight from './components/checkoutRight';
import SuccessModal from './components/successModal';
import CustomerInfoModal from './components/customerInfoModal';

//ICON MATERIAL
import AdfScannerIcon from '@mui/icons-material/AdfScanner';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import ApprovalRoundedIcon from '@mui/icons-material/ApprovalRounded';
import MapIcon from '@mui/icons-material/Map';
import StampModal from './components/StampModal';
import { CartItem } from './types/cart';
import NameCardModal from './components/NameCardModal';
import DocumentPrintModal from './components/DocumentPrintModal';

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
  const [cart, setCart] = React.useState<CartItem[]>([]);

  const [editingItem, setEditingItem] = React.useState<CartItem | null>(null);

  const total = cart.reduce((sum, item) => sum + Number(item.unitPrice) * Number(item.qty || 0), 0);

  const round2 = (n: number) => Math.round(n * 100) / 100;

  const netAfterDiscount = round2(Math.max(total - discount, 0));

  const [customer, setCustomer] = React.useState({
    customerName: '',
    phoneNumber: '',
    note: '',
  });

  // หลังกดชำระสินค้า

  const [customerModalOpen, setCustomerModalOpen] = React.useState(false);
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [lastPayment, setLastPayment] = React.useState<'cash' | 'promptpay'>('cash');
  const [taxInvoice, setTaxInvoice] = React.useState<'yes' | 'no'>('no');

  const vatAmount = taxInvoice === 'yes' ? round2(netAfterDiscount * 0.07) : 0;
  const grossTotal = round2(netAfterDiscount + vatAmount);

  const adjustedCart = cart.map(item => {
    const itemNet = item.totalPrice || 0;
    const ratio = total > 0 ? itemNet / total : 0;

    // Net หลังหักส่วนลดแบบเฉลี่ยต่อชิ้น
    const itemNetAfterDiscount = round2(netAfterDiscount * ratio);
    const itemVat = taxInvoice === 'yes' ? round2(itemNetAfterDiscount * 0.07) : 0;
    const itemGross = round2(itemNetAfterDiscount + itemVat);

    if (item.fullPayment) {
      return {
        ...item,
        deposit: itemGross,
        remaining: 0,
        totalPrice: itemNetAfterDiscount,
      };
    } else {
      const safeBase = itemNet || 1; // กันหารศูนย์
      const scale = itemGross / safeBase;
      return {
        ...item,
        deposit: round2((item.deposit || 0) * scale),
        remaining: round2((item.remaining || 0) * scale),
        totalPrice: itemNetAfterDiscount,
      };
    }
  });

  const handleCheckout = (payment: 'cash' | 'promptpay') => {
    setLastPayment(payment);
    setCustomerModalOpen(true);
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

        const fixedData = Array.isArray(data)
          ? data.map(p => ({
              ...p,
              variants: p.variants.map(v => ({
                ...v,
                price: Number(v.price), // ✅ บังคับแปลงเป็น number
              })),
            }))
          : [];

        setProducts(fixedData);
        setLoading(false);
      })
      .catch(() => {
        setErrorMsg('โหลดสินค้าล้มเหลว กรุณาลองใหม่');
        setLoading(false);
      });
  }, []);

  const filtered = React.useMemo(() => {
    return products
      .filter(p => (activeCat === 'ทั้งหมด' ? true : p.category === activeCat))
      .filter(p => p.name.toLowerCase().includes(qDebounced.toLowerCase()));
  }, [products, activeCat, qDebounced]);

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
              <Tab
                value="นามบัตร"
                icon={<CreditCardRoundedIcon />}
                iconPosition="start"
                label="นามบัตร"
              />
              <Tab
                value="ปริ้นท์เอกสาร"
                icon={<AdfScannerIcon />}
                iconPosition="start"
                label="ปริ้นท์เอกสาร"
              />
              <Tab
                value="โพสการ์ด"
                icon={<ImageRoundedIcon />}
                iconPosition="start"
                label="โพสการ์ด"
              />
              <Tab
                value="ตรายาง"
                icon={<ApprovalRoundedIcon />}
                iconPosition="start"
                label="ตรายาง"
              />
              <Tab
                value="อิงค์เจ็ท"
                icon={<LocalPrintshopIcon />}
                iconPosition="start"
                label="อิงค์เจ็ท"
              />
              <Tab value="พล็อตแพลน" icon={<MapIcon />} iconPosition="start" label="พล็อตแพลน" />
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
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                        transform: 'translateY(-4px)',
                      },
                    }}>
                    {/* Cover */}
                    <Box
                      sx={{
                        height: 180,
                        width: '100%',
                        bgcolor: p.tint || '#f5f5f5',
                        overflow: 'hidden',
                      }}>
                      <img
                        src={p.cover}
                        alt={p.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </Box>

                    {/* Content */}
                    <CardContent sx={{ pb: 1 }}>
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

                    {/* Action */}
                    <CardActions sx={{ p: 1.5, pt: 0 }}>
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
              onTaxInvoiceChange={setTaxInvoice}
              onEditItem={item => {
                setEditingItem(item); // กดแก้ไข → preload ข้อมูล item
                setActiveProduct({
                  id: item.key,
                  name: item.name,
                  category: item.category ?? '',
                  cover: '',
                  tint: '',
                  variants: [],
                });
                setOpenModal(true);
              }}
              onDeleteItem={key => {
                setCart(prev => prev.filter(i => i.key !== key));
              }}
            />
          </Box>
        </Box>
      </Container>

      {/* Modal สำหรับสินค้าประเภทนามบัตร */}
      {activeProduct?.category?.trim() === 'นามบัตร' && (
        <NameCardModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditingItem(null);
          }}
          productName={activeProduct?.name || ''}
          initialData={editingItem || undefined}
          onSelect={item => {
            if (editingItem) {
              setCart(prev =>
                prev.map(it =>
                  it.key === editingItem.key ? { ...item, key: editingItem.key } : it
                )
              );
              setEditingItem(null);
            } else {
              setCart(prev => [...prev, { ...item, key: `${activeProduct?.id}-${Date.now()}` }]);
            }
            setOpenModal(false);
          }}
        />
      )}

      {activeProduct?.category?.trim() === 'ตรายาง' && (
        <StampModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditingItem(null);
          }}
          productName={activeProduct?.name || ''}
          initialData={editingItem || undefined}
          onSelect={item => {
            if (editingItem) {
              // 📝 กรณีแก้ไข → ใช้ key เดิม
              setCart(prev =>
                prev.map(it =>
                  it.key === editingItem.key ? { ...item, key: editingItem.key } : it
                )
              );
              setEditingItem(null);
            } else {
              // 📝 กรณีเพิ่มใหม่ → generate key ใหม่
              setCart(prev => [...prev, { ...item, key: `${activeProduct?.id}-${Date.now()}` }]);
            }
            setOpenModal(false);
          }}
        />
      )}

      {activeProduct?.category?.trim() === 'ปริ้นท์เอกสาร' && (
        <DocumentPrintModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditingItem(null);
          }}
          productName={activeProduct?.name || ''}
          initialData={editingItem || undefined}
          onSelect={item => {
            if (editingItem) {
              // 📝 กรณีแก้ไข → ใช้ key เดิม
              setCart(prev =>
                prev.map(it =>
                  it.key === editingItem.key ? { ...item, key: editingItem.key } : it
                )
              );
              setEditingItem(null);
            } else {
              // 📝 กรณีเพิ่มใหม่ → generate key ใหม่
              setCart(prev => [...prev, { ...item, key: `${activeProduct?.id}-${Date.now()}` }]);
            }
            setOpenModal(false);
          }}
        />
      )}

      <SuccessModal
        open={successOpen}
        payment={lastPayment}
        onClose={() => {
          setSuccessOpen(false);
          localStorage.removeItem('pendingOrder'); // ✅ เคลียร์ให้ Customer กลับ Banner
        }}
        onPaid={() => {
          console.log('อัปเดตเป็น paid แล้ว');

          setCart([]);
          setDiscount(0);
        }}
        onNewOrder={() => {
          setCart([]);

          setSuccessOpen(false);
          setDiscount(0);
        }}
      />

      <CustomerInfoModal
        open={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        customer={customer}
        onSubmit={data => {
          setCustomer(data); // เก็บ state ลูกค้า
          setCustomerModalOpen(false);
          setSuccessOpen(true);

          const order = {
            orderId: Date.now().toString(),
            ...data,
            payment: lastPayment,
            total: netAfterDiscount, // เก็บ Net หลังหักส่วนลด
            discount,
            status: 'pending',
            depositTotal: adjustedCart.reduce((s, i) => s + (i.deposit || 0), 0),
            remainingTotal: adjustedCart.reduce((s, i) => s + (i.remaining || 0), 0),
            cart: adjustedCart,
            taxInvoice,
            vatAmount,
            grandTotal: grossTotal, // ✅ เก็บ Gross รวม VAT
          };

          localStorage.setItem('pendingOrder', JSON.stringify(order));
          setCustomerModalOpen(false);
          setSuccessOpen(true);
        }}
      />
    </Box>
  );
}
