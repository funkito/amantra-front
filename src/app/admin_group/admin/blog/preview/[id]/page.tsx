import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRelatedProductsByTags } from '@/lib/catalog/public-products';
import { normalizeBlogBodyMarkup } from '@/lib/content/blog-rich-text';
import { getPostTags } from '@/lib/content/public-blog';
import { requireProductManager } from '@/lib/auth/guards';
import { prisma } from '@/lib/prisma';

export default async function AdminBlogPreviewPage(props: PageProps<'/admin_group/admin/blog/preview/[id]'>) {
  await requireProductManager();
  const { id } = await props.params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const contentObject = typeof post.content === 'object' && post.content ? (post.content as Record<string, unknown>) : {};
  const excerpt = typeof contentObject.excerpt === 'string' ? contentObject.excerpt : '';
  const coverImage = typeof contentObject.coverImage === 'string' ? contentObject.coverImage : '';
  const body = typeof contentObject.body === 'string' ? normalizeBlogBodyMarkup(contentObject.body) : '';
  const tags = getPostTags(post.content);
  const relatedProducts = await getRelatedProductsByTags(null, tags, 3);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#140f0c',
        color: '#f5efe4',
        padding: '32px 20px 80px',
      }}
    >
      <div
        style={{
          width: 'min(1100px, calc(100% - 0rem))',
          margin: '0 auto 24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '14px 18px',
          borderRadius: 20,
          border: '1px solid rgba(212,175,55,0.14)',
          background: 'rgba(255,248,232,0.05)',
        }}
      >
        <div style={{ display: 'grid', gap: 4 }}>
          <strong style={{ color: '#fff8ea' }}>Vista previa del artículo</strong>
          <span style={{ color: '#ccbda5', fontSize: 14 }}>
           {post.title} · {'Publicado'} 
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Link href={`/admin_group/admin/blog/${post.id}`} className="product-tag-link">
            Volver al editor
          </Link>
          {post.published ? (
              <Link href={`/blog/${post.slug}`} className="product-tag-link">
                Abrir ruta pública
              </Link>
            ) : null}
        </div>
      </div>

      <article
        style={{
          maxWidth: 860,
          margin: '0 auto',
          display: 'grid',
          gap: 20,
        }}
      >
        <div style={{ color: '#d4af37', letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: 12 }}>
          Blog Amantra
        </div>
        <h1 style={{ margin: 0, fontSize: 'clamp(2.5rem, 5vw, 4.4rem)', lineHeight: 0.95 }}>{post.title}</h1>
        {excerpt ? <p style={{ margin: 0, color: 'rgba(245,239,228,0.82)', lineHeight: 1.8, fontSize: 18 }}>{excerpt}</p> : null}
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- Blog cover can be arbitrary remote/local media from JSON content.
          <img
            src={coverImage}
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
          {new Date(post.createdAt).toLocaleDateString('es-CO')} · {post.author.name ?? post.author.email}
        </div>
        {tags.length > 0 ? (
          <div className="product-tag-links">
            {tags.map((tag) => (
              <span key={tag} className="product-tag-link">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
        <div className="blog-rich-content" dangerouslySetInnerHTML={{ __html: body }} />

        {relatedProducts.length > 0 ? (
          <section className="product-related-section">
            <div className="section-heading">
              <p className="eyebrow">Inspirado en este artículo</p>
              <h2>Productos relacionados</h2>
            </div>
            <div className="related-grid">
              {relatedProducts.map((product) => (
                <article key={product.id} className="related-card">
                  <Link href={product.productUrl ?? `/products/${product.id}`} className="related-card-visual">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.imageUrl} alt={product.name} className="related-card-image" />
                    ) : (
                      <div className={`product-visual bg-gradient-to-br ${product.accent}`}>
                        <span>{product.imageLabel}</span>
                      </div>
                    )}
                  </Link>
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
