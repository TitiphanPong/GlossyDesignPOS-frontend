'use client';

import * as React from 'react';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { canOverridePrice, fetchCurrentAdminRole, type AdminRole } from '@/lib/admin-capabilities';
import { createCustomer, fetchCustomers, getPrimaryCustomerPhoneNumber, type CustomerProfile } from '@/lib/customers';
import { fetchProducts } from '@/lib/products';
import type { Product, ProductVariant } from '@/lib/contracts';
import {
  createQuotation,
  sendQuotation,
  updateQuotation,
  type Quotation,
  type QuotationDraftPayload,
  type QuotationItemRequest,
} from '@/lib/quotations';
import { commonButtonSx, uiCardSx } from '../components/adminUi';
import { quotationDisplayNumber, quotationMoney } from './quotationUi';

type EditableItem = {
  key: string;
  productId?: string;
  productCode?: string;
  typeCode?: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  unit: string;
  description: string;
  previewUnitPrice?: number;
  customName?: string;
  overridePrice?: number;
  overrideReason?: string;
  priceOverrideEnabled?: boolean;
};

type BuilderProps = Readonly<{
  quotation?: Quotation;
  onSaved?: (quotation: Quotation) => void;
  onCancel?: () => void;
}>;

const emptyCustomer = {
  customerName: '',
  phoneNumber: '',
  email: '',
  taxId: '',
  branchType: '',
  branchNo: '',
  address: '',
  subDistrict: '',
  district: '',
  province: '',
  postalCode: '',
};

function itemFromQuotation(item: Quotation['items'][number], index: number): EditableItem {
  return {
    key: `${index}-${item.productId ?? item.quickProductId ?? item.name}`,
    productId: item.productId,
    productCode: item.productCode,
    typeCode: item.typeCode,
    productName: item.name,
    variantId: item.variantId,
    variantName: item.variantName,
    quantity: item.quantity,
    unit: item.unit || 'ชิ้น',
    description: item.description ?? item.productNote ?? '',
    previewUnitPrice: item.authoritativeUnitPrice,
    ...(item.priceOverride
      ? {
          priceOverrideEnabled: true,
          overridePrice: item.authoritativeUnitPrice,
          overrideReason: item.priceOverride.reason,
        }
      : {}),
    ...(!item.productId && !item.quickProductId && !item.productCode && !item.typeCode
      ? {
          customName: item.name,
          priceOverrideEnabled: true,
          overridePrice: item.authoritativeUnitPrice,
          overrideReason: item.priceOverride?.reason ?? 'ราคาอนุมัติจากใบเสนอราคา',
        }
      : {}),
  };
}

function productId(product: Product): string {
  return product._id || product.productId || product.id;
}

function variantId(variant: ProductVariant): string {
  return variant._id || variant.id || variant.name;
}

function toDateInput(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export default function QuotationBuilder({ quotation, onSaved, onCancel }: BuilderProps) {
  const router = useRouter();
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [role, setRole] = React.useState<AdminRole | null>(null);
  const [customers, setCustomers] = React.useState<CustomerProfile[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerProfile | null>(null);
  const [customer, setCustomer] = React.useState({ ...emptyCustomer, ...(quotation?.customerSnapshot ?? {}) });
  const [items, setItems] = React.useState<EditableItem[]>(() => quotation?.items.map(itemFromQuotation) ?? []);
  const [subject, setSubject] = React.useState(quotation?.subject ?? '');
  const [validUntil, setValidUntil] = React.useState(toDateInput(quotation?.validUntil));
  const [discountType, setDiscountType] = React.useState<'amount' | 'percent'>(quotation?.discountType ?? 'amount');
  const [discountValue, setDiscountValue] = React.useState(quotation?.discountValue ?? 0);
  const [taxInvoiceRequested, setTaxInvoiceRequested] = React.useState(quotation?.taxInvoiceRequested ?? false);
  const [notes, setNotes] = React.useState(quotation?.notes ?? '');
  const [terms, setTerms] = React.useState(quotation?.termsAndConditions ?? '');
  const [paymentTerms, setPaymentTerms] = React.useState(quotation?.paymentTerms ?? '');
  const [deliveryTerms, setDeliveryTerms] = React.useState(quotation?.deliveryTerms ?? '');
  const [internalNote, setInternalNote] = React.useState(quotation?.internalNote ?? '');
  const [savedQuotation, setSavedQuotation] = React.useState<Quotation | undefined>(quotation);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [customerDialog, setCustomerDialog] = React.useState(false);
  const [newCustomer, setNewCustomer] = React.useState({ displayName: '', phoneNumber: '', email: '', taxId: '', address: '' });
  const [creatingCustomer, setCreatingCustomer] = React.useState(false);

  React.useEffect(() => {
    void Promise.all([fetchCustomers('', 100), fetchProducts(), fetchCurrentAdminRole()])
      .then(([customerRows, productRows, currentRole]) => {
        setCustomers(customerRows);
        setProducts(productRows.filter(product => product.active));
        setRole(currentRole);
        if (quotation?.customerId) {
          setSelectedCustomer(customerRows.find(row => row._id === quotation.customerId) ?? null);
        }
      })
      .catch(loadError => setError(loadError instanceof Error ? loadError.message : 'โหลดข้อมูลสำหรับใบเสนอราคาไม่สำเร็จ'));
  }, [quotation?.customerId]);

  React.useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const markDirty = React.useCallback(() => setDirty(true), []);

  const selectCustomer = (value: CustomerProfile | null) => {
    setSelectedCustomer(value);
    if (value) {
      setCustomer({
        customerName: value.displayName,
        phoneNumber: getPrimaryCustomerPhoneNumber(value),
        email: value.email ?? '',
        taxId: value.taxId ?? '',
        branchType: value.branchType ?? '',
        branchNo: value.branchNo ?? '',
        address: value.address ?? '',
        subDistrict: value.subDistrict ?? '',
        district: value.district ?? '',
        province: value.province ?? '',
        postalCode: value.postalCode ?? '',
      });
    }
    markDirty();
  };

  const addCatalogItem = () => {
    const first = products[0];
    if (!first) {
      setError('ไม่พบสินค้าที่เปิดใช้งานใน Catalog');
      return;
    }
    const variant = first.variants.find(row => row.active) ?? first.variants[0];
    setItems(current => [
      ...current,
      {
        key: crypto.randomUUID(),
        productId: productId(first),
        productCode: first.code,
        typeCode: first.typeCode,
        productName: first.name,
        variantId: variant ? variantId(variant) : undefined,
        variantName: variant?.name,
        quantity: 1,
        unit: first.unitLabel || 'ชิ้น',
        description: '',
        previewUnitPrice: variant?.price,
      },
    ]);
    markDirty();
  };

  const addCustomItem = () => {
    if (!canOverridePrice(role)) {
      setError('รายการกำหนดราคาเองต้องใช้สิทธิ์ Manager หรือ Admin');
      return;
    }
    setItems(current => [
      ...current,
      {
        key: crypto.randomUUID(),
        productName: 'รายการกำหนดเอง',
        customName: 'รายการกำหนดเอง',
        quantity: 1,
        unit: 'ชิ้น',
        description: '',
        overridePrice: 0,
        overrideReason: '',
      },
    ]);
    markDirty();
  };

  const updateItem = (key: string, patch: Partial<EditableItem>) => {
    setItems(current => current.map(item => (item.key === key ? { ...item, ...patch } : item)));
    markDirty();
  };

  const changeProduct = (key: string, id: string) => {
    const product = products.find(row => productId(row) === id);
    if (!product) return;
    const variant = product.variants.find(row => row.active) ?? product.variants[0];
    updateItem(key, {
      productId: productId(product),
      productCode: product.code,
      typeCode: product.typeCode,
      productName: product.name,
      variantId: variant ? variantId(variant) : undefined,
      variantName: variant?.name,
      previewUnitPrice: variant?.price,
      unit: product.unitLabel || 'ชิ้น',
      customName: undefined,
      overridePrice: undefined,
      overrideReason: undefined,
    });
  };

  const changeVariant = (item: EditableItem, id: string) => {
    const product = products.find(row => productId(row) === item.productId);
    const variant = product?.variants.find(row => variantId(row) === id);
    if (!variant) return;
    updateItem(item.key, { variantId: variantId(variant), variantName: variant.name, previewUnitPrice: variant.price });
  };

  const payload = React.useCallback((): QuotationDraftPayload => {
    const requestItems: QuotationItemRequest[] = items.map(item => {
      if (item.customName) {
        const overridePrice = Number(item.overridePrice);
        const overrideReason = item.overrideReason?.trim();
        return {
          customName: item.customName,
          quantity: Math.max(1, Number(item.quantity) || 1),
          unit: item.unit || 'ชิ้น',
          description: item.description || undefined,
          ...(Number.isFinite(overridePrice) && overridePrice > 0 && overrideReason
            ? {
                priceOverride: {
                  unitPrice: overridePrice,
                  reason: overrideReason,
                },
              }
            : {}),
        };
      }
      return {
        productId: item.productId,
        productCode: item.productCode,
        typeCode: item.typeCode,
        variantId: item.variantId,
        variantName: item.variantName,
        quantity: Math.max(1, Number(item.quantity) || 1),
        unit: item.unit || 'ชิ้น',
        description: item.description || undefined,
      };
    });
    return {
      ...(selectedCustomer ? { customerId: selectedCustomer._id } : {}),
      customerSnapshot: Object.fromEntries(Object.entries(customer).filter(([, value]) => value?.trim())) as QuotationDraftPayload['customerSnapshot'],
      items: requestItems,
      discount: {
        type: discountType,
        value: Math.max(0, Number(discountValue) || 0),
      },
      taxInvoiceRequested,
      ...(validUntil ? { validUntil } : {}),
      subject: subject.trim() || undefined,
      notes: notes.trim() || undefined,
      termsAndConditions: terms.trim() || undefined,
      paymentTerms: paymentTerms.trim() || undefined,
      deliveryTerms: deliveryTerms.trim() || undefined,
      internalNote: internalNote.trim() || undefined,
    };
  }, [customer, deliveryTerms, discountType, discountValue, internalNote, items, notes, paymentTerms, selectedCustomer, subject, taxInvoiceRequested, terms, validUntil]);

  const saveDraft = async (): Promise<Quotation | null> => {
    setSaving(true);
    setError(null);
    try {
      const result = savedQuotation
        ? await updateQuotation(savedQuotation._id, savedQuotation.version, payload())
        : await createQuotation(payload());
      setSavedQuotation(result);
      setDirty(false);
      setNotice('บันทึกร่างแล้ว');
      onSaved?.(result);
      return result;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'บันทึกร่างไม่สำเร็จ');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const send = async () => {
    if (!customer.customerName.trim()) {
      setError('กรุณาระบุชื่อลูกค้าก่อนส่งใบเสนอราคา');
      return;
    }
    if (items.length === 0) {
      setError('กรุณาเพิ่มอย่างน้อย 1 รายการก่อนส่งใบเสนอราคา');
      return;
    }
    if (!validUntil) {
      setError('กรุณาระบุวันหมดอายุก่อนส่งใบเสนอราคา');
      return;
    }
    const draft = dirty || !savedQuotation ? await saveDraft() : savedQuotation;
    if (!draft) return;
    setSaving(true);
    try {
      const sent = await sendQuotation(draft._id, draft.version);
      setSavedQuotation(sent);
      setDirty(false);
      onSaved?.(sent);
      router.push(`/home/quotations/${encodeURIComponent(sent._id)}`);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'ส่งใบเสนอราคาไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const createNewCustomer = async () => {
    if (!newCustomer.displayName.trim()) return;
    setCreatingCustomer(true);
    try {
      const created = await createCustomer({
        displayName: newCustomer.displayName.trim(),
        phoneNumber: newCustomer.phoneNumber.trim() || undefined,
        phoneNumbers: newCustomer.phoneNumber.trim() ? [newCustomer.phoneNumber.trim()] : [],
        email: newCustomer.email.trim() || undefined,
        taxId: newCustomer.taxId.trim() || undefined,
        address: newCustomer.address.trim() || undefined,
      });
      setCustomers(current => [created, ...current]);
      selectCustomer(created);
      setCustomerDialog(false);
      setNewCustomer({ displayName: '', phoneNumber: '', email: '', taxId: '', address: '' });
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'สร้างลูกค้าไม่สำเร็จ');
    } finally {
      setCreatingCustomer(false);
    }
  };

  const backendSummary = savedQuotation;

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.7fr) minmax(320px, 0.75fr)' },
          gap: 2,
          alignItems: 'start',
          minWidth: 0,
        }}>
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          {error ? <Alert severity="error" onClose={() => setError(null)}>{error}</Alert> : null}

          <Card sx={uiCardSx}>
            <CardContent>
              <Stack spacing={1.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>ลูกค้า</Typography>
                    <Typography variant="body2" color="text.secondary">เลือกจากฐานลูกค้า หรือกรอก Snapshot สำหรับเอกสารนี้</Typography>
                  </Box>
                  <Button startIcon={<PersonAddAltRoundedIcon />} onClick={() => setCustomerDialog(true)} sx={commonButtonSx}>สร้างลูกค้าใหม่</Button>
                </Stack>
                <Autocomplete
                  options={customers}
                  value={selectedCustomer}
                  onChange={(_, value) => selectCustomer(value)}
                  getOptionLabel={option => `${option.displayName}${getPrimaryCustomerPhoneNumber(option) ? ` · ${getPrimaryCustomerPhoneNumber(option)}` : ''}`}
                  renderInput={params => <TextField {...params} label="ค้นหา/เลือกลูกค้า" />}
                />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.25 }}>
                  <TextField label="ชื่อลูกค้า" value={customer.customerName} onChange={event => { setCustomer(row => ({ ...row, customerName: event.target.value })); markDirty(); }} />
                  <TextField label="เบอร์โทรศัพท์" value={customer.phoneNumber} onChange={event => { setCustomer(row => ({ ...row, phoneNumber: event.target.value })); markDirty(); }} />
                  <TextField label="อีเมล" value={customer.email} onChange={event => { setCustomer(row => ({ ...row, email: event.target.value })); markDirty(); }} />
                  <TextField label="เลขประจำตัวผู้เสียภาษี" value={customer.taxId} onChange={event => { setCustomer(row => ({ ...row, taxId: event.target.value })); markDirty(); }} />
                  <TextField label="ประเภทสาขา" value={customer.branchType} onChange={event => { setCustomer(row => ({ ...row, branchType: event.target.value })); markDirty(); }} />
                  <TextField label="เลขสาขา" value={customer.branchNo} onChange={event => { setCustomer(row => ({ ...row, branchNo: event.target.value })); markDirty(); }} />
                  <TextField label="ที่อยู่" value={customer.address} onChange={event => { setCustomer(row => ({ ...row, address: event.target.value })); markDirty(); }} sx={{ gridColumn: { sm: '1 / -1' } }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={uiCardSx}>
            <CardContent>
              <Stack spacing={1.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>รายการสินค้าและสเปก</Typography>
                    <Typography variant="body2" color="text.secondary">ราคาที่เห็นระหว่างแก้เป็น Preview; Backend จะ resolve ราคาใหม่ตอนบันทึก</Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button startIcon={<AddRoundedIcon />} variant="outlined" onClick={addCatalogItem}>เพิ่มสินค้า</Button>
                    {canOverridePrice(role) ? <Button startIcon={<AddRoundedIcon />} variant="outlined" onClick={addCustomItem}>รายการกำหนดเอง</Button> : null}
                  </Stack>
                </Stack>
                {items.length === 0 ? (
                  <Box sx={{ border: '1px dashed #CBD5E1', borderRadius: 3, p: 3, textAlign: 'center' }}>
                    <Typography fontWeight={700}>ยังไม่มีรายการสินค้า</Typography>
                    <Typography variant="body2" color="text.secondary">Draft สามารถบันทึกไว้ก่อนได้ และค่อยเพิ่มรายการก่อนส่ง</Typography>
                  </Box>
                ) : null}
                {items.map((item, index) => {
                  const product = products.find(row => productId(row) === item.productId);
                  const variants = product?.variants.filter(row => row.active) ?? [];
                  return (
                    <Box key={item.key} sx={{ border: '1px solid #E2E8F0', borderRadius: 3, p: { xs: 1.5, sm: 2 } }}>
                      <Stack spacing={1.25}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography fontWeight={800}>รายการที่ {index + 1}</Typography>
                          <IconButton aria-label={`ลบรายการที่ ${index + 1}`} onClick={() => { setItems(current => current.filter(row => row.key !== item.key)); markDirty(); }}><DeleteOutlineRoundedIcon /></IconButton>
                        </Stack>
                        {item.customName ? (
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 1.25 }}>
                            <TextField label="ชื่อรายการ" value={item.customName} onChange={event => updateItem(item.key, { customName: event.target.value, productName: event.target.value })} />
                            <TextField label="ราคาอนุมัติต่อหน่วย" type="number" value={item.overridePrice ?? 0} onChange={event => updateItem(item.key, { overridePrice: Number(event.target.value) })} />
                            <TextField label="เหตุผลการกำหนดราคา" value={item.overrideReason ?? ''} onChange={event => updateItem(item.key, { overrideReason: event.target.value })} sx={{ gridColumn: { sm: '1 / -1' } }} />
                          </Box>
                        ) : (
                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 2fr) minmax(0, 1fr)' }, gap: 1.25 }}>
                            <TextField select label="สินค้า" value={item.productId ?? ''} onChange={event => changeProduct(item.key, event.target.value)}>
                              {products.map(row => <MenuItem key={productId(row)} value={productId(row)}>{row.name}</MenuItem>)}
                            </TextField>
                            <TextField select label="Variant" value={item.variantId ?? ''} onChange={event => changeVariant(item, event.target.value)} disabled={variants.length === 0}>
                              {variants.map(row => <MenuItem key={variantId(row)} value={variantId(row)}>{row.name} · {quotationMoney.format(row.price)}</MenuItem>)}
                            </TextField>
                          </Box>
                        )}
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '120px 140px minmax(0, 1fr)' }, gap: 1.25 }}>
                          <TextField label="จำนวน" type="number" inputProps={{ min: 1 }} value={item.quantity} onChange={event => updateItem(item.key, { quantity: Number(event.target.value) })} />
                          <TextField label="หน่วย" value={item.unit} onChange={event => updateItem(item.key, { unit: event.target.value })} />
                          <TextField label="รายละเอียด / Specification" value={item.description} onChange={event => updateItem(item.key, { description: event.target.value })} sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }} />
                        </Box>
                        {item.previewUnitPrice != null && !item.customName ? <Typography variant="caption" color="text.secondary">ราคา Catalog Preview: {quotationMoney.format(item.previewUnitPrice)} / {item.unit}</Typography> : null}
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>

          <Card sx={uiCardSx}>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="h6" fontWeight={800}>รายละเอียดเอกสารและเงื่อนไข</Typography>
                <TextField label="หัวเรื่อง / Subject" value={subject} onChange={event => { setSubject(event.target.value); markDirty(); }} />
                <TextField label="ใช้ได้ถึงวันที่" type="date" value={validUntil} onChange={event => { setValidUntil(event.target.value); markDirty(); }} slotProps={{ inputLabel: { shrink: true } }} />
                <TextField label="หมายเหตุ" multiline minRows={2} value={notes} onChange={event => { setNotes(event.target.value); markDirty(); }} />
                <TextField label="Terms & Conditions" multiline minRows={3} value={terms} onChange={event => { setTerms(event.target.value); markDirty(); }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25 }}>
                  <TextField label="เงื่อนไขการชำระเงิน" multiline minRows={2} value={paymentTerms} onChange={event => { setPaymentTerms(event.target.value); markDirty(); }} />
                  <TextField label="เงื่อนไขการส่งมอบ" multiline minRows={2} value={deliveryTerms} onChange={event => { setDeliveryTerms(event.target.value); markDirty(); }} />
                </Box>
                <TextField label="บันทึกภายใน (ไม่พิมพ์บนใบเสนอราคา)" multiline minRows={2} value={internalNote} onChange={event => { setInternalNote(event.target.value); markDirty(); }} />
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        <Card
          sx={{
            ...uiCardSx,
            position: { lg: 'sticky' },
            top: { lg: 20 },
            alignSelf: 'start',
            overflow: 'hidden',
          }}>
          <CardContent>
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="overline" color="text.secondary">ใบเสนอราคา</Typography>
                <Typography fontWeight={900} sx={{ overflowWrap: 'anywhere' }}>{quotationDisplayNumber(backendSummary?.quotationNumber)}</Typography>
                <Typography variant="body2" color="text.secondary">Revision {backendSummary?.revision ?? 0}</Typography>
              </Box>
              <Divider />
              <Typography fontWeight={800}>การเงิน</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 0.75 }}>
                <Typography color="text.secondary">Subtotal</Typography><Typography>{backendSummary ? quotationMoney.format(backendSummary.subtotal) : 'ยืนยันหลังบันทึก'}</Typography>
                <Typography color="text.secondary">ส่วนลด</Typography><Typography>{backendSummary ? quotationMoney.format(backendSummary.discount) : '-'}</Typography>
                <Typography color="text.secondary">VAT</Typography><Typography>{backendSummary ? quotationMoney.format(backendSummary.vatAmount) : '-'}</Typography>
                <Typography fontWeight={900}>ยอดรวม</Typography><Typography fontWeight={900} color="primary.main">{backendSummary ? quotationMoney.format(backendSummary.grandTotal) : 'ยืนยันหลังบันทึก'}</Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 110px', gap: 1 }}>
                <TextField select size="small" label="ส่วนลด" value={discountType} onChange={event => { setDiscountType(event.target.value as 'amount' | 'percent'); markDirty(); }}>
                  <MenuItem value="amount">บาท</MenuItem>
                  <MenuItem value="percent">%</MenuItem>
                </TextField>
                <TextField size="small" label="ค่า" type="number" inputProps={{ min: 0 }} value={discountValue} onChange={event => { setDiscountValue(Number(event.target.value)); markDirty(); }} />
              </Box>
              <FormControlLabel control={<Checkbox checked={taxInvoiceRequested} onChange={event => { setTaxInvoiceRequested(event.target.checked); markDirty(); }} />} label="ลูกค้าต้องการใบกำกับภาษี (VAT 7%)" />
              <Alert severity="info">ยอดทั้งหมดด้านบนมาจาก Backend หลัง Save Draft เท่านั้น เพื่อป้องกันสูตร Frontend ไม่ตรงกับ Order</Alert>
              {!mobile ? (
                <Stack spacing={1}>
                  <Button variant="outlined" startIcon={<SaveRoundedIcon />} disabled={saving} onClick={() => void saveDraft()} sx={commonButtonSx}>{saving ? 'กำลังบันทึก...' : 'บันทึกร่าง'}</Button>
                  <Button variant="contained" startIcon={<SendRoundedIcon />} disabled={saving} onClick={() => void send()} sx={commonButtonSx}>ส่งใบเสนอราคา</Button>
                  {onCancel ? <Button onClick={onCancel}>ยกเลิกการแก้ไข</Button> : null}
                </Stack>
              ) : null}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {mobile ? (
        <Box sx={{ position: 'sticky', bottom: 0, zIndex: 10, mt: 2, mx: -2, px: 2, pt: 1, pb: 'calc(12px + env(safe-area-inset-bottom))', bgcolor: 'rgba(255,255,255,0.96)', borderTop: '1px solid #E2E8F0', backdropFilter: 'blur(10px)' }}>
          <Stack direction="row" spacing={1}>
            <Button fullWidth variant="outlined" startIcon={<SaveRoundedIcon />} disabled={saving} onClick={() => void saveDraft()}>บันทึกร่าง</Button>
            <Button fullWidth variant="contained" startIcon={<SendRoundedIcon />} disabled={saving} onClick={() => void send()}>ส่งใบเสนอราคา</Button>
          </Stack>
        </Box>
      ) : null}

      <Dialog open={customerDialog} onClose={() => (creatingCustomer ? undefined : setCustomerDialog(false))} fullWidth maxWidth="sm">
        <DialogTitle>สร้างลูกค้าใหม่</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <TextField autoFocus required label="ชื่อลูกค้า" value={newCustomer.displayName} onChange={event => setNewCustomer(row => ({ ...row, displayName: event.target.value }))} />
            <TextField label="เบอร์โทรศัพท์" value={newCustomer.phoneNumber} onChange={event => setNewCustomer(row => ({ ...row, phoneNumber: event.target.value }))} />
            <TextField label="อีเมล" value={newCustomer.email} onChange={event => setNewCustomer(row => ({ ...row, email: event.target.value }))} />
            <TextField label="เลขประจำตัวผู้เสียภาษี" value={newCustomer.taxId} onChange={event => setNewCustomer(row => ({ ...row, taxId: event.target.value }))} />
            <TextField label="ที่อยู่" multiline minRows={2} value={newCustomer.address} onChange={event => setNewCustomer(row => ({ ...row, address: event.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomerDialog(false)} disabled={creatingCustomer}>ยกเลิก</Button>
          <Button variant="contained" disabled={!newCustomer.displayName.trim() || creatingCustomer} onClick={() => void createNewCustomer()}>{creatingCustomer ? 'กำลังสร้าง...' : 'สร้างลูกค้า'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(notice)} autoHideDuration={2500} onClose={() => setNotice(null)} message={notice ?? ''} />
    </>
  );
}
