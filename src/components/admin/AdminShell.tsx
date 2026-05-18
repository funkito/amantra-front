import type { ReactNode } from 'react';
import type { AdminRole } from '@/lib/auth/token';
import AdminShellClient from '@/components/admin/AdminShellClient';

interface AdminShellProps {
  title: string;
  description?: string;
  email: string;
  role: AdminRole;
  children: ReactNode;
}

export default function AdminShell({ title, description, email, role, children }: AdminShellProps) {
  return <AdminShellClient title={title} description={description} email={email} role={role}>{children}</AdminShellClient>;
}
