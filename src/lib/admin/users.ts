import type { Role } from '@prisma/client';
import { hashPassword } from '@/lib/auth/passwords';

export const userRoleOptions = [
  { value: 'SUPERADMIN', label: 'admin' },
  { value: 'EDITOR', label: 'editor' },
  { value: 'CLIENTE', label: 'customer' },
] satisfies Array<{ value: Role; label: string }>;

export function getRoleLabel(role: Role) {
  if (role === 'SUPERADMIN') return 'admin';
  if (role === 'EDITOR') return 'editor';
  if (role === 'CLIENTE') return 'customer';
  return 'customer';
}

export function normalizeUserEmail(email: string) {
  return email.toLowerCase().trim();
}

export function validateUserPayload(payload: {
  name: string;
  email: string;
  role: string;
  password?: string;
}) {
  if (!payload.name.trim()) {
    return 'El nombre es obligatorio.';
  }

  if (!payload.email.trim()) {
    return 'El correo es obligatorio.';
  }

  if (!['SUPERADMIN', 'EDITOR', 'CLIENTE'].includes(payload.role)) {
    return 'Rol inválido.';
  }

  if (payload.password !== undefined && payload.password.trim() !== '' && payload.password.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }

  return null;
}

export function buildUserCreateData(payload: {
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'EDITOR' | 'CLIENTE';
  password: string;
  isActive: boolean;
}) {
  return {
    name: payload.name.trim(),
    email: normalizeUserEmail(payload.email),
    role: payload.role,
    isActive: payload.isActive,
    password: hashPassword(payload.password),
  };
}

export function buildUserUpdateData(payload: {
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'EDITOR' | 'CLIENTE';
  password?: string;
  isActive: boolean;
}) {
  return {
    name: payload.name.trim(),
    email: normalizeUserEmail(payload.email),
    role: payload.role,
    isActive: payload.isActive,
    ...(payload.password && payload.password.trim() ? { password: hashPassword(payload.password) } : {}),
  };
}
