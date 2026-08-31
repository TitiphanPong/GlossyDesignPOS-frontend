'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, Box, Button, CircularProgress, Drawer, Snackbar, Stack, TextField, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import { isMissingApiBaseError } from '../../../../lib/api';
import { createInvoiceOrderFromNormalizedOrder, type CustomerInfo, type NormalizedInvoiceOrder } from '../../../../lib/contracts';
import { fetchOrderById, getOrderTrackingAccess, updateOrderCustomerInfo } from '../../../../lib/orders';
import { getMissingCompanyConfigFields, InvoiceDocument, InvoiceMobilePreview } from './InvoiceDocument';
import { PrintDocumentLayout } from './PrintDocumentLayout';
import { getInvoiceDocumentMeta, resolveInvoiceDocumentType } from '../../../home/invoice/[orderId]/invoice-utils';

type PrintInvoicePageProps = Readonly<{
  params: Promise<{ orderId: string }>;
}>;

type CustomerFormValues = {
  customerName: string;
  taxId: string;
  address: string;
  itemNames: string[];
};

function LoadingState({ documentTitle }: Readonly<{ documentTitle: string }>) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#F8FAFC', px: 2 }}>
      <Stack spacing={2} alignItems="center">
        <CircularProgress size={30} sx={{ color: '#0F172A' }} />
        <Typography sx={{ fontSize: 14, color: '#475569' }}>กำลังโหลดเอกสาร{documentTitle}...</Typography>
      </Stack>
    </Box>
  );
}

function ErrorState({ title, subtitle }: Readonly<{ title: string; subtitle: string }>) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#F8FAFC', px: 2 }}>
      <Stack spacing={1.2} alignItems="center" sx={{ maxWidth: 520, textAlign: 'center' }}>
        <Typography sx={{ fontSize: 24, fontWeight: 800, color: '#0F172A' }}>{title}</Typography>
        <Typography sx={{ fontSize: 14, color: '#64748B' }}>{subtitle}</Typography>
      </Stack>
    </Box>
  );
}

function normalizeOptionalValue(value: string | undefined): string | undefined {
  return value && value !== '-' ? value : undefined;
}

function resolvePrefilledTaxId(order: NormalizedInvoiceOrder): string | undefined {
  const phoneNumber = normalizeOptionalValue(order.customerInfo.phoneNumber || order.phoneNumber);
  const taxId = normalizeOptionalValue(order.customerInfo.taxId || order.taxId);

  if (!taxId) {
    return undefined;
  }

  return phoneNumber && taxId === phoneNumber ? undefined : taxId;
}

function getCustomerInfoFromOrder(order: NormalizedInvoiceOrder): CustomerInfo {
  return {
    customerName: order.customerInfo.customerName || order.customerName,
    phoneNumber: order.customerInfo.phoneNumber || normalizeOptionalValue(order.phoneNumber),
    email: order.customerInfo.email || normalizeOptionalValue(order.email),
    taxId: resolvePrefilledTaxId(order),
    branchType: order.customerInfo.branchType,
    branchNo: order.customerInfo.branchNo,
    address: order.customerInfo.address || normalizeOptionalValue(order.address),
    subDistrict: order.customerInfo.subDistrict,
    district: order.customerInfo.district,
    province: order.customerInfo.province,
    postalCode: order.customerInfo.postalCode,
    shippingAddress: order.customerInfo.shippingAddress,
  };
}

function createFormValues(customerInfo: CustomerInfo, itemNames: string[] = []): CustomerFormValues {
  return {
    customerName: customerInfo.customerName || '',
    taxId: customerInfo.taxId || '',
    address: customerInfo.address || '',
    itemNames,
  };
}

function applyCustomerInfoToOrder(order: NormalizedInvoiceOrder, values: CustomerFormValues): NormalizedInvoiceOrder {
  return {
    ...order,
    customerName: values.customerName.trim() || '-',
    taxId: values.taxId.trim() || '-',
    address: values.address.trim() || '-',
    cart: order.cart.map((item, index) => ({ ...item, name: values.itemNames[index]?.trim() || item.name })),
    customerInfo: {
      ...order.customerInfo,
      customerName: values.customerName.trim() || '-',
      taxId: values.taxId.trim() || undefined,
      address: values.address.trim() || undefined,
    },
  };
}

type CustomerEditDrawerProps = Readonly<{
  open: boolean;
  saving: boolean;
  errorMessage: string | null;
  formValues: CustomerFormValues;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: keyof CustomerFormValues, value: CustomerFormValues[keyof CustomerFormValues]) => void;
}>;

function CustomerEditDrawer({ open, saving, errorMessage, formValues, onClose, onSave, onChange }: CustomerEditDrawerProps) {
  const customerFieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      bgcolor: '#FFFFFF',
      '& fieldset': { borderColor: '#CBD5E1', transition: 'border-color 160ms ease, box-shadow 160ms ease' },
      '&:hover fieldset': { borderColor: '#94A3B8' },
      '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: 1, boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.10)' },
    },
    '& .MuiInputLabel-root': { color: '#64748B', fontSize: 14 },
    '& .MuiInputLabel-root.Mui-focused': { color: '#1D4ED8' },
    '& .MuiInputBase-input': { color: '#1E293B', fontSize: 15 },
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 520, md: 560 },
            bgcolor: '#F8FAFC',
            boxShadow: '-18px 0 45px rgba(15, 23, 42, 0.14)',
          },
        },
      }}>
      <Stack sx={{ height: '100%' }}>
        <Box sx={{ position: 'relative', px: { xs: 2.5, sm: 3.5 }, pt: 3, pb: 3, bgcolor: '#0F172A', color: '#FFFFFF', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', width: 180, height: 180, right: -70, top: -90, border: '1px solid rgba(147,197,253,0.28)', borderRadius: '50%' }} />
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ position: 'relative' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 42, height: 42, borderRadius: '12px', display: 'grid', placeItems: 'center', bgcolor: '#2563EB', color: '#FFFFFF' }}>
                <PersonOutlineRoundedIcon />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1 }}>ข้อมูลลูกค้า</Typography>
                <Typography sx={{ mt: 0.6, fontSize: 12.5, color: '#BFDBFE', lineHeight: 1.3 }}>Billing & tax invoice details</Typography>
              </Box>
            </Stack>
            <Button
              onClick={onClose}
              aria-label="ปิด"
              sx={{ minWidth: 36, width: 36, height: 36, p: 0, borderRadius: '10px', color: '#CBD5E1', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#FFFFFF' } }}>
              <CloseRoundedIcon />
            </Button>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', px: { xs: 2.5, sm: 3.5 }, py: 3, bgcolor: '#F1F5F9' }}>
          <Stack spacing={2.5}>
            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

            <Stack spacing={1.5} sx={{ p: { xs: 2, sm: 2.5 }, border: '1px solid #E2E8F0', borderRadius: '14px', bgcolor: '#FFFFFF', boxShadow: '0 5px 16px rgba(15, 23, 42, 0.04)' }}>
              <Box sx={{ pl: 1.5, borderLeft: '3px solid #2563EB' }}>
                <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>แก้ไขข้อมูล</Typography>
                <Typography sx={{ mt: 0.4, fontSize: 12.5, color: '#64748B' }}>ข้อมูลนี้จะแสดงบนใบเสร็จและใบกำกับภาษี</Typography>
              </Box>
              <TextField sx={customerFieldSx} label="ชื่อลูกค้า" value={formValues.customerName} onChange={event => onChange('customerName', event.target.value)} fullWidth />
              <TextField sx={customerFieldSx} label="ที่อยู่" value={formValues.address} onChange={event => onChange('address', event.target.value)} fullWidth multiline minRows={4} />
              <TextField sx={customerFieldSx} label="เลขประจำตัวผู้เสียภาษี" value={formValues.taxId} onChange={event => onChange('taxId', event.target.value)} fullWidth />
              {formValues.itemNames.map((itemName, index) => (
                <TextField
                  key={itemName || 'item-name'}
                  sx={customerFieldSx}
                  label={`ชื่อรายการที่ ${index + 1}`}
                  value={itemName}
                  onChange={event =>
                    onChange(
                      'itemNames',
                      formValues.itemNames.map((name, itemIndex) => (itemIndex === index ? event.target.value : name))
                    )
                  }
                  fullWidth
                />
              ))}
            </Stack>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ px: { xs: 2.5, sm: 3.5 }, py: 2.25, borderTop: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={saving}
            sx={{
              minHeight: 42,
              px: 2.4,
              borderRadius: '10px',
              borderColor: '#E5E7EB',
              color: '#0F172A',
              fontWeight: 700,
              textTransform: 'none',
            }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={onSave}
            disabled={saving}
            startIcon={<SaveRoundedIcon />}
            sx={{
              minHeight: 42,
              px: 2.6,
              borderRadius: '10px',
              bgcolor: '#2563EB',
              boxShadow: '0 10px 24px rgba(37, 99, 235, 0.22)',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#1D4ED8',
              },
            }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

export function PrintInvoicePage({ params }: PrintInvoicePageProps) {
  const { orderId } = use(params);
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<NormalizedInvoiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [missingApiBase, setMissingApiBase] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [drawerError, setDrawerError] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [trackingOrigin, setTrackingOrigin] = useState<string | null>(null);
  const [trackingToken, setTrackingToken] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<CustomerFormValues>({
    customerName: '',
    taxId: '',
    address: '',
    itemNames: [],
  });

  useEffect(() => {
    setTrackingOrigin(globalThis.location?.origin ?? null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      try {
        const data = await fetchOrderById(orderId);
        if (!mounted) {
          return;
        }

        const normalized = createInvoiceOrderFromNormalizedOrder(data);
        setOrder(normalized);
        setFormValues(
          createFormValues(
            getCustomerInfoFromOrder(normalized),
            normalized.cart.map(item => item.name)
          )
        );
        setLoadError(null);
        void getOrderTrackingAccess(data._id)
          .then(access => {
            if (mounted) setTrackingToken(access.token);
          })
          .catch(() => {
            if (mounted) setTrackingToken(null);
          });
      } catch (error) {
        if (!mounted) {
          return;
        }

        if (isMissingApiBaseError(error)) {
          setMissingApiBase(true);
          return;
        }

        console.error('Failed to load print invoice:', error);
        setLoadError(error instanceof Error && error.message ? error.message : 'ไม่สามารถโหลดเอกสารใบกำกับภาษีได้');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      mounted = false;
    };
  }, [orderId]);

  const documentType = useMemo(() => resolveInvoiceDocumentType(searchParams.get('documentType'), order, order?.taxInvoice), [order, searchParams]);
  const documentMeta = getInvoiceDocumentMeta(documentType);
  const missingCompanyConfig = useMemo(() => getMissingCompanyConfigFields(), []);

  const handleOpenDrawer = () => {
    if (!order) {
      return;
    }

    setFormValues(
      createFormValues(
        getCustomerInfoFromOrder(order),
        order.cart.map(item => item.name)
      )
    );
    setDrawerError(null);
    setDrawerOpen(true);
  };

  const handleChangeFormValue = (field: keyof CustomerFormValues, value: CustomerFormValues[keyof CustomerFormValues]) => {
    setFormValues(current => ({ ...current, [field]: value }));
  };

  const handleSaveCustomer = async () => {
    if (!order) {
      return;
    }

    const previousOrder = order;
    const optimisticOrder = applyCustomerInfoToOrder(order, formValues);

    setOrder(optimisticOrder);
    setSavingCustomer(true);
    setDrawerError(null);

    try {
      const updatedOrder = await updateOrderCustomerInfo(order.orderId, {
        customerName: formValues.customerName.trim() || '-',
        taxId: formValues.taxId.trim() || undefined,
        address: formValues.address.trim() || undefined,
        itemNames: formValues.itemNames,
      });
      const normalized = createInvoiceOrderFromNormalizedOrder(updatedOrder);

      setOrder(normalized);
      setFormValues(
        createFormValues(
          getCustomerInfoFromOrder(normalized),
          normalized.cart.map(item => item.name)
        )
      );
      setDrawerOpen(false);
      setSnackbarMessage('Customer information updated successfully.');
    } catch (error) {
      setOrder(previousOrder);
      setDrawerError(error instanceof Error && error.message ? error.message : 'Unable to save customer information.');
    } finally {
      setSavingCustomer(false);
    }
  };

  if (loading) {
    return <LoadingState documentTitle={documentMeta.titleTh} />;
  }

  if (missingApiBase) {
    return <ErrorState title="ยังไม่สามารถสร้างเอกสารได้" subtitle="กรุณาตั้งค่า NEXT_PUBLIC_API_URL ก่อนใช้งานหน้าพิมพ์เอกสารนี้" />;
  }

  if (!order) {
    return <ErrorState title={`ไม่พบข้อมูล${documentMeta.titleTh}`} subtitle={loadError ?? 'ไม่พบข้อมูลออเดอร์ที่ต้องการพิมพ์ กรุณากลับไปตรวจสอบรายการอีกครั้ง'} />;
  }

  if (missingCompanyConfig.length > 0) {
    return <ErrorState title="ยังไม่สามารถพิมพ์เอกสารได้" subtitle={`กรุณาตั้งค่าข้อมูลบริษัทให้ครบก่อนออกเอกสาร: ${missingCompanyConfig.join(', ')}`} />;
  }

  if (documentType === 'tax-invoice' && order.taxInvoice !== 'yes') {
    return <ErrorState title="ไม่สามารถเปิดใบกำกับภาษีได้" subtitle="รายการนี้ไม่ได้เลือกออกใบกำกับภาษี กรุณาเปิดเป็นใบเสร็จรับเงินแทน" />;
  }

  return (
    <>
      <PrintDocumentLayout
        titleTh={documentMeta.titleTh}
        titleEn={documentMeta.titleEn}
        invoiceNumber={`#${documentType === 'tax-invoice' ? order.invoiceNumber || order.orderNumber || order.orderId : order.orderNumber || order.orderId}`}
        documentType={documentType}
        onEditCustomer={handleOpenDrawer}
        mobilePreviewDocument={
          documentType === 'receipt' ? undefined : <InvoiceMobilePreview documentType={documentType} order={order} trackingOrigin={trackingOrigin} trackingToken={trackingToken} />
        }
        printableDocument={<InvoiceDocument documentType={documentType} order={order} trackingOrigin={trackingOrigin} trackingToken={trackingToken} />}
      />

      <CustomerEditDrawer
        open={drawerOpen}
        saving={savingCustomer}
        errorMessage={drawerError}
        formValues={formValues}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSaveCustomer}
        onChange={handleChangeFormValue}
      />

      <Snackbar open={Boolean(snackbarMessage)} autoHideDuration={3200} onClose={() => setSnackbarMessage(null)} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbarMessage(null)} severity="success" variant="filled" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
