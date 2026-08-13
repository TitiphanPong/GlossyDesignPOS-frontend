import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeStaffUsers } from './staffUsers';

test('normalizeStaffUsers accepts both canonical id and MongoDB _id', () => {
  assert.deepEqual(
    normalizeStaffUsers([
      { id: 'canonical', username: 'admin', role: 'admin', active: true, lastLoginAt: null },
      { _id: 'legacy', username: 'cashier', role: 'staff', active: false, lastLoginAt: '2026-08-13T00:00:00.000Z' },
    ]).map(user => user.id),
    ['canonical', 'legacy']
  );
});

test('normalizeStaffUsers drops records without a usable id', () => {
  assert.deepEqual(normalizeStaffUsers([{ username: 'broken', role: 'admin', active: true }]), []);
});
