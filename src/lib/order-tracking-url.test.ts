import test from 'node:test';
import assert from 'node:assert/strict';

import { buildOrderTrackingPath, buildOrderTrackingUrl } from './order-tracking-url';

test('builds a tracking path with only the order number', () => {
  assert.equal(buildOrderTrackingPath('ORD-2026-00123'), '/track?order=ORD-2026-00123');
});

test('encodes the order number and never adds verifier or customer PII', () => {
  const url = buildOrderTrackingUrl('ORD 2026/00123', 'https://pos.example.com');

  assert.equal(url, 'https://pos.example.com/track?order=ORD+2026%2F00123');
  assert.equal(url?.includes('phone'), false);
  assert.equal(url?.includes('token'), false);
});

test('fails closed when an absolute public origin is unavailable or unsupported', () => {
  assert.equal(buildOrderTrackingUrl('ORD-1', undefined), null);
  assert.equal(buildOrderTrackingUrl('ORD-1', 'javascript:alert(1)'), null);
  assert.equal(buildOrderTrackingUrl('', 'https://pos.example.com'), null);
});
