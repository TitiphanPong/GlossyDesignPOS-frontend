'use client';

import * as React from 'react';
import { Box, Alert, Button, Card, FormControl, InputLabel, MenuItem, Select, Stack } from '@mui/material';
import { CheckoutSidebar } from './components/CheckoutSidebar';
import { ProductList } from './components/ProductList';
import { SearchBar } from './components/SearchBar';
import { useCart } from './components/useCart';
import { useProductModals } from './components/useProductModals';
import SuccessModal from './components/successModal';
import CustomerInfoModal from './components/customerInfoModal';
import StampModal from './components/StampModal';
import NameCardModal from './components/NameCardModal';
import DocumentPrintModal from './components/DocumentPrintModal';
import PostCardModal from './components/PostCardModal';
import InkjetModal from './components/InkjetModal';
import PlotPlanModal from './components/PlotPlanModal';
import StickerPVCModal from './components/stickerPVCModal';
import StickerPPModal from './components/stickerPPModal';
import PremiumProductModal from './components/premiumProductModal';
import AdminPageContainer from '../components/AdminPageContainer';
import { commonButtonSx, uiCardSx } from '../components/adminUi';
import { SearchToolbar } from '../components/dashboardUi';

type Variant = { name: string; price: number; note?: string };
type Category = 'นามบัตร' | 'Postcard' | 'Print A3/A4' | 'Photo' | 'Sticker Laser' | (string & {});
export type Product = {
  id: string;
  name: string;
  cover: string;
  tint: string;
  badge?: 'NEW' | 'HIT';
  category: Category;
  variants: Variant[];
};

const normalizeVariant = (variant: Variant): Variant => ({ ...variant, price: Number(variant.price) });
const normalizeProduct = (product: Product): Product => ({ ...product, variants: product.variants.map(normalizeVariant) });

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
  const cartState = useCart();
  const modalState = useProductModals();
  const [customer, setCustomer] = React.useState({ customerName: '', phoneNumber: '', note: '' });
  const [customerModalOpen, setCustomerModalOpen] = React.useState(false);
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [lastPayment, setLastPayment] = React.useState<'cash' | 'promptpay'>('cash');
  const [taxInvoice, setTaxInvoice] = React.useState<'yes' | 'no'>('no');

  const round2 = (n: number) => Math.round(n * 100) / 100;
  const vatAmount = taxInvoice === 'yes' ? round2(cartState.netAfterDiscount * 0.07) : 0;
  const grossTotal = round2(cartState.netAfterDiscount + vatAmount);
  const total = cartState.total;
  const netAfterDiscount = cartState.netAfterDiscount;
  const cart = cartState.cart;
  const setCart = cartState.setCart;
  const discount = cartState.discount;
  const setDiscount = cartState.setDiscount;

  const adjustedCart = cart.map(item => {
    const itemNet = item.totalPrice || 0;
    const ratio = total > 0 ? itemNet / total : 0;
    const itemNetAfterDiscount = round2(netAfterDiscount * ratio);
    const itemVat = taxInvoice === 'yes' ? round2(itemNetAfterDiscount * 0.07) : 0;
    const itemGross = round2(itemNetAfterDiscount + itemVat);
    if (item.fullPayment) return { ...item, deposit: itemGross, remaining: 0, totalPrice: itemNetAfterDiscount };
    const safeBase = itemNet || 1;
    const scale = itemGross / safeBase;
    return { ...item, deposit: round2((item.deposit || 0) * scale), remaining: round2((item.remaining || 0) * scale), totalPrice: itemNetAfterDiscount };
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
        const fixedData = Array.isArray(data) ? data.map(normalizeProduct) : [];
        setProducts(fixedData);
        setLoading(false);
      })
      .catch(() => {
        setErrorMsg('โหลดสินค้าล้มเหลว กรุณาลองใหม่');
        setLoading(false);
      });
  }, []);

  const filtered = React.useMemo(
    () => products.filter(p => (activeCat === 'ทั้งหมด' ? true : p.category === activeCat)).filter(p => p.name.toLowerCase().includes(qDebounced.toLowerCase())),
    [products, activeCat, qDebounced]
  );

  return (
    <AdminPageContainer title="POS Seller" subtitle="หน้าขายหน้าร้านสำหรับแคชเชียร์ ใช้งานเร็ว และจัดการคำสั่งซื้ออย่างเป็นระบบ">
      <Stack spacing={2.5}>
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

        <SearchToolbar>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
            <Box sx={{ flex: 1 }}>
              <SearchBar q={q} setQ={setQ} />
            </Box>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 200 } }}>
              <InputLabel id="category-filter-label">Filter</InputLabel>
              <Select labelId="category-filter-label" value={activeCat} label="Filter" onChange={e => setActiveCat(e.target.value)}>
                <MenuItem value="ทั้งหมด">ทั้งหมด</MenuItem>
                <MenuItem value="นามบัตร">นามบัตร</MenuItem>
                <MenuItem value="ปริ้นท์เอกสาร">ปริ้นท์เอกสาร</MenuItem>
                <MenuItem value="โพสการ์ด">โพสการ์ด</MenuItem>
                <MenuItem value="ตรายาง">ตรายาง</MenuItem>
                <MenuItem value="อิงค์เจ็ท">อิงค์เจ็ท</MenuItem>
                <MenuItem value="สติ๊กเกอร์">สติ๊กเกอร์</MenuItem>
                <MenuItem value="พล็อตแพลน">พล็อตแพลน</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" sx={commonButtonSx}>
              เริ่มบิลใหม่
            </Button>
          </Stack>
        </SearchToolbar>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 3fr) minmax(320px, 1fr)' }, gap: 2 }}>
          <Card sx={{ ...uiCardSx, p: 1.4 }}>
            <ProductList
              loading={loading}
              filtered={filtered}
              onAddProduct={p => {
                modalState.setActiveProduct(p);
                modalState.setOpenModal(true);
              }}
            />
          </Card>

          <CheckoutSidebar
            cart={cart}
            total={total}
            onCheckout={handleCheckout}
            discount={discount}
            onDiscountChange={setDiscount}
            onPaymentChange={setLastPayment}
            onTaxInvoiceChange={setTaxInvoice}
            onEditItem={item => {
              modalState.setEditingItem(item);
              modalState.setActiveProduct({ id: item.key, name: item.name, category: item.category ?? '', cover: '', tint: '', variants: [] });
              modalState.setOpenModal(true);
            }}
            onDeleteItem={key => setCart(prev => prev.filter(i => i.key !== key))}
          />
        </Box>
      </Stack>

      {/* Modals */}
      {modalState.activeProduct?.category?.trim() === 'นามบัตร' && (
        <NameCardModal
          open={modalState.openModal}
          onClose={() => {
            modalState.setOpenModal(false);
            modalState.setEditingItem(null);
          }}
          productName={modalState.activeProduct?.name || ''}
          initialData={modalState.editingItem || undefined}
          onSelect={item => {
            if (modalState.editingItem) {
              setCart(prev => prev.map(it => (it.key === modalState.editingItem!.key ? { ...item, key: modalState.editingItem!.key } : it)));
              modalState.setEditingItem(null);
            } else {
              setCart(prev => [...prev, { ...item, key: `${modalState.activeProduct?.id}-${Date.now()}` }]);
            }
            modalState.setOpenModal(false);
          }}
        />
      )}
      {modalState.activeProduct?.category?.trim() === 'ตรายาง' && (
        <StampModal
          open={modalState.openModal}
          onClose={() => {
            modalState.setOpenModal(false);
            modalState.setEditingItem(null);
          }}
          productName={modalState.activeProduct?.name || ''}
          initialData={modalState.editingItem || undefined}
          onSelect={item => {
            if (modalState.editingItem) {
              setCart(prev => prev.map(it => (it.key === modalState.editingItem!.key ? { ...item, key: modalState.editingItem!.key } : it)));
              modalState.setEditingItem(null);
            } else {
              setCart(prev => [...prev, { ...item, key: `${modalState.activeProduct?.id}-${Date.now()}` }]);
            }
            modalState.setOpenModal(false);
          }}
        />
      )}
      {modalState.activeProduct?.category?.trim() === 'ปริ้นท์เอกสาร' && (
        <DocumentPrintModal
          open={modalState.openModal}
          onClose={() => {
            modalState.setOpenModal(false);
            modalState.setEditingItem(null);
          }}
          productName={modalState.activeProduct?.name || ''}
          initialData={modalState.editingItem || undefined}
          onSelect={item => {
            if (modalState.editingItem) {
              setCart(prev => prev.map(it => (it.key === modalState.editingItem!.key ? { ...item, key: modalState.editingItem!.key } : it)));
              modalState.setEditingItem(null);
            } else {
              setCart(prev => [...prev, { ...item, key: `${modalState.activeProduct?.id}-${Date.now()}` }]);
            }
            modalState.setOpenModal(false);
          }}
        />
      )}
      {modalState.activeProduct?.category?.trim() === 'โพสการ์ด' && (
        <PostCardModal
          open={modalState.openModal}
          onClose={() => {
            modalState.setOpenModal(false);
            modalState.setEditingItem(null);
          }}
          productName={modalState.activeProduct?.name || ''}
          initialData={modalState.editingItem || undefined}
          onSelect={item => {
            if (modalState.editingItem) {
              setCart(prev => prev.map(it => (it.key === modalState.editingItem!.key ? { ...item, key: modalState.editingItem!.key } : it)));
              modalState.setEditingItem(null);
            } else {
              setCart(prev => [...prev, { ...item, key: `${modalState.activeProduct?.id}-${Date.now()}` }]);
            }
            modalState.setOpenModal(false);
          }}
        />
      )}
      {modalState.activeProduct?.category?.trim() === 'อิงค์เจ็ท' && (
        <InkjetModal
          open={modalState.openModal}
          onClose={() => {
            modalState.setOpenModal(false);
            modalState.setEditingItem(null);
          }}
          productName={modalState.activeProduct?.name || ''}
          initialData={modalState.editingItem || undefined}
          onSelect={item => {
            if (modalState.editingItem) {
              setCart(prev => prev.map(it => (it.key === modalState.editingItem!.key ? { ...item, key: modalState.editingItem!.key } : it)));
              modalState.setEditingItem(null);
            } else {
              setCart(prev => [...prev, { ...item, key: `${modalState.activeProduct?.id}-${Date.now()}` }]);
            }
            modalState.setOpenModal(false);
          }}
        />
      )}
      {modalState.activeProduct?.category?.trim() === 'พล็อตแพลน' && (
        <PlotPlanModal
          open={modalState.openModal}
          onClose={() => {
            modalState.setOpenModal(false);
            modalState.setEditingItem(null);
          }}
          productName={modalState.activeProduct?.name || ''}
          initialData={modalState.editingItem || undefined}
          onSelect={item => {
            if (modalState.editingItem) {
              setCart(prev => prev.map(it => (it.key === modalState.editingItem!.key ? { ...item, key: modalState.editingItem!.key } : it)));
              modalState.setEditingItem(null);
            } else {
              setCart(prev => [...prev, { ...item, key: `${modalState.activeProduct?.id}-${Date.now()}` }]);
            }
            modalState.setOpenModal(false);
          }}
        />
      )}
      {modalState.activeProduct?.category?.trim() === 'สินค้าพรีเมียม' && (
        <PremiumProductModal
          open={modalState.openModal}
          onClose={() => {
            modalState.setOpenModal(false);
            modalState.setEditingItem(null);
          }}
          productName={modalState.activeProduct?.name || ''}
          initialData={modalState.editingItem || undefined}
          onSelect={item => {
            if (modalState.editingItem) {
              setCart(prev => prev.map(it => (it.key === modalState.editingItem!.key ? { ...item, key: modalState.editingItem!.key } : it)));
              modalState.setEditingItem(null);
            } else {
              setCart(prev => [...prev, { ...item, key: `${modalState.activeProduct?.id}-${Date.now()}` }]);
            }
            modalState.setOpenModal(false);
          }}
        />
      )}
      {modalState.activeProduct?.name?.includes('สติ๊กเกอร์ PVC Inkjet') && (
        <StickerPVCModal
          open={modalState.openModal}
          onClose={() => {
            modalState.setOpenModal(false);
            modalState.setEditingItem(null);
          }}
          productName={modalState.activeProduct?.name || ''}
          initialData={modalState.editingItem || undefined}
          onSelect={item => {
            if (modalState.editingItem) {
              setCart(prev => prev.map(it => (it.key === modalState.editingItem!.key ? { ...item, key: modalState.editingItem!.key } : it)));
              modalState.setEditingItem(null);
            } else {
              setCart(prev => [...prev, { ...item, key: `${modalState.activeProduct?.id}-${Date.now()}` }]);
            }
            modalState.setOpenModal(false);
          }}
        />
      )}
      {modalState.activeProduct?.name?.includes('สติ๊กเกอร์ PP Laser') && (
        <StickerPPModal
          open={modalState.openModal}
          onClose={() => {
            modalState.setOpenModal(false);
            modalState.setEditingItem(null);
          }}
          productName={modalState.activeProduct?.name || ''}
          initialData={modalState.editingItem || undefined}
          onSelect={item => {
            if (modalState.editingItem) {
              setCart(prev => prev.map(it => (it.key === modalState.editingItem!.key ? { ...item, key: modalState.editingItem!.key } : it)));
              modalState.setEditingItem(null);
            } else {
              setCart(prev => [...prev, { ...item, key: `${modalState.activeProduct?.id}-${Date.now()}` }]);
            }
            modalState.setOpenModal(false);
          }}
        />
      )}

      <SuccessModal
        open={successOpen}
        payment={lastPayment}
        onClose={() => {
          setSuccessOpen(false);
          localStorage.removeItem('pendingOrder');
        }}
        onPaid={() => {
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
          setCustomer(data);
          setCustomerModalOpen(false);
          setSuccessOpen(true);
          const order = {
            orderId: Date.now().toString(),
            ...data,
            payment: lastPayment,
            total: netAfterDiscount,
            discount,
            status: 'pending',
            depositTotal: adjustedCart.reduce((s, i) => s + (i.deposit || 0), 0),
            remainingTotal: adjustedCart.reduce((s, i) => s + (i.remaining || 0), 0),
            cart: adjustedCart,
            taxInvoice,
            vatAmount,
            grandTotal: grossTotal,
          };
          localStorage.setItem('pendingOrder', JSON.stringify(order));
          setCustomerModalOpen(false);
          setSuccessOpen(true);
        }}
      />
    </AdminPageContainer>
  );
}
