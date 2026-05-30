export const ADMIN_AUTH_STORAGE_KEY = 'auth_token';
export const ADMIN_AUTH_TOKEN = 'glossy-secret';
export const ADMIN_LOGIN_USERNAME = 'glossydesign';
export const ADMIN_LOGIN_PASSWORD = 'glossygmail';
export const ADMIN_LOGIN_REDIRECT_PATH = '/dashboard';
export const ADMIN_GUARD_REDIRECT_PATH = '/login';
export const ADMIN_AUTH_SESSION_VERSION = 1;
export const ADMIN_AUTH_SESSION_TTL_MS = 12 * 60 * 60 * 1000;

type AdminAuthSession = {
  token: string;
  version: number;
  issuedAt: number;
  expiresAt: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function parseAdminAuthSession(value: string | null | undefined): AdminAuthSession | null {
  if (!value) {
    return null;
  }

  if (value === ADMIN_AUTH_TOKEN) {
    return {
      token: ADMIN_AUTH_TOKEN,
      version: ADMIN_AUTH_SESSION_VERSION,
      issuedAt: 0,
      expiresAt: Number.POSITIVE_INFINITY,
    };
  }

  try {
    const parsed = JSON.parse(value);
    if (!isRecord(parsed)) {
      return null;
    }

    const token = parsed.token;
    const version = parsed.version;
    const issuedAt = parsed.issuedAt;
    const expiresAt = parsed.expiresAt;

    if (token !== ADMIN_AUTH_TOKEN) {
      return null;
    }

    if (version !== ADMIN_AUTH_SESSION_VERSION) {
      return null;
    }

    if (typeof issuedAt !== 'number' || !Number.isFinite(issuedAt)) {
      return null;
    }

    if (typeof expiresAt !== 'number' || !Number.isFinite(expiresAt)) {
      return null;
    }

    if (expiresAt <= issuedAt) {
      return null;
    }

    return {
      token,
      version,
      issuedAt,
      expiresAt,
    };
  } catch {
    return null;
  }
}

export function createAdminSession(now = Date.now()): string {
  return JSON.stringify({
    token: ADMIN_AUTH_TOKEN,
    version: ADMIN_AUTH_SESSION_VERSION,
    issuedAt: now,
    expiresAt: now + ADMIN_AUTH_SESSION_TTL_MS,
  } satisfies AdminAuthSession);
}

export function isValidAdminToken(token: string | null | undefined): boolean {
  const session = parseAdminAuthSession(token);
  return Boolean(session && session.expiresAt > Date.now());
}

export function canAdminLogin(username: string, password: string): boolean {
  return username === ADMIN_LOGIN_USERNAME && password === ADMIN_LOGIN_PASSWORD;
}

export function resolveAdminGuardRedirect(token: string | null | undefined): string | null {
  return isValidAdminToken(token) ? null : ADMIN_GUARD_REDIRECT_PATH;
}

export function shouldClearStoredAdminToken(token: string | null | undefined): boolean {
  return Boolean(token) && !isValidAdminToken(token);
}

export function clearAdminAuthSession(storage?: Pick<Storage, 'removeItem'>): void {
  storage?.removeItem(ADMIN_AUTH_STORAGE_KEY);
}
