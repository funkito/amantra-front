import Link from 'next/link';
import { redirect } from 'next/navigation';
import AuthForm from '@/components/admin/AuthForm';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getAdminBootstrapState } from '@/lib/auth/admin-state';

export default async function AdminSetupPage() {
  const session = await getSessionFromCookies();

  if (session) {
    redirect('/admin_group');
  }

  const { adminCount, databaseError } = await getAdminBootstrapState();

  if (!databaseError && adminCount > 0) {
    redirect('/admin_group/login');
  }

  return (
    <main className="admin-auth-shell">
      <section className="admin-auth-card">
        <p className="eyebrow">Primer acceso</p>
        <h1>Crear administrador principal</h1>
        <p>
          Este formulario solo funciona una vez, cuando todavía no existe un usuario con permisos
          de administración en la base de datos.
        </p>

        <AuthForm mode="setup" />

        {databaseError ? <p className="admin-auth-error">{databaseError}</p> : null}

        <p className="admin-auth-helper">
          Si ya creaste el usuario, vuelve a <Link href="/admin_group/login">iniciar sesión</Link>.
        </p>
      </section>
    </main>
  );
}
