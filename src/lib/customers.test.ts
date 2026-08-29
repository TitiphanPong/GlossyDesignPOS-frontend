import test from 'node:test';
import assert from 'node:assert/strict';

import {
  fetchCustomersPage,
  getCustomerPhoneNumbers,
  updateCustomer,
} from './customers';

test('getCustomerPhoneNumbers keeps the primary phone first and removes duplicates', () => {
  assert.deepEqual(
    getCustomerPhoneNumbers({
      phoneNumber: '02-111-2222',
      phoneNumbers: ['089-123-4567', '02-111-2222', ' 089-123-4567 '],
    }),
    ['02-111-2222', '089-123-4567'],
  );
});

test('fetchCustomersPage forwards server-side search, pagination, and inactive filtering', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiBase = process.env.NEXT_PUBLIC_API_URL;
  let capturedUrl = '';

  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
  globalThis.fetch = (async input => {
    capturedUrl = String(input);
    return new Response(
      JSON.stringify({
        data: [{ _id: '1', customerCode: 'CUS-1', displayName: 'Acme', active: false }],
        page: 3,
        limit: 25,
        total: 61,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }) as typeof fetch;

  try {
    const result = await fetchCustomersPage({
      search: ' Acme Co ',
      page: 3,
      limit: 25,
      active: false,
    });

    const url = new URL(capturedUrl);
    assert.equal(url.pathname, '/customers');
    assert.equal(url.searchParams.get('search'), 'Acme Co');
    assert.equal(url.searchParams.get('page'), '3');
    assert.equal(url.searchParams.get('limit'), '25');
    assert.equal(url.searchParams.get('active'), 'false');
    assert.equal(result.total, 61);
    assert.equal(result.data[0]?.active, false);
  } finally {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_URL = originalApiBase;
  }
});

test('updateCustomer preserves explicit nulls so optional profile fields can be cleared', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiBase = process.env.NEXT_PUBLIC_API_URL;
  let capturedBody = '';

  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
  globalThis.fetch = (async (_input, init) => {
    capturedBody = typeof init?.body === 'string' ? init.body : '';
    return new Response(
      JSON.stringify({
        _id: 'customer-1',
        customerCode: 'CUS-1',
        displayName: 'Acme',
        active: false,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }) as typeof fetch;

  try {
    await updateCustomer('customer-1', {
      email: null,
      companyName: null,
      shippingAddress: null,
      phoneNumbers: [],
      active: false,
    });

    assert.deepEqual(JSON.parse(capturedBody), {
      email: null,
      companyName: null,
      shippingAddress: null,
      phoneNumbers: [],
      active: false,
    });
  } finally {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_URL = originalApiBase;
  }
});
