import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateAddedVat, calculateChange, calculatePayableTotal, calculateQuickSale, isDefaultVariantName } from './quickSale';

test('quick sale calculates amount and percentage discounts safely', () => {
  assert.deepEqual(calculateQuickSale(350, 50, 'amount'), { subtotal: 350, discount: 50, grandTotal: 300 });
  assert.deepEqual(calculateQuickSale(350, 10, 'percent'), { subtotal: 350, discount: 35, grandTotal: 315 });
  assert.equal(calculateQuickSale(100, 200, 'amount').grandTotal, 0);
});

test('cash change never becomes negative', () => {
  assert.equal(calculateChange(500, 350), 150);
  assert.equal(calculateChange(100, 350), 0);
});

test('quick sale adds 7% VAT when a tax invoice is selected', () => {
  assert.equal(calculateAddedVat(120), 8.4);
  assert.equal(calculatePayableTotal(120, 'yes'), 128.4);
  assert.equal(calculatePayableTotal(120, 'no'), 120);
});

test('default variants are recognized case-insensitively', () => {
  assert.equal(isDefaultVariantName('default'), true);
  assert.equal(isDefaultVariantName(' Default '), true);
  assert.equal(isDefaultVariantName('DEFAULT'), true);
  assert.equal(isDefaultVariantName('A4 สี'), false);
});
