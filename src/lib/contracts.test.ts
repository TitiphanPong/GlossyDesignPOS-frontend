import test from 'node:test';
import assert from 'node:assert/strict';

import { createInvoiceOrderFromNormalizedOrder, getDisplayOrderNumber, normalizeApiCartItem, normalizeApiOrder, normalizeApiCartItemForInvoice, normalizeApiOrderAmounts, normalizeApiOrderForInvoice } from './contracts';

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
  assert.equal(item.qty, 2);
  assert.equal(item.unitPrice, 45);
  assert.equal(item.price, 45);
  assert.equal(item.totalPrice, 90);
  assert.equal(item.total, 90);
  assert.equal(item.note, 'Urgent print');
});

test('normalizeApiOrder creates a canonical order shape with synced cart aliases', () => {
  const order = normalizeApiOrder({
    _id: 'mongo-111',
    orderId: 'POS-111',
    customerName: 'Glossy Customer',
    payment: 'promptpay',
    status: 'partial',
    createdAt: '2026-06-04T10:00:00.000Z',
    remainingTotal: 40,
    cart: [{ name: 'Poster', qty: 2, price: 30 }],
  });

  assert.equal(order.orderNumber, 'POS-111');
  assert.equal(order.paymentMethod, 'promptpay');
  assert.equal(order.cart[0]?.quantity, 2);
  assert.equal(order.cart[0]?.qty, 2);
  assert.equal(order.cart[0]?.unitPrice, 30);
  assert.equal(order.cart[0]?.price, 30);
  assert.equal(order.cart[0]?.totalPrice, 60);
  assert.equal(order.cart[0]?.total, 60);
  assert.equal(order.grandTotal, 60);
  assert.equal(order.paidAmount, 20);
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

test('normalizeApiOrderForInvoice normalizes legacy invoice customer and cart fallbacks', () => {
  const order = normalizeApiOrderForInvoice({
    _id: 'mongo-456',
    orderId: 'POS-002',
    customerName: 'Legacy Customer',
    customerAddress: '88/8 Moo Baan Klang Muang',
    customerTaxId: '0123456789012',
    customerBranch: 'สำนักงานใหญ่',
    cart: [
      { name: 'Poster', quantity: 2, lineTotal: 90 },
      { name: 'Sticker', qty: 5, price: 12 },
    ],
  });

  assert.equal(order.address, '88/8 Moo Baan Klang Muang');
  assert.equal(order.taxId, '0123456789012');
  assert.equal(order.branch, 'สำนักงานใหญ่');
  assert.deepEqual(order.cart, [
    { name: 'Poster', quantity: 2, unitPrice: 45, totalPrice: 90 },
    { name: 'Sticker', quantity: 5, unitPrice: 12, totalPrice: 60 },
  ]);
});

test('createInvoiceOrderFromNormalizedOrder reuses the canonical normalized order shape', () => {
  const invoiceOrder = createInvoiceOrderFromNormalizedOrder(
    normalizeApiOrder({
      _id: 'mongo-222',
      orderId: 'POS-222',
      payment: 'cash',
      status: 'paid',
      createdAt: '2026-06-04T12:00:00.000Z',
      cart: [{ name: 'Sticker', qty: 4, price: 5 }],
    })
  );

  assert.equal(invoiceOrder.orderId, 'POS-222');
  assert.deepEqual(invoiceOrder.cart, [{ name: 'Sticker', quantity: 4, unitPrice: 5, totalPrice: 20 }]);
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
  assert.equal(amounts.total, 100);
  assert.equal(amounts.grandTotal, 107);
  assert.equal(amounts.remainingTotal, 20);
  assert.equal(amounts.paidAmount, 87);
});

test('getDisplayOrderNumber prefers orderNumber and falls back to orderId', () => {
  assert.equal(getDisplayOrderNumber({ orderNumber: 'GD-2026-000001', orderId: 'legacy-001' }), 'GD-2026-000001');
  assert.equal(getDisplayOrderNumber({ orderId: 'legacy-001' }), 'legacy-001');
  assert.equal(getDisplayOrderNumber({}, '-'), '-');
});
