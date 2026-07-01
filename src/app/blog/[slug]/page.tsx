import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRelatedProductsByTags } from '@/lib/catalog/public-products';
import {
  getProtectedBlogPostById,
  getPublishedBlogPostBySlug,
} from '@/lib/content/public-blog';
import SiteMenu from '@/components/storefront/SiteMenu';
import WorkshopPaywall from '@/components/storefront/WorkshopPaywall';
import { getSessionFromCookies, isAdminRole } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    payment?: string | string[];
  }>;
}

export default async function BlogPostPage({ params, searchParams }: BlogPostPageProps) {
  const [{ slug }, resolvedSearchParams, session] = await Promise.all([
    params,
    searchParams,
    getSessionFromCookies(),
  ]);
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) {
    notFound();
  }
  const relatedProducts = await getRelatedProductsByTags(null, post.tags, 3);
  const isPaidWorkshop = post.accessType === 'PAID_WORKSHOP';
  let hasWorkshopAccess = !isPaidWorkshop || Boolean(session && isAdminRole(session.role));

  if (isPaidWorkshop && session && !isAdminRole(session.role)) {
    const access = await prisma.workshopAccess.findFirst({
      where: {
        userId: session.userId,
        postSlug: post.slug,
        status: 'ACTIVE',
        user: { isActive: true },
      },
      select: { id: true },
    });
    hasWorkshopAccess = Boolean(access);
  }

  const paymentReturned = Array.isArray(resolvedSearchParams.payment)
    ? resolvedSearchParams.payment.includes('return')
    : resolvedSearchParams.payment === 'return';
  const protectedPost =
    isPaidWorkshop && hasWorkshopAccess
      ? await getProtectedBlogPostById(post.id)
      : null;
  const visiblePost = protectedPost ?? post;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#140f0c',
        color: '#f5efe4',
        padding: '48px 20px 80px',
      }}
    >
      <article
        style={{
          maxWidth: 860,
          margin: '0 auto',
          display: 'grid',
          gap: 20,
        }}
      >
        <SiteMenu compact />
        <div style={{ color: '#d4af37', letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: 12 }}>
          Blog Amantra
        </div>
        <h1 style={{ margin: 0, fontSize: 'clamp(2.5rem, 5vw, 4.4rem)', lineHeight: 0.95 }}>{post.title}</h1>
        {post.excerpt ? <p style={{ margin: 0, color: 'rgba(245,239,228,0.82)', lineHeight: 1.8, fontSize: 18 }}>{post.excerpt}</p> : null}
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- Blog cover can be arbitrary remote/local media from JSON content.
          <img
            src={post.coverImage}
            alt={post.title}
            style={{
              width: '100%',
              maxHeight: 460,
              objectFit: 'cover',
              borderRadius: 28,
              border: '1px solid rgba(212,175,55,0.14)',
            }}
          />
        ) : null}
        <div style={{ color: '#8f846d', fontSize: 14 }}>
          {new Date(post.createdAt).toLocaleDateString('es-CO')}
        </div>
        {post.tags.length > 0 ? (
          <div className="product-tag-links">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}#catalogo`} className="product-tag-link">
                #{tag}
              </Link>
            ))}
          </div>
        ) : null}
        {hasWorkshopAccess ? (
          <>
            {visiblePost.videoUrl ? (
              <video
                src={visiblePost.videoUrl}
                controls
                preload="metadata"
                poster={post.coverImage || undefined}
                controlsList="nodownload"
                style={{
                  display: 'block',
                  width: '100%',
                  maxHeight: 560,
                  borderRadius: 24,
                  background: '#050505',
                  border: '1px solid rgba(212,175,55,0.18)',
                }}
              >
                Tu navegador no puede reproducir este video.
              </video>
            ) : null}
            <div
              className="blog-rich-content"
              dangerouslySetInnerHTML={{ __html: visiblePost.body }}
            />
          </>
        ) : (
          <WorkshopPaywall
            slug={post.slug}
            price={post.workshopPrice ?? 0}
            authenticated={Boolean(session)}
            paymentReturned={paymentReturned}
          />
        )}

        {relatedProducts.length > 0 ? (
          <section className="product-related-section">
            <div className="section-heading">
              <p className="eyebrow">Inspirado en este artículo</p>
              <h2>Productos relacionados</h2>
            </div>
            <div className="related-grid">
              {relatedProducts.map((product) => {
                const productHref = `/products/${product.slug ?? product.id}`;

                return (
                  <article key={product.id} className="related-card">
                    <div className="related-card-visual">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.imageUrl} alt={product.name} className="related-card-image" />
                      ) : (
                        <div className={`product-visual bg-gradient-to-br ${product.accent}`}>
                          <span>{product.imageLabel}</span>
                        </div>
                      )}
                    </div>
                    <div className="related-card-body">
                      <h3>
                        <Link href={productHref}>{product.name}</Link>
                      </h3>
                      <p>{product.description}</p>
                      <strong>
                        {new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          maximumFractionDigits: 0,
                        }).format(product.price)}
                      </strong>
                      <Link href={productHref} className="related-card-link">
                        Ver producto
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
