import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createTaxInvoicePeriod,
  filterTaxInvoiceDocuments,
  getCurrentBangkokPeriod,
  getPreviousBangkokPeriod,
  type TaxInvoiceReportItem,
} from './tax-invoice-reports';

function item(overrides: Partial<TaxInvoiceReportItem> = {}): TaxInvoiceReportItem {
  return {
    id: 'mongo-1',
    orderId: 'order-1',
    orderNumber: 'ORD-0001',
    documentDate: '2026-08-10T05:00:00.000Z',
    invoicePeriod: '202608',
    invoicePeriodSource: 'invoicePeriod',
    invoiceNumber: 'INV-202608-001-001',
    bookNo: '001',
    invoiceSequence: '001',
    customerName: 'บริษัท ทดสอบ จำกัด',
    customerAddress: 'กรุงเทพฯ',
    taxId: '0012345678901',
    branch: '00001',
    subtotal: 100,
    discount: 0,
    taxableBase: 100,
    vatAmount: 7,
    grandTotal: 107,
    paymentMethod: 'cash',
    note: '',
    status: 'paid',
    reportStatus: 'issued',
    reviewReasons: [],
    items: [],
    ...overrides,
  };
}

test('current report period follows Asia/Bangkok', () => {
  assert.equal(getCurrentBangkokPeriod(new Date('2026-08-31T17:30:00.000Z')), '202609');
  assert.equal(getCurrentBangkokPeriod(new Date('2026-01-01T00:00:00.000Z')), '202601');
});

test('previous report period follows Asia/Bangkok and crosses year safely', () => {
  assert.equal(getPreviousBangkokPeriod(new Date('2026-09-01T16:30:00.000Z')), '202608');
  assert.equal(getPreviousBangkokPeriod(new Date('2026-01-01T00:00:00.000Z')), '202512');
});

test('Buddhist-year UI selection still produces Gregorian YYYYMM API period', () => {
  assert.equal(createTaxInvoicePeriod(2026, 8), '202608');
});

test('table search covers invoice, order, customer, and tax id without mutating source data', () => {
  const documents = [
    item(),
    item({
      id: 'mongo-2',
      orderNumber: 'ORD-0002',
      invoiceNumber: 'INV-202608-001-002',
      customerName: 'Glossy Customer',
      taxId: '0999999999999',
    }),
  ];

  assert.equal(filterTaxInvoiceDocuments(documents, '001-002').length, 1);
  assert.equal(filterTaxInvoiceDocuments(documents, 'ORD-0001').length, 1);
  assert.equal(filterTaxInvoiceDocuments(documents, 'glossy').length, 1);
  assert.equal(filterTaxInvoiceDocuments(documents, '0012345678901').length, 1);
  assert.equal(filterTaxInvoiceDocuments(documents, '').length, 2);
  assert.equal(documents.length, 2);
});
