import test from 'node:test';
import assert from 'node:assert/strict';

import { parseOrderDrilldownFilters } from './orderDrilldownFilters';

test('parses supported dashboard drill-down filters', () => {
  const result = parseOrderDrilldownFilters('?status=partial&payment=unpaid&month=2026-08');

  assert.equal(result.status, 'partial');
  assert.equal(result.payment, 'unpaid');
  assert.equal(result.month, '2026-08');
  assert.equal(result.sanitizedSearch, 'status=partial&payment=unpaid&month=2026-08');
});

test('drops invalid dashboard drill-down values while preserving unrelated query params', () => {
  const result = parseOrderDrilldownFilters('?status=unknown&payment=paid&month=2026-13&source=dashboard');

  assert.equal(result.status, 'all');
  assert.equal(result.payment, 'all');
  assert.equal(result.month, null);
  assert.equal(result.sanitizedSearch, 'source=dashboard');
});
