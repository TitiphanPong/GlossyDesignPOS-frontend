import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBackendCurrentAdminIdentity } from './admin-session-identity';

test('uses the current backend role instead of stale frontend session metadata', () => {
  assert.deepEqual(
    parseBackendCurrentAdminIdentity({ user: { id: 'user-1', username: 'cashier', role: 'staff' } }),
    { username: 'cashier', role: 'staff' }
  );
  assert.deepEqual(
    parseBackendCurrentAdminIdentity({ user: { id: 'user-1', username: 'cashier', role: 'admin' } }),
    { username: 'cashier', role: 'admin' }
  );
});

test('fails closed for malformed backend identity payloads', () => {
  assert.equal(parseBackendCurrentAdminIdentity(null), null);
  assert.equal(parseBackendCurrentAdminIdentity({ user: { username: 'cashier', role: 'owner' } }), null);
  assert.equal(parseBackendCurrentAdminIdentity({ user: { username: '   ', role: 'staff' } }), null);
});
