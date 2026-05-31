'use client';

import { Box, Stack, Typography } from '@mui/material';
import { formatCustomerAddress, type NormalizedInvoiceOrder, type PaymentMethod } from '../../../../lib/contracts';
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

const PAGE_WIDTH_MM = 285;
const PAGE_HEIGHT_MM = 197;
const COPY_WIDTH_MM = PAGE_WIDTH_MM / 2;
const BORDER = '0.2mm solid #000';
const DOTTED_BORDER = '0.2mm dotted #000';
const BASE_FONT_MM = 2.55;
const SECTION_GAP_MM = 1;
const MIN_ITEM_ROWS = 7;

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

function getRenderedCopyTitle(baseTitle: string, copyIndex: number): string {
  if (baseTitle.startsWith('ต้นฉบับ')) {
    return copyIndex === 0 ? baseTitle.replaceAll('ต้นฉบับ', 'สำเนา') : baseTitle;
  }

  if (baseTitle.startsWith('ใบเสนอราคา')) {
    return copyIndex === 0 ? `สำเนา${baseTitle}` : `ต้นฉบับ${baseTitle}`;
  }

  return copyIndex === 0 ? `สำเนา${baseTitle}` : `ต้นฉบับ${baseTitle}`;
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
    thaiName: readEnv(process.env.NEXT_PUBLIC_COMPANY_THAI_NAME, 'กลอสซี่ ปริ้น แอนด์ พรีเมี่ยม'),
    englishName: readEnv(process.env.NEXT_PUBLIC_COMPANY_ENGLISH_NAME, 'GLOSSY PRINT AND PREMIUM'),
    branchNumber: readEnv(process.env.NEXT_PUBLIC_COMPANY_BRANCH_NO, 'สำนักงานใหญ่'),
    address: readEnv(process.env.NEXT_PUBLIC_COMPANY_ADDRESS, '55 ถนนศรีนครินทร์ แขวงหนองบอน เขตประเวศ จังหวัดกรุงเทพฯ 10250'),
    phone: readEnv(process.env.NEXT_PUBLIC_COMPANY_PHONE, '081-555-2929'),
    taxId: readEnv(process.env.NEXT_PUBLIC_COMPANY_TAX_ID, '3160100252587'),
    email: readEnv(process.env.NEXT_PUBLIC_COMPANY_EMAIL, 'glossy2929@gmail.com'),
    website: readEnv(process.env.NEXT_PUBLIC_COMPANY_WEBSITE, 'glossysiam.com'),
  };
}

export function buildInvoiceDataFromOrder(order: NormalizedInvoiceOrder, documentType: InvoiceDocumentType): InvoiceData {
  const company = getCompanyInfo();
  const issuedDate = formatThaiTaxDate(order.issueDate || order.orderDate);
  const totalAmount = order.grandTotal;
  const customerAddress = formatCustomerAddress(order.customerInfo) || order.address;
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
      name: order.customerInfo.customerName || order.customerName,
      taxId: order.customerInfo.taxId || order.taxId,
      address: customerAddress,
    },
    items,
    subtotal: order.subtotal,
    vat: order.vatAmount,
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

function SignatureColumn({ label }: Readonly<{ label: string }>) {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box sx={{ borderBottom: BORDER, height: '9mm' }} />
      <Typography sx={{ mt: '1.1mm', fontSize: '2.2mm', textAlign: 'center', lineHeight: 1.2 }}>{label}</Typography>
    </Box>
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

function SummaryLine({
  label,
  value,
  bold = false,
  labelFontSize = '3mm',
  valueFontSize,
  labelWhiteSpace = 'normal',
}: Readonly<{
  label: string;
  value: string;
  bold?: boolean;
  labelFontSize?: string;
  valueFontSize?: string;
  labelWhiteSpace?: 'normal' | 'nowrap';
}>) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing="9mm" alignItems="center" sx={{ py: '0.15mm' }}>
      <Typography sx={{ flex: 1, minWidth: 0, fontSize: labelFontSize, fontWeight: bold ? 700 : 500, lineHeight: 1.15, whiteSpace: labelWhiteSpace, textAlign: 'right' }}>{label}</Typography>
      <Typography
        sx={{
          minWidth: '15mm',
          fontSize: valueFontSize ?? (bold ? '3.25mm' : '3mm'),
          fontWeight: bold ? 700 : 500,
          lineHeight: 1.1,
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
        border: BORDER,
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
        <Stack direction="row" sx={{ border: BORDER }}>
          <Box sx={{ width: '50%', px: '1.4mm', py: '1.1mm', borderRight: BORDER }}>
            <Typography sx={{ fontSize: '2.25mm', lineHeight: 1.2 }}>เล่มที่ Book No. {invoiceData.bookNo}</Typography>
          </Box>
          <Box sx={{ width: '50%', px: '1.4mm', py: '1.1mm' }}>
            <Typography sx={{ fontSize: '2.25mm', lineHeight: 1.2 }}>เลขที่ Invoice No. {invoiceData.invoiceNo}</Typography>
          </Box>
        </Stack>

        <Box sx={{ border: BORDER, px: '1.6mm', py: '1.4mm' }}>
          <Stack direction="row" spacing="2mm" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ width: '42%', textAlign: 'left' }}>
              <Typography sx={{ fontSize: '4.4mm', fontWeight: 700, lineHeight: 1.2 }}>{invoiceData.company.thaiName}</Typography>
              <Typography sx={{ mt: '0.3mm', fontSize: '3.6mm', lineHeight: 1.2 }}>{invoiceData.company.englishName}</Typography>
              <Typography sx={{ mt: '0.35mm', fontSize: '2.25mm', lineHeight: 1.2 }}>สาขา / Branch No. {invoiceData.company.branchNumber}</Typography>
            </Box>
            <Box sx={{ width: '58%', textAlign: 'right' }}>
              <Typography sx={{ fontSize: '3mm', lineHeight: 1.25 }}>{invoiceData.company.address}</Typography>
              <Typography sx={{ mt: '0.35mm', fontSize: '2.15mm', lineHeight: 1.25 }}>
                โทร / Phone : {invoiceData.company.phone} | Tax ID : {invoiceData.company.taxId}
              </Typography>
              <Typography sx={{ mt: '0.2mm', fontSize: '2.05mm', lineHeight: 1.25 }}>
                Email : {invoiceData.company.email} | Website : {invoiceData.company.website}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ position: 'relative', border: BORDER, px: '1.6mm', py: '1.3mm', minHeight: '7mm' }}>
          <Typography
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              px: '20mm',
              fontSize: '3.4mm',
              fontWeight: 700,
              lineHeight: 1.2,
              textAlign: 'center',
            }}>
            {renderedCopyTitle}
          </Typography>
          <Typography sx={{ mt: '1.25mm', fontSize: `${BASE_FONT_MM}mm`, lineHeight: 1.2, textAlign: 'right', whiteSpace: 'nowrap' }}>วันที่ / Date : {invoiceData.issuedDate}</Typography>
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
            <Typography sx={{ fontSize: '3mm', lineHeight: 1.1 }}>/ Quantity</Typography>
          </Box>
          <Box sx={{ px: '1mm', py: '1mm', borderRight: BORDER, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '3mm', fontWeight: 700, lineHeight: 1.2 }}>รายละเอียด</Typography>
            <Typography sx={{ fontSize: '3mm', lineHeight: 1.1 }}>/ Description</Typography>
          </Box>
          <Box sx={{ px: '1mm', py: '1mm', borderRight: BORDER, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '3mm', fontWeight: 700, lineHeight: 1.2 }}>ราคาต่อหน่วย</Typography>
            <Typography sx={{ fontSize: '3mm', lineHeight: 1.1 }}>Price / Unit</Typography>
          </Box>
          <Box sx={{ px: '1mm', py: '1mm', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '3mm', fontWeight: 700, lineHeight: 1.2 }}>บาท</Typography>
            <Typography sx={{ fontSize: '3mm', lineHeight: 1.1 }}>/ Stg.</Typography>
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
                <Typography sx={{ fontSize: `${BASE_FONT_MM}mm`, lineHeight: 1.2 }}>{row.item ? row.item.quantity : ''}</Typography>
              </Box>
              <Box sx={{ px: '1.2mm', py: '1mm', borderRight: BORDER }}>
                <Typography sx={{ fontSize: `${BASE_FONT_MM}mm`, lineHeight: 1.2, wordBreak: 'break-word' }}>{row.item?.description ?? ''}</Typography>
              </Box>
              <Box sx={{ px: '1.2mm', py: '1mm', borderRight: BORDER, textAlign: 'right' }}>
                <Typography sx={{ fontSize: `${BASE_FONT_MM}mm`, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
                  {row.item ? formatCurrency(row.item.unitPrice) : ''}
                </Typography>
              </Box>
              <Box sx={{ px: '1.2mm', py: '1mm', textAlign: 'right' }}>
                <Typography sx={{ fontSize: `${BASE_FONT_MM}mm`, lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
                  {row.item ? formatCurrency(row.item.amount) : ''}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Stack spacing="0.8mm">
        <SummaryLine label="รวมมูลค่าสินค้า / TOTAL" value={formatCurrency(invoiceData.subtotal)} labelFontSize="4mm" valueFontSize="4mm" />
        <SummaryLine label="ภาษีมูลค่าเพิ่ม 7% / VALUE ADDED TAX" value={formatCurrency(invoiceData.vat)} labelFontSize="4mm" valueFontSize="4mm" />

        <SummaryLine label="จำนวนเงินรวมทั้งสิ้น / TOTAL AMOUNT INCLUDED VAT" value={formatCurrency(invoiceData.totalAmount)} bold labelFontSize="4mm" valueFontSize="4mm" />
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 50mm', gap: '0.8mm', alignItems: 'stretch' }}>
          <Box />
          <Stack spacing="0.35mm" sx={{ px: '0.2mm' }}>
            <Box sx={{ px: '0.4mm', py: '0.15mm' }}></Box>
            <Box sx={{ px: '0.4mm', py: '0.15mm' }}></Box>
            <Box sx={{ px: '0.4mm', py: '0.15mm' }}></Box>
          </Stack>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 50mm', gap: '0.8mm', alignItems: 'stretch' }}>
          <Box />
          <Stack spacing="0.4mm">
            <Box sx={{ border: BORDER, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ px: '1.4mm', py: '1.2mm', bgcolor: '#d4d4d8', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '4mm', fontWeight: 700, lineHeight: 1.2 }}>{invoiceData.amountInWords}</Typography>
              </Box>
            </Box>
            <Typography sx={{ px: '1.2mm', py: '0.3mm', fontSize: '4mm', lineHeight: 1.2, textAlign: 'center' }}>จำนวนเงินเป็นตัวอักษร Amount in Words</Typography>
          </Stack>
        </Box>
      </Stack>

      <Box sx={{ mt: 'auto', border: BORDER }}>
        <Box sx={{ px: '1.4mm', py: '1.1mm' }}>
          <Stack direction="row" spacing="2.2mm">
            <Box sx={{ flex: 2, minWidth: 0 }}>
              <Box sx={{ borderBottom: BORDER, height: '9mm' }} />
              <Typography sx={{ mt: '1.1mm', fontSize: '2.2mm', textAlign: 'center', lineHeight: 1.2 }}>{`${invoiceData.collectorSignatureLabel} `}</Typography>
            </Box>
            <SignatureColumn label={invoiceData.customerSignatureLabel} />
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" spacing="4mm" sx={{ mt: '1.2mm' }}>
            <Stack spacing="0.4mm" sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '2.15mm', lineHeight: 1.2, whiteSpace: 'nowrap' }}>วันที่ / Date ____________________ {invoiceData.dateLine}</Typography>
              <Typography sx={{ fontSize: '1.85mm', lineHeight: 1.15 }}>{invoiceData.notes}</Typography>
            </Stack>
            <Stack spacing="0.7mm" sx={{ flexShrink: 0, minWidth: '30mm', alignItems: 'flex-start' }}>
              <Typography sx={{ fontSize: '2.2mm', fontWeight: 700, lineHeight: 1.2 }}>การชำระ / Payment</Typography>
              <Stack direction="row" spacing="3mm" alignItems="center">
                <CheckboxField label="เงินสด" checked={invoiceData.paymentMethod === 'cash'} />
                <CheckboxField label="โอนเงิน" checked={invoiceData.paymentMethod === 'transfer'} />
              </Stack>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export function TaxInvoiceTemplate({ invoiceData, minItemRows = MIN_ITEM_ROWS }: Readonly<TaxInvoiceTemplateProps>) {
  return (
    <Box
      className="invoice-document-sheet"
      sx={{
        width: `${PAGE_WIDTH_MM}mm`,
        height: `${PAGE_HEIGHT_MM}mm`,
        display: 'grid',
        gridTemplateColumns: `repeat(2, ${COPY_WIDTH_MM}mm)`,
        gap: 0,
        bgcolor: '#fff',
        boxSizing: 'border-box',
        breakInside: 'avoid',
      }}>
      <InvoiceCopy invoiceData={invoiceData} minItemRows={minItemRows} copyIndex={0} />
      <InvoiceCopy invoiceData={invoiceData} minItemRows={minItemRows} copyIndex={1} />
    </Box>
  );
}

export function InvoiceDocument({ documentType, order }: Readonly<InvoiceDocumentProps>) {
  return <TaxInvoiceTemplate invoiceData={buildInvoiceDataFromOrder(order, documentType)} />;
}
