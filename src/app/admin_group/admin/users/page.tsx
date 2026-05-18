import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import AdminShell from '@/components/admin/AdminShell';
import UserForm from '@/components/admin/UserForm';
import UserManagementTable from '@/components/admin/UserManagementTable';
import { requireSuperAdmin } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';

export default async function AdminUsersPage() {
  const session = await requireSuperAdmin();
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <AdminShell
      title="Usuarios y acceso"
      description="Revisa clientes, administradores y permisos desde una estructura clara y lista para RBAC avanzado."
      email={session.email}
      role={session.role}
    >
      <AdminBreadcrumbs
        items={[
          { label: 'Dashboard', href: '/admin_group' },
          { label: 'Usuarios', href: '/admin_group/admin/users' },
          { label: 'Gestión de accesos' },
        ]}
      />

      <div style={{ display: 'grid', gap: '24px' }}>
        <UserForm />
        <UserManagementTable
          currentUserId={session.userId}
          users={users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt.toISOString(),
          }))}
        />
      </div>
    </AdminShell>
  );
}
