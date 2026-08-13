export type StaffRole = 'staff' | 'manager' | 'admin';

export type StaffUser = {
  id: string;
  username: string;
  role: StaffRole;
  active: boolean;
  lastLoginAt: string | null;
};

type StaffUserApiRecord = Omit<StaffUser, 'id'> & {
  id?: unknown;
  _id?: unknown;
};

export function normalizeStaffUsers(value: unknown): StaffUser[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap(item => {
    if (!item || typeof item !== 'object') return [];
    const record = item as StaffUserApiRecord;
    const id = typeof record.id === 'string' && record.id ? record.id : typeof record._id === 'string' && record._id ? record._id : null;
    if (!id || typeof record.username !== 'string' || !['staff', 'manager', 'admin'].includes(record.role)) return [];

    return [{
      id,
      username: record.username,
      role: record.role,
      active: Boolean(record.active),
      lastLoginAt: typeof record.lastLoginAt === 'string' ? record.lastLoginAt : null,
    }];
  });
}
