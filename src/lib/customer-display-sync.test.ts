import assert from 'node:assert/strict';
import test from 'node:test';
import { getCustomerDisplayPairingUrl, sanitizeCustomerDisplayState } from './customer-display-sync';

test('customer display sync strips customer PII and internal note fields', () => {
  const state = sanitizeCustomerDisplayState({
    orderId: 'order-1',
    orderNumber: 'GD-1',
    clientDraftId: 'draft-1',
    customerName: 'Private Customer',
    phoneNumber: '0812345678',
    note: 'internal note',
    total: 120,
    discount: 20,
    grandTotal: 100,
    payment: 'promptpay',
    status: 'pending',
    remainingTotal: 100,
    cart: [
      {
        name: 'Sticker',
        category: 'Sticker',
        qty: 2,
        totalPrice: 120,
        note: 'do not expose',
        variant: { name: 'A4' },
      },
    ],
  });

  assert.ok(state);
  assert.equal('customerName' in state, false);
  assert.equal('phoneNumber' in state, false);
  assert.equal('note' in state, false);
  const firstItem = (state.cart as Array<Record<string, unknown>>)[0];
  assert.equal('note' in firstItem, false);
  assert.equal(firstItem.variantName, 'A4');
});

test('customer display sync clears remote state when there is no cart', () => {
  assert.equal(sanitizeCustomerDisplayState({ total: 0, cart: [] }), null);
});

test('customer display pairing URL uses the explicit customer-display route', () => {
  const url = getCustomerDisplayPairingUrl(
    {
      sessionId: 'session-1',
      displayToken: 'display-token-1',
      expiresAt: '2099-01-01T00:00:00.000Z',
    },
    'https://glossy.example',
  );

  assert.equal(url, 'https://glossy.example/customer-display?display=display-token-1');
});
