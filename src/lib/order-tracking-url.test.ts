import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildOrderTrackingPath,
  buildOrderTrackingUrl,
  buildSecureOrderTrackingPath,
  buildSecureOrderTrackingUrl,
} from './order-tracking-url';

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

test('builds secure QR tracking URLs from opaque tokens without phone or order PII', () => {
  const token = 'C'.repeat(43);
  assert.equal(buildSecureOrderTrackingPath(token), `/track?t=${token}`);
  assert.equal(
    buildSecureOrderTrackingUrl(token, 'https://pos.example.com'),
    `https://pos.example.com/track?t=${token}`,
  );
  assert.equal(buildSecureOrderTrackingUrl(token, 'https://pos.example.com')?.includes('phone'), false);
  assert.equal(buildSecureOrderTrackingUrl(token, 'https://pos.example.com')?.includes('order='), false);
});

test('secure QR tracking URLs fail closed for malformed capability tokens', () => {
  assert.equal(buildSecureOrderTrackingPath('too-short'), null);
  assert.equal(buildSecureOrderTrackingUrl('too-short', 'https://pos.example.com'), null);
  assert.equal(buildSecureOrderTrackingUrl('C'.repeat(43), 'javascript:alert(1)'), null);
});
