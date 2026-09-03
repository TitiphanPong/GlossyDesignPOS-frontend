import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import type { NormalizedInvoiceOrder } from '../../../lib/contracts';
import { buildInvoiceDataFromOrder, InvoiceDocument, InvoiceMobilePreview, ReceiptTemplate, TaxInvoiceTemplate } from './[orderId]/InvoiceDocument';

const sampleOrder: NormalizedInvoiceOrder = {
  orderId: 'order-123',
  orderNumber: 'ORD-2026-00123',
  invoiceNumber: 'TAX-2026-00023',
  bookNo: '002',
  invoiceSequence: '001',
  invoicePeriod: '202608',
  customerName: 'Customer Name',
  phoneNumber: '0812345678',
  email: '-',
  address: 'Customer Address',
  taxId: '1234567890123',
  branch: '-',
  note: '-',
  salesChannel: 'pos',
  paymentMethod: 'cash',
  status: 'paid',
  issueDate: '2026-08-25T10:00:00.000Z',
  orderDate: '2026-08-25T10:00:00.000Z',
  taxInvoice: 'yes',
  customerInfo: {
    customerName: 'Customer Name',
    taxId: '1234567890123',
    address: 'Customer Address',
  },
  cart: [{ name: 'Premium Print', quantity: 2, unitPrice: 150, totalPrice: 300 }],
  subtotal: 300,
  discount: 0,
  finalTotal: 300,
  vatAmount: 21,
  grandTotal: 321,
};

test('receipt data uses the order number and does not synthesize VAT', () => {
  const receiptData = buildInvoiceDataFromOrder(sampleOrder, 'receipt');

  assert.equal(receiptData.invoiceNo, sampleOrder.orderNumber);
  assert.equal(receiptData.vat, sampleOrder.vatAmount);
  assert.equal(receiptData.totalAmount, sampleOrder.grandTotal);
  assert.equal(receiptData.issuedDate, '25/08/2569');
  assert.equal(receiptData.issuedTime, '17:00');
});

test('thermal delivery note hides company contact details and uses the requested document title', () => {
  const receiptData = buildInvoiceDataFromOrder(sampleOrder, 'receipt');
  const html = renderToStaticMarkup(
    ReceiptTemplate({
      invoiceData: {
        ...receiptData,
        company: {
          ...receiptData.company,
          address: 'SECRET ADDRESS',
          phone: '081-555-2929',
          taxId: '3160100252587',
        },
      },
    })
  );

  assert.match(html, /ใบแจ้งราคาสินค้า \/ ใบส่งของ/);
  assert.match(html, /INVOICE \/ DELIVERY NOTE/);
  assert.doesNotMatch(html, /SECRET ADDRESS/);
  assert.doesNotMatch(html, /081-555-2929/);
  assert.doesNotMatch(html, /3160100252587/);
  assert.equal(receiptData.copyTitle, 'ต้นฉบับ ใบแจ้งราคาสินค้า / ใบส่งของ');
});

test('tax invoice data uses its invoice number and receipt dispatch selects the thermal template', () => {
  const taxInvoiceData = buildInvoiceDataFromOrder(sampleOrder, 'tax-invoice');
  const receiptDocument = InvoiceDocument({ documentType: 'receipt', order: sampleOrder });
  const taxInvoiceDocument = InvoiceDocument({ documentType: 'tax-invoice', order: sampleOrder });

  assert.equal(taxInvoiceData.bookNo, sampleOrder.bookNo);
  assert.equal(taxInvoiceData.invoiceNo, sampleOrder.invoiceSequence);
  assert.equal(receiptDocument.type, ReceiptTemplate);
  assert.equal(taxInvoiceDocument.type, TaxInvoiceTemplate);
});

test('customer documents render a secure tracking QR when staff-issued access is available', () => {
  const trackingToken = 'E'.repeat(43);
  const receiptHtml = renderToStaticMarkup(InvoiceDocument({ documentType: 'receipt', order: sampleOrder, trackingOrigin: 'https://pos.example.com', trackingToken }));
  const taxInvoiceHtml = renderToStaticMarkup(InvoiceDocument({ documentType: 'tax-invoice', order: sampleOrder, trackingOrigin: 'https://pos.example.com', trackingToken }));

  assert.match(receiptHtml, /Order tracking QR/);
  assert.match(receiptHtml, /ติดตามสถานะงาน/);
  assert.match(taxInvoiceHtml, /Order tracking QR/);
  assert.doesNotMatch(receiptHtml, /0812345678/);
  assert.doesNotMatch(receiptHtml, /order=ORD-2026-00123/);
});

test('tax invoice keeps document numbers above the header and the issued date below the title', () => {
  const trackingToken = 'F'.repeat(43);
  const html = renderToStaticMarkup(
    InvoiceDocument({
      documentType: 'tax-invoice',
      order: sampleOrder,
      trackingOrigin: 'https://pos.example.com',
      trackingToken,
    })
  );

  assert.equal(html.match(/data-invoice-region="issued-date"/g)?.length, 2);
  assert.equal(html.match(/data-invoice-region="tracking-qr"/g)?.length, 2);
  assert.ok(html.indexOf('เล่มที่ Book No.') < html.indexOf('data-invoice-region="company-header"'));
  assert.ok(html.indexOf('เลขที่ Invoice No.') < html.indexOf('data-invoice-region="company-header"'));
  assert.ok(html.indexOf('data-invoice-region="company-header"') < html.indexOf('data-invoice-region="document-title"'));
  assert.ok(html.indexOf('data-invoice-region="document-title"') < html.indexOf('data-invoice-region="issued-date"'));
  assert.ok(html.indexOf('data-invoice-region="company-information"') < html.indexOf('data-invoice-region="tracking-qr"'));
});

test('mobile tax invoice preview renders one readable original copy', () => {
  const html = renderToStaticMarkup(InvoiceMobilePreview({ documentType: 'tax-invoice', order: sampleOrder }));

  assert.equal(html.match(/data-copy-index="0"/g)?.length, 1);
  assert.equal(html.match(/data-copy-index="1"/g)?.length ?? 0, 0);
});

test('customer documents remain printable when tracking QR generation is unavailable', () => {
  const html = renderToStaticMarkup(InvoiceDocument({ documentType: 'receipt', order: sampleOrder }));

  assert.match(html, /ใบแจ้งราคาสินค้า \/ ใบส่งของ/);
  assert.doesNotMatch(html, /Order tracking QR/);
});

test('normal tax invoice has no cancellation watermark and keeps the compact summary', () => {
  const html = renderToStaticMarkup(InvoiceDocument({ documentType: 'tax-invoice', order: sampleOrder }));

  assert.doesNotMatch(html, /data-invoice-cancelled-watermark="true"/);
  assert.doesNotMatch(html, /ส่วนลด \/ DISCOUNT/);
  assert.doesNotMatch(html, /ยอดหลังหักส่วนลด \/ NET AMOUNT/);
});

test('tax invoice renders persisted fixed discount totals before VAT without browser re-pricing', () => {
  const order: NormalizedInvoiceOrder = {
    ...sampleOrder,
    subtotal: 700,
    discount: 100,
    finalTotal: 600,
    vatAmount: 42,
    grandTotal: 642,
  };
  const data = buildInvoiceDataFromOrder(order, 'tax-invoice');
  const html = renderToStaticMarkup(InvoiceDocument({ documentType: 'tax-invoice', order }));

  assert.equal(data.subtotal, 700);
  assert.equal(data.discount, 100);
  assert.equal(data.netAmount, 600);
  assert.equal(data.vat, 42);
  assert.equal(data.totalAmount, 642);
  assert.equal(data.amountInWords, 'หกร้อยสี่สิบสองบาทถ้วน');
  assert.match(html, /รวมมูลค่าสินค้า \/ SUBTOTAL/);
  assert.match(html, /ส่วนลด \/ DISCOUNT/);
  assert.match(html, /ยอดหลังหักส่วนลด \/ NET AMOUNT/);
});

test('tax invoice renders persisted percentage discount result and VAT from the discounted net', () => {
  const order: NormalizedInvoiceOrder = {
    ...sampleOrder,
    subtotal: 700,
    discount: 70,
    finalTotal: 630,
    vatAmount: 44.1,
    grandTotal: 674.1,
  };
  const data = buildInvoiceDataFromOrder(order, 'tax-invoice');

  assert.equal(data.discount, 70);
  assert.equal(data.netAmount, 630);
  assert.equal(data.vat, 44.1);
  assert.equal(data.totalAmount, 674.1);
});

test('cancelled tax invoice preview renders one cancellation mark', () => {
  const cancelledOrder: NormalizedInvoiceOrder = { ...sampleOrder, status: 'cancelled' };
  const html = renderToStaticMarkup(InvoiceMobilePreview({ documentType: 'tax-invoice', order: cancelledOrder }));

  assert.equal(html.match(/data-invoice-cancelled-watermark="true"/g)?.length, 1);
  assert.doesNotMatch(html, /data-invoice-cancelled-badge="true"/);
  assert.match(html, /ยกเลิก \/ CANCELLED/);
});

test('cancelled tax invoice print and PDF document carries watermark on original and copy', () => {
  const cancelledOrder: NormalizedInvoiceOrder = { ...sampleOrder, status: 'cancelled' };
  const html = renderToStaticMarkup(InvoiceDocument({ documentType: 'tax-invoice', order: cancelledOrder }));

  assert.equal(html.match(/data-invoice-cancelled-watermark="true"/g)?.length, 2);
  assert.doesNotMatch(html, /data-invoice-cancelled-badge="true"/);
});

test('cancelled receipt also carries its cancellation watermark', () => {
  const cancelledOrder: NormalizedInvoiceOrder = { ...sampleOrder, status: 'cancelled' };
  const html = renderToStaticMarkup(InvoiceDocument({ documentType: 'receipt', order: cancelledOrder }));

  assert.equal(html.match(/data-invoice-cancelled-watermark="true"/g)?.length, 1);
  assert.doesNotMatch(html, /data-invoice-cancelled-badge="true"/);
});
