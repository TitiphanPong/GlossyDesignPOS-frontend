'use client';

import * as React from 'react';
import { Box, Container, Tabs, Tab, Alert } from '@mui/material';

//COMPONENTS

import { CheckoutSidebar } from './components/CheckoutSidebar';
import { ProductList } from './components/ProductList';
import { HeaderBar } from './components/HeaderBar';
import { SearchBar } from './components/SearchBar';
import { useCart } from './components/useCart';
import { useProductModals } from './components/useProductModals';
import SuccessModal from './components/successModal';
import CustomerInfoModal from './components/customerInfoModal';

//ICON MATERIAL
import AdfScannerIcon from '@mui/icons-material/AdfScanner';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
// ...existing code...
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import ApprovalRoundedIcon from '@mui/icons-material/ApprovalRounded';
import MapIcon from '@mui/icons-material/Map';
import StampModal from './components/StampModal';
import NameCardModal from './components/NameCardModal';
import DocumentPrintModal from './components/DocumentPrintModal';
import PostCardModal from './components/PostCardModal';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import InkjetModal from './components/InkjetModal';
import StickerPVCModal from './components/stickerPVCModal';
import StickerPPModal from './components/stickerPPModal';
import PremiumProductModal from './components/premiumProductModal';

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

const normalizeVariant = (variant: Variant): Variant => ({
  ...variant,
  price: Number(variant.price),
});

const normalizeProduct = (product: Product): Product => ({
  ...product,
  variants: product.variants.map(normalizeVariant),
});

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

  // ใช้ custom hooks
  const cartState = useCart();
  const modalState = useProductModals();

  // ... (คงไว้สำหรับ customer, success, tax, ฯลฯ)
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
    if (item.fullPayment) {
      return { ...item, deposit: itemGross, remaining: 0, totalPrice: itemNetAfterDiscount };
    } else {
      const safeBase = itemNet || 1;
      const scale = itemGross / safeBase;
      return { ...item, deposit: round2((item.deposit || 0) * scale), remaining: round2((item.remaining || 0) * scale), totalPrice: itemNetAfterDiscount };
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
        const fixedData = Array.isArray(data) ? data.map(normalizeProduct) : [];
        setProducts(fixedData);
        setLoading(false);
      })
      .catch(() => {
        setErrorMsg('โหลดสินค้าล้มเหลว กรุณาลองใหม่');
        setLoading(false);
      });
  }, []);

  const filtered = React.useMemo(() => {
    return products.filter(p => (activeCat === 'ทั้งหมด' ? true : p.category === activeCat)).filter(p => p.name.toLowerCase().includes(qDebounced.toLowerCase()));
  }, [products, activeCat, qDebounced]);

  return (
    <Box sx={{ minHeight: '100dvh' }}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <HeaderBar />
        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
        <SearchBar q={q} setQ={setQ} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 1fr' }, gap: 3, mt: 2 }}>
          <Box>
            <Tabs
              value={activeCat}
              onChange={(_, v) => setActiveCat(v)}
              variant="scrollable"
              allowScrollButtonsMobile
              sx={{ mb: 2, '& .MuiTabs-indicator': { height: 3 } }}>
              <Tab value="ทั้งหมด" icon={<LayersRoundedIcon />} iconPosition="start" label="ทั้งหมด" />
              <Tab value="นามบัตร" icon={<CreditCardRoundedIcon />} iconPosition="start" label="นามบัตร" />
              <Tab value="ปริ้นท์เอกสาร" icon={<AdfScannerIcon />} iconPosition="start" label="ปริ้นท์เอกสาร" />
              <Tab value="โพสการ์ด" icon={<ImageRoundedIcon />} iconPosition="start" label="โพสการ์ด" />
              <Tab value="ตรายาง" icon={<ApprovalRoundedIcon />} iconPosition="start" label="ตรายาง" />
              <Tab value="อิงค์เจ็ท" icon={<LocalPrintshopIcon />} iconPosition="start" label="อิงค์เจ็ท" />
              <Tab value="สติ๊กเกอร์" icon={<ColorLensIcon />} iconPosition="start" label="สติ๊กเกอร์" />
              <Tab value="พล็อตแพลน" icon={<MapIcon />} iconPosition="start" label="พล็อตแพลน" />
            </Tabs>
            <ProductList loading={loading} filtered={filtered} onAddProduct={p => { modalState.setActiveProduct(p); modalState.setOpenModal(true); }} />
          </Box>
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
              modalState.setActiveProduct({
                id: item.key,
                name: item.name,
                category: item.category ?? '',
                cover: '',
                tint: '',
                variants: [],
              });
              modalState.setOpenModal(true);
            }}
            onDeleteItem={key => setCart(prev => prev.filter(i => i.key !== key))}
          />
        </Box>
      </Container>

      {/* Modal สำหรับสินค้าประเภทนามบัตร */}
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
