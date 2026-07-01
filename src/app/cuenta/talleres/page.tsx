import Link from 'next/link';
import { redirect } from 'next/navigation';
import CustomerLogoutButton from '@/components/storefront/CustomerLogoutButton';
import SiteMenu from '@/components/storefront/SiteMenu';
import { getSessionFromCookies } from '@/lib/auth/session';
import { getPublishedBlogPostBySlug } from '@/lib/content/public-blog';
import { prisma } from '@/lib/prisma';

export default async function CustomerWorkshopsPage() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect('/cuenta/ingresar?next=%2Fcuenta%2Ftalleres');
  }

  const accesses = await prisma.workshopAccess.findMany({
    where: {
      userId: session.userId,
      status: 'ACTIVE',
      user: { isActive: true },
    },
    orderBy: { grantedAt: 'desc' },
    select: {
      postSlug: true,
      grantedAt: true,
    },
  });
  const workshopResults = await Promise.all(
    accesses.map(async (access) => ({
      access,
      post: await getPublishedBlogPostBySlug(access.postSlug),
    }))
  );
  const workshops = workshopResults.filter(
    (item): item is typeof item & { post: NonNullable<typeof item.post> } => Boolean(item.post)
  );

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '32px 20px 80px',
        color: '#f5efe4',
        background:
          'radial-gradient(circle at 14% 8%, rgba(212,175,55,0.12), transparent 30%), #140f0c',
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gap: 36 }}>
        <SiteMenu compact />
        <header style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: 0, color: '#d4af37', letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 12 }}>
              Cuenta Amantra
            </p>
            <h1 style={{ margin: '8px 0 0', fontSize: 'clamp(2.4rem, 7vw, 4.8rem)' }}>Mis talleres</h1>
          </div>
          <CustomerLogoutButton />
        </header>

        {workshops.length > 0 ? (
          <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: 22 }}>
            {workshops.map(({ access, post }) => (
              <article
                key={post.slug}
                style={{
                  overflow: 'hidden',
                  borderRadius: 24,
                  border: '1px solid rgba(212,175,55,0.2)',
                  background: 'rgba(31,23,18,0.9)',
                }}
              >
                {post.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: 210, objectFit: 'cover' }} />
                ) : null}
                <div style={{ padding: 22, display: 'grid', gap: 12 }}>
                  <div style={{ color: '#d4af37', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Acceso activo
                  </div>
                  <h2 style={{ margin: 0 }}>{post.title}</h2>
                  <p style={{ margin: 0, color: 'rgba(245,239,228,0.68)', lineHeight: 1.6 }}>
                    Disponible desde {access.grantedAt.toLocaleDateString('es-CO')}.
                  </p>
                  <Link href={'/blog/' + post.slug} className="checkout-button">
                    Entrar al taller
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section style={{ padding: 32, borderRadius: 24, border: '1px solid rgba(212,175,55,0.18)', background: 'rgba(31,23,18,0.8)' }}>
            <h2 style={{ marginTop: 0 }}>Todavía no tienes talleres activos</h2>
            <p style={{ color: 'rgba(245,239,228,0.7)' }}>Cuando Bold confirme una compra, aparecerá aquí automáticamente.</p>
            <Link href="/blog" className="checkout-button">
              Explorar contenidos
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}