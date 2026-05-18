import Link from 'next/link';
import SiteMenu from '@/components/storefront/SiteMenu';
import { getPublishedBlogPosts, getPublishedBlogTags } from '@/lib/content/public-blog';

interface BlogIndexPageProps {
  searchParams?: Promise<{
    tag?: string | string[];
  }>;
}

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const resolved = (await searchParams) ?? {};
  const activeTag = Array.isArray(resolved.tag)
    ? resolved.tag[0]?.trim() ?? ''
    : resolved.tag?.trim() ?? '';
  const [posts, tags] = await Promise.all([
    getPublishedBlogPosts(activeTag || undefined),
    getPublishedBlogTags(),
  ]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#140f0c',
        color: '#f5efe4',
        padding: '48px 20px 80px',
      }}
    >
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'grid',
          gap: 24,
        }}
      >
        <SiteMenu compact />

        <div className="section-heading" style={{ marginBottom: 0 }}>
          <p className="eyebrow">Blog Amantra</p>
          <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(2.5rem, 5vw, 4.4rem)', lineHeight: 0.95 }}>
            Historias, rituales y estilo con propósito
          </h1>
          <p style={{ margin: 0, color: 'rgba(245,239,228,0.82)', lineHeight: 1.8 }}>
            Explora inspiración editorial, significado de materiales y formas de conectar catálogo y bienestar.
          </p>
        </div>

        {tags.length > 0 ? (
          <div className="catalog-tag-bar">
            <Link href="/blog" className={`catalog-tag-chip${activeTag ? '' : ' active'}`}>
              Todas
            </Link>
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className={`catalog-tag-chip${activeTag.toLowerCase() === tag.toLowerCase() ? ' active' : ''}`}
              >
                #{tag}
              </Link>
            ))}
          </div>
        ) : null}

        <div className="related-grid">
          {posts.map((post) => (
            <article key={post.id} className="related-card">
              <div className="related-card-visual">
                {post.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.coverImage} alt={post.title} className="related-card-image" />
                ) : (
                  <div className="related-card-fallback">Blog Amantra</div>
                )}
              </div>
              <div className="related-card-body">
                <h3>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>
                <p>{post.excerpt || 'Descubre una historia conectada con diseño, bienestar y estilo consciente.'}</p>
                <div style={{ color: '#8f846d', fontSize: 13 }}>
                  {new Date(post.createdAt).toLocaleDateString('es-CO')}
                </div>
                <Link href={`/blog/${post.slug}`} className="related-card-link">
                  Leer artículo
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
