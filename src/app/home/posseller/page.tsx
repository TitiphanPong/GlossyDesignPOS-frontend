'use client';

import * as React from 'react';
import { alpha, Alert, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';

import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import RequestQuoteRoundedIcon from '@mui/icons-material/RequestQuoteRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import TvRoundedIcon from '@mui/icons-material/TvRounded';

import { CheckoutSidebar } from './components/CheckoutSidebar';
import { ProductList } from './components/ProductList';

import { useCart } from './components/useCart';
import { createCartItemKey, useProductModals } from './components/useProductModals';
import SuccessModal from './components/successModal';
import CustomerInfoModal from './components/customerInfoModal';
import AdminPageContainer from '../components/AdminPageContainer';
import { uiCardSx } from '../components/adminUi';
import AdminHeroHeader, { heroOutlineButtonSx, heroPrimaryButtonSx } from '../components/AdminHeroHeader';
import { MissingApiConfigState } from '../components/dashboardUi';
import { isMissingApiBaseError } from '../../../lib/api';
import { buildPendingOrderDraft, PENDING_ORDER_KEY, persistPendingOrderDraft } from '../../../lib/pending-order';
import { computeTotals } from '../../utils/computeTotal';
import { ActiveProduct, CartItem } from './types/cart';
import Link from 'next/link';
import { fetchProducts } from '@/lib/products';
import type { Product } from '@/lib/contracts';

type CustomerInfo = { customerName: string; phoneNumber: string; taxId: string; address: string; note: string };

const DAYS_TH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const MONTHS_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

const toActiveProduct = (product: Product): ActiveProduct => ({ id: product.id, name: product.name, category: product.category, code: product.code, typeCode: product.typeCode });
const sanitizeCustomerInfo = (customer: CustomerInfo): CustomerInfo => ({
  customerName: customer.customerName.trim(),
  phoneNumber: customer.phoneNumber.trim(),
  taxId: customer.taxId.trim(),
  address: customer.address.trim(),
  note: customer.note.trim(),
});

function readExistingPendingDraftId(): string | null {
  if (globalThis.window === undefined) return null;

  try {
    const stored = globalThis.localStorage.getItem(PENDING_ORDER_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as { clientDraftId?: unknown };
    return typeof parsed.clientDraftId === 'string' && parsed.clientDraftId.trim() ? parsed.clientDraftId : null;
  } catch {
    return null;
  }
}

function createDraftId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatLastSynced(date: Date | null) {
  if (!date) return '-';
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear() + 543;
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatThaiFullDate(date: Date | null) {
  if (!date) return 'กำลังโหลดวันที่';
  return `วัน${DAYS_TH[date.getDay()]}ที่ ${date.getDate()} ${MONTHS_TH[date.getMonth()]} พ.ศ. ${date.getFullYear() + 543}`;
}

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

export default function SellPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [missingApiBase, setMissingApiBase] = React.useState(false);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<Date | null>(null);
  const cartState = useCart();
  const modalState = useProductModals();
  const { activeModal, activeProduct, closeModal, editingItem, openForEdit, openForProduct, openModal } = modalState;
  const [customer, setCustomer] = React.useState<CustomerInfo>({ customerName: '', phoneNumber: '', taxId: '', address: '', note: '' });
  const [customerModalOpen, setCustomerModalOpen] = React.useState(false);
  const [successOpen, setSuccessOpen] = React.useState(false);
  const [lastPayment, setLastPayment] = React.useState<'cash' | 'promptpay'>('cash');
  const [taxInvoice, setTaxInvoice] = React.useState<'yes' | 'no'>('no');
  const liveDraftIdRef = React.useRef<string | null>(null);

  const total = cartState.total;
  const cart = cartState.cart;
  const setCart = cartState.setCart;
  const discount = cartState.discount;
  const setDiscount = cartState.setDiscount;
  const totals = React.useMemo(() => computeTotals(cart, discount, taxInvoice), [cart, discount, taxInvoice]);

  const handleCheckout = (payment: 'cash' | 'promptpay') => {
    setLastPayment(payment);
    setCustomerModalOpen(true);
  };

  const loadProducts = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data.filter(product => product.active));
      setErrorMsg(null);
      setMissingApiBase(false);
      setLastSyncedAt(new Date());
    } catch (error) {
      if (isMissingApiBaseError(error)) {
        setMissingApiBase(true);
      } else {
        setErrorMsg(error instanceof Error && error.message ? error.message : 'โหลดสินค้าล้มเหลว กรุณาลองใหม่');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  React.useEffect(() => {
    if (successOpen) return;

    if (cart.length === 0) {
      if (!customerModalOpen) {
        liveDraftIdRef.current = null;
        persistPendingOrderDraft(null);
      }
      return;
    }

    liveDraftIdRef.current = readExistingPendingDraftId() ?? liveDraftIdRef.current ?? createDraftId();
    persistPendingOrderDraft(
      buildPendingOrderDraft({
        draftId: liveDraftIdRef.current,
        customer: {
          customerName: customer.customerName.trim() || 'Walk-in Customer',
          phoneNumber: customer.phoneNumber.trim(),
          taxId: customer.taxId.trim() || undefined,
          address: customer.address.trim() || undefined,
          note: customer.note.trim(),
        },
        payment: lastPayment,
        discount,
        taxInvoice,
        totals,
      })
    );
  }, [cart.length, customer.address, customer.customerName, customer.note, customer.phoneNumber, customer.taxId, customerModalOpen, discount, lastPayment, successOpen, taxInvoice, totals]);

  const summaryStats = React.useMemo(() => {
    const itemCount = cart.reduce((acc, item) => acc + Number(item.qty || 0), 0);
    return {
      itemCount,
      net: totals.finalTotal,
      amountDue: totals.grandTotal,
    };
  }, [cart, totals.finalTotal, totals.grandTotal]);

  const handleModalClose = React.useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleModalSelect = React.useCallback(
    (item: CartItem) => {
      if (editingItem) {
        const editingKey = editingItem.key;
        setCart(prev => prev.map(it => (it.key === editingKey ? { ...item, key: editingKey } : it)));
      } else if (activeProduct) {
        setCart(prev => [...prev, { ...item, key: createCartItemKey(activeProduct.id) }]);
      }

      closeModal();
    },
    [activeProduct, closeModal, editingItem, setCart]
  );

  const ActiveProductModal = activeModal?.component ?? null;

  return (
    <AdminPageContainer>
      <AdminHeroHeader
        title="Cashier"
        description="หน้าขายหน้าร้านสำหรับแคชเชียร์ ใช้งานเร็ว และจัดการคำสั่งซื้ออย่างเป็นระบบ"
        lastSynced={formatLastSynced(lastSyncedAt)}
        thaiDate={formatThaiFullDate(lastSyncedAt)}
        actions={
          <>
            <Button onClick={() => void loadProducts()} startIcon={<RefreshRoundedIcon />} variant="outlined" disabled={loading} sx={heroOutlineButtonSx}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button component={Link} href="/home/orders" startIcon={<ReceiptLongRoundedIcon />} variant="outlined" sx={heroOutlineButtonSx}>
              View Orders
            </Button>
            <Button component={Link} href="/customer" startIcon={<TvRoundedIcon />} variant="contained" sx={heroPrimaryButtonSx}>
              Customer Display
            </Button>
          </>
        }
      />

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
            filtered={products}
            onAddProduct={p => {
              openForProduct(toActiveProduct(p));
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
            openForEdit(item);
          }}
          onDeleteItem={key => setCart(prev => prev.filter(i => i.key !== key))}
        />
      </Box>

      {/* Modals */}
      {ActiveProductModal ? (
        <ActiveProductModal
          key={activeModal?.key}
          open={openModal}
          onClose={handleModalClose}
          productName={activeProduct?.name || ''}
          initialData={editingItem || undefined}
          onSelect={handleModalSelect}
        />
      ) : null}

      <SuccessModal
        open={successOpen}
        payment={lastPayment}
        onClose={() => {
          setSuccessOpen(false);
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
        taxInvoice={taxInvoice}
        onClose={() => setCustomerModalOpen(false)}
        customer={customer}
        onSubmit={data => {
          const sanitizedCustomer = sanitizeCustomerInfo(data);
          if (!sanitizedCustomer.customerName || !sanitizedCustomer.phoneNumber) {
            return;
          }

          const order = buildPendingOrderDraft({
            draftId: globalThis.crypto.randomUUID(),
            customer: sanitizedCustomer,
            payment: lastPayment,
            discount,
            taxInvoice,
            totals,
          });

          persistPendingOrderDraft(order);
          setCustomer(sanitizedCustomer);
          setCustomerModalOpen(false);
          setSuccessOpen(true);
        }}
      />
    </AdminPageContainer>
  );
}
