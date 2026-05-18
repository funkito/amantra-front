import Link from 'next/link';
import { redirect } from 'next/navigation';
import AuthForm from '@/components/admin/AuthForm';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getAdminBootstrapState } from '@/lib/auth/admin-state';

export default async function AdminLoginPage() {
  const session = await getSessionFromCookies();

  if (session) {
    redirect('/admin_group');
  }

  const { adminCount, databaseError } = await getAdminBootstrapState();

  return (
    <main className="admin-auth-shell">
      <section className="admin-auth-card">
        <p className="eyebrow">Acceso administrativo</p>
        <h1>Ingresa al panel de Amantra</h1>
        <p>
          Usa tu correo y contraseña para administrar productos, pedidos y ajustes internos de la
          tienda.
        </p>

        <AuthForm mode="login" />

        {databaseError ? <p className="admin-auth-error">{databaseError}</p> : null}

        {adminCount === 0 ? (
          <p className="admin-auth-helper">
            Aún no existe un administrador.{' '}
            <Link href="/admin_group/setup">Crear el primer usuario admin</Link>
          </p>
        ) : null}
      </section>
    </main>
  );
}
