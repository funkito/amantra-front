import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import AdminShell from '@/components/admin/AdminShell';
import BoldSettingsForm from '@/components/admin/BoldSettingsForm';
import { requireSuperAdmin } from '@/lib/auth/guards';
import { buildWebhookUrl, getBoldSettings } from '@/lib/system-settings';

export default async function AdminSettingsPage() {
  const session = await requireSuperAdmin();
  const settings = await getBoldSettings();
  const webhookUrl = buildWebhookUrl(settings);

  return (
    <AdminShell
      title="Configuración general"
      description="Centraliza integraciones, preferencias operativas y parámetros globales del negocio."
      email={session.email}
      role={session.role}
    >
      <AdminBreadcrumbs
        items={[
          { label: 'Dashboard', href: '/admin_group' },
          { label: 'Configuración', href: '/admin_group/admin/settings' },
          { label: 'Ajustes globales' },
        ]}
      />

      <div style={{ display: 'grid', gap: '24px' }}>
        <BoldSettingsForm initialValues={settings} webhookUrl={webhookUrl} />
      </div>
    </AdminShell>
  );
}
