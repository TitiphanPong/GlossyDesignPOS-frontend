'use client';

import { use, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Stack, Typography } from '@mui/material';
import { InvoiceLoadingState, MissingApiConfigState } from '../../components/dashboardUi';
import { isMissingApiBaseError } from '../../../../lib/api';
import { type NormalizedInvoiceOrder, normalizeApiOrderForInvoice } from '../../../../lib/contracts';
import { fetchOrderById } from '../../../../lib/orders';
import { InvoiceDocument, InvoiceToolbar } from './invoice-document';
import { resolveInvoiceDocumentType } from './invoice-utils';

export default function InvoicePage({ params }: Readonly<{ params: Promise<{ orderId: string }> }>) {
  const { orderId } = use(params);
  const searchParams = useSearchParams();
  const invoiceRef = useRef<HTMLDivElement | null>(null);
  const [order, setOrder] = useState<NormalizedInvoiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [missingApiBase, setMissingApiBase] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await fetchOrderById(orderId);
        setOrder(normalizeApiOrderForInvoice(data));
        setLoadError(null);
      } catch (error) {
        if (isMissingApiBaseError(error)) {
          setMissingApiBase(true);
        } else {
          console.error('Error:', error);
          setLoadError(error instanceof Error && error.message ? error.message : 'โหลดออเดอร์ไม่สำเร็จ');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const documentType = useMemo(
    () => resolveInvoiceDocumentType(searchParams.get('documentType'), order, order?.taxInvoice),
    [order, searchParams]
  );

  if (missingApiBase) {
    return (
      <Box sx={{ minHeight: '80vh', maxWidth: 960, mx: 'auto', px: { xs: 2, md: 3 }, py: { xs: 3, md: 4 } }}>
        <MissingApiConfigState subtitle="กรุณาตั้งค่า NEXT_PUBLIC_API_URL เพื่อให้หน้าใบกำกับภาษีดึงข้อมูลออเดอร์ได้" />
      </Box>
    );
  }

  if (loading) {
    return <InvoiceLoadingState />;
  }

  if (!order) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'grid', placeItems: 'center' }}>
        <Typography>{loadError ?? 'ไม่พบข้อมูลออเดอร์'}</Typography>
      </Box>
    );
  }

  return (
    <Box
      className="invoice-screen-root"
      sx={{
        minHeight: '100vh',
        bgcolor: '#F3F4F6',
        px: { xs: 2, md: 3 },
        py: { xs: 2.5, md: 4 },
      }}>
      <Stack spacing={2.2} sx={{ maxWidth: 'calc(190mm + 32px)', mx: 'auto' }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
          className="no-print">
          <Box>
            <Typography sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 800, color: '#111827' }}>Invoice Document</Typography>
            <Typography sx={{ mt: 0.6, fontSize: 14, color: '#4B5563' }}>
              A4-ready business document for print, PDF export, customer delivery, and accounting records.
            </Typography>
          </Box>
          <InvoiceToolbar documentRef={invoiceRef} filename={`${order.orderNumber || order.orderId}.pdf`} />
        </Stack>

        <Box
          className="invoice-page"
          sx={{
            width: '100%',
            overflowX: 'auto',
            overflowY: 'visible',
            pb: 1,
          }}>
          <Box ref={invoiceRef} className="invoice-print-root" sx={{ width: 'fit-content', mx: 'auto' }}>
            <InvoiceDocument documentType={documentType} order={order} />
          </Box>
        </Box>
      </Stack>

      <style jsx global>{`
        @page {
          size: A4;
          margin: 10mm;
        }

        @media print {
          html,
          body {
            background: white !important;
          }

          body * {
            visibility: hidden !important;
          }

          .no-print {
            display: none !important;
          }

          .invoice-print-root,
          .invoice-print-root * {
            visibility: visible !important;
          }

          .invoice-screen-root {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
          }

          .invoice-page {
            width: 190mm !important;
            margin: 0 auto !important;
            overflow: visible !important;
          }

          .invoice-print-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 190mm !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </Box>
  );
}
