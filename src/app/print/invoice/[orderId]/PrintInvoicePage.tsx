'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, Box, Button, CircularProgress, Divider, Drawer, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { isMissingApiBaseError } from '../../../../lib/api';
import { type CustomerInfo, type NormalizedInvoiceOrder, normalizeApiOrderForInvoice } from '../../../../lib/contracts';
import { fetchOrderById, updateOrderCustomerInfo } from '../../../../lib/orders';
import { InvoiceDocument } from './InvoiceDocument';
import { PrintDocumentLayout } from './PrintDocumentLayout';
import { resolveInvoiceDocumentType } from '../../../home/invoice/[orderId]/invoice-utils';

type PrintInvoicePageProps = Readonly<{
  params: Promise<{ orderId: string }>;
}>;

type CustomerFormValues = {
  customerName: string;
  taxId: string;
  address: string;
};

function LoadingState() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#F8FAFC', px: 2 }}>
      <Stack spacing={2} alignItems="center">
        <CircularProgress size={30} sx={{ color: '#0F172A' }} />
        <Typography sx={{ fontSize: 14, color: '#475569' }}>กำลังโหลดเอกสารใบกำกับภาษี...</Typography>
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

function getCustomerInfoFromOrder(order: NormalizedInvoiceOrder): CustomerInfo {
  return {
    customerName: order.customerInfo.customerName || order.customerName,
    phoneNumber: order.customerInfo.phoneNumber || (order.phoneNumber !== '-' ? order.phoneNumber : undefined),
    email: order.customerInfo.email || (order.email !== '-' ? order.email : undefined),
    taxId: order.customerInfo.taxId || (order.taxId !== '-' ? order.taxId : undefined),
    branchType: order.customerInfo.branchType,
    branchNo: order.customerInfo.branchNo,
    address: order.customerInfo.address || (order.address !== '-' ? order.address : undefined),
    subDistrict: order.customerInfo.subDistrict,
    district: order.customerInfo.district,
    province: order.customerInfo.province,
    postalCode: order.customerInfo.postalCode,
    shippingAddress: order.customerInfo.shippingAddress,
  };
}

function createFormValues(customerInfo: CustomerInfo): CustomerFormValues {
  return {
    customerName: customerInfo.customerName || '',
    taxId: customerInfo.taxId || '',
    address: customerInfo.address || '',
  };
}

function applyCustomerInfoToOrder(order: NormalizedInvoiceOrder, values: CustomerFormValues): NormalizedInvoiceOrder {
  return {
    ...order,
    customerName: values.customerName.trim() || '-',
    taxId: values.taxId.trim() || '-',
    address: values.address.trim() || '-',
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
  onChange: (field: keyof CustomerFormValues, value: string) => void;
}>;

function CustomerEditDrawer({ open, saving, errorMessage, formValues, onClose, onSave, onChange }: CustomerEditDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', md: 520 },
          bgcolor: '#FFFFFF',
        },
      }}>
      <Stack sx={{ height: '100%' }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #E5E7EB' }}>
          <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#0F172A' }}>Customer Information</Typography>
          <Typography sx={{ mt: 0.7, fontSize: 13, color: '#64748B' }}>Manage billing and tax invoice information</Typography>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
          <Stack spacing={3}>
            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

            <Stack spacing={1.6}>
              <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#0F172A' }}>Editable Fields</Typography>
              <TextField label="Customer Name" value={formValues.customerName} onChange={event => onChange('customerName', event.target.value)} fullWidth />
              <TextField label="Tax ID" value={formValues.taxId} onChange={event => onChange('taxId', event.target.value)} fullWidth />
              <TextField label="Address" value={formValues.address} onChange={event => onChange('address', event.target.value)} fullWidth multiline minRows={4} />
            </Stack>

            <Divider sx={{ borderColor: '#E5E7EB' }} />

            <Typography sx={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
              ฟอร์มนี้แก้ไขได้เฉพาะชื่อลูกค้า เลขประจำตัวผู้เสียภาษีลูกค้า และที่อยู่ลูกค้าเท่านั้น
            </Typography>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ px: 3, py: 2.25, borderTop: '1px solid #E5E7EB' }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={saving}
            sx={{
              minHeight: 42,
              px: 2.4,
              borderRadius: '12px',
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
            sx={{
              minHeight: 42,
              px: 2.6,
              borderRadius: '12px',
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
  const [formValues, setFormValues] = useState<CustomerFormValues>({
    customerName: '',
    taxId: '',
    address: '',
  });

  useEffect(() => {
    let mounted = true;

    const loadOrder = async () => {
      try {
        const data = await fetchOrderById(orderId);
        if (!mounted) {
          return;
        }

        const normalized = normalizeApiOrderForInvoice(data);
        setOrder(normalized);
        setFormValues(createFormValues(getCustomerInfoFromOrder(normalized)));
        setLoadError(null);
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

  const handleOpenDrawer = () => {
    if (!order) {
      return;
    }

    setFormValues(createFormValues(getCustomerInfoFromOrder(order)));
    setDrawerError(null);
    setDrawerOpen(true);
  };

  const handleChangeFormValue = (field: keyof CustomerFormValues, value: string) => {
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
        ...getCustomerInfoFromOrder(order),
        customerName: formValues.customerName.trim() || '-',
        taxId: formValues.taxId.trim() || undefined,
        address: formValues.address.trim() || undefined,
      });
      const normalized = normalizeApiOrderForInvoice(updatedOrder);

      setOrder(normalized);
      setFormValues(createFormValues(getCustomerInfoFromOrder(normalized)));
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
    return <LoadingState />;
  }

  if (missingApiBase) {
    return <ErrorState title="ยังไม่สามารถสร้างเอกสารได้" subtitle="กรุณาตั้งค่า NEXT_PUBLIC_API_URL ก่อนใช้งานหน้าพิมพ์เอกสารนี้" />;
  }

  if (!order) {
    return (
      <ErrorState
        title="ไม่พบข้อมูลใบกำกับภาษี"
        subtitle={loadError ?? 'ไม่พบข้อมูลออเดอร์ที่ต้องการพิมพ์ กรุณากลับไปตรวจสอบรายการอีกครั้ง'}
      />
    );
  }

  return (
    <>
      <PrintDocumentLayout
        title="ใบกำกับภาษี / Tax Invoice"
        invoiceNumber={`#${order.orderNumber || order.orderId}`}
        onEditCustomer={handleOpenDrawer}
        printableDocument={<InvoiceDocument documentType={documentType} order={order} />}
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
