export type AdminRole = 'staff' | 'manager' | 'admin';

function isAdminRole(value: unknown): value is AdminRole {
  return value === 'staff' || value === 'manager' || value === 'admin';
}

export function canOverridePrice(role: AdminRole | null | undefined): boolean {
  return role === 'manager' || role === 'admin';
}

export async function fetchCurrentAdminRole(): Promise<AdminRole | null> {
  try {
    const response = await fetch('/api/admin/session', {
      credentials: 'same-origin',
      cache: 'no-store',
    });
    if (!response.ok) return null;

    const payload = (await response.json()) as { authenticated?: unknown; role?: unknown };
    if (payload.authenticated !== true || !isAdminRole(payload.role)) return null;
    return payload.role;
  } catch {
    return null;
  }
}
