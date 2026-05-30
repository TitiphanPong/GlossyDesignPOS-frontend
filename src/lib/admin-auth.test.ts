import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ADMIN_AUTH_STORAGE_KEY,
  ADMIN_AUTH_SESSION_TTL_MS,
  ADMIN_AUTH_SESSION_VERSION,
  ADMIN_AUTH_TOKEN,
  ADMIN_GUARD_REDIRECT_PATH,
  ADMIN_LOGIN_PASSWORD,
  ADMIN_LOGIN_REDIRECT_PATH,
  ADMIN_LOGIN_USERNAME,
  canAdminLogin,
  clearAdminAuthSession,
  createAdminSession,
  isValidAdminToken,
  resolveAdminGuardRedirect,
  shouldClearStoredAdminToken,
} from './admin-auth';

test('admin auth constants keep the current local-storage guard contract stable', () => {
  assert.equal(ADMIN_AUTH_STORAGE_KEY, 'auth_token');
  assert.equal(ADMIN_AUTH_TOKEN, 'glossy-secret');
  assert.equal(ADMIN_AUTH_SESSION_VERSION, 1);
  assert.equal(ADMIN_AUTH_SESSION_TTL_MS, 12 * 60 * 60 * 1000);
  assert.equal(ADMIN_LOGIN_USERNAME, 'glossydesign');
  assert.equal(ADMIN_LOGIN_PASSWORD, 'glossygmail');
  assert.equal(ADMIN_LOGIN_REDIRECT_PATH, '/dashboard');
  assert.equal(ADMIN_GUARD_REDIRECT_PATH, '/login');
});

test('isValidAdminToken accepts the legacy token and a valid structured session', () => {
  assert.equal(isValidAdminToken('glossy-secret'), true);
  assert.equal(isValidAdminToken(createAdminSession()), true);
  assert.equal(isValidAdminToken('wrong-token'), false);
  assert.equal(isValidAdminToken(''), false);
  assert.equal(isValidAdminToken(null), false);
  assert.equal(isValidAdminToken(undefined), false);
});

test('isValidAdminToken rejects expired and malformed structured sessions', () => {
  const expired = JSON.stringify({
    token: ADMIN_AUTH_TOKEN,
    version: ADMIN_AUTH_SESSION_VERSION,
    issuedAt: 1000,
    expiresAt: 1001,
  });
  const malformed = JSON.stringify({
    token: ADMIN_AUTH_TOKEN,
    version: ADMIN_AUTH_SESSION_VERSION,
    issuedAt: 'bad',
    expiresAt: 2000,
  });

  assert.equal(isValidAdminToken(expired), false);
  assert.equal(isValidAdminToken(malformed), false);
});

test('canAdminLogin requires the exact username and password pair', () => {
  assert.equal(canAdminLogin('glossydesign', 'glossygmail'), true);
  assert.equal(canAdminLogin('glossydesign', 'wrong'), false);
  assert.equal(canAdminLogin('wrong', 'glossygmail'), false);
  assert.equal(canAdminLogin('glossydesign ', 'glossygmail'), false);
});

test('resolveAdminGuardRedirect keeps unauthenticated admin routes pointed at login', () => {
  assert.equal(resolveAdminGuardRedirect('glossy-secret'), null);
  assert.equal(resolveAdminGuardRedirect(JSON.stringify({ token: ADMIN_AUTH_TOKEN, version: ADMIN_AUTH_SESSION_VERSION, issuedAt: 1000, expiresAt: 1001 })), '/login');
  assert.equal(resolveAdminGuardRedirect(null), '/login');
});

test('shouldClearStoredAdminToken only clears non-empty invalid stored auth', () => {
  assert.equal(shouldClearStoredAdminToken('glossy-secret'), false);
  assert.equal(shouldClearStoredAdminToken(createAdminSession()), false);
  assert.equal(shouldClearStoredAdminToken('expired-token'), true);
  assert.equal(shouldClearStoredAdminToken(null), false);
});

test('clearAdminAuthSession removes the shared auth storage key', () => {
  let removedKey: string | null = null;

  clearAdminAuthSession({
    removeItem(key) {
      removedKey = key;
    },
  });

  assert.equal(removedKey, ADMIN_AUTH_STORAGE_KEY);
});
