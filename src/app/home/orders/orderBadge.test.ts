import assert from 'node:assert/strict';
import test from 'node:test';

import { getOrderKindBadge } from './orderBadge';

test('backdated badge overrides quick-sale rush badge', () => {
  assert.deepEqual(
    getOrderKindBadge({ orderType: 'QUICK_SALE', isBackdated: true }),
    { kind: 'backdated', label: 'ย้อนหลัง' }
  );
});

test('quick sale uses the rush badge when it is not backdated', () => {
  assert.deepEqual(
    getOrderKindBadge({ orderType: 'QUICK_SALE', isBackdated: false }),
    { kind: 'rush', label: 'งานด่วน' }
  );
});

test('normal sale uses the normal badge when it is not backdated', () => {
  assert.deepEqual(
    getOrderKindBadge({ orderType: 'NORMAL', isBackdated: false }),
    { kind: 'normal', label: 'งานปกติ' }
  );
});
