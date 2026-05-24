import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ADMIN_AUTH_STORAGE_KEY,
  ADMIN_AUTH_TOKEN,
  ADMIN_GUARD_REDIRECT_PATH,
  ADMIN_LOGIN_PASSWORD,
  ADMIN_LOGIN_REDIRECT_PATH,
  ADMIN_LOGIN_USERNAME,
  canAdminLogin,
  isValidAdminToken,
  resolveAdminGuardRedirect,
} from './admin-auth';

test('admin auth constants keep the current local-storage guard contract stable', () => {
  assert.equal(ADMIN_AUTH_STORAGE_KEY, 'auth_token');
  assert.equal(ADMIN_AUTH_TOKEN, 'glossy-secret');
  assert.equal(ADMIN_LOGIN_USERNAME, 'glossydesign');
  assert.equal(ADMIN_LOGIN_PASSWORD, 'glossygmail');
  assert.equal(ADMIN_LOGIN_REDIRECT_PATH, '/dashboard');
  assert.equal(ADMIN_GUARD_REDIRECT_PATH, '/login');
});

test('isValidAdminToken accepts only the current admin token', () => {
  assert.equal(isValidAdminToken('glossy-secret'), true);
  assert.equal(isValidAdminToken('wrong-token'), false);
  assert.equal(isValidAdminToken(''), false);
  assert.equal(isValidAdminToken(null), false);
  assert.equal(isValidAdminToken(undefined), false);
});

test('canAdminLogin requires the exact username and password pair', () => {
  assert.equal(canAdminLogin('glossydesign', 'glossygmail'), true);
  assert.equal(canAdminLogin('glossydesign', 'wrong'), false);
  assert.equal(canAdminLogin('wrong', 'glossygmail'), false);
  assert.equal(canAdminLogin('glossydesign ', 'glossygmail'), false);
});

test('resolveAdminGuardRedirect keeps unauthenticated admin routes pointed at login', () => {
  assert.equal(resolveAdminGuardRedirect('glossy-secret'), null);
  assert.equal(resolveAdminGuardRedirect('expired-token'), '/login');
  assert.equal(resolveAdminGuardRedirect(null), '/login');
});
