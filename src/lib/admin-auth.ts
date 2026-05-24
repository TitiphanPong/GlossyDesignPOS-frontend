export const ADMIN_AUTH_STORAGE_KEY = 'auth_token';
export const ADMIN_AUTH_TOKEN = 'glossy-secret';
export const ADMIN_LOGIN_USERNAME = 'glossydesign';
export const ADMIN_LOGIN_PASSWORD = 'glossygmail';
export const ADMIN_LOGIN_REDIRECT_PATH = '/dashboard';
export const ADMIN_GUARD_REDIRECT_PATH = '/login';

export function isValidAdminToken(token: string | null | undefined): boolean {
  return token === ADMIN_AUTH_TOKEN;
}

export function canAdminLogin(username: string, password: string): boolean {
  return username === ADMIN_LOGIN_USERNAME && password === ADMIN_LOGIN_PASSWORD;
}

export function resolveAdminGuardRedirect(token: string | null | undefined): string | null {
  return isValidAdminToken(token) ? null : ADMIN_GUARD_REDIRECT_PATH;
}
