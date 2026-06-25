import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import AdminShell from '@/components/admin/AdminShell';
import TagManagementPanel, { type AdminTagRow } from '@/components/admin/TagManagementPanel';
import { prisma } from '@/lib/prisma';
import { requireProductManager } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export default async function AdminTagsPage() {
  const session = await requireProductManager();

  // Consulta directa a Prisma sin depender de APIs viejas externas
  const dbTags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });

  // Mapeo adaptado al frontend original usando index numérico
  const tags: AdminTagRow[] = dbTags.map((tag, index) => ({
    id: index + 1,
    name: tag.name,
    slug: tag.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-'),
    productCount: tag._count?.products ?? 0,
    blogCount: 0,
  }));

  return (
    <AdminShell
      title="Etiquetas"
      description="Organiza el vocabulario que conecta productos, blog, filtros y recomendaciones."
      email={session.email}
      role={session.role}
    >
      <AdminBreadcrumbs
        items={[
          { label: 'Dashboard', href: '/admin_group' },
          { label: 'Etiquetas', href: '/admin_group/admin/tags' },
          { label: 'Administrador' },
        ]}
      />

      <TagManagementPanel initialTags={tags} />
    </AdminShell>
  );
}
