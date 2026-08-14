import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateChange, calculateInclusiveVat, calculateQuickSale, isDefaultVariantName } from './quickSale';

test('quick sale calculates amount and percentage discounts safely', () => {
  assert.deepEqual(calculateQuickSale(350, 50, 'amount'), { subtotal: 350, discount: 50, grandTotal: 300 });
  assert.deepEqual(calculateQuickSale(350, 10, 'percent'), { subtotal: 350, discount: 35, grandTotal: 315 });
  assert.equal(calculateQuickSale(100, 200, 'amount').grandTotal, 0);
});

test('cash change never becomes negative', () => {
  assert.equal(calculateChange(500, 350), 150);
  assert.equal(calculateChange(100, 350), 0);
});

test('quick sale extracts VAT from the existing total without increasing it', () => {
  assert.equal(calculateInclusiveVat(107), 7);
  assert.equal(calculateInclusiveVat(100), 6.54);
});

test('default variants are recognized case-insensitively', () => {
  assert.equal(isDefaultVariantName('default'), true);
  assert.equal(isDefaultVariantName(' Default '), true);
  assert.equal(isDefaultVariantName('DEFAULT'), true);
  assert.equal(isDefaultVariantName('A4 สี'), false);
});
