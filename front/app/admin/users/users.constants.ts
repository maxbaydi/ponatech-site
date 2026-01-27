import type { UserRole } from '@/lib/api/types';

export const ROLE_BADGES: Record<
  UserRole,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  SUPER_ADMIN: { label: 'Супер-админ', variant: 'destructive' },
  ADMIN: { label: 'Администратор', variant: 'default' },
  MANAGER: { label: 'Менеджер', variant: 'secondary' },
  CUSTOMER: { label: 'Покупатель', variant: 'outline' },
};

export const ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CUSTOMER'];

export const ROLE_OPTIONS = ROLES.map((role) => ({
  value: role,
  label: ROLE_BADGES[role].label,
}));

export const USER_PASSWORD_MIN_LENGTH = 8;
export const USER_NAME_MIN_LENGTH = 2;
export const USER_PHONE_MIN_LENGTH = 10;
export const USER_COMPANY_MIN_LENGTH = 2;
