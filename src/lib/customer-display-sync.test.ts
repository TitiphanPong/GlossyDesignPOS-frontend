import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';
import {
  getCustomerDisplayPairingUrl,
  getCustomerDisplaySession,
  revokeCustomerDisplaySession,
  rotateCustomerDisplaySession,
  sanitizeCustomerDisplayState,
} from './customer-display-sync';

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
const originalFetch = globalThis.fetch;

function installBrowserStorage() {
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {} });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  return storage;
}

function restoreDescriptor(key: 'window' | 'localStorage', descriptor: PropertyDescriptor | undefined) {
  if (descriptor) {
    Object.defineProperty(globalThis, key, descriptor);
  } else {
    Reflect.deleteProperty(globalThis, key);
  }
}

afterEach(() => {
  restoreDescriptor('window', originalWindow);
  restoreDescriptor('localStorage', originalLocalStorage);
  globalThis.fetch = originalFetch;
});

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

test('invalid stored pairing data is discarded instead of being reused', () => {
  const storage = installBrowserStorage();
  storage.setItem('glossyCustomerDisplaySession', JSON.stringify({ sessionId: 'broken' }));

  assert.equal(getCustomerDisplaySession(), null);
  assert.equal(storage.getItem('glossyCustomerDisplaySession'), null);
});

test('rotating a pairing replaces local identity and calls the session-specific rotate endpoint', async () => {
  const storage = installBrowserStorage();
  storage.setItem(
    'glossyCustomerDisplaySession',
    JSON.stringify({
      sessionId: 'session-1',
      displayToken: 'old-token',
      expiresAt: '2099-01-01T00:00:00.000Z',
    }),
  );

  let requestUrl = '';
  let requestMethod = '';
  globalThis.fetch = (async (input, init) => {
    requestUrl = String(input);
    requestMethod = init?.method ?? 'GET';
    return new Response(
      JSON.stringify({
        sessionId: 'session-1',
        displayToken: 'new-token',
        expiresAt: '2099-01-02T00:00:00.000Z',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }) as typeof fetch;

  const rotated = await rotateCustomerDisplaySession();

  assert.equal(requestUrl, '/api/backend/customer-display/sessions/session-1/rotate');
  assert.equal(requestMethod, 'POST');
  assert.equal(rotated.displayToken, 'new-token');
  assert.equal(getCustomerDisplaySession()?.displayToken, 'new-token');
});

test('revoking a pairing clears local identity only after the backend confirms revocation', async () => {
  const storage = installBrowserStorage();
  storage.setItem(
    'glossyCustomerDisplaySession',
    JSON.stringify({
      sessionId: 'session-1',
      displayToken: 'display-token-1',
      expiresAt: '2099-01-01T00:00:00.000Z',
    }),
  );

  let requestUrl = '';
  let requestMethod = '';
  globalThis.fetch = (async (input, init) => {
    requestUrl = String(input);
    requestMethod = init?.method ?? 'GET';
    return new Response(JSON.stringify({ sessionId: 'session-1', revoked: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;

  assert.equal(await revokeCustomerDisplaySession(), true);
  assert.equal(requestUrl, '/api/backend/customer-display/sessions/session-1');
  assert.equal(requestMethod, 'DELETE');
  assert.equal(storage.getItem('glossyCustomerDisplaySession'), null);
});

test('failed revocation keeps the local pairing so staff can retry without losing the session identity', async () => {
  const storage = installBrowserStorage();
  const stored = JSON.stringify({
    sessionId: 'session-1',
    displayToken: 'display-token-1',
    expiresAt: '2099-01-01T00:00:00.000Z',
  });
  storage.setItem('glossyCustomerDisplaySession', stored);
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ message: 'Backend failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })) as typeof fetch;

  await assert.rejects(revokeCustomerDisplaySession(), /Backend failed/);
  assert.equal(storage.getItem('glossyCustomerDisplaySession'), stored);
});
