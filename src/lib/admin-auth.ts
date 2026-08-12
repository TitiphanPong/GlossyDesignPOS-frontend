export const ADMIN_AUTH_STORAGE_KEY = 'auth_token';
export const ADMIN_AUTH_COOKIE_NAME = 'glossy_admin_session';
export const ADMIN_LOGIN_REDIRECT_PATH = '/home';
export const ADMIN_GUARD_REDIRECT_PATH = '/login';
export const ADMIN_AUTH_SESSION_VERSION = 3;
export const ADMIN_AUTH_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export type AdminAuthSession = {
  username: string;
  role?: 'staff' | 'manager' | 'admin';
  accessToken?: string;
  version: number;
  issuedAt: number;
  expiresAt: number;
};

type AdminAuthConfig = {
  username: string;
  password: string;
  secret: string;
};

function readRequiredServerValue(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';

  bytes.forEach(byte => {
    binary += String.fromCodePoint(byte);
  });

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
}

function fromBase64Url(value: string): string | null {
  try {
    const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
    const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
    const binary = atob(`${normalized}${padding}`);
    const bytes = Uint8Array.from(binary, char => char.codePointAt(0) ?? 0);
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= (left.codePointAt(index) ?? 0) ^ (right.codePointAt(index) ?? 0);
  }

  return mismatch === 0;
}

async function signValue(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  const bytes = new Uint8Array(signature);
  let binary = '';

  bytes.forEach(byte => {
    binary += String.fromCodePoint(byte);
  });

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

export function getAdminAuthConfig(env: NodeJS.ProcessEnv = process.env): AdminAuthConfig | null {
  const username = readRequiredServerValue(env.ADMIN_LOGIN_USERNAME);
  const password = readRequiredServerValue(env.ADMIN_LOGIN_PASSWORD);
  const secret = readRequiredServerValue(env.ADMIN_SESSION_SECRET);

  if (!username || !password || !secret) {
    return null;
  }

  return { username, password, secret };
}

export function hasAdminAuthConfig(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(getAdminAuthConfig(env));
}

export async function createAdminSession(
  username: string,
  now = Date.now(),
  env: NodeJS.ProcessEnv = process.env,
  backend?: { accessToken: string; role: 'staff' | 'manager' | 'admin'; expiresAt: string }
): Promise<string> {
  const config = getAdminAuthConfig(env);
  if (!config) {
    throw new Error('Admin authentication is not configured');
  }

  const payload = JSON.stringify({
    username,
    role: backend?.role,
    accessToken: backend?.accessToken,
    version: ADMIN_AUTH_SESSION_VERSION,
    issuedAt: now,
    expiresAt: now + ADMIN_AUTH_SESSION_TTL_MS,
  } satisfies AdminAuthSession);
  const encodedPayload = toBase64Url(payload);
  const signature = await signValue(encodedPayload, config.secret);

  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSession(token: string | null | undefined, now = Date.now(), env: NodeJS.ProcessEnv = process.env): Promise<AdminAuthSession | null> {
  if (!token) {
    return null;
  }

  const config = getAdminAuthConfig(env);
  if (!config) {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = await signValue(encodedPayload, config.secret);
  if (!constantTimeEqual(signature, expectedSignature)) {
    return null;
  }

  const payload = fromBase64Url(encodedPayload);
  if (!payload) {
    return null;
  }

  try {
    const parsed = JSON.parse(payload);
    if (!isRecord(parsed)) {
      return null;
    }

    const username = parsed.username;
    const version = parsed.version;
    const issuedAt = parsed.issuedAt;
    const expiresAt = parsed.expiresAt;
    const role = parsed.role;
    const accessToken = parsed.accessToken;

    if (typeof username !== 'string' || !username.trim()) {
      return null;
    }

    if (version !== ADMIN_AUTH_SESSION_VERSION) {
      return null;
    }

    // Version 3 sessions must carry the revocable backend identity used by
    // the same-origin BFF. Older frontend-only cookies must log in again.
    if (typeof accessToken !== 'string' || !accessToken) {
      return null;
    }

    if (role !== 'staff' && role !== 'manager' && role !== 'admin') {
      return null;
    }

    if (typeof issuedAt !== 'number' || !Number.isFinite(issuedAt)) {
      return null;
    }

    if (typeof expiresAt !== 'number' || !Number.isFinite(expiresAt)) {
      return null;
    }

    if (expiresAt <= issuedAt || expiresAt <= now) {
      return null;
    }

    return {
      username,
      role,
      accessToken,
      version,
      issuedAt,
      expiresAt,
    };
  } catch {
    return null;
  }
}

export async function canAdminLogin(username: string, password: string, env: NodeJS.ProcessEnv = process.env): Promise<boolean> {
  const config = getAdminAuthConfig(env);
  if (!config) {
    return false;
  }

  return username === config.username && password === config.password;
}

export function resolveAdminGuardRedirect(isAuthenticated: boolean): string | null {
  return isAuthenticated ? null : ADMIN_GUARD_REDIRECT_PATH;
}

export function clearAdminAuthSession(storage?: Pick<Storage, 'removeItem'>): void {
  storage?.removeItem(ADMIN_AUTH_STORAGE_KEY);
}

export async function destroyAdminBrowserSession(): Promise<void> {
  try {
    await fetch('/api/admin/session', {
      method: 'DELETE',
      credentials: 'same-origin',
    });
  } finally {
    clearAdminAuthSession(globalThis.localStorage);
  }
}
