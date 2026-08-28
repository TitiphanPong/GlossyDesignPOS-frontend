import test from 'node:test';
import assert from 'node:assert/strict';
import { GET } from './route';
import { ADMIN_AUTH_COOKIE_NAME, createAdminSession, verifyAdminSession } from '@/lib/admin-auth';

const ORIGINAL_ENV = { ...process.env };
const ORIGINAL_FETCH = globalThis.fetch;

function sessionRequest(token: string) {
  return new Request('http://localhost/api/admin/session', {
    headers: { cookie: `${ADMIN_AUTH_COOKIE_NAME}=${token}` },
  });
}

test.afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  globalThis.fetch = ORIGINAL_FETCH;
});

test('session GET reflects a backend demotion immediately and refreshes cookie metadata', async () => {
  process.env.ADMIN_SESSION_SECRET = 'test-session-secret-at-least-long-enough';
  process.env.BACKEND_API_URL = 'http://backend.test';
  const backendExpiry = new Date(Date.now() + 60_000).toISOString();
  const staleToken = await createAdminSession('cashier', Date.now(), process.env, {
    accessToken: 'backend-access-token',
    expiresAt: backendExpiry,
    role: 'admin',
  });

  globalThis.fetch = async input => {
    assert.equal(String(input), 'http://backend.test/auth/me');
    return Response.json({ user: { id: 'user-1', username: 'cashier', role: 'staff' } });
  };

  const response = await GET(sessionRequest(staleToken));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    authenticated: true,
    configured: true,
    expiresAt: (await verifyAdminSession(staleToken, Date.now(), process.env))?.expiresAt,
    username: 'cashier',
    role: 'staff',
  });

  const setCookie = response.headers.get('set-cookie') ?? '';
  const refreshedCookie = setCookie.match(new RegExp(`${ADMIN_AUTH_COOKIE_NAME}=([^;]+)`))?.[1];
  assert.ok(refreshedCookie);
  const refreshedSession = await verifyAdminSession(refreshedCookie, Date.now(), process.env);
  assert.equal(refreshedSession?.role, 'staff');
  assert.equal(refreshedSession?.accessToken, 'backend-access-token');
});

test('session GET reflects a backend promotion without waiting for stale cookie expiry', async () => {
  process.env.ADMIN_SESSION_SECRET = 'test-session-secret-at-least-long-enough';
  process.env.BACKEND_API_URL = 'http://backend.test';
  const staleToken = await createAdminSession('cashier', Date.now(), process.env, {
    accessToken: 'backend-access-token',
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
    role: 'staff',
  });

  globalThis.fetch = async () => Response.json({ user: { id: 'user-1', username: 'cashier', role: 'manager' } });

  const response = await GET(sessionRequest(staleToken));
  const payload = (await response.json()) as { authenticated: boolean; role: string };
  assert.equal(payload.authenticated, true);
  assert.equal(payload.role, 'manager');
});
