import test from 'node:test';
import assert from 'node:assert/strict';

import { computeOrderPaymentSummary, computeTotals, getCartSubtotal, getDiscountedTotal, roundCurrency } from './computeTotal';

test('getCartSubtotal rounds unit prices to satang before multiplying quantity', () => {
  const subtotal = getCartSubtotal([
    { qty: 2, unitPrice: 99.995 },
    { qty: 1, unitPrice: 50 },
  ]);

  assert.equal(subtotal, 250);
});

test('getDiscountedTotal clamps discounts to a valid non-negative range', () => {
  assert.equal(getDiscountedTotal(100, -25), 100);
  assert.equal(getDiscountedTotal(100, 25), 75);
  assert.equal(getDiscountedTotal(100, 250), 0);
});

test('computeTotals adds 7% VAT to VAT-exclusive prices', () => {
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
    'yes'
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

test('computeTotals does not add VAT for a regular receipt', () => {
  const result = computeTotals([{ qty: 4, unitPrice: 60, deposit: 0, fullPayment: true }], 0, 'no');

  assert.equal(result.finalTotal, 240);
  assert.equal(result.vatAmount, 0);
  assert.equal(result.grandTotal, 240);
  assert.equal(result.depositTotal, 240);
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
    'no'
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

test('computeTotals allocates rounding residuals so line payments reconcile to grand total', () => {
  const result = computeTotals(
    [
      { qty: 1, unitPrice: 0.05, deposit: 0, fullPayment: true },
      { qty: 1, unitPrice: 0.05, deposit: 0, fullPayment: true },
      { qty: 1, unitPrice: 0.05, deposit: 0, fullPayment: true },
    ],
    0,
    'no'
  );

  assert.equal(result.grandTotal, 0.15);
  assert.equal(result.depositTotal, result.grandTotal);
  assert.equal(
    roundCurrency(
      result.adjustedCart.reduce((sum, item) => sum + Number(item.deposit), 0)
    ),
    result.grandTotal
  );
});

test('computeOrderPaymentSummary uses deposit for partial orders and grand total for fully paid orders', () => {
  const partialSummary = computeOrderPaymentSummary({
    total: 250,
    discount: 25,
    taxInvoice: 'yes',
    cart: [
      { deposit: 45, remaining: 135, fullPayment: false },
      { deposit: 45, remaining: 0, fullPayment: true },
    ],
  });

  assert.deepEqual(partialSummary, {
    subtotal: 250,
    discount: 25,
    netTotal: 225,
    vat: 15.75,
    grandTotal: 240.75,
    deposit: 90,
    remaining: 135,
    hasDeposit: true,
    amountToPay: 90,
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
