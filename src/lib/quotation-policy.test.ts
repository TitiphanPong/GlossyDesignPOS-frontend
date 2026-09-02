import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function source(path: string): string {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

test('quotation print route is protected by the admin proxy', () => {
  const proxy = source('src/proxy.ts');
  assert.match(proxy, /'\/print\/quotation'/);
  assert.match(proxy, /'\/print\/quotation\/:path\*'/);
});

test('quotation UI does not reuse the legacy Order invoice print route', () => {
  const quotationSources = [
    'src/app/home/quotations/page.tsx',
    'src/app/home/quotations/QuotationBuilder.tsx',
    'src/app/home/quotations/[quotationId]/page.tsx',
    'src/app/print/quotation/[quotationId]/PrintQuotationPage.tsx',
    'src/app/print/quotation/[quotationId]/QuotationDocument.tsx',
    'src/lib/quotations.ts',
  ].map(source).join('\n');

  assert.equal(quotationSources.includes('/print/invoice'), false);
  assert.equal(quotationSources.includes('fetchOrders('), false);
  assert.equal(quotationSources.includes('updateOrderCustomerInfo('), false);
  assert.equal(quotationSources.includes('payRemainingBalance('), false);
});

test('quotation builder never submits authoritative totals from the frontend', () => {
  const builder = source('src/app/home/quotations/QuotationBuilder.tsx');
  const payloadSection = builder.slice(builder.indexOf('const payload ='), builder.indexOf('const saveDraft ='));

  for (const forbidden of ['subtotal:', 'taxableAmount:', 'vatAmount:', 'grandTotal:', 'authoritativeUnitPrice:', 'lineTotal:']) {
    assert.equal(payloadSection.includes(forbidden), false, `${forbidden} must stay Backend-owned`);
  }
  assert.match(builder, /beforeunload/);
});

test('quotation A4 print DOM contains print-safe rules and no tax-invoice identity fields', () => {
  const document = source('src/app/print/quotation/[quotationId]/QuotationDocument.tsx');

  assert.match(document, /@page\s*\{/);
  assert.match(document, /size:\s*A4 portrait/);
  assert.match(document, /display:\s*table-header-group/);
  assert.match(document, /break-inside:\s*avoid/);
  assert.match(document, /counter\(page\)/);
  assert.equal(document.includes('invoiceNumber'), false);
  assert.equal(document.includes('bookNo'), false);
  assert.equal(document.includes('invoiceSequence'), false);
  assert.equal(document.includes('ใบเสร็จ'), false);
  assert.equal(document.includes('เลขใบกำกับภาษี'), false);
});
