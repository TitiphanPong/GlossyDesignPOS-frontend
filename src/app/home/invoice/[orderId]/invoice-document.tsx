'use client';

import type { RefObject } from 'react';
import LocalPrintshopRoundedIcon from '@mui/icons-material/LocalPrintshopRounded';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import type { NormalizedInvoiceOrder, PaymentMethod } from '../../../../lib/contracts';
import { convertAmountToThaiText, formatCurrency, resolveInvoiceDocumentType, type InvoiceDocumentType } from './invoice-utils';

export type InvoiceItem = {
  quantity: number;
  description: string;
  unitPrice: number;
  amount: number;
};

export type CustomerInfo = {
  name: string;
  taxId: string;
  address: string;
};

export type CompanyInfo = {
  thaiName: string;
  englishName: string;
  branchNumber: string;
  address: string;
  phone: string;
  taxId: string;
  email: string;
  website: string;
};

export type InvoiceData = {
  bookNo: string;
  invoiceNo: string;
  copyTitle: string;
  issuedDate: string;
  customer: CustomerInfo;
  items: InvoiceItem[];
  subtotal: number;
  vat: number;
  totalAmount: number;
  amountInWords: string;
  paymentMethod: 'cash' | 'transfer';
  bankTransferInfo: string;
  collectorSignatureLabel: string;
  authorizedSignatureLabel: string;
  customerSignatureLabel: string;
  dateLine: string;
  notes: string;
  company: CompanyInfo;
};

type InvoiceDocumentProps = {
  documentType: InvoiceDocumentType;
  order: NormalizedInvoiceOrder;
};

type TaxInvoiceTemplateProps = {
  invoiceData: InvoiceData;
  minItemRows?: number;
};

type InvoiceCopyProps = TaxInvoiceTemplateProps & {
  copyIndex: number;
};

type InvoiceToolbarProps = {
  documentRef: RefObject<HTMLDivElement | null>;
};

const PAGE_WIDTH_MM = 285;
const PAGE_HEIGHT_MM = 198;
const COPY_WIDTH_MM = PAGE_WIDTH_MM / 2;
const BORDER = '0.2mm solid #000';
const DOTTED_BORDER = '0.2mm dotted #000';
const BASE_FONT_MM = 2.55;
const SECTION_GAP_MM = 1.2;
const MIN_ITEM_ROWS = 8;

function readEnv(value: string | undefined, fallback: string) {
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

function getCopyTitle(documentType: InvoiceDocumentType, taxInvoice: 'yes' | 'no'): string {
  const resolvedType = resolveInvoiceDocumentType(documentType, null, taxInvoice);

  if (resolvedType === 'quotation') {
    return 'ใบเสนอราคา';
  }

  if (resolvedType === 'receipt') {
    return 'ต้นฉบับใบเสร็จรับเงิน';
  }

  return 'ต้นฉบับใบเสร็จรับเงิน / ต้นฉบับใบกำกับภาษี';
}

function normalizePrintablePaymentMethod(paymentMethod: PaymentMethod): 'cash' | 'transfer' {
  return paymentMethod === 'cash' ? 'cash' : 'transfer';
}

function formatThaiTaxDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const parts = formatter.formatToParts(parsed);
  const month = parts.find(part => part.type === 'month')?.value ?? '-';
  const day = parts.find(part => part.type === 'day')?.value ?? '-';
  const year = parts.find(part => part.type === 'year')?.value ?? '0';
  const buddhistYear = Number(year) + 543;

  return `${month}/${day}/${buddhistYear}`;
}

function getCompanyInfo(): CompanyInfo {
  return {
    thaiName: readEnv(process.env.NEXT_PUBLIC_COMPANY_THAI_NAME, 'กรอสซี่ ปริ้น แอนด์ พรีเมี่ยม'),
    englishName: readEnv(process.env.NEXT_PUBLIC_COMPANY_ENGLISH_NAME, 'GLOSSY PRINT AND PREMIUM'),
    branchNumber: readEnv(process.env.NEXT_PUBLIC_COMPANY_BRANCH_NO, 'สำนักงานใหญ่'),
    address: readEnv(process.env.NEXT_PUBLIC_COMPANY_ADDRESS, '-'),
    phone: readEnv(process.env.NEXT_PUBLIC_COMPANY_PHONE, '-'),
    taxId: readEnv(process.env.NEXT_PUBLIC_COMPANY_TAX_ID, '-'),
    email: readEnv(process.env.NEXT_PUBLIC_COMPANY_EMAIL, 'glossy2929@gmail.com'),
    website: readEnv(process.env.NEXT_PUBLIC_COMPANY_WEBSITE, '-'),
  };
}

export function buildInvoiceDataFromOrder(order: NormalizedInvoiceOrder, documentType: InvoiceDocumentType): InvoiceData {
  const company = getCompanyInfo();
  const issuedDate = formatThaiTaxDate(order.issueDate || order.orderDate);
  const totalAmount = order.grandTotal;
  const items = order.cart.map(item => ({
    quantity: item.quantity,
    description: item.name,
    unitPrice: item.unitPrice,
    amount: item.totalPrice,
  }));

  return {
    bookNo: '-',
    invoiceNo: order.orderNumber || order.orderId,
    copyTitle: getCopyTitle(documentType, order.taxInvoice),
    issuedDate,
    customer: {
      name: order.customerName,
      taxId: order.taxId,
      address: order.address,
    },
    items,
    subtotal: order.subtotal,
    vat: order.vatAmount,
    totalAmount,
    amountInWords: convertAmountToThaiText(totalAmount),
    paymentMethod: normalizePrintablePaymentMethod(order.paymentMethod),
    bankTransferInfo: readEnv(process.env.NEXT_PUBLIC_COMPANY_BANK_INFO, 'ธนาคาร / พร้อมเพย์'),
    collectorSignatureLabel: 'ผู้รับเงิน / Collector',
    authorizedSignatureLabel: 'ผู้มีอำนาจลงนาม / Authorized',
    customerSignatureLabel: 'ผู้รับสินค้า / Customer',
    dateLine: issuedDate,
    notes: order.note && order.note !== '-' ? order.note : 'กรุณาตรวจสอบรายการและเก็บเอกสารนี้ไว้เป็นหลักฐาน',
    company,
  };
}

function CheckboxField({ label, checked }: Readonly<{ label: string; checked: boolean }>) {
  return (
    <Stack direction="row" spacing="1.2mm" alignItems="center">
      <Box
        sx={{
          width: '3mm',
          height: '3mm',
          border: BORDER,
          display: 'grid',
          placeItems: 'center',
          fontSize: '2.1mm',
          lineHeight: 1,
        }}>
        {checked ? '✓' : ''}
      </Box>
      <Typography sx={{ fontSize: `${BASE_FONT_MM}mm`, lineHeight: 1.15 }}>{label}</Typography>
    </Stack>
  );
}

function SignatureColumn({ label }: Readonly<{ label: string }>) {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box sx={{ borderBottom: BORDER, height: '9mm' }} />
      <Typography sx={{ mt: '1.1mm', fontSize: '2.2mm', textAlign: 'center', lineHeight: 1.2 }}>{label}</Typography>
    </Box>
  );
}

function InfoLine({ label, value, minHeight = '5.4mm' }: Readonly<{ label: string; value: string; minHeight?: string }>) {
  return (
    <Stack
      direction="row"
      spacing="1.4mm"
      alignItems="flex-start"
      sx={{
        minHeight,
        borderBottom: DOTTED_BORDER,
        pb: '0.7mm',
      }}>
      <Typography sx={{ fontSize: `${BASE_FONT_MM}mm`, whiteSpace: 'nowrap', lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ flex: 1, minWidth: 0, fontSize: `${BASE_FONT_MM}mm`, lineHeight: 1.2, wordBreak: 'break-word' }}>{value || '-'}</Typography>
    </Stack>
  );
}

function SummaryLine({
  label,
  value,
  bold = false,
}: Readonly<{
  label: string;
  value: string;
  bold?: boolean;
}>) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing="2mm" sx={{ py: '0.45mm' }}>
      <Typography sx={{ fontSize: `${BASE_FONT_MM}mm`, fontWeight: bold ? 700 : 400, lineHeight: 1.2 }}>{label}</Typography>
      <Typography
        sx={{
          fontSize: `${BASE_FONT_MM}mm`,
          fontWeight: bold ? 700 : 400,
          lineHeight: 1.2,
          fontVariantNumeric: 'tabular-nums',
          textAlign: 'right',
        }}>
        {value}
      </Typography>
    </Stack>
  );
}

export function InvoiceCopy({ invoiceData, minItemRows = MIN_ITEM_ROWS, copyIndex }: Readonly<InvoiceCopyProps>) {
  const emptyRowCount = Math.max(minItemRows - invoiceData.items.length, 0);
  const rows = [...invoiceData.items, ...Array.from({ length: emptyRowCount }, () => null)];

  return (
    <Box
      className="tax-invoice-copy"
      data-copy-index={copyIndex}
      sx={{
        width: `${COPY_WIDTH_MM}mm`,
        minHeight: `${PAGE_HEIGHT_MM}mm`,
        border: BORDER,
        boxSizing: 'border-box',
        px: '2.2mm',
        py: '2mm',
        color: '#000',
        bgcolor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: `${SECTION_GAP_MM}mm`,
        fontFamily: '"Noto Sans Thai", Tahoma, sans-serif',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}>
      <Stack spacing="1mm">
        <Stack direction="row" sx={{ border: BORDER }}>
          <Box sx={{ width: '50%', px: '1.4mm', py: '1.1mm', borderRight: BORDER }}>
            <Typography sx={{ fontSize: '2.25mm', lineHeight: 1.2 }}>เล่มที่ Book No. {invoiceData.bookNo}</Typography>
          </Box>
          <Box sx={{ width: '50%', px: '1.4mm', py: '1.1mm' }}>
            <Typography sx={{ fontSize: '2.25mm', lineHeight: 1.2 }}>เลขที่ Invoice No. {invoiceData.invoiceNo}</Typography>
          </Box>
        </Stack>

        <Box sx={{ border: BORDER, px: '1.6mm', py: '1.4mm', textAlign: 'center' }}>
          <Typography sx={{ fontSize: '3.15mm', fontWeight: 700, lineHeight: 1.2 }}>{invoiceData.company.thaiName}</Typography>
          <Typography sx={{ mt: '0.3mm', fontSize: '2.45mm', lineHeight: 1.2 }}>{invoiceData.company.englishName}</Typography>
          <Typography sx={{ mt: '0.35mm', fontSize: '2.25mm', lineHeight: 1.2 }}>สาขา / Branch No. {invoiceData.company.branchNumber}</Typography>
          <Typography sx={{ mt: '0.35mm', fontSize: '2.15mm', lineHeight: 1.25 }}>{invoiceData.company.address}</Typography>
          <Typography sx={{ mt: '0.35mm', fontSize: '2.15mm', lineHeight: 1.25 }}>
            โทร / Phone {invoiceData.company.phone} | Tax ID {invoiceData.company.taxId}
          </Typography>
          <Typography sx={{ mt: '0.2mm', fontSize: '2.05mm', lineHeight: 1.25 }}>
            Email {invoiceData.company.email} | Website {invoiceData.company.website}
          </Typography>
        </Box>

        <Box sx={{ border: BORDER, px: '1.6mm', py: '1.3mm', textAlign: 'center' }}>
          <Typography sx={{ fontSize: '2.9mm', fontWeight: 700, lineHeight: 1.2 }}>{invoiceData.copyTitle}</Typography>
        </Box>
      </Stack>

      <Stack spacing="0.9mm">
        <Box sx={{ border: BORDER, px: '1.4mm', py: '1mm' }}>
          <Typography sx={{ fontSize: `${BASE_FONT_MM}mm`, lineHeight: 1.2 }}>วันที่ Date {invoiceData.issuedDate}</Typography>
        </Box>

        <Box sx={{ border: BORDER, px: '1.4mm', py: '1mm' }}>
          <InfoLine label="ลูกค้า / Customer" value={invoiceData.customer.name} />
          <InfoLine label="ที่อยู่ / Address" value={invoiceData.customer.address} minHeight="9.5mm" />
          <InfoLine label="เลขประจำตัวผู้เสียภาษี Tax ID" value={invoiceData.customer.taxId} />
        </Box>
      </Stack>

      <Box sx={{ border: BORDER, flex: '0 0 auto' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '16mm 1fr 24mm 24mm',
            borderBottom: BORDER,
            bgcolor: '#fff',
          }}>
          <Box sx={{ px: '1mm', py: '1mm', borderRight: BORDER, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '2.2mm', fontWeight: 700, lineHeight: 1.2 }}>จำนวน</Typography>
            <Typography sx={{ fontSize: '2mm', lineHeight: 1.1 }}>/ Quantity</Typography>
          </Box>
          <Box sx={{ px: '1mm', py: '1mm', borderRight: BORDER, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '2.2mm', fontWeight: 700, lineHeight: 1.2 }}>รายละเอียด</Typography>
            <Typography sx={{ fontSize: '2mm', lineHeight: 1.1 }}>/ Description</Typography>
          </Box>
          <Box sx={{ px: '1mm', py: '1mm', borderRight: BORDER, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '2.2mm', fontWeight: 700, lineHeight: 1.2 }}>ราคาต่อหน่วย</Typography>
            <Typography sx={{ fontSize: '2mm', lineHeight: 1.1 }}>/ Price/Unit</Typography>
          </Box>
          <Box sx={{ px: '1mm', py: '1mm', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '2.2mm', fontWeight: 700, lineHeight: 1.2 }}>บาท</Typography>
            <Typography sx={{ fontSize: '2mm', lineHeight: 1.1 }}>/ Stg.</Typography>
          </Box>
        </Box>

        <Box>
          {rows.map((item, index) => (
            <Box
              key={`invoice-row-${index}`}
              sx={{
                display: 'grid',
                gridTemplateColumns: '16mm 1fr 24mm 24mm',
                minHeight: '8.2mm',
                '&:not(:last-of-type)': {
                  borderBottom: DOTTED_BORDER,
                },
              }}>
              <Box sx={{ px: '1mm', py: '1mm', borderRight: BORDER, textAlign: 'center' }}>
                <Typography sx={{ fontSize: `${BASE_FONT_MM}mm`, lineHeight: 1.2 }}>{item ? item.quantity : ''}</Typography>
              </Box>
              <Box sx={{ px: '1.2mm', py: '1mm', borderRight: BORDER }}>
                <Typography sx={{ fontSize: `${BASE_FONT_MM}mm`, lineHeight: 1.2, wordBreak: 'break-word' }}>{item?.description ?? ''}</Typography>
              </Box>
              <Box sx={{ px: '1.2mm', py: '1mm', borderRight: BORDER, textAlign: 'right' }}>
                <Typography sx={{ fontSize: `${BASE_FONT_MM}mm`, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{item ? formatCurrency(item.unitPrice) : ''}</Typography>
              </Box>
              <Box sx={{ px: '1.2mm', py: '1mm', textAlign: 'right' }}>
                <Typography sx={{ fontSize: `${BASE_FONT_MM}mm`, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{item ? formatCurrency(item.amount) : ''}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Stack spacing="0.9mm">
        <Box sx={{ border: BORDER, px: '1.5mm', py: '1.2mm' }}>
          <SummaryLine label="รวมมูลค่าสินค้า / TOTAL" value={formatCurrency(invoiceData.subtotal)} />
          <SummaryLine label="ภาษีมูลค่าเพิ่ม 7% / VALUE ADDED TAX" value={formatCurrency(invoiceData.vat)} />
          <Divider sx={{ my: '0.5mm', borderColor: '#000' }} />
          <SummaryLine label="จำนวนเงินรวมทั้งสิ้น / TOTAL AMOUNT INCLUDED VAT" value={formatCurrency(invoiceData.totalAmount)} bold />
        </Box>

        <Box sx={{ border: BORDER, px: '1.5mm', py: '1.1mm' }}>
          <Typography sx={{ fontSize: '3mm', fontWeight: 700, lineHeight: 1.2 }}>จำนวนเงินเป็นอักษร / Amount in words</Typography>
          <Typography sx={{ mt: '0.6mm', fontSize: `${BASE_FONT_MM}mm`, lineHeight: 1.25 }}>{invoiceData.amountInWords}</Typography>
        </Box>

        <Box sx={{ border: BORDER, px: '1.5mm', py: '1.1mm' }}>
          <Stack direction="row" spacing="4mm" alignItems="center">
            <CheckboxField label="เงินสด" checked={invoiceData.paymentMethod === 'cash'} />
            <CheckboxField label="โอนเงิน" checked={invoiceData.paymentMethod === 'transfer'} />
          </Stack>
          <Typography sx={{ mt: '0.8mm', fontSize: `${BASE_FONT_MM}mm`, lineHeight: 1.2 }}>{invoiceData.bankTransferInfo}</Typography>
        </Box>
      </Stack>

      <Box sx={{ mt: 'auto', border: BORDER, px: '1.5mm', py: '1.2mm' }}>
        <Stack direction="row" spacing="2.2mm">
          <SignatureColumn label={invoiceData.collectorSignatureLabel} />
          <SignatureColumn label={invoiceData.authorizedSignatureLabel} />
          <SignatureColumn label={invoiceData.customerSignatureLabel} />
        </Stack>
        <Typography sx={{ mt: '1.3mm', fontSize: '2.2mm', lineHeight: 1.2 }}>วันที่ / Date ____________________ {invoiceData.dateLine}</Typography>
        <Typography sx={{ mt: '1mm', fontSize: '1.95mm', lineHeight: 1.25 }}>{invoiceData.notes}</Typography>
      </Box>
    </Box>
  );
}

export function TaxInvoiceTemplate({ invoiceData, minItemRows = MIN_ITEM_ROWS }: Readonly<TaxInvoiceTemplateProps>) {
  return (
    <Box
      className="tax-invoice-template"
      sx={{
        width: `${PAGE_WIDTH_MM}mm`,
        minHeight: `${PAGE_HEIGHT_MM}mm`,
        display: 'grid',
        gridTemplateColumns: `repeat(2, ${COPY_WIDTH_MM}mm)`,
        gap: 0,
        bgcolor: '#fff',
        boxSizing: 'border-box',
      }}>
      <InvoiceCopy invoiceData={invoiceData} minItemRows={minItemRows} copyIndex={0} />
      <InvoiceCopy invoiceData={invoiceData} minItemRows={minItemRows} copyIndex={1} />
    </Box>
  );
}

export function InvoiceDocument({ documentType, order }: Readonly<InvoiceDocumentProps>) {
  return <TaxInvoiceTemplate invoiceData={buildInvoiceDataFromOrder(order, documentType)} />;
}

export function InvoiceToolbar({ documentRef }: Readonly<InvoiceToolbarProps>) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} className="no-print" sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
      <Button
        variant="contained"
        startIcon={<LocalPrintshopRoundedIcon />}
        onClick={async () => {
          if (documentRef.current && typeof document !== 'undefined' && 'fonts' in document) {
            await document.fonts.ready;
          }

          globalThis.print();
        }}>
        Print / Save PDF
      </Button>
    </Stack>
  );
}
