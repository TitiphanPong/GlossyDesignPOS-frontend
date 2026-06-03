import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createOrder,
  extractOrderFromResponse,
  extractOrdersFromResponse,
  fetchOrderById,
  fetchOrders,
  payRemainingBalance,
  sortOrdersByNewest,
  updateOrderCustomerInfo,
} from './orders';

function getHeaderValue(headers: HeadersInit | undefined, key: string): string | null {
  if (!headers) {
    return null;
  }

  if (headers instanceof Headers) {
    return headers.get(key);
  }

  if (Array.isArray(headers)) {
    const match = headers.find(([headerName]) => headerName === key);
    return match?.[1] ?? null;
  }

  return headers[key] ?? null;
}

test('createOrder accepts a direct order response with orderNumber', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiBase = process.env.NEXT_PUBLIC_API_URL;
  let capturedHeaders: HeadersInit | undefined;
  let capturedBody: string | undefined;

  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';

  const mockFetch: typeof fetch = async (_input, init) => {
    capturedHeaders = init?.headers;
    capturedBody = typeof init?.body === 'string' ? init.body : undefined;

    return new Response(
      JSON.stringify({
        _id: 'abc123',
        orderId: 'legacy-001',
        orderNumber: 'ORD-20260527-0001',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };
  globalThis.fetch = mockFetch;

  try {
    const result = await createOrder({ status: 'paid', clientDraftId: 'draft-001' });
    assert.equal(result.orderNumber, 'ORD-20260527-0001');
    assert.equal(result._id, 'abc123');
    assert.equal(getHeaderValue(capturedHeaders, 'Idempotency-Key'), 'draft-001');
    assert.match(capturedBody ?? '', /"clientDraftId":"draft-001"/);
  } finally {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_URL = originalApiBase;
  }
});

test('createOrder accepts a wrapped order response with orderNumber', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiBase = process.env.NEXT_PUBLIC_API_URL;

  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';

  const mockFetch: typeof fetch = async () =>
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
    );
  globalThis.fetch = mockFetch;

  try {
    const result = await createOrder({ status: 'partial' });
    assert.equal(result.orderNumber, 'ORD-20260527-0002');
    assert.equal(result._id, 'abc124');
  } finally {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_URL = originalApiBase;
  }
});

test('createOrder falls back to orderId when backend omits orderNumber', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiBase = process.env.NEXT_PUBLIC_API_URL;

  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';

  const mockFetch: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        _id: 'abc125',
        orderId: 'legacy-003',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  globalThis.fetch = mockFetch;

  try {
    const result = await createOrder({ status: 'paid' });
    assert.equal(result.orderId, 'legacy-003');
    assert.equal(result.orderNumber, 'legacy-003');
    assert.equal(result._id, 'abc125');
  } finally {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_URL = originalApiBase;
  }
});

test('payRemainingBalance accepts a wrapped updated order response', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiBase = process.env.NEXT_PUBLIC_API_URL;

  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';

  const mockFetch: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        order: {
          _id: 'abc126',
          orderId: 'legacy-004',
          orderNumber: 'ORD-20260527-0004',
          payment: 'promptpay',
          status: 'paid',
          createdAt: '2026-05-31T10:00:00.000Z',
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  globalThis.fetch = mockFetch;

  try {
    const result = await payRemainingBalance('abc126', { amount: 120, method: 'promptpay' });
  assert.equal(result.orderNumber, 'ORD-20260527-0004');
  assert.equal(result.status, 'paid');
  assert.equal(result._id, 'abc126');
  assert.equal(result.paymentMethod, 'promptpay');
  } finally {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_URL = originalApiBase;
  }
});

test('fetchOrders accepts a wrapped orders list response', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiBase = process.env.NEXT_PUBLIC_API_URL;

  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';

  const mockFetch: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        data: {
          orders: [
            {
              _id: 'abc127',
              orderId: 'legacy-005',
              orderNumber: 'ORD-20260527-0005',
              payment: 'cash',
              status: 'pending',
              createdAt: '2026-05-31T10:00:00.000Z',
            },
          ],
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  globalThis.fetch = mockFetch;

  try {
    const result = await fetchOrders();
    assert.equal(result.length, 1);
    assert.equal(result[0]?.orderNumber, 'ORD-20260527-0005');
  } finally {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_URL = originalApiBase;
  }
});

test('fetchOrders accepts a raw array response', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiBase = process.env.NEXT_PUBLIC_API_URL;

  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';

  const mockFetch: typeof fetch = async () =>
    new Response(
      JSON.stringify([
        {
          _id: 'abc127b',
          orderId: 'legacy-005b',
          orderNumber: 'ORD-20260527-0005B',
          payment: 'cash',
          status: 'pending',
          createdAt: '2026-05-31T10:00:00.000Z',
        },
      ]),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  globalThis.fetch = mockFetch;

  try {
    const result = await fetchOrders();
    assert.equal(result.length, 1);
    assert.equal(result[0]?.orderNumber, 'ORD-20260527-0005B');
  } finally {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_URL = originalApiBase;
  }
});

test('fetchOrders accepts payload.orders envelopes', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiBase = process.env.NEXT_PUBLIC_API_URL;

  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';

  const mockFetch: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        payload: {
          orders: [
            {
              _id: 'abc127c',
              orderId: 'legacy-005c',
              orderNumber: 'ORD-20260527-0005C',
              payment: 'promptpay',
              status: 'paid',
              createdAt: '2026-05-31T11:00:00.000Z',
            },
          ],
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  globalThis.fetch = mockFetch;

  try {
    const result = await fetchOrders();
    assert.equal(result.length, 1);
    assert.equal(result[0]?.orderNumber, 'ORD-20260527-0005C');
  } finally {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_URL = originalApiBase;
  }
});

test('extractOrderFromResponse supports payload.order envelopes and normalizes cart aliases', () => {
  const result = extractOrderFromResponse({
    payload: {
      order: {
        _id: 'abc127d',
        orderId: 'legacy-005d',
        payment: 'cash',
        status: 'partial',
        createdAt: '2026-05-31T11:30:00.000Z',
        cart: [{ name: 'Poster', quantity: 2, unitPrice: 15 }],
      },
    },
  });

  assert.ok(result);
  assert.equal(result.orderNumber, 'legacy-005d');
  assert.equal(result.cart[0]?.qty, 2);
  assert.equal(result.cart[0]?.price, 15);
  assert.equal(result.grandTotal, 30);
});

test('extractOrdersFromResponse supports top-level orders envelopes', () => {
  const result = extractOrdersFromResponse({
    orders: [
      {
        _id: 'abc127e',
        orderId: 'legacy-005e',
        payment: 'cash',
        status: 'pending',
        createdAt: '2026-05-31T12:00:00.000Z',
      },
    ],
  });

  assert.ok(result);
  assert.equal(result.length, 1);
  assert.equal(result[0]?.orderNumber, 'legacy-005e');
});

test('fetchOrderById accepts a wrapped single-order response', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiBase = process.env.NEXT_PUBLIC_API_URL;

  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';

  const mockFetch: typeof fetch = async () =>
    new Response(
      JSON.stringify({
        data: {
          order: {
            _id: 'abc128',
            orderId: 'legacy-006',
            orderNumber: 'ORD-20260527-0006',
            payment: 'cash',
            status: 'paid',
            createdAt: '2026-05-31T10:00:00.000Z',
          },
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  globalThis.fetch = mockFetch;

  try {
    const result = await fetchOrderById('abc128');
    assert.equal(result.orderNumber, 'ORD-20260527-0006');
    assert.equal(result._id, 'abc128');
  } finally {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_URL = originalApiBase;
  }
});

test('updateOrderCustomerInfo sends only tax invoice customer fields', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiBase = process.env.NEXT_PUBLIC_API_URL;
  let capturedBody: string | undefined;

  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';

  const mockFetch: typeof fetch = async (_input, init) => {
    capturedBody = typeof init?.body === 'string' ? init.body : undefined;

    return new Response(
      JSON.stringify({
        _id: 'abc129',
        orderId: 'legacy-007',
        orderNumber: 'ORD-20260531-0007',
        customerName: 'Sarayut 111',
        taxId: '0123456789012',
        customerTaxId: '0123456789012',
        address: '88/8 Moo Baan Klang Muang',
        customerAddress: '88/8 Moo Baan Klang Muang',
        payment: 'cash',
        status: 'pending',
        createdAt: '2026-05-31T10:00:00.000Z',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };
  globalThis.fetch = mockFetch;

  try {
    const result = await updateOrderCustomerInfo('abc129', {
      customerName: 'Sarayut 111',
      taxId: '0123456789012',
      address: '88/8 Moo Baan Klang Muang',
    });

    assert.equal(result.orderNumber, 'ORD-20260531-0007');

    const parsedBody = JSON.parse(capturedBody ?? '{}') as Record<string, unknown>;
    assert.deepEqual(parsedBody, {
      customerName: 'Sarayut 111',
      taxId: '0123456789012',
      customerTaxId: '0123456789012',
      address: '88/8 Moo Baan Klang Muang',
      customerAddress: '88/8 Moo Baan Klang Muang',
    });
    assert.equal('phoneNumber' in parsedBody, false);
    assert.equal('email' in parsedBody, false);
    assert.equal('branch' in parsedBody, false);
  } finally {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_URL = originalApiBase;
  }
});

test('sortOrdersByNewest sorts newest createdAt first without mutating the original array', () => {
  const orders = [
    { _id: '1', orderId: '1', payment: 'cash', status: 'pending', createdAt: '2026-05-30T10:00:00.000Z' },
    { _id: '2', orderId: '2', payment: 'cash', status: 'pending', createdAt: '2026-05-31T10:00:00.000Z' },
  ];

  const sorted = sortOrdersByNewest(orders);

  assert.deepEqual(sorted.map(order => order.orderId), ['2', '1']);
  assert.deepEqual(orders.map(order => order.orderId), ['1', '2']);
});
