'use client';

import { Box, Stack, Typography } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { formatCustomerAddress, type NormalizedInvoiceOrder, type PaymentMethod } from '../../../../lib/contracts';
import { buildSecureOrderTrackingUrl } from '../../../../lib/order-tracking-url';
import { convertAmountToThaiText, formatCurrency, resolveInvoiceDocumentType, type InvoiceDocumentType } from '../../../home/invoice/[orderId]/invoice-utils';

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
  issuedTime: string;
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
  trackingOrigin?: string | null;
  trackingToken?: string | null;
};

type TaxInvoiceTemplateProps = {
  invoiceData: InvoiceData;
  minItemRows?: number;
  trackingUrl?: string | null;
};

type InvoiceCopyProps = TaxInvoiceTemplateProps & {
  copyIndex: number;
};

const PAGE_WIDTH_MM = 285;
const PAGE_HEIGHT_MM = 197;
const CUT_GAP_MM = 6.1;
const COPY_WIDTH_MM = (PAGE_WIDTH_MM - CUT_GAP_MM) / 2;
const BORDER = '0.2mm solid #000';
const DOTTED_BORDER = '0.2mm dotted #000';
const BASE_FONT_MM = 2.55;
const SECTION_GAP_MM = 1;
const MIN_ITEM_ROWS = 6;

function readEnv(value: string | undefined, fallback = '-') {
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

const REQUIRED_COMPANY_CONFIG = [
  ['NEXT_PUBLIC_COMPANY_THAI_NAME', process.env.NEXT_PUBLIC_COMPANY_THAI_NAME],
  ['NEXT_PUBLIC_COMPANY_BRANCH_NO', process.env.NEXT_PUBLIC_COMPANY_BRANCH_NO],
  ['NEXT_PUBLIC_COMPANY_ADDRESS', process.env.NEXT_PUBLIC_COMPANY_ADDRESS],
  ['NEXT_PUBLIC_COMPANY_PHONE', process.env.NEXT_PUBLIC_COMPANY_PHONE],
  ['NEXT_PUBLIC_COMPANY_TAX_ID', process.env.NEXT_PUBLIC_COMPANY_TAX_ID],
] as const;

export function getMissingCompanyConfigFields(): string[] {
  return REQUIRED_COMPANY_CONFIG.filter(([, value]) => !value?.trim()).map(([name]) => name);
}

function getCopyTitle(documentType: InvoiceDocumentType, taxInvoice: 'yes' | 'no'): string {
  const resolvedType = resolveInvoiceDocumentType(documentType, null, taxInvoice);

  if (resolvedType === 'quotation') {
    return 'ใบเสนอราคา';
  }

  if (resolvedType === 'receipt') {
    return 'ต้นฉบับ ใบแจ้งราคาสินค้า / ใบส่งของ';
  }

  return 'ต้นฉบับ ใบเสร็จรับเงิน / ใบกำกับภาษี';
}

function normalizePrintablePaymentMethod(paymentMethod: PaymentMethod): 'cash' | 'transfer' {
  return paymentMethod === 'cash' ? 'cash' : 'transfer';
}

function getRenderedCopyTitle(baseTitle: string, copyIndex: number): string {
  if (baseTitle.startsWith('ต้นฉบับ')) {
    return copyIndex === 0 ? `สำเนา${baseTitle.slice('ต้นฉบับ'.length)}` : baseTitle;
  }

  if (baseTitle.startsWith('ใบเสนอราคา')) {
    return copyIndex === 0 ? `สำเนา ${baseTitle}` : `ต้นฉบับ ${baseTitle}`;
  }

  return copyIndex === 0 ? `สำเนา ${baseTitle}` : `ต้นฉบับ ${baseTitle}`;
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

  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${buddhistYear}`;
}

function formatThaiTaxTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const parts = formatter.formatToParts(parsed);
  const hour = parts.find(part => part.type === 'hour')?.value ?? '-';
  const minute = parts.find(part => part.type === 'minute')?.value ?? '-';

  return `${hour}:${minute}`;
}

function getCompanyInfo(): CompanyInfo {
  return {
    thaiName: readEnv(process.env.NEXT_PUBLIC_COMPANY_THAI_NAME),
    englishName: readEnv(process.env.NEXT_PUBLIC_COMPANY_ENGLISH_NAME),
    branchNumber: readEnv(process.env.NEXT_PUBLIC_COMPANY_BRANCH_NO),
    address: readEnv(process.env.NEXT_PUBLIC_COMPANY_ADDRESS),
    phone: readEnv(process.env.NEXT_PUBLIC_COMPANY_PHONE),
    taxId: readEnv(process.env.NEXT_PUBLIC_COMPANY_TAX_ID),
    email: readEnv(process.env.NEXT_PUBLIC_COMPANY_EMAIL),
    website: readEnv(process.env.NEXT_PUBLIC_COMPANY_WEBSITE),
  };
}

export function buildInvoiceDataFromOrder(order: NormalizedInvoiceOrder, documentType: InvoiceDocumentType): InvoiceData {
  const company = getCompanyInfo();
  const issuedAt = order.issueDate || order.orderDate;
  const issuedDate = formatThaiTaxDate(issuedAt);
  const issuedTime = formatThaiTaxTime(issuedAt);
  const taxableAmount = Math.max(0, order.subtotal);
  const expectedVat = Math.round(taxableAmount * 0.07 * 100) / 100;
  const shouldAddVat = documentType === 'tax-invoice' && order.grandTotal <= taxableAmount;
  const vat = shouldAddVat ? expectedVat : order.vatAmount;
  const totalAmount = shouldAddVat ? Math.round((taxableAmount + vat) * 100) / 100 : order.grandTotal;
  const customerAddress = formatCustomerAddress(order.customerInfo) || order.address;
  const items = order.cart.map(item => ({
    quantity: item.quantity,
    description: item.name,
    unitPrice: item.unitPrice,
    amount: item.totalPrice,
  }));

  return {
    bookNo: documentType === 'tax-invoice' ? order.bookNo || '-' : '-',
    invoiceNo: documentType === 'tax-invoice' ? order.invoiceSequence || order.invoiceNumber || order.orderNumber || order.orderId : order.orderNumber || order.orderId,
    copyTitle: getCopyTitle(documentType, order.taxInvoice),
    issuedDate,
    issuedTime,
    customer: {
      name: order.customerInfo.customerName || order.customerName,
      taxId: order.customerInfo.taxId || order.taxId,
      address: customerAddress,
    },
    items,
    subtotal: order.subtotal,
    vat,
    totalAmount,
    amountInWords: convertAmountToThaiText(totalAmount),
    paymentMethod: normalizePrintablePaymentMethod(order.paymentMethod),
    bankTransferInfo: readEnv(process.env.NEXT_PUBLIC_COMPANY_BANK_INFO, '-'),
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
        {checked ? 'x' : ''}
      </Box>
      <Typography sx={{ fontSize: `${BASE_FONT_MM}mm`, lineHeight: 1.15 }}>{label}</Typography>
    </Stack>
  );
}

function TrackingQr({ trackingUrl, compact = false }: Readonly<{ trackingUrl?: string | null; compact?: boolean }>) {
  if (!trackingUrl) {
    return null;
  }

  const size = compact ? '21mm' : '24mm';

  return (
    <Stack data-invoice-region="tracking-qr" alignItems="center" spacing="1mm" sx={{ flexShrink: 0, textAlign: 'center' }}>
      <Box sx={{ width: size, height: size, display: 'grid', placeItems: 'center', bgcolor: '#fff' }}>
        <QRCodeSVG value={trackingUrl} size={compact ? 79 : 91} level="M" marginSize={0} title="Order tracking QR" />
      </Box>
      <Typography sx={{ fontSize: compact ? '2.3mm' : '2.35mm', fontWeight: 600, lineHeight: 1.15 }}>ติดตามสถานะงาน</Typography>
    </Stack>
  );
}

function InfoLine({
  label,
  value,
  minHeight = '5.4mm',
  labelFontSize = '2.9mm',
  valueFontSize = '2.9mm',
}: Readonly<{
  label: string;
  value: string;
  minHeight?: string;
  labelFontSize?: string;
  valueFontSize?: string;
}>) {
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
      <Typography sx={{ fontSize: labelFontSize, fontWeight: 700, whiteSpace: 'nowrap', lineHeight: 1.2 }}>{label}</Typography>
      <Typography sx={{ flex: 1, minWidth: 0, fontSize: valueFontSize, lineHeight: 1.2, wordBreak: 'break-word' }}>{value || '-'}</Typography>
    </Stack>
  );
}

export function InvoiceCopy({ invoiceData, minItemRows = MIN_ITEM_ROWS, copyIndex, trackingUrl }: Readonly<InvoiceCopyProps>) {
  const emptyRowCount = Math.max(minItemRows - invoiceData.items.length, 0);
  const rows = [
    ...invoiceData.items.map((item, itemIndex) => ({
      key: `item-${item.description}-${item.quantity}-${item.unitPrice}-${itemIndex}`,
      item,
    })),
    ...Array.from({ length: emptyRowCount }, (_value, emptyRowIndex) => ({
      key: `empty-row-${invoiceData.invoiceNo}-${emptyRowIndex}`,
      item: null,
    })),
  ];
  const renderedCopyTitle = getRenderedCopyTitle(invoiceData.copyTitle, copyIndex);

  return (
    <Box
      className="invoice-copy"
      data-copy-index={copyIndex}
      sx={{
        width: `${COPY_WIDTH_MM}mm`,
        height: `${PAGE_HEIGHT_MM}mm`,
        boxSizing: 'border-box',
        px: '2mm',
        py: '1.8mm',
        color: '#000',
        bgcolor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: `${SECTION_GAP_MM}mm`,
        fontFamily: '"Noto Sans Thai", Tahoma, sans-serif',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
        breakInside: 'avoid',
      }}>
      <Stack spacing="0.8mm">
        <Box sx={{ display: 'grid', gridTemplateColumns: trackingUrl ? '1fr 40mm' : '56% 44%' }}>
          <Box sx={{ px: '1.4mm', py: '1.1mm' }}>
            <Typography sx={{ fontSize: '3mm', lineHeight: 1.2 }}>เล่มที่ Book No. {invoiceData.bookNo}</Typography>
          </Box>
          <Box sx={{ pl: trackingUrl ? 0 : '4mm', py: '1.1mm', textAlign: trackingUrl ? 'center' : 'right' }}>
            <Typography sx={{ fontSize: '3mm', lineHeight: 1.2 }}>เลขที่ Invoice No. {invoiceData.invoiceNo}</Typography>
          </Box>
        </Box>

        <Box
          data-invoice-region="company-header"
          sx={{
            mt: '1.5mm',
            mb: '2mm',
            position: 'relative',
            minHeight: trackingUrl ? '25mm' : 'auto',
            bgcolor: '#fff',
            overflow: 'visible',
          }}>
          <Box
            sx={{
              pr: trackingUrl ? '40mm' : 0,
              minHeight: trackingUrl ? '25mm' : 'auto',
              display: 'flex',
              alignItems: 'center',
            }}>
            <Box
              data-invoice-region="company-information"
              sx={{
                minWidth: 0,
                px: '1mm',
                py: '0.8mm',
              }}>
              <Typography sx={{ fontSize: '3.45mm', fontWeight: 800, lineHeight: 1.1, color: '#000' }}>
                {invoiceData.company.thaiName}{' '}
                <Box component="span" sx={{ fontSize: '2.7mm', fontWeight: 400 }}>
                  (สาขา {invoiceData.company.branchNumber})
                </Box>
              </Typography>
              <Typography sx={{ mt: '0.7mm', fontSize: '3.45mm', fontWeight: 700, lineHeight: 1.1, color: '#000' }}>
                {invoiceData.company.englishName}{' '}
                <Box component="span" sx={{ fontSize: '2.7mm', fontWeight: 400 }}>
                  (Branch {invoiceData.company.branchNumber})
                </Box>
              </Typography>
              <Typography sx={{ mt: '0.7mm', fontSize: '2.75mm', lineHeight: 1.2, color: '#000' }}>
                Tax ID : {invoiceData.company.taxId} โทร / Phone : {invoiceData.company.phone}
              </Typography>
              <Typography sx={{ mt: '0.55mm', fontSize: '2.75mm', lineHeight: 1.2, color: '#000' }}>{invoiceData.company.address}</Typography>
            </Box>
          </Box>
          {trackingUrl ? (
            <Box sx={{ position: 'absolute', top: '50%', right: 0, width: '40mm', transform: 'translateY(-50%)', display: 'grid', placeItems: 'center' }}>
              <TrackingQr trackingUrl={trackingUrl} compact />
            </Box>
          ) : null}
        </Box>

        <Box data-invoice-region="document-title" sx={{ position: 'relative', px: '1.6mm', py: '1.3mm', minHeight: '14.4mm' }}>
          <Typography
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              px: '20mm',
              fontSize: '5.6mm',
              fontWeight: 700,
              lineHeight: 1.2,
              textAlign: 'center',
            }}>
            {renderedCopyTitle}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box
            data-invoice-region="issued-date"
            sx={{
              width: '43mm',
              bgcolor: '#f3f3f3',
              px: '2mm',
              py: '1.15mm',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: '1.5mm',
            }}>
            <Typography sx={{ fontSize: '2.65mm', fontWeight: 700, lineHeight: 1.15, whiteSpace: 'nowrap' }}>วันที่ / Date</Typography>
            <Typography sx={{ fontSize: '3.2mm', fontWeight: 800, lineHeight: 1.15, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{invoiceData.dateLine}</Typography>
          </Box>
        </Box>
      </Stack>

      <Stack spacing="0.8mm">
        <Box sx={{ border: BORDER, px: '2mm', py: '1mm' }}>
          <InfoLine label="ลูกค้า / Customer : " value={invoiceData.customer.name} labelFontSize="3.2mm" valueFontSize="3.1mm" />
          <InfoLine label="ที่อยู่ / Address :" value={invoiceData.customer.address} minHeight="9.5mm" labelFontSize="3.2mm" valueFontSize="3.1mm" />
          <InfoLine label="เลขประจำตัวผู้เสียภาษี Tax ID :" value={invoiceData.customer.taxId} labelFontSize="3.2mm" valueFontSize="3.1mm" />
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
            <Typography sx={{ fontSize: '3mm', fontWeight: 700, lineHeight: 1.2 }}>จำนวน</Typography>
            <Typography sx={{ fontSize: '3mm', lineHeight: 1.1 }}>Quantity</Typography>
          </Box>
          <Box sx={{ px: '1mm', py: '1mm', borderRight: BORDER, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '3mm', fontWeight: 700, lineHeight: 1.2 }}>รายการ</Typography>
            <Typography sx={{ fontSize: '3mm', lineHeight: 1.1 }}>Description</Typography>
          </Box>
          <Box sx={{ px: '1mm', py: '1mm', borderRight: BORDER, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '3mm', fontWeight: 700, lineHeight: 1.2 }}>ราคาต่อหน่วย</Typography>
            <Typography sx={{ fontSize: '3mm', lineHeight: 1.1 }}>Price / Unit</Typography>
          </Box>
          <Box sx={{ px: '1mm', py: '1mm', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '3mm', fontWeight: 700, lineHeight: 1.2 }}>บาท / สต.</Typography>
            <Typography sx={{ fontSize: '3mm', lineHeight: 1.1 }}>Bahe / Stg.</Typography>
          </Box>
        </Box>

        <Box>
          {rows.map(row => (
            <Box
              key={row.key}
              sx={{
                display: 'grid',
                gridTemplateColumns: '16mm 1fr 24mm 24mm',
                minHeight: '7.4mm',
                '&:not(:last-of-type)': {
                  borderBottom: DOTTED_BORDER,
                },
              }}>
              <Box sx={{ px: '1mm', py: '1mm', borderRight: BORDER, textAlign: 'center' }}>
                <Typography sx={{ fontSize: `3.5mm`, lineHeight: 1.2 }}>{row.item ? row.item.quantity : ''}</Typography>
              </Box>
              <Box sx={{ px: '1.2mm', py: '1mm', borderRight: BORDER }}>
                <Typography sx={{ fontSize: `3.5mm`, lineHeight: 1.2, wordBreak: 'break-word' }}>{row.item?.description ?? ''}</Typography>
              </Box>
              <Box sx={{ px: '1.2mm', py: '1mm', borderRight: BORDER, textAlign: 'right' }}>
                <Typography sx={{ fontSize: `3.5mm`, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{row.item ? formatCurrency(row.item.unitPrice) : ''}</Typography>
              </Box>
              <Box sx={{ px: '1.2mm', py: '1mm', textAlign: 'right' }}>
                <Typography sx={{ fontSize: `3.5mm`, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{row.item ? formatCurrency(row.item.amount) : ''}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ bgcolor: '#fff' }}>
        <Stack spacing={0}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: '1.8mm', py: '1.1mm', borderBottom: DOTTED_BORDER }}>
            <Typography sx={{ fontSize: '3mm', fontWeight: 400, lineHeight: 1.2 }}>รวมมูลค่าสินค้า / TOTAL</Typography>
            <Typography sx={{ fontSize: '3mm', fontWeight: 700, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(invoiceData.subtotal)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: '1.8mm', py: '1.1mm', borderBottom: DOTTED_BORDER }}>
            <Typography sx={{ fontSize: '3mm', fontWeight: 400, lineHeight: 1.2 }}>ภาษีมูลค่าเพิ่ม 7% / VALUE ADDED TAX</Typography>
            <Typography sx={{ fontSize: '3mm', fontWeight: 700, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(invoiceData.vat)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: '1.8mm', py: '1.25mm', bgcolor: '#f3f3f3' }}>
            <Typography sx={{ fontSize: '3.2mm', fontWeight: 400, lineHeight: 1.2 }}>จำนวนเงินรวมทั้งสิ้น / TOTAL AMOUNT INCLUDED VAT</Typography>
            <Typography sx={{ fontSize: '3.5mm', fontWeight: 700, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(invoiceData.totalAmount)}</Typography>
          </Stack>

          <Box sx={{ px: '1.8mm', py: '1.2mm', display: 'flex', justifyContent: 'center', overflow: 'visible' }}>
            <Stack spacing="0.9mm" sx={{ width: '100%', maxWidth: 'none', alignItems: 'flex-end', textAlign: 'right', whiteSpace: 'nowrap' }}>
              <Box sx={{ px: '1.5mm', py: '0.4mm', bgcolor: '#E5E7EB', whiteSpace: 'nowrap' }}>
                <Typography sx={{ fontSize: '4.6mm', fontWeight: 400, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{invoiceData.amountInWords}</Typography>
              </Box>
              <Typography sx={{ fontSize: '2.4mm', fontWeight: 500, lineHeight: 1.15 }}>จำนวนเงินเป็นตัวอักษร / Amount in Words</Typography>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ mt: 'auto', bgcolor: '#fff', borderTop: BORDER, pt: '1.2mm' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1.15fr 0.925fr 0.925fr', gap: '1.4mm', alignItems: 'stretch' }}>
          <Stack spacing="1mm" sx={{ minWidth: 0, minHeight: '15mm', border: BORDER, px: '1.5mm', py: '1.1mm', bgcolor: '#fafafa' }}>
            <Typography sx={{ pb: '0.8mm', borderBottom: BORDER, fontSize: '2.7mm', fontWeight: 700, lineHeight: 1.2 }}>การชำระเงิน / Payment</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', justifyContent: 'space-between', gap: '1mm', alignItems: 'center' }}>
              <CheckboxField label="เงินสด" checked={invoiceData.paymentMethod === 'cash'} />
              <CheckboxField label="โอนเงิน" checked={invoiceData.paymentMethod === 'transfer'} />
              <CheckboxField label="อื่นๆ" checked={false} />
            </Box>
            <Typography sx={{ pt: '0.7mm', borderTop: DOTTED_BORDER, fontSize: '2.1mm', lineHeight: 1.2, whiteSpace: 'nowrap' }}>อื่นๆ / Other : __________________</Typography>
          </Stack>

          <Box sx={{ minWidth: 0, minHeight: '15mm', px: '1mm', pt: '0.8mm', pb: '0.9mm', border: BORDER, display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontSize: '2.1mm', color: '#555', lineHeight: 1.2 }}>ลงชื่อ / Signature</Typography>
            <Box sx={{ mt: '4.5mm', borderBottom: BORDER }} />
            <Typography sx={{ mt: '1mm', fontSize: '2.2mm', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{invoiceData.collectorSignatureLabel}</Typography>
          </Box>

          <Box sx={{ minWidth: 0, minHeight: '15mm', px: '1mm', pt: '0.8mm', pb: '0.9mm', border: BORDER, display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontSize: '2.1mm', color: '#555', lineHeight: 1.2 }}>ลงชื่อ / Signature</Typography>
            <Box sx={{ mt: '4.5mm', borderBottom: BORDER }} />
            <Typography sx={{ mt: '1mm', fontSize: '2.2mm', fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{invoiceData.customerSignatureLabel}</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: '1.2mm', px: '1.5mm', py: '0.8mm', borderTop: DOTTED_BORDER }}>
          <Typography sx={{ minWidth: 0, fontSize: '2.3mm', lineHeight: 1.2, textAlign: 'center' }}>{invoiceData.notes}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export function TaxInvoiceTemplate({ invoiceData, minItemRows = MIN_ITEM_ROWS, trackingUrl }: Readonly<TaxInvoiceTemplateProps>) {
  return (
    <Box
      className="invoice-document-sheet"
      sx={{
        width: `${PAGE_WIDTH_MM}mm`,
        height: `${PAGE_HEIGHT_MM}mm`,
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: `repeat(2, ${COPY_WIDTH_MM}mm)`,
        columnGap: `${CUT_GAP_MM}mm`,
        bgcolor: '#fff',
        boxSizing: 'border-box',
        breakInside: 'avoid',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          borderLeft: '0.35mm dashed #000',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          zIndex: 5,
          printColorAdjust: 'exact',
          WebkitPrintColorAdjust: 'exact',
        },
      }}>
      <InvoiceCopy invoiceData={invoiceData} minItemRows={minItemRows} copyIndex={0} trackingUrl={trackingUrl} />
      <InvoiceCopy invoiceData={invoiceData} minItemRows={minItemRows} copyIndex={1} trackingUrl={trackingUrl} />
    </Box>
  );
}

export function ReceiptTemplate({ invoiceData, trackingUrl }: Readonly<{ invoiceData: InvoiceData; trackingUrl?: string | null }>) {
  const hasVat = invoiceData.vat > 0;

  return (
    <Box
      className="receipt-document-sheet"
      sx={{
        width: '100%',
        maxWidth: '80mm',
        minHeight: '110mm',
        boxSizing: 'border-box',
        px: '4mm',
        py: '5mm',
        color: '#111827',
        bgcolor: '#fff',
        fontFamily: '"Noto Sans Thai", Tahoma, sans-serif',
        printColorAdjust: 'exact',
        WebkitPrintColorAdjust: 'exact',
      }}>
      <Stack spacing="3mm">
        <Stack spacing="1mm" alignItems="center" textAlign="center">
          <Typography sx={{ fontSize: '4.5mm', fontWeight: 800, lineHeight: 1.15 }}>{invoiceData.company.thaiName}</Typography>
          {invoiceData.company.englishName !== '-' ? <Typography sx={{ fontSize: '2.7mm', lineHeight: 1.2 }}>{invoiceData.company.englishName}</Typography> : null}
        </Stack>

        <Box sx={{ borderTop: '0.3mm dashed #111827', borderBottom: '0.3mm dashed #111827', py: '2.5mm', textAlign: 'center' }}>
          <Typography sx={{ fontSize: '3.8mm', fontWeight: 800, lineHeight: 1.2 }}>ใบแจ้งราคาสินค้า / ใบส่งของ</Typography>
          <Typography sx={{ mt: '0.5mm', fontSize: '2.35mm', letterSpacing: '0.06em', lineHeight: 1.2 }}>INVOICE / DELIVERY NOTE</Typography>
        </Box>

        <Stack spacing="1mm" sx={{ fontSize: '2.7mm' }}>
          <Stack direction="row" justifyContent="space-between" spacing="3mm">
            <Typography sx={{ fontSize: '2.7mm' }}>เลขที่</Typography>
            <Typography sx={{ fontSize: '2.7mm', fontWeight: 700, textAlign: 'right', overflowWrap: 'anywhere' }}>{invoiceData.invoiceNo}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" spacing="3mm">
            <Typography sx={{ fontSize: '2.7mm' }}>วันที่</Typography>
            <Typography sx={{ fontSize: '2.7mm', textAlign: 'right' }}>{invoiceData.issuedDate}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" spacing="3mm">
            <Typography sx={{ fontSize: '2.7mm' }}>เวลา</Typography>
            <Typography sx={{ fontSize: '2.7mm', textAlign: 'right' }}>{invoiceData.issuedTime} น.</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" spacing="3mm">
            <Typography sx={{ fontSize: '2.7mm' }}>ชำระโดย</Typography>
            <Typography sx={{ fontSize: '2.7mm', textAlign: 'right' }}>{invoiceData.paymentMethod === 'cash' ? 'เงินสด' : 'โอนเงิน'}</Typography>
          </Stack>
        </Stack>

        <Box sx={{ borderTop: '0.3mm dashed #111827', pt: '2mm' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 10mm 17mm', columnGap: '1.5mm', pb: '1.5mm', borderBottom: '0.2mm solid #111827' }}>
            <Typography sx={{ fontSize: '2.5mm', fontWeight: 800 }}>รายการ</Typography>
            <Typography sx={{ fontSize: '2.5mm', fontWeight: 800, textAlign: 'right' }}>จำนวน</Typography>
            <Typography sx={{ fontSize: '2.5mm', fontWeight: 800, textAlign: 'right' }}>รวม</Typography>
          </Box>
          <Stack spacing="1.8mm" sx={{ pt: '2mm' }}>
            {invoiceData.items.map((item, itemIndex) => (
              <Box key={`${item.description}-${itemIndex}`} sx={{ display: 'grid', gridTemplateColumns: '1fr 10mm 17mm', columnGap: '1.5mm', alignItems: 'start' }}>
                <Box>
                  <Typography sx={{ fontSize: '2.8mm', lineHeight: 1.25, overflowWrap: 'anywhere' }}>{item.description}</Typography>
                  <Typography sx={{ mt: '0.4mm', fontSize: '2.35mm', color: '#4B5563', lineHeight: 1.2 }}>{formatCurrency(item.unitPrice)} / หน่วย</Typography>
                </Box>
                <Typography sx={{ fontSize: '2.8mm', lineHeight: 1.25, textAlign: 'right' }}>{item.quantity}</Typography>
                <Typography sx={{ fontSize: '2.8mm', lineHeight: 1.25, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(item.amount)}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        <Stack spacing="1.2mm" sx={{ borderTop: '0.3mm dashed #111827', pt: '2.5mm' }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography sx={{ fontSize: '2.8mm' }}>รวมค่าสินค้า</Typography>
            <Typography sx={{ fontSize: '2.8mm', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(invoiceData.subtotal)}</Typography>
          </Stack>
          {hasVat ? (
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: '2.8mm' }}>ภาษีมูลค่าเพิ่ม 7%</Typography>
              <Typography sx={{ fontSize: '2.8mm', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(invoiceData.vat)}</Typography>
            </Stack>
          ) : null}
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mt: '0.8mm', pt: '1.8mm', borderTop: '0.2mm solid #111827' }}>
            <Typography sx={{ fontSize: '3.4mm', fontWeight: 800 }}>ยอดชำระสุทธิ</Typography>
            <Typography sx={{ fontSize: '4mm', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(invoiceData.totalAmount)}</Typography>
          </Stack>
          <Typography sx={{ pt: '0.8mm', fontSize: '2.55mm', lineHeight: 1.35, textAlign: 'center', overflowWrap: 'anywhere' }}>({invoiceData.amountInWords})</Typography>
        </Stack>

        <Stack spacing="1.5mm" alignItems="center" sx={{ borderTop: '0.3mm dashed #111827', pt: '3mm', textAlign: 'center' }}>
          {invoiceData.notes ? <Typography sx={{ fontSize: '2.35mm', lineHeight: 1.35 }}>{invoiceData.notes}</Typography> : null}
          <TrackingQr trackingUrl={trackingUrl} />
          <Typography sx={{ fontSize: '2.8mm', fontWeight: 700, lineHeight: 1.3 }}>ขอบคุณที่ใช้บริการ</Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

export function InvoiceDocument({ documentType, order, trackingOrigin, trackingToken }: Readonly<InvoiceDocumentProps>) {
  const invoiceData = buildInvoiceDataFromOrder(order, documentType);
  const trackingUrl = trackingToken ? buildSecureOrderTrackingUrl(trackingToken, trackingOrigin) : null;

  if (documentType === 'receipt') {
    return <ReceiptTemplate invoiceData={invoiceData} trackingUrl={trackingUrl} />;
  }

  return <TaxInvoiceTemplate invoiceData={invoiceData} trackingUrl={trackingUrl} />;
}

export function InvoiceMobilePreview({ documentType, order, trackingOrigin, trackingToken }: Readonly<InvoiceDocumentProps>) {
  const invoiceData = buildInvoiceDataFromOrder(order, documentType);
  const trackingUrl = trackingToken ? buildSecureOrderTrackingUrl(trackingToken, trackingOrigin) : null;

  if (documentType === 'receipt') {
    return <ReceiptTemplate invoiceData={invoiceData} trackingUrl={trackingUrl} />;
  }

  return <InvoiceCopy invoiceData={invoiceData} copyIndex={0} trackingUrl={trackingUrl} />;
}
