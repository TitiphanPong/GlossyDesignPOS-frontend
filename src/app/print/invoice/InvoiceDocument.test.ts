import test from 'node:test';
import assert from 'node:assert/strict';

import type { NormalizedInvoiceOrder } from '../../../lib/contracts';
import { buildInvoiceDataFromOrder, InvoiceDocument, ReceiptTemplate, TaxInvoiceTemplate } from './[orderId]/InvoiceDocument';

const sampleOrder: NormalizedInvoiceOrder = {
  orderId: 'order-123',
  orderNumber: 'ORD-2026-00123',
  invoiceNumber: 'TAX-2026-00023',
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

test('tax invoice data uses its invoice number and receipt dispatch selects the thermal template', () => {
  const taxInvoiceData = buildInvoiceDataFromOrder(sampleOrder, 'tax-invoice');
  const receiptDocument = InvoiceDocument({ documentType: 'receipt', order: sampleOrder });
  const taxInvoiceDocument = InvoiceDocument({ documentType: 'tax-invoice', order: sampleOrder });

  assert.equal(taxInvoiceData.invoiceNo, sampleOrder.invoiceNumber);
  assert.equal(receiptDocument.type, ReceiptTemplate);
  assert.equal(taxInvoiceDocument.type, TaxInvoiceTemplate);
});
