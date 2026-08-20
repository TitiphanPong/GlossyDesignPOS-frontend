'use client';

import * as React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import KeyboardArrowRightRoundedIcon from '@mui/icons-material/KeyboardArrowRightRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import ApprovalRoundedIcon from '@mui/icons-material/ApprovalRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import LocalPrintshopRoundedIcon from '@mui/icons-material/LocalPrintshopRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PhotoRoundedIcon from '@mui/icons-material/PhotoRounded';
import ScannerRoundedIcon from '@mui/icons-material/ScannerRounded';
import SellRoundedIcon from '@mui/icons-material/SellRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { createOrder } from '@/lib/orders';
import { fetchQuickProducts } from '@/lib/products';
import type { PaymentMethod, Product } from '@/lib/contracts';
import { buildPendingOrderDraft, PENDING_ORDER_KEY, persistPendingOrderDraft, type StoredPendingOrderDraft } from '@/lib/pending-order';
import AdminPageContainer from '../components/AdminPageContainer';
import AdminHeroHeader, { formatAdminLastSynced, formatAdminThaiDate, heroOutlineButtonSx } from '../components/AdminHeroHeader';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import QuickSellerCart, { type QuickSaleCartItem } from './components/QuickSellerCart';
import QuickSalePaymentDialog from './components/QuickSalePaymentDialog';
import { calculateAddedVat, calculateChange, calculatePayableTotal, calculateQuickSale, isDefaultVariantName, roundMoney, type DiscountMode } from './quickSale';

type QuickItem = QuickSaleCartItem;
type CompletedSale = { orderId: string; orderNumber: string; grandTotal: number; changeAmount: number };

const money = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const touchButton = { minWidth: 44, minHeight: 44, borderRadius: 2.5 } as const;

function localDateValue(value = new Date()): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function firstActiveVariant(product: Product) {
  return product.variants.find(variant => variant.active);
}

function getProductVisual(product: Product): { Icon: React.ElementType; background: string; color: string } {
  const identity = `${product.name} ${product.category} ${product.code} ${product.typeCode}`.toLowerCase();

  if (/ตรายาง|stamp/u.test(identity)) return { Icon: ApprovalRoundedIcon, background: '#F3E8FF', color: '#9333EA' };
  if (/นามบัตร|name.?card|business.?card/u.test(identity)) return { Icon: BadgeRoundedIcon, background: '#E0F2FE', color: '#0284C7' };
  if (/สติ๊กเกอร์|sticker|label/u.test(identity)) return { Icon: SellRoundedIcon, background: '#FEF3C7', color: '#D97706' };
  if (/รูป|photo|ภาพ/u.test(identity)) return { Icon: PhotoRoundedIcon, background: '#FCE7F3', color: '#DB2777' };
  if (/สแกน|scan/u.test(identity)) return { Icon: ScannerRoundedIcon, background: '#E0F2FE', color: '#0369A1' };
  if (/เข้าเล่ม|binding|book/u.test(identity)) return { Icon: MenuBookRoundedIcon, background: '#EDE9FE', color: '#7C3AED' };
  if (/เคลือบ|laminat|coat/u.test(identity)) return { Icon: LayersRoundedIcon, background: '#DCFCE7', color: '#16A34A' };
  if (/ตัด|cut/u.test(identity)) return { Icon: ContentCutRoundedIcon, background: '#FFEDD5', color: '#EA580C' };
  if (/พรีเมียม|premium/u.test(identity)) return { Icon: WorkspacePremiumRoundedIcon, background: '#FEF9C3', color: '#CA8A04' };
  if (/พิมพ์|ปริ้น|print|inkjet|plot/u.test(identity)) return { Icon: LocalPrintshopRoundedIcon, background: '#DBEAFE', color: '#2563EB' };
  return { Icon: ArticleRoundedIcon, background: '#E2E8F0', color: '#52657C' };
}

export default function QuickSalePage() {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('lg'));
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const searchRef = React.useRef<HTMLInputElement>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<Date | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState('ทั้งหมด');
  const [items, setItems] = React.useState<QuickItem[]>([]);
  const [discountValue, setDiscountValue] = React.useState(0);
  const [discountMode, setDiscountMode] = React.useState<DiscountMode>('amount');
  const [customOpen, setCustomOpen] = React.useState(false);
  const [customName, setCustomName] = React.useState('');
  const [customQuantity, setCustomQuantity] = React.useState(1);
  const [customPrice, setCustomPrice] = React.useState('');
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);
  const [cartOpen, setCartOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('cash');
  const [taxInvoice, setTaxInvoice] = React.useState<'yes' | 'no'>('no');
  const [receivedAmount, setReceivedAmount] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [completed, setCompleted] = React.useState<CompletedSale | null>(null);
  const [checkoutDraftId, setCheckoutDraftId] = React.useState<string | null>(null);
  const now = new Date();
  const [entryMode, setEntryMode] = React.useState<'normal' | 'backdated'>('normal');
  const [saleDate, setSaleDate] = React.useState(localDateValue(now));
  const [saleTime, setSaleTime] = React.useState(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
  const [backdatedReason, setBackdatedReason] = React.useState('');

  const clearQuickSaleCustomerDisplay = React.useCallback(() => {
    const draftId = checkoutDraftId;
    if (globalThis.window === undefined || !draftId) return;

    try {
      const stored = globalThis.localStorage.getItem(PENDING_ORDER_KEY);
      const pending = stored ? (JSON.parse(stored) as StoredPendingOrderDraft) : null;
      if (pending?.clientDraftId === draftId) {
        persistPendingOrderDraft(null);
      }
    } catch {
      persistPendingOrderDraft(null);
    }
  }, [checkoutDraftId]);

  const openCheckout = React.useCallback(() => {
    setCheckoutDraftId(crypto.randomUUID());
    setCheckoutOpen(true);
  }, []);

  const closeCheckout = React.useCallback(() => {
    clearQuickSaleCustomerDisplay();
    setCheckoutDraftId(null);
    setCheckoutOpen(false);
  }, [clearQuickSaleCustomerDisplay]);

  const loadProducts = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    await fetchQuickProducts()
      .then(data => {
        setProducts(data);
        setLastSyncedAt(new Date());
      })
      .catch(() => setError('โหลดสินค้าไม่สำเร็จ กรุณาลองใหม่'))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    void loadProducts();
  }, [loadProducts]);
  const subtotal = React.useMemo(() => roundMoney(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)), [items]);
  const totals = React.useMemo(() => calculateQuickSale(subtotal, discountValue, discountMode), [subtotal, discountValue, discountMode]);
  const vatAmount = React.useMemo(() => (taxInvoice === 'yes' ? calculateAddedVat(totals.grandTotal) : 0), [taxInvoice, totals.grandTotal]);
  const payableTotal = React.useMemo(() => calculatePayableTotal(totals.grandTotal, taxInvoice), [taxInvoice, totals.grandTotal]);
  const customerDisplayDraft = React.useMemo(() => {
    const draftId = checkoutDraftId;
    if (!draftId || !items.length) return null;

    return buildPendingOrderDraft({
      draftId,
      customer: {
        customerName: 'ลูกค้าหน้าร้าน',
        phoneNumber: '',
        note: '',
      },
      payment: paymentMethod,
      discount: totals.discount,
      taxInvoice,
      totals: {
        total: totals.subtotal,
        depositTotal: payableTotal,
        remainingTotal: 0,
        adjustedCart: items.map(item => ({
          productId: item.productId,
          productCode: item.productCode,
          name: item.productName,
          category: item.category,
          qty: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: roundMoney(item.quantity * item.unitPrice),
          lineTotal: roundMoney(item.quantity * item.unitPrice),
          fullPayment: true,
        })),
        vatAmount,
        grandTotal: payableTotal,
      },
    });
  }, [checkoutDraftId, items, paymentMethod, payableTotal, taxInvoice, totals, vatAmount]);

  React.useEffect(() => {
    if (!checkoutOpen) return;
    if (!customerDisplayDraft) {
      clearQuickSaleCustomerDisplay();
      return;
    }
    persistPendingOrderDraft(customerDisplayDraft);
  }, [checkoutOpen, clearQuickSaleCustomerDisplay, customerDisplayDraft]);
  const categories = React.useMemo(() => ['ทั้งหมด', ...Array.from(new Set(products.map(product => product.category))).sort()], [products]);
  const visible = React.useMemo(() => {
    const sellable = products.filter(product => product.active && firstActiveVariant(product));
    const hasConfiguredQuickMenu = sellable.some(product => product.quickSaleEnabled || product.isHotMenu);
    return sellable
      .filter(product => query.trim().length > 0 || !hasConfiguredQuickMenu || product.quickSaleEnabled || product.isHotMenu)
      .filter(product => category === 'ทั้งหมด' || product.category === category)
      .filter(product => `${product.name} ${product.code} ${product.typeCode} ${product.category}`.toLowerCase().includes(query.trim().toLowerCase()))
      .sort((a, b) => (a.quickSaleSortOrder ?? Number.MAX_SAFE_INTEGER) - (b.quickSaleSortOrder ?? Number.MAX_SAFE_INTEGER));
  }, [products, category, query]);
  const popularProducts = React.useMemo(() => {
    const configured = visible.filter(product => product.isHotMenu || product.quickSaleEnabled);
    return (configured.length ? configured : visible).slice(0, 12);
  }, [visible]);
  const otherProducts = React.useMemo(() => {
    const popularIds = new Set(popularProducts.map(product => product.id));
    return visible.filter(product => !popularIds.has(product.id));
  }, [popularProducts, visible]);

  const addProduct = React.useCallback((product: Product) => {
    const variant = firstActiveVariant(product);
    if (!variant) return;
    const key = `${product.id}:${variant.id || variant._id || variant.name}`;
    setItems(previous =>
      previous.some(item => item.key === key)
        ? previous.map(item => (item.key === key ? { ...item, quantity: item.quantity + 1 } : item))
        : [
            ...previous,
            {
              key,
              productId: product.id,
              productCode: product.code,
              productName: !isDefaultVariantName(variant.name) ? `${product.name} — ${variant.name}` : product.name,
              category: product.category,
              quantity: 1,
              unitPrice: variant.price,
            },
          ]
    );
  }, []);

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.matches('input, textarea, [contenteditable="true"]');
      if (event.key === 'Escape') {
        closeCheckout();
        setCustomOpen(false);
        setCartOpen(false);
        return;
      }
      if (typing) return;
      if (event.key === 'F2') {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'F9' && items.length) {
        event.preventDefault();
        openCheckout();
      }
      if (event.key === 'Enter' && visible.length) addProduct(visible[0]);
    };
    globalThis.addEventListener('keydown', handler);
    return () => globalThis.removeEventListener('keydown', handler);
  }, [addProduct, closeCheckout, items.length, openCheckout, visible]);

  const addCustom = () => {
    const price = Number(customPrice);
    if (!customName.trim() || !Number.isFinite(price) || price < 0) return;
    setItems(previous => [...previous, { key: `custom:${crypto.randomUUID()}`, productName: customName.trim(), category: 'อื่นๆ', quantity: Math.max(1, customQuantity), unitPrice: price }]);
    setCustomName('');
    setCustomQuantity(1);
    setCustomPrice('');
    setCustomOpen(false);
  };
  const startNew = () => {
    setItems([]);
    setDiscountValue(0);
    setCompleted(null);
    setReceivedAmount(0);
    setPaymentMethod('cash');
    setTaxInvoice('no');
    setEntryMode('normal');
    setBackdatedReason('');
  };
  const submitSale = async () => {
    if (!items.length || (paymentMethod === 'cash' && receivedAmount < payableTotal)) return;
    setSubmitting(true);
    setError(null);
    try {
      const clientDraftId = checkoutDraftId ?? crypto.randomUUID();
      const result = await createOrder({
        clientDraftId,
        orderType: 'QUICK_SALE',
        ...(entryMode === 'backdated' ? { entryMode, saleDate: new Date(`${saleDate}T${saleTime}:00`).toISOString(), backdatedReason } : {}),
        salesChannel: 'quick_sale',
        customerName: 'ลูกค้าหน้าร้าน',
        phoneNumber: '',
        note: '',
        cart: items.map(item => ({
          productId: item.productId,
          productCode: item.productCode,
          name: item.productName,
          category: item.category,
          qty: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: roundMoney(item.quantity * item.unitPrice),
          lineTotal: roundMoney(item.quantity * item.unitPrice),
          fullPayment: true,
        })),
        subtotal: totals.subtotal,
        total: totals.subtotal,
        discount: totals.discount,
        grandTotal: payableTotal,
        payment: paymentMethod,
        paymentMethod,
        paidAmount: payableTotal,
        depositTotal: payableTotal,
        remainingTotal: 0,
        receivedAmount: paymentMethod === 'cash' ? receivedAmount : payableTotal,
        changeAmount: paymentMethod === 'cash' ? calculateChange(receivedAmount, payableTotal) : 0,
        status: 'paid',
        taxInvoice,
        vatAmount,
      });
      setCompleted({
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        grandTotal: payableTotal,
        changeAmount: paymentMethod === 'cash' ? calculateChange(receivedAmount, payableTotal) : 0,
      });
      if (customerDisplayDraft) {
        persistPendingOrderDraft({
          ...customerDisplayDraft,
          orderId: result.orderId,
          orderNumber: result.orderNumber,
          status: 'paid',
          orderSyncStatus: 'submitted',
        });
      }
      setCheckoutDraftId(null);
      setCheckoutOpen(false);
      setCartOpen(false);
      setItems([]);
      setDiscountValue(0);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'บันทึกการขายไม่สำเร็จ');
    } finally {
      setSubmitting(false);
    }
  };

  const cart = (
    <QuickSellerCart
      items={items}
      setItems={setItems}
      totals={totals}
      discountValue={discountValue}
      discountMode={discountMode}
      setDiscountValue={setDiscountValue}
      setDiscountMode={setDiscountMode}
      onCheckout={openCheckout}
    />
  );
  return (
    <AdminPageContainer>
      <AdminHeroHeader
        title="Quick Sale"
        description="ขายสินค้าหน้าร้านอย่างรวดเร็ว เลือกรายการ รับชำระ และออกเอกสารในขั้นตอนเดียว"
        lastSynced={formatAdminLastSynced(lastSyncedAt)}
        thaiDate={formatAdminThaiDate(lastSyncedAt)}
        actions={
          <Button variant="outlined" startIcon={<RefreshRoundedIcon />} disabled={loading} onClick={() => void loadProducts()} sx={heroOutlineButtonSx}>
            {loading ? 'กำลังโหลด...' : 'รีเฟรช'}
          </Button>
        }
      />
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : 'minmax(0, 1.85fr) minmax(370px, 1fr)', gap: 2, alignItems: 'start' }}>
        <Paper variant="outlined" sx={{ p: { xs: 1.75, md: 2.25 }, borderRadius: 4, minHeight: 600, borderColor: '#E2E8F0', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25} sx={{ mb: 1.5 }}>
            <TextField
              inputRef={searchRef}
              fullWidth
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="ค้นหาสินค้า / สแกนบาร์โค้ด (F2)"
              sx={{ '& .MuiOutlinedInput-root': { minHeight: 52, borderRadius: 2.5, bgcolor: '#FFFFFF', fontSize: 15 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: '#64748B' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Chip size="small" label="F2" sx={{ borderRadius: 1.5, color: '#64748B' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setCustomOpen(true)} sx={{ minWidth: 132, minHeight: 52, borderRadius: 2.5, bgcolor: '#FFFFFF', fontWeight: 800 }}>
              รายการอื่น
            </Button>
          </Stack>
          <Stack direction="row" gap={1} sx={{ overflowX: 'auto', pb: 2, scrollbarWidth: 'none' }}>
            {categories.map(value => (
              <Chip
                key={value}
                label={value}
                clickable
                color={category === value ? 'primary' : 'default'}
                variant={category === value ? 'filled' : 'outlined'}
                onClick={() => setCategory(value)}
                sx={{ minHeight: 40, px: 0.5, flexShrink: 0, fontWeight: category === value ? 700 : 500, borderColor: '#E2E8F0' }}
              />
            ))}
          </Stack>
          <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 1.25 }}>
            <LocalFireDepartmentRoundedIcon sx={{ color: '#F97316', fontSize: 22 }} />
            <Typography fontWeight={900} color="#172033">
              สินค้ายอดนิยม
            </Typography>
            <Typography variant="body2" color="text.secondary">
              (กดเพิ่มลงรายการทันที)
            </Typography>
          </Stack>
          {loading ? (
            <Typography sx={{ py: 8, textAlign: 'center' }}>กำลังโหลดสินค้า...</Typography>
          ) : visible.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography fontWeight={700}>ไม่พบสินค้า Quick Sale</Typography>
              <Typography color="text.secondary">ค้นหาสินค้าทั้งหมด หรือกำหนด quickSaleEnabled ใน Product</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 1.25 }}>
              {popularProducts.map(product => {
                const variant = firstActiveVariant(product)!;
                const visual = getProductVisual(product);
                return (
                  <Button
                    key={product.id}
                    variant="outlined"
                    onClick={() => addProduct(product)}
                    sx={{
                      minHeight: 148,
                      p: 1.75,
                      borderRadius: 3,
                      textAlign: 'center',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexDirection: 'column',
                      textTransform: 'none',
                      bgcolor: '#FFFFFF',
                      borderColor: product.isHotMenu ? '#93B4FF' : '#E2E8F0',
                      boxShadow: product.isHotMenu ? '0 5px 16px rgba(37, 99, 235, 0.08)' : 'none',
                      transition: 'border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease',
                      '&:hover': { borderColor: '#2563EB', bgcolor: '#F8FBFF', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.12)', transform: 'translateY(-1px)' },
                    }}>
                    <Box
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: 2.5,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: product.emoji ? product.tint || visual.background : visual.background,
                        color: visual.color,
                        fontSize: 30,
                      }}>
                      {product.emoji || <visual.Icon sx={{ fontSize: 34 }} />}
                    </Box>
                    <Box>
                      <Typography color="#0F172A" fontSize={16} fontWeight={900} lineHeight={1.3}>
                        {product.name}
                      </Typography>
                      <Typography color="#53657D" fontSize={13} fontWeight={600} sx={{ mt: 0.35 }}>
                        {product.priceDisplayMode === 'STARTING_AT' ? 'เริ่มต้น ' : ''}฿{money.format(variant.price)}
                        {product.unitLabel ? ` / ${product.unitLabel}` : ''}
                        {!isDefaultVariantName(variant.name) ? ` · ${variant.name}` : ''}
                      </Typography>
                    </Box>
                  </Button>
                );
              })}
            </Box>
          )}
          {!loading && otherProducts.length > 0 && (
            <Box sx={{ mt: 2.25 }}>
              <Typography fontWeight={900} color="#172033" sx={{ mb: 1.1 }}>
                สินค้าทั้งหมด
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1 }}>
                {otherProducts.map(product => {
                  const variant = firstActiveVariant(product)!;
                  const visual = getProductVisual(product);
                  return (
                    <Button
                      key={product.id}
                      variant="outlined"
                      onClick={() => addProduct(product)}
                      sx={{ minHeight: 62, px: 1.25, borderRadius: 2.5, borderColor: '#E2E8F0', bgcolor: '#FFFFFF', textTransform: 'none', justifyContent: 'flex-start', textAlign: 'left' }}>
                      <Box sx={{ width: 38, height: 38, mr: 1.25, flexShrink: 0, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: visual.background, color: visual.color }}>
                        <visual.Icon fontSize="small" />
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography noWrap color="#172033" fontWeight={800}>
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.priceDisplayMode === 'STARTING_AT' ? 'เริ่มต้น ' : ''}฿{money.format(variant.price)}
                          {product.unitLabel ? ` / ${product.unitLabel}` : ''}
                        </Typography>
                      </Box>
                      <KeyboardArrowRightRoundedIcon sx={{ color: '#64748B' }} />
                    </Button>
                  );
                })}
              </Box>
            </Box>
          )}
        </Paper>
        {!compact && (
          <Paper
            variant="outlined"
            sx={{
              position: 'sticky',
              top: 20,
              height: 'min(760px, calc(100vh - 40px))',
              borderRadius: 4,
              overflow: 'hidden',
              borderColor: '#DCE4EF',
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.07)',
            }}>
            {cart}
          </Paper>
        )}
      </Box>
      {compact && (
        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: mobile ? 0 : 92,
            right: 0,
            zIndex: 1000,
            p: 1.5,
            borderRadius: 0,
            borderTop: '1px solid #DCE4EF',
            boxShadow: '0 -10px 30px rgba(15, 23, 42, 0.1)',
          }}>
          <Button fullWidth variant="contained" size="large" onClick={() => setCartOpen(true)} disabled={!items.length} sx={{ minHeight: 54 }}>
            ดูรายการ ({items.length}) · ฿{money.format(totals.grandTotal)}
          </Button>
        </Paper>
      )}
      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 430 } } }}>
        {cart}
      </Drawer>

      <Dialog
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            width: { xs: 'calc(100% - 24px)', sm: 440 },
            m: { xs: 1.5, sm: 4 },
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(15, 23, 42, 0.22)',
          },
        }}>
        <DialogTitle sx={{ px: { xs: 2.5, sm: 3 }, pt: 2.75, pb: 1 }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2}>
            <Box>
              <Typography component="h2" fontSize={21} fontWeight={900} color="#172033">
                เพิ่มรายการอื่น
              </Typography>
              <Typography fontSize={13.5} color="#64748B" sx={{ mt: 0.5 }}>
                สำหรับสินค้าหรือบริการที่ไม่มีในรายการ
              </Typography>
            </Box>
            <IconButton aria-label="ปิดหน้าต่าง" onClick={() => setCustomOpen(false)} sx={{ mt: -0.5, mr: -1, bgcolor: '#F1F5F9', color: '#475569', '&:hover': { bgcolor: '#E2E8F0' } }}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, pt: '16px !important', pb: 2 }}>
          <Stack gap={2.25}>
            <TextField
              autoFocus
              fullWidth
              label="ชื่อรายการ"
              placeholder="เช่น ค่าออกแบบ, ค่าจัดส่ง"
              value={customName}
              onChange={event => setCustomName(event.target.value)}
              slotProps={{ input: { sx: { borderRadius: 2.5 } } }}
            />

            <Box>
              <Typography component="label" fontSize={13} fontWeight={800} color="#475569">
                จำนวน
              </Typography>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.75, p: 0.75, border: '1px solid #DCE4EF', borderRadius: 2.5, bgcolor: '#F8FAFC' }}>
                <IconButton
                  aria-label="ลดจำนวน"
                  disabled={customQuantity <= 1}
                  onClick={() => setCustomQuantity(value => Math.max(1, value - 1))}
                  sx={{ ...touchButton, border: '1px solid #DCE4EF', bgcolor: '#FFFFFF', '&:hover': { bgcolor: '#EFF6FF', borderColor: '#93C5FD' } }}>
                  <RemoveRoundedIcon />
                </IconButton>
                <TextField
                  type="number"
                  value={customQuantity}
                  onChange={event => setCustomQuantity(Math.max(1, Math.floor(Number(event.target.value) || 1)))}
                  inputProps={{ min: 1, inputMode: 'numeric', 'aria-label': 'จำนวนรายการ' }}
                  sx={{ width: 104, '& .MuiOutlinedInput-notchedOutline': { border: 0 }, '& input': { p: 1, textAlign: 'center', fontSize: 20, fontWeight: 900 } }}
                />
                <IconButton
                  aria-label="เพิ่มจำนวน"
                  onClick={() => setCustomQuantity(value => value + 1)}
                  sx={{ ...touchButton, border: '1px solid #BFDBFE', bgcolor: '#EFF6FF', color: '#1769E0', '&:hover': { bgcolor: '#DBEAFE' } }}>
                  <AddRoundedIcon />
                </IconButton>
              </Stack>
            </Box>

            <TextField
              fullWidth
              label="ราคาต่อหน่วย"
              type="number"
              value={customPrice}
              inputProps={{ min: 0, step: 0.01, inputMode: 'decimal' }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">฿</InputAdornment>,
                  sx: { borderRadius: 2.5, fontWeight: 800 },
                },
              }}
              onChange={event => setCustomPrice(event.target.value)}
            />

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5, borderRadius: 2.5, bgcolor: '#EFF6FF' }}>
              <Typography fontSize={14} fontWeight={700} color="#52657C">
                ยอดรวม
              </Typography>
              <Typography fontSize={20} fontWeight={900} color="#1769E0">
                ฿{money.format(customQuantity * (Number(customPrice) || 0))}
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ gap: 1.25, px: { xs: 2.5, sm: 3 }, pt: 1.5, pb: 2.75, borderTop: '1px solid #EEF2F7' }}>
          <Button fullWidth variant="outlined" onClick={() => setCustomOpen(false)} sx={{ minHeight: 48, borderRadius: 2.5, fontWeight: 800 }}>
            ยกเลิก
          </Button>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddRoundedIcon />}
            disabled={!customName.trim() || customPrice === ''}
            onClick={addCustom}
            sx={{ minHeight: 48, borderRadius: 2.5, fontWeight: 900, boxShadow: '0 8px 18px rgba(23, 105, 224, 0.22)' }}>
            เพิ่มรายการ
          </Button>
        </DialogActions>
      </Dialog>

      <QuickSalePaymentDialog
        open={checkoutOpen}
        itemCount={items.length}
        grandTotal={payableTotal}
        vatAmount={vatAmount}
        paymentMethod={paymentMethod}
        taxInvoice={taxInvoice}
        receivedAmount={receivedAmount}
        submitting={submitting}
        entryMode={entryMode}
        saleDate={saleDate}
        saleTime={saleTime}
        backdatedReason={backdatedReason}
        onClose={closeCheckout}
        onPaymentMethodChange={setPaymentMethod}
        onTaxInvoiceChange={setTaxInvoice}
        onReceivedAmountChange={setReceivedAmount}
        onConfirm={() => void submitSale()}
        onEntryModeChange={setEntryMode}
        onSaleDateChange={setSaleDate}
        onSaleTimeChange={setSaleTime}
        onBackdatedReasonChange={setBackdatedReason}
      />

      <Dialog
        open={Boolean(completed)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { width: { xs: 'calc(100% - 24px)', sm: 440 }, m: 1.5, borderRadius: 4, overflow: 'hidden', boxShadow: '0 28px 72px rgba(15, 23, 42, 0.24)' } }}>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ px: { xs: 2.5, sm: 3.5 }, pt: 4, pb: 3, textAlign: 'center', background: 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)' }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                mx: 'auto',
                mb: 2,
                borderRadius: '50%',
                bgcolor: '#22A447',
                color: '#FFFFFF',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 12px 28px rgba(34, 164, 71, 0.26)',
              }}>
              <CheckRoundedIcon sx={{ fontSize: 44 }} />
            </Box>
            <Typography component="h2" fontSize={25} fontWeight={900} color="#172033">
              ขายสำเร็จ
            </Typography>
            <Typography fontSize={14} color="#64748B" sx={{ mt: 0.5 }}>
              บันทึกรายการขายเรียบร้อยแล้ว
            </Typography>
            <Chip label={completed?.orderNumber} sx={{ mt: 2, height: 34, borderRadius: 2, bgcolor: '#E8F1FF', color: '#1769E0', fontSize: 15, fontWeight: 900, '& .MuiChip-label': { px: 2 } }} />
          </Box>

          <Box sx={{ px: { xs: 2.5, sm: 3.5 }, pb: 3.5 }}>
            <Stack gap={1.25} sx={{ p: 2, mb: 2.5, border: '1px solid #E6ECF4', borderRadius: 3, bgcolor: '#F8FAFC' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography fontSize={14} color="#64748B">
                  ยอดชำระ
                </Typography>
                <Typography fontSize={19} fontWeight={900} color="#172033">
                  ฿{money.format(completed?.grandTotal ?? 0)}
                </Typography>
              </Stack>
              <Box sx={{ borderTop: '1px dashed #D8E1EC' }} />
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography fontSize={14} color="#64748B">
                  เงินทอน
                </Typography>
                <Typography fontSize={19} fontWeight={900} color="#22A447">
                  ฿{money.format(completed?.changeAmount ?? 0)}
                </Typography>
              </Stack>
            </Stack>

            <Stack gap={1.25}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<ReplayRoundedIcon />}
                onClick={startNew}
                sx={{ minHeight: 50, borderRadius: 2.5, fontWeight: 900, boxShadow: '0 8px 18px rgba(23, 105, 224, 0.22)' }}>
                ขายรายการใหม่
              </Button>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<ReceiptLongRoundedIcon />}
                onClick={() => completed && globalThis.open(`/print/invoice/${encodeURIComponent(completed.orderId)}?documentType=receipt`, '_blank')}
                sx={{ minHeight: 50, borderRadius: 2.5, fontWeight: 800 }}>
                พิมพ์ใบเสร็จ
              </Button>
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>
    </AdminPageContainer>
  );
}
