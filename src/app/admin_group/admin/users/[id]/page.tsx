import { notFound } from 'next/navigation';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import AdminShell from '@/components/admin/AdminShell';
import UserForm from '@/components/admin/UserForm';
import { requireSuperAdmin } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';

export default async function AdminEditUserPage(props: PageProps<'/admin_group/admin/users/[id]'>) {
  const session = await requireSuperAdmin();
  const { id } = await props.params;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    notFound();
  }

  return (
    <AdminShell
      title="Edición de usuario"
      description="Actualiza datos de acceso, rol y estado del usuario desde una vista segura para superadmin."
      email={session.email}
      role={session.role}
    >
      <AdminBreadcrumbs
        items={[
          { label: 'Dashboard', href: '/admin_group' },
          { label: 'Usuarios', href: '/admin_group/admin/users' },
          { label: 'Editar usuario' },
        ]}
      />

      <UserForm
        mode="edit"
        userId={user.id}
        initialData={{
          id: user.id,
          name: user.name ?? '',
          email: user.email,
          role: user.role === 'VENDEDOR' ? 'CLIENTE' : user.role,
          isActive: user.isActive,
        }}
      />
    </AdminShell>
  );
}
