import test from 'node:test';
import assert from 'node:assert/strict';

import { createOrder } from './orders';

test('createOrder accepts a direct order response with orderNumber', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiBase = process.env.NEXT_PUBLIC_API_URL;

  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';

  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        _id: 'abc123',
        orderId: 'legacy-001',
        orderNumber: 'ORD-20260527-0001',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )) as typeof fetch;

  try {
    const result = await createOrder({ status: 'paid' });
    assert.equal(result.orderNumber, 'ORD-20260527-0001');
    assert.equal(result._id, 'abc123');
  } finally {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_URL = originalApiBase;
  }
});

test('createOrder accepts a wrapped order response with orderNumber', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiBase = process.env.NEXT_PUBLIC_API_URL;

  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';

  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        data: {
          order: {
            _id: 'abc124',
            orderId: 'legacy-002',
            orderNumber: 'ORD-20260527-0002',
          },
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )) as typeof fetch;

  try {
    const result = await createOrder({ status: 'partial' });
    assert.equal(result.orderNumber, 'ORD-20260527-0002');
    assert.equal(result._id, 'abc124');
  } finally {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_URL = originalApiBase;
  }
});
