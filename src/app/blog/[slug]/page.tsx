import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRelatedProductsByTags } from '@/lib/catalog/public-products';
import { getPublishedBlogPostBySlug } from '@/lib/content/public-blog';
import SiteMenu from '@/components/storefront/SiteMenu';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) {
    notFound();
  }
  const relatedProducts = await getRelatedProductsByTags(null, post.tags, 3);

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
        <div
          className="blog-rich-content"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {relatedProducts.length > 0 ? (
          <section className="product-related-section">
            <div className="section-heading">
              <p className="eyebrow">Inspirado en este artículo</p>
              <h2>Productos relacionados</h2>
            </div>
            <div className="related-grid">
              {relatedProducts.map((product) => (
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
                      <Link href={product.productUrl ?? `/products/${product.id}`}>{product.name}</Link>
                    </h3>
                    <p>{product.description}</p>
                    <strong>
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        maximumFractionDigits: 0,
                      }).format(product.price)}
                    </strong>
                    <Link href={product.productUrl ?? `/products/${product.id}`} className="related-card-link">
                      Ver producto
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
