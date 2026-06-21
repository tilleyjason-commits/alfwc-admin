import type { AppRole } from './types';

const roleRank: Record<AppRole, number> = {
  editor: 1,
  publisher: 2,
  admin: 3,
};

export function canEdit(role?: AppRole | null) {
  return Boolean(role && roleRank[role] >= 1);
}

export function canPublish(role?: AppRole | null) {
  return Boolean(role && roleRank[role] >= 2);
}

export function canManageUsers(role?: AppRole | null) {
  return Boolean(role && roleRank[role] >= 3);
}

export function roleLabel(role?: AppRole | null) {
  if (!role) return 'No role';
  return role[0].toUpperCase() + role.slice(1);
}
