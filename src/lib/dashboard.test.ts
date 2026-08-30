import test from 'node:test';
import assert from 'node:assert/strict';

import { buildDashboardOrdersHref, buildDashboardProductionHref, fetchDashboardSummary } from './dashboard';

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

test('builds a workflow drill-down that keeps the selected date range', () => {
  assert.equal(
    buildDashboardOrdersHref({
      period: 'last7',
      startDate: '2026-08-22',
      endDate: '2026-08-28',
      workflowStatus: 'producing',
    }),
    '/home/orders?startDate=2026-08-22&endDate=2026-08-28&workflowStatus=producing'
  );
});

test('builds executable Production Board urgency drill-downs for incomplete jobs', () => {
  assert.equal(buildDashboardProductionHref('dueToday'), '/home/production?active=true&due=today');
  assert.equal(buildDashboardProductionHref('overdue'), '/home/production?active=true&due=overdue');
  assert.equal(buildDashboardProductionHref('rush'), '/home/production?active=true&priority=rush');
});

test('builds an outstanding drill-down for today', () => {
  assert.equal(
    buildDashboardOrdersHref({
      period: 'today',
      startDate: '2026-08-28',
      endDate: '2026-08-28',
      payment: 'unpaid',
    }),
    '/home/orders?period=today&payment=unpaid'
  );
});
