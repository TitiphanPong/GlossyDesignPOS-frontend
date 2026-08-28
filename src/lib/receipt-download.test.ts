import assert from 'node:assert/strict';
import test from 'node:test';
import { buildReceiptFileName, isShareCancelled, prefersReceiptShare } from './receipt-download';

test('prefersReceiptShare detects iPhone, Android and iPadOS desktop mode', () => {
  assert.equal(prefersReceiptShare({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', maxTouchPoints: 5 }), true);
  assert.equal(prefersReceiptShare({ userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 9)', maxTouchPoints: 5 }), true);
  assert.equal(prefersReceiptShare({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)', maxTouchPoints: 5 }), true);
});

test('prefersReceiptShare keeps desktop clients on direct download', () => {
  assert.equal(prefersReceiptShare({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', maxTouchPoints: 0 }), false);
  assert.equal(prefersReceiptShare({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', maxTouchPoints: 0 }), false);
  assert.equal(prefersReceiptShare(undefined), false);
});

test('buildReceiptFileName removes display hash and keeps the order number', () => {
  assert.equal(buildReceiptFileName('#GD-2026-000245'), 'receipt-GD-2026-000245.png');
});

test('isShareCancelled recognizes the native share cancel signal', () => {
  assert.equal(isShareCancelled(new DOMException('cancelled', 'AbortError')), true);
  assert.equal(isShareCancelled(new Error('failed')), false);
});
