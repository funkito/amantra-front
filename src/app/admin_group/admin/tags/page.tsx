import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import AdminShell from '@/components/admin/AdminShell';
import TagManagementPanel, { type AdminTagRow } from '@/components/admin/TagManagementPanel';
import { prisma } from '@/lib/prisma';
import { requireProductManager } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

export default async function AdminTagsPage() {
  const session = await requireProductManager();

  // ⚡ Consulta directa a Prisma incluyendo la nueva columna imageUrl
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

  // Mapeo idéntico incluyendo imageUrl para que el panel lo pueda renderizar
  const tags: AdminTagRow[] = dbTags.map((tag, index) => ({
    id: index + 1,
    dbId: tag.id, // Guardamos el ID real de la BD por si el componente lo necesita
    name: tag.name,
    imageUrl: tag.imageUrl || '', // 👈 ¡CLAVE! Pasamos la URL de la foto de la burbuja
    slug: tag.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-'),
    productCount: tag._count?.products ?? 0,
    blogCount: 0,
  }));

  return (
    <AdminShell
      title="Etiquetas"
      description="Organiza el vocabulario que conecta productos, blog, filtros y recommendations."
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