import test from 'node:test';
import assert from 'node:assert/strict';

import { parseOrderDrilldownFilters } from './orderDrilldownFilters';

test('parses supported dashboard drill-down filters', () => {
  const result = parseOrderDrilldownFilters('?workflowStatus=producing&payment=unpaid&month=2026-08');

  assert.equal(result.workflowStatus, 'producing');
  assert.equal(result.payment, 'unpaid');
  assert.equal(result.month, '2026-08');
  assert.equal(result.sanitizedSearch, 'workflowStatus=producing&payment=unpaid&month=2026-08');
});

test('migrates a legacy workflow status and parses a custom date range', () => {
  const result = parseOrderDrilldownFilters('?status=ready_for_pickup&startDate=2026-08-22&endDate=2026-08-28');

  assert.equal(result.workflowStatus, 'ready_for_pickup');
  assert.equal(result.startDate, '2026-08-22');
  assert.equal(result.endDate, '2026-08-28');
  assert.equal(result.sanitizedSearch, 'startDate=2026-08-22&endDate=2026-08-28&workflowStatus=ready_for_pickup');
});

test('drops invalid dashboard drill-down values while preserving unrelated query params', () => {
  const result = parseOrderDrilldownFilters('?status=unknown&payment=paid&month=2026-13&source=dashboard');

  assert.equal(result.workflowStatus, 'all');
  assert.equal(result.payment, 'all');
  assert.equal(result.month, null);
  assert.equal(result.sanitizedSearch, 'source=dashboard');
});
