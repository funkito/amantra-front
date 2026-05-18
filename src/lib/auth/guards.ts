import { redirect } from 'next/navigation';
import { AdminRole } from '@/lib/auth/token';
import { getSessionFromCookies, isAdminRole } from '@/lib/auth/session';

export async function requireAdminSession() {
  const session = await getSessionFromCookies();

  if (!session || !isAdminRole(session.role)) {
    redirect('/admin_group/login');
  }

  return session;
}

export async function requireRoles(roles: AdminRole[]) {
  const session = await requireAdminSession();

  if (!roles.includes(session.role)) {
    redirect('/admin_group');
  }

  return session;
}

export async function requireProductManager() {
  return requireRoles(['SUPERADMIN', 'EDITOR']);
}

export async function requireSuperAdmin() {
  return requireRoles(['SUPERADMIN']);
}
