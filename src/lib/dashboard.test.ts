import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchDashboardSummary } from './dashboard';

test('fetchDashboardSummary requests the selected Bangkok sale month', async () => {
  const originalFetch = globalThis.fetch;
  const originalApiBase = process.env.NEXT_PUBLIC_API_URL;
  let capturedUrl = '';
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
  globalThis.fetch = async input => {
    capturedUrl = String(input);
    return new Response(
      JSON.stringify({
        generatedAt: '2026-08-21T00:00:00.000Z',
        timezone: 'Asia/Bangkok',
        period: { mode: 'month', month: '2026-08' },
        periodSummary: { sales: 100 },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  };

  try {
    const result = await fetchDashboardSummary({ period: 'month', month: '2026-08' });
    assert.equal(capturedUrl, 'http://localhost:3001/dashboard/summary?period=month&month=2026-08');
    assert.equal(result.period.mode, 'month');
    assert.equal(result.periodSummary.sales, 100);
  } finally {
    globalThis.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_URL = originalApiBase;
  }
});
