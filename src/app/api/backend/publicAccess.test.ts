import assert from 'node:assert/strict';
import test from 'node:test';
import { isPublicBackendRequest } from './publicAccess';

test('public backend allowlist includes only the canonical anonymous POST contracts', () => {
  assert.equal(isPublicBackendRequest('POST', ['uploads']), true);
  assert.equal(isPublicBackendRequest('POST', ['line', 'session']), true);
  assert.equal(isPublicBackendRequest('POST', ['upload']), false);
  assert.equal(isPublicBackendRequest('POST', ['tracking', 'token']), true);
  assert.equal(isPublicBackendRequest('POST', ['tracking', 'lookup']), true);
});

test('public backend allowlist exposes only read-only customer display token routes', () => {
  assert.equal(isPublicBackendRequest('GET', ['customer-display', 'state']), true);
  assert.equal(isPublicBackendRequest('GET', ['customer-display', 'events']), true);
  assert.equal(isPublicBackendRequest('POST', ['customer-display', 'sessions']), false);
  assert.equal(isPublicBackendRequest('PATCH', ['customer-display', 'sessions', 'abc', 'state']), false);
});

test('public backend allowlist does not expose tracking token through other methods or routes', () => {
  assert.equal(isPublicBackendRequest('GET', ['tracking', 'token']), false);
  assert.equal(isPublicBackendRequest('PATCH', ['tracking', 'token']), false);
  assert.equal(isPublicBackendRequest('POST', ['orders']), false);
  assert.equal(isPublicBackendRequest('GET', ['customers']), false);
  assert.equal(isPublicBackendRequest('GET', ['customers', '64b000000000000000000001']), false);
  assert.equal(isPublicBackendRequest('POST', ['customers']), false);
  assert.equal(isPublicBackendRequest('POST', ['orders', 'GD-1', 'tracking-access']), false);
});
