import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ADMIN_AUTH_COOKIE_NAME,
  ADMIN_AUTH_SESSION_TTL_MS,
  ADMIN_AUTH_SESSION_VERSION,
  ADMIN_GUARD_REDIRECT_PATH,
  ADMIN_LOGIN_REDIRECT_PATH,
  canAdminLogin,
  clearAdminAuthSession,
  createAdminSession,
  getAdminAuthConfig,
  hasAdminAuthConfig,
  resolveAdminGuardRedirect,
  verifyAdminSession,
} from './admin-auth';

const TEST_ENV: NodeJS.ProcessEnv = {
  ADMIN_LOGIN_USERNAME: 'glossydesign',
  ADMIN_LOGIN_PASSWORD: 'glossygmail',
  ADMIN_SESSION_SECRET: 'test-secret-value',
  NODE_ENV: 'test',
};

test('admin auth constants expose the cookie-based contract', () => {
  assert.equal(ADMIN_AUTH_COOKIE_NAME, 'glossy_admin_session');
  assert.equal(ADMIN_AUTH_SESSION_VERSION, 2);
  assert.equal(ADMIN_AUTH_SESSION_TTL_MS, 12 * 60 * 60 * 1000);
  assert.equal(ADMIN_LOGIN_REDIRECT_PATH, '/dashboard');
  assert.equal(ADMIN_GUARD_REDIRECT_PATH, '/login');
});

test('getAdminAuthConfig requires all server-side auth values', () => {
  assert.deepEqual(getAdminAuthConfig(TEST_ENV), {
    username: 'glossydesign',
    password: 'glossygmail',
    secret: 'test-secret-value',
  });
  assert.equal(hasAdminAuthConfig(TEST_ENV), true);
  assert.equal(hasAdminAuthConfig({ ADMIN_LOGIN_USERNAME: 'only-user', NODE_ENV: 'test' }), false);
});

test('createAdminSession and verifyAdminSession round-trip a valid signed cookie', async () => {
  const now = Date.now();
  const token = await createAdminSession('glossydesign', now, TEST_ENV);
  const session = await verifyAdminSession(token, now + 1000, TEST_ENV);

  assert.ok(session);
  assert.equal(session?.username, 'glossydesign');
  assert.equal(session?.version, ADMIN_AUTH_SESSION_VERSION);
  assert.equal(session?.issuedAt, now);
});

test('verifyAdminSession rejects tampered, expired, and malformed cookies', async () => {
  const now = Date.now();
  const token = await createAdminSession('glossydesign', now, TEST_ENV);
  const [payload, signature] = token.split('.');
  const tamperedToken = `${payload}.tampered${signature}`;

  assert.equal(await verifyAdminSession(tamperedToken, now + 1000, TEST_ENV), null);
  assert.equal(await verifyAdminSession(token, now + ADMIN_AUTH_SESSION_TTL_MS + 1, TEST_ENV), null);
  assert.equal(await verifyAdminSession('not-a-session', now, TEST_ENV), null);
});

test('canAdminLogin validates credentials against server env config', async () => {
  assert.equal(await canAdminLogin('glossydesign', 'glossygmail', TEST_ENV), true);
  assert.equal(await canAdminLogin('glossydesign', 'wrong', TEST_ENV), false);
  assert.equal(await canAdminLogin('wrong', 'glossygmail', TEST_ENV), false);
});

test('resolveAdminGuardRedirect reflects authenticated state', () => {
  assert.equal(resolveAdminGuardRedirect(true), null);
  assert.equal(resolveAdminGuardRedirect(false), '/login');
});

test('clearAdminAuthSession removes the legacy localStorage key during migration', () => {
  let removedKey: string | null = null;

  clearAdminAuthSession({
    removeItem(key) {
      removedKey = key;
    },
  });

  assert.equal(removedKey, 'auth_token');
});
