import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateAddedVat, calculateChange, calculatePayableTotal, calculateQuickSale, isDefaultVariantName } from './quickSale';
import { computeTotals } from '../../utils/computeTotal';

test('quick sale calculates amount and percentage discounts safely', () => {
  assert.deepEqual(calculateQuickSale(350, 50, 'amount'), { subtotal: 350, discount: 50, grandTotal: 300 });
  assert.deepEqual(calculateQuickSale(350, 10, 'percent'), { subtotal: 350, discount: 35, grandTotal: 315 });
  assert.equal(calculateQuickSale(100, 200, 'amount').grandTotal, 0);
});

test('POS and Quick Sale add VAT only for tax invoices', () => {
  const net = calculateQuickSale(250, 25, 'amount');
  assert.equal(calculatePayableTotal(net.grandTotal, 'no'), 225);
  assert.equal(calculatePayableTotal(net.grandTotal, 'yes'), 240.75);
  assert.equal(calculateAddedVat(net.grandTotal), 15.75);
});

test('POS and Quick Sale stay in satang parity across representative rounding cases', () => {
  for (let satang = 1; satang <= 10_000; satang += 37) {
    const unitPrice = satang / 100;
    const quick = calculateQuickSale(unitPrice * 3, 0, 'amount');
    for (const taxInvoice of ['no', 'yes'] as const) {
      const pos = computeTotals([{ qty: 3, unitPrice, fullPayment: true }], 0, taxInvoice);
      const quickPayable = calculatePayableTotal(quick.grandTotal, taxInvoice);

      assert.equal(pos.grandTotal, quickPayable);
      assert.equal(Number.isInteger(Math.round(pos.grandTotal * 100)), true);
    }
  }
});

test('cash change never becomes negative', () => {
  assert.equal(calculateChange(500, 350), 150);
  assert.equal(calculateChange(100, 350), 0);
});

test('quick sale keeps receipt total unchanged and adds VAT for a tax invoice', () => {
  assert.equal(calculateAddedVat(120), 8.4);
  assert.equal(calculatePayableTotal(120, 'yes'), 128.4);
  assert.equal(calculatePayableTotal(120, 'no'), 120);
  assert.equal(calculatePayableTotal(240, 'no'), 240);
  assert.equal(calculatePayableTotal(240, 'yes'), 256.8);
});

test('default variants are recognized case-insensitively', () => {
  assert.equal(isDefaultVariantName('default'), true);
  assert.equal(isDefaultVariantName(' Default '), true);
  assert.equal(isDefaultVariantName('DEFAULT'), true);
  assert.equal(isDefaultVariantName('A4 สี'), false);
});
