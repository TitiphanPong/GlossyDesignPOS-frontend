import test from 'node:test';
import assert from 'node:assert/strict';
import { canOverridePrice } from './admin-capabilities';

test('price override capability is limited to manager and admin roles', () => {
  assert.equal(canOverridePrice('staff'), false);
  assert.equal(canOverridePrice('manager'), true);
  assert.equal(canOverridePrice('admin'), true);
  assert.equal(canOverridePrice(null), false);
  assert.equal(canOverridePrice(undefined), false);
});
