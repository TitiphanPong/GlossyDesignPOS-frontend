import test from 'node:test';
import assert from 'node:assert/strict';

import {
  QuotationApiError,
  convertQuotationToOrder,
  fetchQuotations,
  updateQuotation,
} from './quotations';

function headerValue(headers: HeadersInit | undefined, key: string): string | null {
  if (!headers) return null;
  if (headers instanceof Headers) return headers.get(key);
  if (Array.isArray(headers)) {
    return headers.find(([name]) => name.toLowerCase() === key.toLowerCase())?.[1] ?? null;
  }
  const match = Object.entries(headers).find(([name]) => name.toLowerCase() === key.toLowerCase());
  return match?.[1] ?? null;
}

test('fetchQuotations uses only the Quotation API with server-side filters and pagination', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiBase = process.env.NEXT_PUBLIC_API_URL;
  let capturedUrl = '';

  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
  globalThis.fetch = async (input) => {
    capturedUrl = String(input);
    return new Response(
      JSON.stringify({
        data: [],
        page: 2,
        limit: 50,
        total: 0,
        summary: { draft: 0, sent: 0, approved: 0, expired: 0, expiring: 0, expiringOrExpired: 0 },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };

  try {
    await fetchQuotations({
      page: 2,
      limit: 50,
      search: 'QT-202609 สมชาย',
      status: 'SENT',
      issuedFrom: '2026-09-01',
      issuedTo: '2026-09-30',
      validFrom: '2026-09-02',
      validTo: '2026-10-15',
      sort: 'validUntilAsc',
    });

    const url = new URL(capturedUrl);
    assert.equal(url.pathname, '/quotations');
    assert.equal(url.searchParams.get('page'), '2');
    assert.equal(url.searchParams.get('limit'), '50');
    assert.equal(url.searchParams.get('search'), 'QT-202609 สมชาย');
    assert.equal(url.searchParams.get('status'), 'SENT');
    assert.equal(url.searchParams.get('issuedFrom'), '2026-09-01');
    assert.equal(url.searchParams.get('issuedTo'), '2026-09-30');
    assert.equal(url.searchParams.get('validFrom'), '2026-09-02');
    assert.equal(url.searchParams.get('validTo'), '2026-10-15');
    assert.equal(url.searchParams.get('sort'), 'validUntilAsc');
    assert.equal(capturedUrl.includes('/orders'), false);
  } finally {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_URL = originalApiBase;
  }
});

test('updateQuotation preserves an explicit zero discount so an existing Draft discount can be cleared', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiBase = process.env.NEXT_PUBLIC_API_URL;
  let capturedUrl = '';
  let capturedMethod = '';
  let capturedBody: Record<string, unknown> = {};

  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
  globalThis.fetch = async (input, init) => {
    capturedUrl = String(input);
    capturedMethod = init?.method ?? '';
    capturedBody = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
    return new Response(JSON.stringify({ _id: 'quotation-1', version: 4 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    await updateQuotation('quotation-1', 3, {
      discount: { type: 'amount', value: 0 },
      taxInvoiceRequested: false,
    });

    assert.equal(new URL(capturedUrl).pathname, '/quotations/quotation-1');
    assert.equal(capturedMethod, 'PATCH');
    assert.equal(capturedBody.version, 3);
    assert.deepEqual(capturedBody.discount, { type: 'amount', value: 0 });
    assert.equal('status' in capturedBody, false);
    assert.equal('grandTotal' in capturedBody, false);
  } finally {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_URL = originalApiBase;
  }
});

test('convertQuotationToOrder sends a stable idempotency key and never calls Order PATCH', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiBase = process.env.NEXT_PUBLIC_API_URL;
  const requests: Array<{ url: string; method: string; idempotencyKey: string | null }> = [];

  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
  globalThis.fetch = async (input, init) => {
    requests.push({
      url: String(input),
      method: init?.method ?? '',
      idempotencyKey: headerValue(init?.headers, 'Idempotency-Key'),
    });
    return new Response(
      JSON.stringify({
        quotation: { _id: 'quotation-1', status: 'CONVERTED' },
        order: { _id: 'order-1', orderId: 'GD-2026-000001', status: 'pending', grandTotal: 107, remainingTotal: 107 },
        replayed: requests.length > 1,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };

  try {
    await convertQuotationToOrder('quotation-1', 5);
    await convertQuotationToOrder('quotation-1', 5);

    assert.equal(requests.length, 2);
    for (const request of requests) {
      assert.equal(new URL(request.url).pathname, '/quotations/quotation-1/convert-to-order');
      assert.equal(request.method, 'POST');
      assert.equal(request.idempotencyKey, 'quotation-convert-quotation-1-5');
      assert.equal(request.url.includes('/orders'), false);
    }
  } finally {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_URL = originalApiBase;
  }
});

test('convertQuotationToOrder surfaces structured quoted-vs-current price conflicts', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiBase = process.env.NEXT_PUBLIC_API_URL;

  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        code: 'QUOTATION_PRICE_CONFLICT',
        message: 'Current catalog price differs from quoted price.',
        conflicts: [
          { index: 0, name: 'Premium Card', quotedUnitPrice: 100, currentUnitPrice: 120 },
        ],
      }),
      { status: 409, headers: { 'Content-Type': 'application/json' } },
    );

  try {
    await assert.rejects(
      () => convertQuotationToOrder('quotation-1', 5),
      (error: unknown) => {
        assert.ok(error instanceof QuotationApiError);
        assert.equal(error.status, 409);
        assert.equal(error.code, 'QUOTATION_PRICE_CONFLICT');
        assert.deepEqual(error.conflicts, [
          { index: 0, name: 'Premium Card', quotedUnitPrice: 100, currentUnitPrice: 120 },
        ]);
        return true;
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_URL = originalApiBase;
  }
});
