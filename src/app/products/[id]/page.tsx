import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductDetailCartExperience from '@/components/storefront/ProductDetailCartExperience';
import ProductDetailGallery from '@/components/storefront/ProductDetailGallery';
import SiteMenu from '@/components/storefront/SiteMenu';
import { getPublishedProductById, getRelatedProductsByTags } from '@/lib/catalog/public-products';
import { getRelatedPostsByTags } from '@/lib/content/public-blog';
import { buildProductPublicUrl } from '@/lib/social/share';

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export async function generateMetadata(props: PageProps<'/products/[id]'>): Promise<Metadata> {
  const { id } = await props.params;
  const product = await getPublishedProductById(id);

  if (!product) {
    return {
      title: 'Producto no encontrado | Amantra',
    };
  }

  const url = buildProductPublicUrl(product.slug);
  const image = product.imageUrl ?? '/favicon.ico';

  return {
    title: `${product.name} | Amantra`,
    description: product.description,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.description,
      url,
      type: 'website',
      images: [
        {
          url: image,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [image],
    },
  };
}

export default async function ProductPublicPage(props: PageProps<'/products/[id]'>) {
  const { id } = await props.params;
  const product = await getPublishedProductById(id);

  if (!product) {
    notFound();
  }

  const [relatedProducts, relatedPosts] = await Promise.all([
    getRelatedProductsByTags(product.id, product.tags, 3),
    getRelatedPostsByTags(product.tags, undefined, 3),
  ]);

  const shareProduct = {
    id: product.id,
    slug: product.slug,
    title: product.name,
    description: product.description,
    price: product.price,
    url: buildProductPublicUrl(product.slug),
    imageUrl: product.imageUrl,
  };

  return (
    <main className="amantra-shell">
      <section className="product-detail-shell">
        <SiteMenu compact />
        <Link href="/" className="product-detail-back">
          Volver al catálogo
        </Link>

        <div className="product-detail-grid">
          <div className="product-detail-visual">
            <ProductDetailGallery
              productName={product.name}
              images={product.images ?? []}
              fallbackLabel={product.imageLabel}
              fallbackAccent={product.accent}
            />
          </div>

          <div className="product-detail-copy">
            <p className="eyebrow">{product.category}</p>
            <h1>{product.name}</h1>
            <p className="product-detail-description">{product.description}</p>

            {product.tags.length > 0 ? (
              <div className="product-tag-links">
                {product.tags.map((tag) => (
                  <Link key={tag} href={`/?tag=${encodeURIComponent(tag)}#catalogo`} className="product-tag-link">
                    #{tag}
                  </Link>
                ))}
              </div>
            ) : null}

            <div className="product-notes">
              {product.notes.map((note) => (
                <span key={note}>{note}</span>
              ))}
            </div>

            <div className="product-detail-price">
              <strong>{currency.format(product.price)}</strong>
              <span>{product.shippingLabel}</span>
            </div>

            {product.shippingNotes ? (
              <p className="product-detail-shipping-note">{product.shippingNotes}</p>
            ) : null}

            {product.variants.length > 0 ? (
              <div className="product-detail-variants">
                <h2>Variantes disponibles</h2>
                <div className="product-detail-variant-grid">
                  {product.variants.map((variant) => (
                    <div key={variant.id} className="product-detail-variant-card">
                      <strong>{variant.size || variant.color || variant.sku}</strong>
                      <span>SKU: {variant.sku}</span>
                      {variant.color ? <span>Color: {variant.color}</span> : null}
                      {variant.stoneType ? <span>Material: {variant.stoneType}</span> : null}
                      <span>Stock: {variant.stock}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <ProductDetailCartExperience cartProduct={product} shareProduct={shareProduct} />
          </div>
        </div>

        {relatedProducts.length > 0 ? (
          <section className="product-related-section">
            <div className="section-heading">
              <p className="eyebrow">También te puede gustar</p>
              <h2>Productos relacionados</h2>
            </div>
            <div className="related-grid">
              {relatedProducts.map((relatedProduct) => {
                const relatedProductHref = `/products/${relatedProduct.slug ?? relatedProduct.id}`;

                return (
                  <article key={relatedProduct.id} className="related-card">
                    <div className="related-card-visual">
                      {relatedProduct.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={relatedProduct.imageUrl} alt={relatedProduct.name} className="related-card-image" />
                      ) : (
                        <div className={`product-visual bg-gradient-to-br ${relatedProduct.accent}`}>
                          <span>{relatedProduct.imageLabel}</span>
                        </div>
                      )}
                    </div>
                    <div className="related-card-body">
                      <h3>
                        <Link href={relatedProductHref}>{relatedProduct.name}</Link>
                      </h3>
                      <p>{relatedProduct.description}</p>
                      <strong>{currency.format(relatedProduct.price)}</strong>
                      <Link href={relatedProductHref} className="related-card-link">
                        Ver producto
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        {relatedPosts.length > 0 ? (
          <section className="product-related-section">
            <div className="section-heading">
              <p className="eyebrow">Desde el blog</p>
              <h2>Historias relacionadas con este producto</h2>
            </div>
            <div className="related-grid">
              {relatedPosts.map((post) => (
                <article key={post.id} className="related-card">
                  <Link href={`/blog/${post.slug}`} className="related-card-visual">
                    {post.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.coverImage} alt={post.title} className="related-card-image" />
                    ) : (
                      <div className="related-card-fallback">Blog Amantra</div>
                    )}
                  </Link>
                  <div className="related-card-body">
                    <h3>
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p>{post.excerpt || 'Lee una historia, guía o inspiración relacionada con esta pieza.'}</p>
                    <Link href={`/blog/${post.slug}`} className="related-card-link">
                      Leer artículo
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
