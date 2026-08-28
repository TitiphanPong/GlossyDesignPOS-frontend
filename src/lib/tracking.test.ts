import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildPublicTrackingTimeline,
  getOrderPrefillFromSearch,
  trackOrder,
} from './tracking';

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
    return new Response(JSON.stringify({
      orderNumber: 'GD-000123',
      currentMilestone: 'in_progress',
      milestones: [
        { milestone: 'received', reachedAt: '2026-08-27T00:00:00.000Z' },
        { milestone: 'in_progress', reachedAt: '2026-08-27T01:00:00.000Z' },
      ],
      updatedAt: '2026-08-27T01:00:00.000Z',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
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

test('order prefill reads only the order query parameter and never phone data', () => {
  assert.equal(getOrderPrefillFromSearch('?order=GD-000123'), 'GD-000123');
  assert.equal(getOrderPrefillFromSearch('order=%20GD-42%20&phoneSuffix=5678'), 'GD-42');
  assert.equal(getOrderPrefillFromSearch('?phoneSuffix=5678'), '');
});

test('timeline marks reached, current, and upcoming milestones in order', () => {
  assert.deepEqual(buildPublicTrackingTimeline({
    orderNumber: 'GD-1',
    currentMilestone: 'ready',
    milestones: [
      { milestone: 'received', reachedAt: '2026-08-27T00:00:00.000Z' },
      { milestone: 'in_progress', reachedAt: '2026-08-27T01:00:00.000Z' },
      { milestone: 'ready', reachedAt: '2026-08-27T02:00:00.000Z' },
    ],
  }).map(item => [item.milestone, item.state]), [
    ['received', 'completed'],
    ['in_progress', 'completed'],
    ['ready', 'current'],
    ['completed', 'upcoming'],
  ]);
});

test('cancelled timeline stops normal future flow and emphasizes cancellation', () => {
  assert.deepEqual(buildPublicTrackingTimeline({
    orderNumber: 'GD-2',
    currentMilestone: 'cancelled',
    milestones: [
      { milestone: 'received', reachedAt: '2026-08-27T00:00:00.000Z' },
      { milestone: 'cancelled', reachedAt: '2026-08-27T01:00:00.000Z' },
    ],
  }).map(item => [item.milestone, item.state]), [
    ['received', 'completed'],
    ['cancelled', 'cancelled'],
  ]);
});
