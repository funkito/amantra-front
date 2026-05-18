import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import AdminShell from '@/components/admin/AdminShell';
import TagManagementPanel, { type AdminTagRow } from '@/components/admin/TagManagementPanel';
import { fetchBackendAdminApi } from '@/lib/admin/backend-admin-api';
import { requireProductManager } from '@/lib/auth/guards';

type BackendTag = {
  id: number;
  name: string;
  slug: string;
  _count?: {
    productTags?: number;
    blogTags?: number;
  };
};

export default async function AdminTagsPage() {
  const session = await requireProductManager();
  const response = await fetchBackendAdminApi('/tags?limit=200');
  const payload = (await response.json()) as { data?: BackendTag[] };

  const tags: AdminTagRow[] = (payload.data ?? []).map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    productCount: tag._count?.productTags ?? 0,
    blogCount: tag._count?.blogTags ?? 0,
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
