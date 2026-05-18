import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import AdminShell from '@/components/admin/AdminShell';
import PageBuilderShell from '@/components/builder/PageBuilderShell';
import { requireProductManager } from '@/lib/auth/guards';

interface AdminBuilderPageProps {
  searchParams: Promise<{
    slug?: string;
  }>;
}

export default async function AdminBuilderPage({ searchParams }: AdminBuilderPageProps) {
  const session = await requireProductManager();
  const { slug } = await searchParams;

  return (
    <AdminShell
      title="Website Builder"
      description="Editor visual por bloques, inspirado en constructores WYSIWYG modernos y preparado para persistir JSON estructurado."
      email={session.email}
      role={session.role}
    >
      <AdminBreadcrumbs
        items={[
          { label: 'Dashboard', href: '/admin_group' },
          { label: 'Builder', href: '/admin_group/admin/builder' },
          { label: 'Editor visual' },
        ]}
      />

      <PageBuilderShell slug={slug?.trim() || 'inicio'} />
    </AdminShell>
  );
}
