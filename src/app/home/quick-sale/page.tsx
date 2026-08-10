'use client';

import * as React from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Drawer,
  IconButton, InputAdornment, Paper, Stack, TextField, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import { createOrder } from '@/lib/orders';
import { fetchProducts } from '@/lib/products';
import type { PaymentMethod, Product } from '@/lib/contracts';
import { calculateChange, calculateQuickSale, roundMoney, type DiscountMode } from './quickSale';

type QuickItem = { key: string; productId?: string; productCode?: string; productName: string; category: string; quantity: number; unitPrice: number };
type CompletedSale = { orderId: string; orderNumber: string; grandTotal: number; changeAmount: number };

const money = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const touchButton = { minWidth: 44, minHeight: 44, borderRadius: 2.5 } as const;

function firstActiveVariant(product: Product) {
  return product.variants.find(variant => variant.active);
}

function CartPanel({ items, setItems, totals, discountValue, discountMode, setDiscountValue, setDiscountMode, onCheckout }:
  Readonly<{ items: QuickItem[]; setItems: React.Dispatch<React.SetStateAction<QuickItem[]>>; totals: ReturnType<typeof calculateQuickSale>; discountValue: number; discountMode: DiscountMode; setDiscountValue: (value: number) => void; setDiscountMode: (mode: DiscountMode) => void; onCheckout: () => void }>) {
  const [discountOpen, setDiscountOpen] = React.useState(false);
  const update = (key: string, values: Partial<QuickItem>) => setItems(previous => previous.map(item => item.key === key ? { ...item, ...values } : item));
  return <Stack sx={{ height: '100%', minHeight: 0 }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2.5 }}>
      <Box><Typography variant="h6" fontWeight={800}>รายการขาย</Typography><Typography color="text.secondary" variant="body2">{items.length} รายการ</Typography></Box>
      <ShoppingCartRoundedIcon color="primary" />
    </Stack>
    <Divider />
    <Stack spacing={1.5} sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
      {items.length === 0 && <Box sx={{ py: 8, textAlign: 'center', color: 'text.secondary' }}><ShoppingCartRoundedIcon sx={{ fontSize: 46, opacity: .3 }} /><Typography>กดสินค้าเพื่อเริ่มรายการขาย</Typography></Box>}
      {items.map(item => <Paper variant="outlined" key={item.key} sx={{ p: 1.5, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" gap={1}><Typography fontWeight={700}>{item.productName}</Typography><IconButton size="small" aria-label={`ลบ ${item.productName}`} onClick={() => setItems(previous => previous.filter(row => row.key !== item.key))}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton></Stack>
        <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1 }}>
          <IconButton sx={touchButton} onClick={() => update(item.key, { quantity: Math.max(1, item.quantity - 1) })}><RemoveRoundedIcon /></IconButton>
          <TextField type="number" size="small" value={item.quantity} inputProps={{ min: 1, 'aria-label': `จำนวน ${item.productName}` }} onChange={event => update(item.key, { quantity: Math.max(1, Math.floor(Number(event.target.value) || 1)) })} sx={{ width: 72, '& input': { textAlign: 'center' } }} />
          <IconButton sx={touchButton} onClick={() => update(item.key, { quantity: item.quantity + 1 })}><AddRoundedIcon /></IconButton>
          <TextField label="ราคา/หน่วย" type="number" size="small" value={item.unitPrice} inputProps={{ min: 0, step: .01 }} onChange={event => update(item.key, { unitPrice: Math.max(0, Number(event.target.value) || 0) })} sx={{ ml: 'auto', width: 112 }} />
        </Stack>
        <Typography textAlign="right" fontWeight={700} sx={{ mt: 1 }}>฿{money.format(roundMoney(item.quantity * item.unitPrice))}</Typography>
      </Paper>)}
    </Stack>
    <Divider />
    <Stack spacing={1.25} sx={{ p: 2.5 }}>
      <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">ยอดรวม</Typography><Typography>฿{money.format(totals.subtotal)}</Typography></Stack>
      {discountOpen ? <Stack direction="row" gap={1}>
        <Button variant={discountMode === 'amount' ? 'contained' : 'outlined'} onClick={() => setDiscountMode('amount')}>บาท</Button>
        <Button variant={discountMode === 'percent' ? 'contained' : 'outlined'} onClick={() => setDiscountMode('percent')}>%</Button>
        <TextField autoFocus size="small" type="number" value={discountValue} inputProps={{ min: 0 }} onChange={event => setDiscountValue(Math.max(0, Number(event.target.value) || 0))} />
      </Stack> : <Button size="small" sx={{ alignSelf: 'flex-start' }} onClick={() => setDiscountOpen(true)}>+ ส่วนลด</Button>}
      <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">ส่วนลด</Typography><Typography>-฿{money.format(totals.discount)}</Typography></Stack>
      <Divider /><Stack direction="row" justifyContent="space-between" alignItems="baseline"><Typography fontWeight={800}>ยอดสุทธิ</Typography><Typography variant="h5" color="primary" fontWeight={900}>฿{money.format(totals.grandTotal)}</Typography></Stack>
      <Button variant="contained" size="large" disabled={!items.length} onClick={onCheckout} startIcon={<PointOfSaleRoundedIcon />} sx={{ minHeight: 58, borderRadius: 3, fontSize: 17, fontWeight: 800 }}>ชำระเงิน ฿{money.format(totals.grandTotal)}</Button>
    </Stack>
  </Stack>;
}

export default function QuickSalePage() {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('lg'));
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const searchRef = React.useRef<HTMLInputElement>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
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
  const [receivedAmount, setReceivedAmount] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [completed, setCompleted] = React.useState<CompletedSale | null>(null);

  React.useEffect(() => { void fetchProducts().then(setProducts).catch(() => setError('โหลดสินค้าไม่สำเร็จ กรุณาลองใหม่')).finally(() => setLoading(false)); }, []);
  const subtotal = React.useMemo(() => roundMoney(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)), [items]);
  const totals = React.useMemo(() => calculateQuickSale(subtotal, discountValue, discountMode), [subtotal, discountValue, discountMode]);
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

  const addProduct = React.useCallback((product: Product) => {
    const variant = firstActiveVariant(product); if (!variant) return;
    const key = `${product.id}:${variant.id || variant._id || variant.name}`;
    setItems(previous => previous.some(item => item.key === key) ? previous.map(item => item.key === key ? { ...item, quantity: item.quantity + 1 } : item) : [...previous, { key, productId: product.id, productCode: product.code, productName: variant.name && variant.name !== 'Default' ? `${product.name} — ${variant.name}` : product.name, category: product.category, quantity: 1, unitPrice: variant.price }]);
  }, []);

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null; const typing = target?.matches('input, textarea, [contenteditable="true"]');
      if (event.key === 'Escape') { setCheckoutOpen(false); setCustomOpen(false); setCartOpen(false); return; }
      if (typing) return;
      if (event.key === 'F2') { event.preventDefault(); searchRef.current?.focus(); }
      if (event.key === 'F9' && items.length) { event.preventDefault(); setCheckoutOpen(true); }
      if (event.key === 'Enter' && visible.length) addProduct(visible[0]);
    };
    globalThis.addEventListener('keydown', handler); return () => globalThis.removeEventListener('keydown', handler);
  }, [addProduct, items.length, visible]);

  const addCustom = () => { const price = Number(customPrice); if (!customName.trim() || !Number.isFinite(price) || price < 0) return; setItems(previous => [...previous, { key: `custom:${crypto.randomUUID()}`, productName: customName.trim(), category: 'อื่นๆ', quantity: Math.max(1, customQuantity), unitPrice: price }]); setCustomName(''); setCustomQuantity(1); setCustomPrice(''); setCustomOpen(false); };
  const startNew = () => { setItems([]); setDiscountValue(0); setCompleted(null); setReceivedAmount(0); setPaymentMethod('cash'); };
  const submitSale = async () => {
    if (!items.length || (paymentMethod === 'cash' && receivedAmount < totals.grandTotal)) return;
    setSubmitting(true); setError(null);
    try {
      const result = await createOrder({ clientDraftId: crypto.randomUUID(), orderType: 'QUICK_SALE', salesChannel: 'quick_sale', customerName: '', phoneNumber: '', note: '', cart: items.map(item => ({ productId: item.productId, productCode: item.productCode, name: item.productName, category: item.category, qty: item.quantity, unitPrice: item.unitPrice, totalPrice: roundMoney(item.quantity * item.unitPrice), lineTotal: roundMoney(item.quantity * item.unitPrice), fullPayment: true })), subtotal: totals.subtotal, total: totals.subtotal, discount: totals.discount, grandTotal: totals.grandTotal, payment: paymentMethod, paymentMethod, paidAmount: totals.grandTotal, depositTotal: totals.grandTotal, remainingTotal: 0, receivedAmount: paymentMethod === 'cash' ? receivedAmount : totals.grandTotal, changeAmount: paymentMethod === 'cash' ? calculateChange(receivedAmount, totals.grandTotal) : 0, status: 'paid', taxInvoice: 'no', vatAmount: 0 });
      setCompleted({ orderId: result.orderId, orderNumber: result.orderNumber, grandTotal: totals.grandTotal, changeAmount: paymentMethod === 'cash' ? calculateChange(receivedAmount, totals.grandTotal) : 0 }); setCheckoutOpen(false); setCartOpen(false); setItems([]); setDiscountValue(0);
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'บันทึกการขายไม่สำเร็จ'); } finally { setSubmitting(false); }
  };

  const cart = <CartPanel items={items} setItems={setItems} totals={totals} discountValue={discountValue} discountMode={discountMode} setDiscountValue={setDiscountValue} setDiscountMode={setDiscountMode} onCheckout={() => setCheckoutOpen(true)} />;
  return <Box sx={{ minHeight: '100vh', bgcolor: '#F5F7FB', p: { xs: 2, md: 3 }, pt: { xs: 8, md: 3 } }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} sx={{ mb: 2.5 }}><Box><Typography variant="h4" fontWeight={900}>ขายหน้าร้าน</Typography><Typography color="text.secondary">Quick Sale · F2 ค้นหา · F9 ชำระเงิน</Typography></Box><TextField inputRef={searchRef} value={query} onChange={event => setQuery(event.target.value)} placeholder="ค้นหาสินค้า..." sx={{ width: { xs: '100%', sm: 360 }, bgcolor: 'white' }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> }} /></Stack>
    {error && <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>{error}</Alert>}
    <Box sx={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : 'minmax(0, 65fr) minmax(340px, 35fr)', gap: 2.5, alignItems: 'start' }}>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 4, minHeight: 600 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}><Box><Typography fontWeight={900} color="primary">HOT MENU</Typography><Typography variant="body2" color="text.secondary">แตะสินค้าเพื่อเพิ่มเข้ารายการทันที</Typography></Box><Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setCustomOpen(true)} sx={{ minHeight: 46, borderRadius: 3 }}>รายการอื่น</Button></Stack>
        <Stack direction="row" gap={1} sx={{ overflowX: 'auto', pb: 2 }}>{categories.map(value => <Chip key={value} label={value} clickable color={category === value ? 'primary' : 'default'} onClick={() => setCategory(value)} sx={{ minHeight: 38, px: .5 }} />)}</Stack>
        {loading ? <Typography sx={{ py: 8, textAlign: 'center' }}>กำลังโหลดสินค้า...</Typography> : visible.length === 0 ? <Box sx={{ py: 8, textAlign: 'center' }}><Typography fontWeight={700}>ไม่พบสินค้า Quick Sale</Typography><Typography color="text.secondary">ค้นหาสินค้าทั้งหมด หรือกำหนด quickSaleEnabled ใน Product</Typography></Box> : <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5 }}>{visible.map(product => { const variant = firstActiveVariant(product)!; return <Button key={product.id} variant="outlined" onClick={() => addProduct(product)} sx={{ minHeight: 126, p: 2, borderRadius: 3.5, textAlign: 'left', alignItems: 'stretch', justifyContent: 'space-between', flexDirection: 'column', textTransform: 'none', bgcolor: 'white', borderColor: product.isHotMenu ? 'primary.light' : 'divider' }}><Typography color="text.primary" fontSize={17} fontWeight={800}>{product.name}</Typography><Box><Typography variant="caption" color="text.secondary">{product.category}</Typography><Typography color="primary" fontWeight={800}>฿{money.format(variant.price)}{variant.name !== 'Default' ? ` · ${variant.name}` : ''}</Typography></Box></Button>; })}</Box>}
      </Paper>
      {!compact && <Paper variant="outlined" sx={{ position: 'sticky', top: 24, height: 'calc(100vh - 48px)', borderRadius: 4, overflow: 'hidden' }}>{cart}</Paper>}
    </Box>
    {compact && <Paper sx={{ position: 'fixed', bottom: 0, left: mobile ? 0 : 92, right: 0, zIndex: 1000, p: 1.5, borderRadius: 0 }}><Button fullWidth variant="contained" size="large" onClick={() => setCartOpen(true)} disabled={!items.length} sx={{ minHeight: 54 }}>ดูรายการ ({items.length}) · ฿{money.format(totals.grandTotal)}</Button></Paper>}
    <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)} PaperProps={{ sx: { width: { xs: '100%', sm: 430 } } }}>{cart}</Drawer>

    <Dialog open={customOpen} onClose={() => setCustomOpen(false)} fullWidth maxWidth="xs"><DialogTitle>เพิ่มรายการอื่น</DialogTitle><DialogContent><Stack gap={2} sx={{ pt: 1 }}><TextField autoFocus label="ชื่อรายการ" value={customName} onChange={event => setCustomName(event.target.value)} /><Stack direction="row" alignItems="center" gap={1}><IconButton sx={touchButton} onClick={() => setCustomQuantity(value => Math.max(1, value - 1))}><RemoveRoundedIcon /></IconButton><TextField label="จำนวน" type="number" value={customQuantity} onChange={event => setCustomQuantity(Math.max(1, Math.floor(Number(event.target.value) || 1)))} /><IconButton sx={touchButton} onClick={() => setCustomQuantity(value => value + 1)}><AddRoundedIcon /></IconButton></Stack><TextField label="ราคา/หน่วย" type="number" value={customPrice} inputProps={{ min: 0, step: .01 }} onChange={event => setCustomPrice(event.target.value)} /></Stack></DialogContent><DialogActions><Button onClick={() => setCustomOpen(false)}>ยกเลิก</Button><Button variant="contained" disabled={!customName.trim() || customPrice === ''} onClick={addCustom}>เพิ่มรายการ</Button></DialogActions></Dialog>

    <Dialog open={checkoutOpen} onClose={() => !submitting && setCheckoutOpen(false)} fullWidth maxWidth="sm"><DialogTitle sx={{ fontWeight: 800 }}>ชำระเงิน <IconButton onClick={() => setCheckoutOpen(false)} sx={{ float: 'right' }}><CloseRoundedIcon /></IconButton></DialogTitle><DialogContent><Stack gap={2.5}><Box textAlign="center"><Typography color="text.secondary">ยอดทั้งหมด</Typography><Typography variant="h3" color="primary" fontWeight={900}>฿{money.format(totals.grandTotal)}</Typography></Box><Typography fontWeight={700}>วิธีชำระเงิน</Typography><Stack direction="row" gap={1.5}><Button fullWidth size="large" variant={paymentMethod === 'cash' ? 'contained' : 'outlined'} onClick={() => setPaymentMethod('cash')} sx={{ minHeight: 56 }}>เงินสด</Button><Button fullWidth size="large" variant={paymentMethod === 'promptpay' ? 'contained' : 'outlined'} onClick={() => setPaymentMethod('promptpay')} sx={{ minHeight: 56 }}>โอนเงิน / PromptPay</Button></Stack>{paymentMethod === 'cash' && <><TextField autoFocus label="จำนวนเงินที่รับ" type="number" value={receivedAmount || ''} inputProps={{ min: 0, step: .01 }} onChange={event => setReceivedAmount(Math.max(0, Number(event.target.value) || 0))} /><Stack direction="row" gap={1} flexWrap="wrap">{[{ label: 'พอดี', value: totals.grandTotal }, { label: '100', value: 100 }, { label: '500', value: 500 }, { label: '1,000', value: 1000 }].map(option => <Button key={option.label} variant="outlined" onClick={() => setReceivedAmount(option.value)} sx={touchButton}>{option.label}</Button>)}</Stack><Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}><Typography color="text.secondary">เงินทอน</Typography><Typography variant="h4" fontWeight={900}>฿{money.format(calculateChange(receivedAmount, totals.grandTotal))}</Typography></Paper>{receivedAmount < totals.grandTotal && <Alert severity="warning">จำนวนเงินที่รับยังไม่ครบ</Alert>}</>}</Stack></DialogContent><DialogActions sx={{ p: 3 }}><Button fullWidth variant="contained" size="large" disabled={submitting || (paymentMethod === 'cash' && receivedAmount < totals.grandTotal)} onClick={() => void submitSale()} sx={{ minHeight: 58, fontWeight: 800 }}>{submitting ? 'กำลังบันทึก...' : 'ยืนยันการขาย'}</Button></DialogActions></Dialog>

    <Dialog open={Boolean(completed)} fullWidth maxWidth="xs"><DialogContent><Stack alignItems="center" gap={2} sx={{ py: 3 }}><Box sx={{ width: 68, height: 68, borderRadius: '50%', bgcolor: 'success.light', color: 'success.dark', display: 'grid', placeItems: 'center', fontSize: 38 }}>✓</Box><Typography variant="h5" fontWeight={900}>ขายสำเร็จ</Typography><Typography variant="h6" color="primary" fontWeight={800}>{completed?.orderNumber}</Typography><Stack direction="row" justifyContent="space-between" width="100%"><Typography>ยอดชำระ</Typography><Typography fontWeight={800}>฿{money.format(completed?.grandTotal ?? 0)}</Typography></Stack><Stack direction="row" justifyContent="space-between" width="100%"><Typography>เงินทอน</Typography><Typography fontWeight={800}>฿{money.format(completed?.changeAmount ?? 0)}</Typography></Stack><Button fullWidth variant="contained" size="large" onClick={startNew}>ขายรายการใหม่</Button><Button fullWidth variant="outlined" onClick={() => completed && globalThis.open(`/print/invoice/${encodeURIComponent(completed.orderId)}`, '_blank')}>พิมพ์ใบเสร็จ</Button></Stack></DialogContent></Dialog>
  </Box>;
}
