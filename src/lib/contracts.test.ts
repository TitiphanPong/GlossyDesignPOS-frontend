import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeApiCartItem, normalizeApiCartItemForInvoice, normalizeApiOrderAmounts, normalizeApiOrderForInvoice } from './contracts';

test('normalizeApiCartItemForInvoice supports qty and price fallbacks', () => {
  const item = normalizeApiCartItemForInvoice({
    name: 'A4 Print',
    qty: 3,
    price: 12.5,
  });

  assert.deepEqual(item, {
    name: 'A4 Print',
    quantity: 3,
    unitPrice: 12.5,
    totalPrice: 37.5,
  });
});

test('normalizeApiCartItem supports lineTotal fallback and preserves note-like fields', () => {
  const item = normalizeApiCartItem({
    name: 'Custom Poster',
    quantity: 2,
    lineTotal: 90,
    productNote: 'Urgent print',
  });

  assert.equal(item.quantity, 2);
  assert.equal(item.unitPrice, 45);
  assert.equal(item.totalPrice, 90);
  assert.equal(item.note, 'Urgent print');
});

test('normalizeApiOrderForInvoice derives invoice totals from shared order fields', () => {
  const order = normalizeApiOrderForInvoice({
    _id: 'mongo-123',
    orderId: 'POS-001',
    customerName: 'Glossy Customer',
    phoneNumber: '0812345678',
    discount: 5,
    vatAmount: 2.45,
    cart: [
      { name: 'A4 Print', qty: 2, price: 10 },
      { name: 'Sticker', quantity: 1, unitPrice: 15, totalPrice: 15 },
    ],
  });

  assert.equal(order.orderId, 'POS-001');
  assert.equal(order.orderNumber, 'POS-001');
  assert.equal(order.finalTotal, 30);
  assert.equal(order.vatAmount, 2.45);
  assert.equal(order.grandTotal, 32.45);
  assert.deepEqual(order.cart, [
    { name: 'A4 Print', quantity: 2, unitPrice: 10, totalPrice: 20 },
    { name: 'Sticker', quantity: 1, unitPrice: 15, totalPrice: 15 },
  ]);
});

test('normalizeApiOrderAmounts supports grand total and remaining fallbacks', () => {
  const amounts = normalizeApiOrderAmounts({
    total: 100,
    vatAmount: 7,
    grandTotal: 107,
    remainingTotal: 20,
    cart: [{ name: 'A4 Print', qty: 1, unitPrice: 100 }],
  });

  assert.equal(amounts.subtotal, 100);
  assert.equal(amounts.grandTotal, 107);
  assert.equal(amounts.remainingTotal, 20);
  assert.equal(amounts.paidAmount, 87);
});
