import test from 'node:test';
import assert from 'node:assert/strict';

import {
  computeOrderPaymentSummary,
  computeTotals,
  getCartSubtotal,
  getDiscountedTotal,
  roundCurrency,
} from './computeTotal.ts';

test('getCartSubtotal sums item quantities and unit prices', () => {
  const subtotal = getCartSubtotal([
    { qty: 2, unitPrice: 99.995 },
    { qty: 1, unitPrice: 50 },
  ]);

  assert.equal(subtotal, 249.99);
});

test('getDiscountedTotal clamps discounts to a valid non-negative range', () => {
  assert.equal(getDiscountedTotal(100, -25), 100);
  assert.equal(getDiscountedTotal(100, 25), 75);
  assert.equal(getDiscountedTotal(100, 250), 0);
});

test('computeTotals preserves full-payment items and scales partial-payment items with VAT', () => {
  const result = computeTotals(
    [
      {
        qty: 2,
        unitPrice: 100,
        deposit: 50,
        remaining: 150,
        fullPayment: false,
      },
      {
        qty: 1,
        unitPrice: 50,
        deposit: 0,
        remaining: 0,
        fullPayment: true,
      },
    ],
    25,
    'yes',
  );

  assert.equal(result.total, 250);
  assert.equal(result.discountAmount, 25);
  assert.equal(result.finalTotal, 225);
  assert.equal(result.vatAmount, 15.75);
  assert.equal(result.grandTotal, 240.75);

  assert.deepEqual(result.adjustedCart, [
    {
      qty: 2,
      unitPrice: 100,
      totalPrice: 180,
      deposit: 48.15,
      remaining: 144.45,
      fullPayment: false,
    },
    {
      qty: 1,
      unitPrice: 50,
      totalPrice: 45,
      deposit: 48.15,
      remaining: 0,
      fullPayment: true,
    },
  ]);
  assert.equal(result.depositTotal, 96.3);
  assert.equal(result.remainingTotal, 144.45);
});

test('computeTotals handles zero-value carts without producing NaN values', () => {
  const result = computeTotals(
    [
      {
        qty: 0,
        unitPrice: 0,
        deposit: 10,
        remaining: 5,
        fullPayment: false,
      },
    ],
    10,
    'no',
  );

  assert.equal(result.total, 0);
  assert.equal(result.discountAmount, 0);
  assert.equal(result.finalTotal, 0);
  assert.equal(result.vatAmount, 0);
  assert.equal(result.grandTotal, 0);
  assert.equal(result.depositTotal, 0);
  assert.equal(result.remainingTotal, 0);
  assert.deepEqual(result.adjustedCart, [
    {
      qty: 0,
      unitPrice: 0,
      totalPrice: 0,
      deposit: 0,
      remaining: 0,
      fullPayment: false,
    },
  ]);
});

test('computeOrderPaymentSummary uses deposit for partial orders and grand total for fully paid orders', () => {
  const partialSummary = computeOrderPaymentSummary({
    total: 250,
    discount: 25,
    taxInvoice: 'yes',
    cart: [
      { deposit: 48.15, remaining: 144.45, fullPayment: false },
      { deposit: 48.15, remaining: 0, fullPayment: true },
    ],
  });

  assert.deepEqual(partialSummary, {
    subtotal: 250,
    discount: 25,
    netTotal: 225,
    vat: 15.75,
    grandTotal: 240.75,
    deposit: 96.3,
    remaining: 144.45,
    hasDeposit: true,
    amountToPay: 96.3,
  });

  const paidSummary = computeOrderPaymentSummary({
    total: 100,
    discount: 10,
    taxInvoice: 'no',
    cart: [{ deposit: 0, remaining: 0, fullPayment: true }],
  });

  assert.deepEqual(paidSummary, {
    subtotal: 100,
    discount: 10,
    netTotal: 90,
    vat: 0,
    grandTotal: 90,
    deposit: 0,
    remaining: 0,
    hasDeposit: false,
    amountToPay: 90,
  });
});

test('roundCurrency falls back to zero for non-finite values', () => {
  assert.equal(roundCurrency(Number.NaN), 0);
  assert.equal(roundCurrency(Number.POSITIVE_INFINITY), 0);
});
