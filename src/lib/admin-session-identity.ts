import type { AdminRole } from './admin-capabilities';

export type CurrentAdminIdentity = {
  username: string;
  role: AdminRole;
};

function isAdminRole(value: unknown): value is AdminRole {
  return value === 'staff' || value === 'manager' || value === 'admin';
}

export function parseBackendCurrentAdminIdentity(value: unknown): CurrentAdminIdentity | null {
  if (!value || typeof value !== 'object') return null;

  const user = (value as { user?: unknown }).user;
  if (!user || typeof user !== 'object') return null;

  const username = (user as { username?: unknown }).username;
  const role = (user as { role?: unknown }).role;

  if (typeof username !== 'string' || !username.trim() || !isAdminRole(role)) return null;

  return {
    username: username.trim(),
    role,
  };
}
