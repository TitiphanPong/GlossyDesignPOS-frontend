import assert from 'node:assert/strict';
import test from 'node:test';
import { buildStockMovementPath, isLowStock } from './inventory';

test('isLowStock only flags active items at or below minimum', () => {
  assert.equal(isLowStock({ active: true, onHand: 3, minimumLevel: 3 }), true);
  assert.equal(isLowStock({ active: true, onHand: 4, minimumLevel: 3 }), false);
  assert.equal(isLowStock({ active: false, onHand: 0, minimumLevel: 3 }), false);
});

test('buildStockMovementPath serializes server-side history filters and trims search', () => {
  assert.equal(
    buildStockMovementPath({
      page: 2,
      limit: 25,
      itemId: '64b000000000000000000002',
      type: 'issue',
      from: '2026-08-01T00:00:00.000+07:00',
      to: '2026-08-28T23:59:59.999+07:00',
      q: '  sticker roll  ',
    }),
    '/inventory/movements?page=2&limit=25&itemId=64b000000000000000000002&type=issue&from=2026-08-01T00%3A00%3A00.000%2B07%3A00&to=2026-08-28T23%3A59%3A59.999%2B07%3A00&q=sticker+roll',
  );
});
