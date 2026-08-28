import assert from 'node:assert/strict';
import test from 'node:test';
import { isLowStock } from './inventory';

test('isLowStock only flags active items at or below minimum', () => {
  assert.equal(isLowStock({ active: true, onHand: 3, minimumLevel: 3 }), true);
  assert.equal(isLowStock({ active: true, onHand: 4, minimumLevel: 3 }), false);
  assert.equal(isLowStock({ active: false, onHand: 0, minimumLevel: 3 }), false);
});
