'use client';

import { useState, type RefObject } from 'react';
import Image from 'next/image';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import LocalPrintshopRoundedIcon from '@mui/icons-material/LocalPrintshopRounded';
import {
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { NormalizedInvoiceOrder } from '../../../../lib/contracts';
import {
  convertAmountToThaiText,
  formatCurrency,
  formatDate,
  formatDateTime,
  getDocumentStatusLabel,
  getInvoiceDocumentMeta,
  getPaymentMethodLabel,
  type InvoiceDocumentType,
} from './invoice-utils';

type InvoiceDocumentProps = {
  documentType: InvoiceDocumentType;
  order: NormalizedInvoiceOrder;
};

type InvoicePdfExportButtonProps = {
  documentRef: RefObject<HTMLDivElement | null>;
  filename: string;
};

const COMPANY_PROFILE = {
  name: 'Glossy Design',
  services: ['บริการงานพิมพ์', 'สื่อโฆษณา', 'งานออกแบบ'],
  address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || '-',
  phone: process.env.NEXT_PUBLIC_COMPANY_PHONE || '-',
  email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'glossy2929@gmail.com',
  taxId: process.env.NEXT_PUBLIC_COMPANY_TAX_ID || '-',
};

const sectionTitleSx = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: '#111827',
};

const sectionSx = {
  border: '1px solid #D9D9D9',
  borderRadius: '2px',
  p: '4mm',
  bgcolor: '#FFFFFF',
};

const fieldLabelSx = {
  fontSize: 11,
  color: '#6B7280',
  fontWeight: 600,
};

const fieldValueSx = {
  fontSize: 13,
  color: '#111827',
  fontWeight: 500,
  wordBreak: 'break-word',
};

function FieldPair({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <Box>
      <Typography sx={fieldLabelSx}>{label}</Typography>
      <Typography sx={fieldValueSx}>{value || '-'}</Typography>
    </Box>
  );
}

export function InvoiceHeader({ documentType, order }: Readonly<InvoiceDocumentProps>) {
  const meta = getInvoiceDocumentMeta(documentType);
  const statusLabel = getDocumentStatusLabel(documentType, order.status);

  return (
    <Stack direction="row" justifyContent="space-between" spacing={4} sx={{ mb: '4mm' }}>
      <Stack spacing={1.1} sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box
            sx={{
              width: 52,
              height: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #D9D9D9',
              borderRadius: '2px',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
            <Image src="/logo/logo.png" alt="Glossy Design" width={42} height={42} priority />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.1, color: '#111827' }}>{COMPANY_PROFILE.name}</Typography>
            {COMPANY_PROFILE.services.map(service => (
              <Typography key={service} sx={{ fontSize: 11.5, color: '#374151', lineHeight: 1.45 }}>
                {service}
              </Typography>
            ))}
          </Box>
        </Stack>

        <Stack spacing={0.35}>
          <Typography sx={{ fontSize: 11.5, color: '#374151', whiteSpace: 'pre-line' }}>{COMPANY_PROFILE.address}</Typography>
          <Typography sx={{ fontSize: 11.5, color: '#374151' }}>Phone: {COMPANY_PROFILE.phone}</Typography>
          <Typography sx={{ fontSize: 11.5, color: '#374151' }}>Email: {COMPANY_PROFILE.email}</Typography>
          <Typography sx={{ fontSize: 11.5, color: '#374151' }}>Tax ID: {COMPANY_PROFILE.taxId}</Typography>
        </Stack>
      </Stack>

      <Box
        sx={{
          minWidth: '70mm',
          border: '1px solid #D9D9D9',
          borderRadius: '2px',
          p: '4mm',
          alignSelf: 'flex-start',
        }}>
        <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1.15 }}>{meta.titleTh}</Typography>
        <Typography sx={{ fontSize: 12, color: '#4B5563', mb: 2 }}>{meta.titleEn}</Typography>
        <Stack spacing={1.1}>
          <FieldPair label="Document Number" value={order.orderNumber} />
          <FieldPair label="Issue Date" value={formatDate(order.issueDate || order.orderDate)} />
          <Box>
            <Typography sx={fieldLabelSx}>Status</Typography>
            <Chip
              label={statusLabel}
              size="small"
              sx={{
                mt: 0.6,
                height: 24,
                borderRadius: '2px',
                bgcolor: '#F3F4F6',
                border: '1px solid #D9D9D9',
                color: '#111827',
                fontWeight: 700,
              }}
            />
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}

export function InvoiceCustomerSection({ order }: Readonly<{ order: NormalizedInvoiceOrder }>) {
  return (
    <Box sx={sectionSx}>
      <Typography sx={sectionTitleSx}>Customer Information</Typography>
      <Box
        sx={{
          mt: '3mm',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '3mm 5mm',
        }}>
        <FieldPair label="Customer Name" value={order.customerName} />
        <FieldPair label="Phone Number" value={order.phoneNumber} />
        <FieldPair label="Address" value={order.address} />
        <FieldPair label="Tax ID" value={order.taxId} />
        <FieldPair label="Branch" value={order.branch} />
        <FieldPair label="Email" value={order.email} />
      </Box>
    </Box>
  );
}

export function InvoiceOrderSection({ order }: Readonly<{ order: NormalizedInvoiceOrder }>) {
  return (
    <Box sx={sectionSx}>
      <Typography sx={sectionTitleSx}>Order Information</Typography>
      <Box
        sx={{
          mt: '3mm',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '3mm 5mm',
        }}>
        <FieldPair label="Order Number" value={order.orderNumber} />
        <FieldPair label="Order Date" value={formatDateTime(order.orderDate)} />
        <FieldPair label="Sales Channel" value={order.salesChannel} />
        <FieldPair label="Payment Method" value={getPaymentMethodLabel(order.paymentMethod)} />
        <FieldPair label="Status" value={getDocumentStatusLabel('receipt', order.status)} />
        <FieldPair label="Issue Date" value={formatDate(order.issueDate || order.orderDate)} />
      </Box>
    </Box>
  );
}

export function InvoiceItemsTable({ order }: Readonly<{ order: NormalizedInvoiceOrder }>) {
  return (
    <Box sx={{ ...sectionSx, p: 0, overflow: 'hidden' }}>
      <Table
        size="small"
        sx={{
          tableLayout: 'fixed',
          '& th, & td': {
            borderColor: '#D9D9D9',
            verticalAlign: 'top',
            px: '3mm',
            py: '2.4mm',
          },
          '& th': {
            bgcolor: '#F9FAFB',
            color: '#111827',
            fontWeight: 700,
            fontSize: 12,
          },
          '& td': {
            color: '#111827',
            fontSize: 12,
          },
        }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '10mm' }}>No.</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="center" sx={{ width: '24mm' }}>
              Quantity
            </TableCell>
            <TableCell align="right" sx={{ width: '30mm' }}>
              Unit Price
            </TableCell>
            <TableCell align="right" sx={{ width: '32mm' }}>
              Amount
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {order.cart.map((item, index) => (
            <TableRow key={`${item.name}-${index}`} sx={{ height: '11mm' }}>
              <TableCell>{index + 1}</TableCell>
              <TableCell sx={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.45 }}>{item.name}</TableCell>
              <TableCell align="center">{item.quantity}</TableCell>
              <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(item.unitPrice)}
              </TableCell>
              <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}>
                {formatCurrency(item.totalPrice)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export function InvoiceSummary({ order }: Readonly<{ order: NormalizedInvoiceOrder }>) {
  return (
    <Stack direction="row" justifyContent="flex-end">
      <Box sx={{ width: '72mm', ...sectionSx }}>
        <Stack spacing={1.2}>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography sx={{ fontSize: 12.5, color: '#374151' }}>Subtotal</Typography>
            <Typography sx={{ fontSize: 12.5, color: '#111827', fontWeight: 600 }}>{formatCurrency(order.subtotal)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography sx={{ fontSize: 12.5, color: '#374151' }}>Discount</Typography>
            <Typography sx={{ fontSize: 12.5, color: '#111827', fontWeight: 600 }}>{formatCurrency(order.discount)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography sx={{ fontSize: 12.5, color: '#374151' }}>VAT 7%</Typography>
            <Typography sx={{ fontSize: 12.5, color: '#111827', fontWeight: 600 }}>{formatCurrency(order.vatAmount)}</Typography>
          </Stack>
          <Divider sx={{ borderColor: '#D9D9D9' }} />
          <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-end">
            <Typography sx={{ fontSize: 13, color: '#111827', fontWeight: 700 }}>Grand Total</Typography>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: 28, lineHeight: 1, fontWeight: 700, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(order.grandTotal)}
              </Typography>
              <Typography sx={{ mt: 0.4, fontSize: 12, color: '#6B7280' }}>บาท</Typography>
            </Box>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}

export function InvoiceAmountInWords({ order }: Readonly<{ order: NormalizedInvoiceOrder }>) {
  return (
    <Box sx={sectionSx}>
      <Typography sx={sectionTitleSx}>จำนวนเงินเป็นตัวอักษร</Typography>
      <Typography sx={{ mt: '3mm', fontSize: 13, color: '#111827', fontWeight: 600 }}>
        ({convertAmountToThaiText(order.grandTotal)})
      </Typography>
    </Box>
  );
}

export function InvoiceRemarks({ order }: Readonly<{ order: NormalizedInvoiceOrder }>) {
  return (
    <Box sx={sectionSx}>
      <Typography sx={sectionTitleSx}>หมายเหตุ</Typography>
      <Typography sx={{ mt: '3mm', minHeight: '18mm', fontSize: 12.5, color: '#111827', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
        {order.note}
      </Typography>
    </Box>
  );
}

function SignatureBox({ title }: Readonly<{ title: string }>) {
  return (
    <Box
      sx={{
        flex: 1,
        border: '1px solid #D9D9D9',
        borderRadius: '2px',
        p: '4mm',
        minHeight: '34mm',
      }}>
      <Typography sx={{ fontSize: 12.5, color: '#111827', fontWeight: 700 }}>{title}</Typography>
      <Box sx={{ mt: '11mm', borderBottom: '1px solid #9CA3AF' }} />
      <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mt: 1.5 }}>
        <Typography sx={{ fontSize: 11.5, color: '#6B7280' }}>Name</Typography>
        <Typography sx={{ fontSize: 11.5, color: '#6B7280' }}>Date</Typography>
      </Stack>
    </Box>
  );
}

export function InvoiceSignatures() {
  return (
    <Box sx={{ mt: 'auto', pt: '6mm' }}>
      <Stack direction="row" spacing={'6mm'}>
        <SignatureBox title="ผู้รับเงิน" />
        <SignatureBox title="ผู้รับสินค้า" />
      </Stack>
    </Box>
  );
}

export function InvoicePdfExportButton({ documentRef, filename }: Readonly<InvoicePdfExportButtonProps>) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!documentRef.current || exporting) {
      return;
    }

    try {
      setExporting(true);
      if (typeof document !== 'undefined' && 'fonts' in document) {
        await document.fonts.ready;
      }

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 190;
      const pageHeight = 277;
      const margin = 10;
      const imageData = canvas.toDataURL('image/png');
      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      let renderedHeight = imageHeight;
      let yOffset = 0;

      pdf.addImage(imageData, 'PNG', margin, margin + yOffset, pageWidth, imageHeight, undefined, 'FAST');
      renderedHeight -= pageHeight;

      while (renderedHeight > 0) {
        yOffset -= pageHeight;
        pdf.addPage();
        pdf.addImage(imageData, 'PNG', margin, margin + yOffset, pageWidth, imageHeight, undefined, 'FAST');
        renderedHeight -= pageHeight;
      }

      pdf.save(filename);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={handleExport} disabled={exporting}>
      {exporting ? 'Exporting PDF...' : 'Export PDF'}
    </Button>
  );
}

export function InvoiceDocument({ documentType, order }: Readonly<InvoiceDocumentProps>) {
  return (
    <Box
      sx={{
        width: '190mm',
        minHeight: '277mm',
        bgcolor: '#FFFFFF',
        border: '1px solid #D9D9D9',
        borderRadius: '2px',
        px: '5mm',
        py: '5mm',
        color: '#111827',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}>
      <InvoiceHeader documentType={documentType} order={order} />
      <Stack spacing={'4mm'}>
        <Stack direction="row" spacing={'4mm'}>
          <Box sx={{ flex: 1 }}>
            <InvoiceCustomerSection order={order} />
          </Box>
          <Box sx={{ width: '72mm' }}>
            <InvoiceOrderSection order={order} />
          </Box>
        </Stack>
        <InvoiceItemsTable order={order} />
        <InvoiceSummary order={order} />
        <InvoiceAmountInWords order={order} />
        <InvoiceRemarks order={order} />
      </Stack>
      <InvoiceSignatures />
    </Box>
  );
}

export function InvoiceToolbar({ documentRef, filename }: Readonly<InvoicePdfExportButtonProps>) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} className="no-print" sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
      <Button variant="contained" startIcon={<LocalPrintshopRoundedIcon />} onClick={() => globalThis.print()}>
        Print / Save PDF
      </Button>
      <InvoicePdfExportButton documentRef={documentRef} filename={filename} />
    </Stack>
  );
}
