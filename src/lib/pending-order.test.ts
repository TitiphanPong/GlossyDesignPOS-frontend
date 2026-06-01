import test from 'node:test';
import assert from 'node:assert/strict';
import { computeTotals } from '../app/utils/computeTotal';
import {
  buildPendingOrderDraft,
  buildPendingOrderPayload,
  getPendingOrderFinalStatus,
  hasPendingOrderCartItems,
  isPendingOrderSettled,
  isPendingOrderSubmissionLocked,
  isPendingOrderSubmitted,
  PENDING_ORDER_SUBMIT_LOCK_TTL_MS,
  shouldDisplayPendingOrder,
} from './pending-order';

const pricingCart = [
  { name: 'Business Card', qty: 2, unitPrice: 50, totalPrice: 100, fullPayment: true, deposit: 0, remaining: 0 },
  { name: 'Poster', qty: 1, unitPrice: 200, totalPrice: 200, fullPayment: false, deposit: 80, remaining: 120 },
];

test('buildPendingOrderDraft creates the pending localStorage shape used by POS checkout', () => {
  const totals = computeTotals(pricingCart, 20, 'yes');
  const draft = buildPendingOrderDraft({
    draftId: 'draft-001',
    customer: {
      customerName: 'Alice',
      phoneNumber: '0812345678',
      note: 'Pickup after 5 PM',
    },
    payment: 'promptpay',
    discount: 20,
    taxInvoice: 'yes',
    totals,
  });

  assert.equal(draft.orderId, undefined);
  assert.equal(draft.clientDraftId, 'draft-001');
  assert.equal(draft.status, 'pending');
  assert.equal(draft.orderSyncStatus, 'pending');
  assert.equal(draft.orderSyncStartedAt, undefined);
  assert.equal(draft.lastSubmissionError, null);
  assert.equal(draft.customerName, 'Alice');
  assert.equal(draft.phoneNumber, '0812345678');
  assert.equal(draft.payment, 'promptpay');
  assert.equal(draft.total, totals.total);
  assert.equal(draft.depositTotal, totals.depositTotal);
  assert.equal(draft.remainingTotal, totals.remainingTotal);
  assert.deepEqual(draft.cart, totals.adjustedCart);
});

test('submission helpers keep partial-payment and paid transitions aligned', () => {
  assert.equal(getPendingOrderFinalStatus({ remainingTotal: 125 }), 'partial');
  assert.equal(getPendingOrderFinalStatus({ remainingTotal: 0 }), 'paid');

  assert.equal(isPendingOrderSubmitted({ status: 'pending', orderSyncStatus: 'pending' }), false);
  assert.equal(isPendingOrderSubmitted({ status: 'pending', orderSyncStatus: 'submitted' }), true);
  assert.equal(isPendingOrderSubmitted({ status: 'partial', orderSyncStatus: 'pending' }), true);
  assert.equal(isPendingOrderSubmitted({ status: 'paid', orderSyncStatus: 'pending' }), true);
});

test('buildPendingOrderPayload preserves clientDraftId but removes transient sync fields before POSTing to backend', () => {
  const payload = buildPendingOrderPayload(
    {
      orderId: '1712345678901',
      clientDraftId: 'draft-001',
      customerName: 'Alice',
      payment: 'cash',
      total: 280,
      discount: 20,
      status: 'pending',
      orderSyncStatus: 'submitting',
      lastSubmissionError: 'retry me',
      depositTotal: 85.6,
      remainingTotal: 214,
      cart: [{ name: 'Poster', qty: 1 }],
      taxInvoice: 'yes',
      vatAmount: 18.2,
      grandTotal: 298.2,
    },
    'partial'
  );

  assert.equal(payload.status, 'partial');
  assert.equal(payload.taxInvoice, 'yes');
  assert.equal(payload.vatAmount, 18.2);
  assert.equal(payload.grandTotal, 298.2);
  assert.equal(payload.clientDraftId, 'draft-001');
  assert.equal('orderSyncStatus' in payload, false);
  assert.equal('orderSyncStartedAt' in payload, false);
  assert.equal('lastSubmissionError' in payload, false);
});

test('isPendingOrderSubmissionLocked only blocks fresh in-flight submissions', () => {
  const now = Date.now();

  assert.equal(isPendingOrderSubmissionLocked({ orderSyncStatus: 'pending', orderSyncStartedAt: now }, now), false);
  assert.equal(isPendingOrderSubmissionLocked({ orderSyncStatus: 'submitting', orderSyncStartedAt: now }, now), true);
  assert.equal(
    isPendingOrderSubmissionLocked({ orderSyncStatus: 'submitting', orderSyncStartedAt: now - PENDING_ORDER_SUBMIT_LOCK_TTL_MS - 1 }, now),
    false,
  );
});

test('isPendingOrderSettled matches the customer display clear-after-paid behavior', () => {
  assert.equal(isPendingOrderSettled({ status: 'pending', remainingTotal: 0 }), false);
  assert.equal(isPendingOrderSettled({ status: 'partial', remainingTotal: 120 }), false);
  assert.equal(isPendingOrderSettled({ status: 'partial', remainingTotal: 0 }), true);
  assert.equal(isPendingOrderSettled({ status: 'paid', remainingTotal: 500 }), true);
});

test('customer display only hydrates displayable pending orders', () => {
  assert.equal(hasPendingOrderCartItems({ cart: [] }), false);
  assert.equal(hasPendingOrderCartItems({ cart: [{ name: 'Poster', qty: 1 }] }), true);

  assert.equal(shouldDisplayPendingOrder({ status: 'pending', cart: [{ name: 'Poster', qty: 1 }] }), true);
  assert.equal(shouldDisplayPendingOrder({ status: 'cancelled', cart: [{ name: 'Poster', qty: 1 }] }), false);
  assert.equal(shouldDisplayPendingOrder({ status: 'pending', cart: [] }), false);
});
