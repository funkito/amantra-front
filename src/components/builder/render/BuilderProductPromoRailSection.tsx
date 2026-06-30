import type { PublicProduct } from '@/lib/catalog/public-products';

interface BuilderProductPromoRailSectionProps {
  title?: string;
  body?: string;
  eyebrow?: string;
  products: PublicProduct[];
  productTag?: string;
  accentColor: string;
  limit: number;
  ctaLabel?: string;
  ctaHref?: string;
  badgeLabel?: string;
}

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

function truncateText(value: string, maxLength: number) {
  const normalized = value.trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

function productHasTag(product: PublicProduct, tag?: string) {
  const normalizedTag = tag?.trim().toLowerCase();

  if (!normalizedTag) {
    return true;
  }

  return product.tags.some((item) => item.toLowerCase() === normalizedTag);
}

export default function BuilderProductPromoRailSection({
  title = 'Promociones especiales',
  body = 'Productos seleccionados para impulsar ventas con una vitrina más comercial.',
  eyebrow = 'Oferta destacada',
  products,
  productTag,
  accentColor,
  limit,
  ctaLabel = 'Ver todas las promociones',
  ctaHref = '/#catalogo',
  badgeLabel = 'Promo',
}: BuilderProductPromoRailSectionProps) {
  const filteredProducts = products.filter((product) => productHasTag(product, productTag)).slice(0, Math.min(limit, 12));

  return (
    <div className="builder-promo-rail">
      <div className="builder-promo-rail__header">
        <div>
          <div className="builder-promo-rail__eyebrow" style={{ color: accentColor }}>
            {eyebrow}
          </div>
          <h2 className="builder-promo-rail__title">{title}</h2>
          <p className="builder-promo-rail__body">{body}</p>
        </div>

        {ctaLabel ? (
          <a className="builder-promo-rail__header-link" href={ctaHref || '/#catalogo'} style={{ color: accentColor }}>
            {ctaLabel}
          </a>
        ) : null}
      </div>

      {filteredProducts.length > 0 ? (
        <div className="builder-promo-rail__track" aria-label={title}>
          {filteredProducts.map((product, index) => {
            const image = product.images[0] || product.imageUrl || '';
            const href = `/products/${product.slug ?? product.id}`;

            return (
              <article className="builder-promo-card" key={product.id}>
                <a className="builder-promo-card__image" href={href} style={{ backgroundImage: image ? `url(${image})` : undefined }}>
                  <span className="builder-promo-card__badge" style={{ backgroundColor: accentColor }}>
                    {index === 0 ? badgeLabel : productTag || badgeLabel}
                  </span>
                </a>
                <div className="builder-promo-card__content">
                  <div className="builder-promo-card__tag">{product.category || productTag || 'Amantra'}</div>
                  <h3>{truncateText(product.name, 76)}</h3>
                  <p>{truncateText(product.description || 'Producto seleccionado para esta campaña.', 112)}</p>
                  <div className="builder-promo-card__footer">
                    <strong>{currency.format(product.price ?? 0)}</strong>
                    <a href={href}>Ver producto</a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="builder-promo-rail__empty">
          No hay productos publicados con la etiqueta {productTag ? `"${productTag}"` : 'seleccionada'}.
        </div>
      )}
    </div>
  );
}