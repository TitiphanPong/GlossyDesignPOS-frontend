import assert from 'node:assert/strict';
import test from 'node:test';
import { trackOrder } from './tracking';

test('public tracking uses one exact verifier endpoint without legacy fallbacks', async () => {
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;
  const originalFetch = globalThis.fetch;
  process.env.NEXT_PUBLIC_API_URL = 'https://api.example.test';

  let calls = 0;
  globalThis.fetch = (async (input, init) => {
    calls += 1;
    assert.equal(input, 'https://api.example.test/tracking/lookup');
    assert.equal(init?.method, 'POST');
    assert.deepEqual(JSON.parse(String(init?.body)), {
      orderNumber: 'GD-000123',
      phoneSuffix: '5678',
    });
    return new Response(JSON.stringify({ orderNumber: 'GD-000123', status: 'producing' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }) as typeof fetch;

  try {
    const result = await trackOrder(' GD-000123 ', ' 5678 ');
    assert.equal(result.orderNumber, 'GD-000123');
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalApiUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL;
    else process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
  }
});
