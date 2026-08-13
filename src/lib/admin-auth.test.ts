import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ADMIN_AUTH_COOKIE_NAME,
  ADMIN_AUTH_SESSION_TTL_MS,
  ADMIN_AUTH_SESSION_VERSION,
  ADMIN_GUARD_REDIRECT_PATH,
  ADMIN_LOGIN_REDIRECT_PATH,
  clearAdminAuthSession,
  createAdminSession,
  getAdminAuthConfig,
  hasAdminAuthConfig,
  resolveAdminGuardRedirect,
  sanitizeAdminRedirectPath,
  verifyAdminSession,
} from './admin-auth';

const TEST_ENV: NodeJS.ProcessEnv = {
  ADMIN_SESSION_SECRET: 'test-secret-value',
  NODE_ENV: 'test',
};

test('admin auth constants expose the cookie-based contract', () => {
  assert.equal(ADMIN_AUTH_COOKIE_NAME, 'glossy_admin_session');
  assert.equal(ADMIN_AUTH_SESSION_VERSION, 3);
  assert.equal(ADMIN_AUTH_SESSION_TTL_MS, 12 * 60 * 60 * 1000);
  assert.equal(ADMIN_LOGIN_REDIRECT_PATH, '/home');
  assert.equal(ADMIN_GUARD_REDIRECT_PATH, '/login');
});

test('getAdminAuthConfig only requires the cookie signing secret', () => {
  assert.deepEqual(getAdminAuthConfig(TEST_ENV), {
    secret: 'test-secret-value',
  });
  assert.equal(hasAdminAuthConfig(TEST_ENV), true);
  assert.equal(hasAdminAuthConfig({ ADMIN_LOGIN_USERNAME: 'legacy-user', NODE_ENV: 'test' }), false);
});

test('createAdminSession and verifyAdminSession round-trip a valid signed cookie', async () => {
  const now = Date.now();
  const token = await createAdminSession('glossydesign', now, TEST_ENV, {
    accessToken: 'backend-token',
    role: 'admin',
    expiresAt: new Date(now + ADMIN_AUTH_SESSION_TTL_MS).toISOString(),
  });
  const session = await verifyAdminSession(token, now + 1000, TEST_ENV);

  assert.ok(session);
  assert.equal(session?.username, 'glossydesign');
  assert.equal(session?.version, ADMIN_AUTH_SESSION_VERSION);
  assert.equal(session?.issuedAt, now);
});

test('backend access token and role remain server-only session claims', async () => {
  const now = Date.now();
  const token = await createAdminSession('glossydesign', now, TEST_ENV, {
    accessToken: 'opaque-backend-token',
    role: 'admin',
    expiresAt: new Date(now + ADMIN_AUTH_SESSION_TTL_MS).toISOString(),
  });
  const session = await verifyAdminSession(token, now + 1000, TEST_ENV);

  assert.equal(session?.accessToken, 'opaque-backend-token');
  assert.equal(session?.role, 'admin');
});

test('frontend session never outlives the backend session', async () => {
  const now = Date.now();
  const backendExpiry = now + 60_000;
  const token = await createAdminSession('cashier', now, TEST_ENV, {
    accessToken: 'short-lived-token',
    role: 'staff',
    expiresAt: new Date(backendExpiry).toISOString(),
  });
  const session = await verifyAdminSession(token, now + 1000, TEST_ENV);

  assert.equal(session?.expiresAt, backendExpiry);
  assert.equal(await verifyAdminSession(token, backendExpiry, TEST_ENV), null);
});

test('verifyAdminSession rejects frontend-only legacy cookies without backend identity', async () => {
  const now = Date.now();
  const token = await createAdminSession('glossydesign', now, TEST_ENV);

  assert.equal(await verifyAdminSession(token, now + 1000, TEST_ENV), null);
});

test('signed sessions support backend-managed users beyond the bootstrap admin', async () => {
  const now = Date.now();
  const token = await createAdminSession('cashier-01', now, TEST_ENV, {
    accessToken: 'staff-token',
    role: 'staff',
    expiresAt: new Date(now + ADMIN_AUTH_SESSION_TTL_MS).toISOString(),
  });

  const session = await verifyAdminSession(token, now + 1000, TEST_ENV);
  assert.equal(session?.username, 'cashier-01');
  assert.equal(session?.role, 'staff');
});

test('verifyAdminSession rejects tampered, expired, and malformed cookies', async () => {
  const now = Date.now();
  const token = await createAdminSession('glossydesign', now, TEST_ENV, {
    accessToken: 'backend-token',
    role: 'admin',
    expiresAt: new Date(now + ADMIN_AUTH_SESSION_TTL_MS).toISOString(),
  });
  const [payload, signature] = token.split('.');
  const tamperedToken = `${payload}.tampered${signature}`;

  assert.equal(await verifyAdminSession(tamperedToken, now + 1000, TEST_ENV), null);
  assert.equal(await verifyAdminSession(token, now + ADMIN_AUTH_SESSION_TTL_MS + 1, TEST_ENV), null);
  assert.equal(await verifyAdminSession('not-a-session', now, TEST_ENV), null);
});

test('sanitizeAdminRedirectPath only permits same-origin paths', () => {
  assert.equal(sanitizeAdminRedirectPath('/home/orders?status=pending#latest'), '/home/orders?status=pending#latest');
  assert.equal(sanitizeAdminRedirectPath('https://example.com'), '/home');
  assert.equal(sanitizeAdminRedirectPath('//example.com/path'), '/home');
  assert.equal(sanitizeAdminRedirectPath('/\\example.com'), '/home');
  assert.equal(sanitizeAdminRedirectPath('javascript:alert(1)'), '/home');
  assert.equal(sanitizeAdminRedirectPath(null), '/home');
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
