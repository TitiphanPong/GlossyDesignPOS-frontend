'use client';

import * as React from 'react';
import { alpha, Alert, Box, Card, CardContent, Stack, Typography } from '@mui/material';

import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import RequestQuoteRoundedIcon from '@mui/icons-material/RequestQuoteRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';

import { CheckoutSidebar } from './components/CheckoutSidebar';
import { ProductList } from './components/ProductList';

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
import { uiCardSx } from '../components/adminUi';
import { MissingApiConfigState } from '../components/dashboardUi';
import { getApiBaseUrl, isMissingApiBaseError } from '../../../lib/api';

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

type PosStatCardProps = {
  title: string;
  value: string;
  subtitle: string;
  tone: string;
  icon: React.ReactNode;
};

function PosStatCard({ title, value, subtitle, tone, icon }: Readonly<PosStatCardProps>) {
  return (
    <Card
      sx={{
        borderRadius: 4,
        border: '1px solid #E8EDF5',
        boxShadow: '0 12px 28px rgba(13, 30, 64, 0.07)',
        background: `linear-gradient(140deg, ${alpha(tone, 0.1)} 0%, #FFFFFF 45%, #FFFFFF 100%)`,
      }}>
      <CardContent sx={{ p: 2.25 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: 12.5, fontWeight: 700 }}>{title}</Typography>
            <Typography sx={{ mt: 0.8, color: '#0B1325', fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>{value}</Typography>
            <Typography sx={{ mt: 0.6, color: '#8A95A7', fontSize: 11.5 }}>{subtitle}</Typography>
          </Box>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.6,
              display: 'grid',
              placeItems: 'center',
              color: tone,
              bgcolor: alpha(tone, 0.15),
              boxShadow: `0 10px 20px ${alpha(tone, 0.22)}`,
            }}>
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function useDebouncedValue<T>(value: T, ms = 250) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function SellPage() {
  const [activeCat] = React.useState<Category | 'ทั้งหมด'>('ทั้งหมด');
  const [q] = React.useState('');
  const qDebounced = useDebouncedValue(q, 200);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [missingApiBase, setMissingApiBase] = React.useState(false);
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
    const loadProducts = async () => {
      try {
        const base = getApiBaseUrl();
        const res = await fetch(`${base}/products`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Product[];
        const fixedData = Array.isArray(data) ? data.map(normalizeProduct) : [];
        setProducts(fixedData);
      } catch (error) {
        if (isMissingApiBaseError(error)) {
          setMissingApiBase(true);
        } else {
          setErrorMsg('โหลดสินค้าล้มเหลว กรุณาลองใหม่');
        }
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, []);

  const filtered = React.useMemo(
    () => products.filter(p => (activeCat === 'ทั้งหมด' ? true : p.category === activeCat)).filter(p => p.name.toLowerCase().includes(qDebounced.toLowerCase())),
    [products, activeCat, qDebounced]
  );

  const summaryStats = React.useMemo(() => {
    const itemCount = cart.reduce((acc, item) => acc + Number(item.qty || 0), 0);
    const vat = taxInvoice === 'yes' ? netAfterDiscount * 0.07 : 0;
    const amountDue = netAfterDiscount + vat;
    return {
      itemCount,
      net: netAfterDiscount,
      amountDue,
    };
  }, [cart, netAfterDiscount, taxInvoice]);

  return (
    <AdminPageContainer>
      {/* Top Header Card */}
      <Box
        sx={{
          borderRadius: 6,
          border: '1px solid #E6EDF8',
          boxShadow: '0 20px 45px rgba(18, 45, 82, 0.08)',
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F7FAFF 100%)',
          mb: 3,
        }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2.5} sx={{ p: { xs: 2.2, md: 3 } }}>
          <Box>
            <Typography sx={{ color: '#101828', fontWeight: 800, fontSize: { xs: 30, md: 38 }, lineHeight: 1.06 }}>Cashier</Typography>
            <Typography sx={{ mt: 1, color: '#475467', fontSize: { xs: 14, md: 16 } }}>หน้าขายหน้าร้านสำหรับแคชเชียร์ ใช้งานเร็ว และจัดการคำสั่งซื้ออย่างเป็นระบบ</Typography>
          </Box>
        </Stack>
      </Box>

      {/* Bottom Summary */}
      <Box
        sx={{
          mt: 2.4,
          mb: 2.4,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 1.5,
        }}>
        <PosStatCard title="Items in Cart" value={`${summaryStats.itemCount}`} subtitle="จำนวนชิ้นรวมในบิล" tone="#1E5EFF" icon={<Inventory2RoundedIcon />} />
        <PosStatCard
          title="Net After Discount"
          value={summaryStats.net.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 2 })}
          subtitle="ยอดสุทธิหลังหักส่วนลด"
          tone="#4F46E5"
          icon={<RequestQuoteRoundedIcon />}
        />
        <PosStatCard
          title="Amount Due"
          value={summaryStats.amountDue.toLocaleString('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 2 })}
          subtitle={taxInvoice === 'yes' ? 'รวมภาษีมูลค่าเพิ่ม 7%' : 'ยังไม่รวมภาษีมูลค่าเพิ่ม'}
          tone="#0EA5A3"
          icon={<PaymentsRoundedIcon />}
        />
      </Box>

      {/* Error Message */}
      {missingApiBase ? (
        <Box sx={{ mb: 2 }}>
          <MissingApiConfigState subtitle="กรุณาตั้งค่า NEXT_PUBLIC_API_URL เพื่อให้หน้าขายดึงรายการสินค้าและบันทึกออเดอร์ได้" />
        </Box>
      ) : null}

      {errorMsg ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      ) : null}

      {/* Main Content */}
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
