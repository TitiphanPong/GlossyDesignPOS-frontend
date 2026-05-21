import test from 'node:test';
import assert from 'node:assert/strict';
import { computeTotals } from './computeTotal.ts';
import type { CartItem } from '../home/posseller/types/cart.ts';

function buildCartItem(overrides: Partial<CartItem>): CartItem {
  return {
    key: 'item',
    name: 'Test item',
    qty: 1,
    unitPrice: 0,
    totalPrice: 0,
    ...overrides,
  };
}

function assertClose(actual: number, expected: number, message?: string) {
  assert.ok(Math.abs(actual - expected) < 1e-9, message ?? `Expected ${actual} to be close to ${expected}`);
}

test('computeTotals caps discount at the cart total', () => {
  const cart = [buildCartItem({ key: 'a', qty: 2, unitPrice: 50 })];

  const result = computeTotals(cart, 999, 'no');

  assert.equal(result.total, 100);
  assert.equal(result.discountAmount, 100);
  assert.equal(result.finalTotal, 0);
  assert.equal(result.grandTotal, 0);
});

test('computeTotals adds VAT only when tax invoice is requested', () => {
  const cart = [buildCartItem({ key: 'a', qty: 2, unitPrice: 100 })];

  const withoutVat = computeTotals(cart, 20, 'no');
  const withVat = computeTotals(cart, 20, 'yes');

  assert.equal(withoutVat.finalTotal, 180);
  assert.equal(withoutVat.vatAmount, 0);
  assert.equal(withoutVat.grandTotal, 180);

  assert.equal(withVat.finalTotal, 180);
  assertClose(withVat.vatAmount, 12.6);
  assertClose(withVat.grandTotal, 192.6);
});

test('computeTotals turns full-payment items into immediate deposits', () => {
  const cart = [
    buildCartItem({
      key: 'full',
      qty: 2,
      unitPrice: 100,
      fullPayment: true,
    }),
  ];

  const result = computeTotals(cart, 0, 'no');

  assert.equal(result.adjustedCart.length, 1);
  assert.equal(result.adjustedCart[0]?.remaining, 0);
  assert.equal(result.adjustedCart[0]?.deposit, 200);
  assert.equal(result.depositTotal, 200);
  assert.equal(result.remainingTotal, 0);
});

test('computeTotals scales partial-payment deposit and remaining totals proportionally', () => {
  const cart = [
    buildCartItem({
      key: 'partial',
      qty: 2,
      unitPrice: 100,
      deposit: 50,
      remaining: 150,
      fullPayment: false,
    }),
  ];

  const result = computeTotals(cart, 20, 'yes');
  const adjusted = result.adjustedCart[0];

  assert.ok(adjusted);
  assertClose(result.total, 200);
  assertClose(result.finalTotal, 180);
  assertClose(result.grandTotal, 192.6);
  assertClose(adjusted.totalPrice, 192.6);
  assertClose(adjusted.deposit ?? 0, 48.15);
  assertClose(adjusted.remaining ?? 0, 144.45);
  assertClose(result.depositTotal, 48.15);
  assertClose(result.remainingTotal, 144.45);
});

test('computeTotals handles zero-value carts without NaN totals', () => {
  const cart = [buildCartItem({ key: 'zero', qty: 0, unitPrice: 0, deposit: 0, remaining: 0 })];

  const result = computeTotals(cart, 10, 'yes');

  assert.equal(result.total, 0);
  assert.equal(result.discountAmount, 0);
  assert.equal(result.finalTotal, 0);
  assert.equal(result.vatAmount, 0);
  assert.equal(result.grandTotal, 0);
  assert.equal(result.depositTotal, 0);
  assert.equal(result.remainingTotal, 0);
  assert.equal(result.adjustedCart[0]?.totalPrice, 0);
});
