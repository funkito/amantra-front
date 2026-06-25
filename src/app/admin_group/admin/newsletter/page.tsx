import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import AdminShell from '@/components/admin/AdminShell';
import NewsletterSubscribersTable from '@/components/admin/NewsletterSubscribersTable';
import { requireRoles } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';

export default async function AdminNewsletterPage() {
  const session = await requireRoles(['SUPERADMIN', 'EDITOR']);
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <AdminShell
      title="Interesados newsletter"
      description="Centraliza los correos captados desde las páginas públicas para futuras campañas, lanzamientos y comunicaciones de Amantra."
      email={session.email}
      role={session.role}
    >
      <AdminBreadcrumbs
        items={[
          { label: 'Dashboard', href: '/admin_group' },
          { label: 'Newsletter', href: '/admin_group/admin/newsletter' },
          { label: 'Interesados' },
        ]}
      />

      <NewsletterSubscribersTable
        subscribers={subscribers.map((subscriber) => ({
          id: subscriber.id,
          email: subscriber.email,
          name: subscriber.name,
          sourcePage: subscriber.sourcePage,
          isActive: subscriber.isActive,
          createdAt: subscriber.createdAt.toISOString(),
        }))}
      />
    </AdminShell>
  );
}

