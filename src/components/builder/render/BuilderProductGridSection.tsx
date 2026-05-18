'use client';

import { useMemo, useState } from 'react';

type BuilderGridProduct = {
  id: string;
  slug?: string;
  name: string;
  description: string;
  images: string[];
  basePrice?: number;
  price?: number;
  tags: Array<{ name: string }> | string[];
};

interface BuilderProductGridSectionProps {
  title?: string;
  body?: string;
  products: BuilderGridProduct[];
  initialTag?: string;
  accentColor: string;
  limit: number;
  columns: 1 | 2 | 3 | 4;
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

function getGridCardWidth(columns: 1 | 2 | 3 | 4) {
  switch (columns) {
    case 1:
      return 'min(100%, 860px)';
    case 2:
      return 'min(100%, 520px)';
    case 4:
      return 'min(100%, 260px)';
    case 3:
    default:
      return 'min(100%, 360px)';
  }
}

export default function BuilderProductGridSection({
  title,
  body,
  products,
  initialTag,
  accentColor,
  limit,
  columns,
}: BuilderProductGridSectionProps) {
  const getTagNames = (product: BuilderGridProduct) =>
    product.tags.map((tag) => (typeof tag === 'string' ? tag : tag.name)).filter(Boolean);
  const cardWidth = getGridCardWidth(columns);
  const availableTags = useMemo(
    () =>
      Array.from(
        new Set(
          products.flatMap((product) => getTagNames(product).map((tag) => tag.trim()).filter(Boolean))
        )
      ).sort((left, right) => left.localeCompare(right, 'es')),
    [products]
  );

  const normalizedInitialTag = initialTag?.trim() || '';
  const [activeTag, setActiveTag] = useState(
    normalizedInitialTag && availableTags.includes(normalizedInitialTag) ? normalizedInitialTag : ''
  );

  const visibleProducts = useMemo(() => {
    const baseProducts = activeTag
      ? products.filter((product) =>
          getTagNames(product).some((tag) => tag.toLowerCase() === activeTag.toLowerCase())
        )
      : products;

    return baseProducts.slice(0, Math.min(limit, 8));
  }, [activeTag, limit, products]);

  return (
    <section>
      <div style={{ display: 'grid', gap: 18 }}>
        <div>
          <h2 style={{ margin: '0 0 10px', fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>{title}</h2>
          <p style={{ margin: 0, color: 'rgba(245,239,228,0.78)', lineHeight: 1.8 }}>{body}</p>
        </div>

        {availableTags.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button
              type="button"
              onClick={() => setActiveTag('')}
              style={{
                padding: '10px 14px',
                borderRadius: 999,
                border: activeTag ? '1px solid rgba(212,175,55,0.18)' : '1px solid rgba(212,175,55,0.32)',
                background: activeTag ? 'rgba(255,255,255,0.03)' : 'rgba(212,175,55,0.16)',
                color: activeTag ? '#FFF8EA' : '#D4AF37',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              Todas
            </button>

            {availableTags.map((tag) => {
              const selected = activeTag.toLowerCase() === tag.toLowerCase();

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setActiveTag(tag)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 999,
                    border: selected ? '1px solid rgba(212,175,55,0.32)' : '1px solid rgba(212,175,55,0.18)',
                    background: selected ? 'rgba(212,175,55,0.16)' : 'rgba(255,255,255,0.03)',
                    color: selected ? '#D4AF37' : '#FFF8EA',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        ) : null}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(${cardWidth}, ${cardWidth}))`,
            gap: 16,
            alignItems: 'start',
            justifyContent: 'start',
          }}
        >
          {visibleProducts.map((product) => (
            <article
              key={product.id}
              style={{
                minHeight: 220,
                borderRadius: 22,
                padding: 18,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(212,175,55,0.12)',
                display: 'grid',
                alignContent: 'start',
                alignItems: 'start',
              }}
            >
              {product.images[0] ? (
                <div
                  style={{
                    minHeight: 150,
                    borderRadius: 16,
                    marginBottom: 14,
                    background: `linear-gradient(rgba(20,14,10,0.14), rgba(20,14,10,0.14)), url(${product.images[0]}) center / cover no-repeat`,
                  }}
                />
              ) : null}

              <div style={{ color: '#D4AF37', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                Producto
              </div>
              <h3 style={{ margin: '8px 0 6px', fontSize: 22 }}>{truncateText(product.name, 82)}</h3>
              <p style={{ margin: 0, color: 'rgba(245,239,228,0.76)', lineHeight: 1.7 }}>
                {truncateText(product.description || 'Producto destacado desde el catálogo publicado de Amantra.', 180)}
              </p>
              <div style={{ marginTop: 12, color: '#D4AF37', fontWeight: 800 }}>
                {currency.format(product.price ?? product.basePrice ?? 0)}
              </div>
              <a
                href={`/products/${product.slug ?? product.id}`}
                style={{
                  marginTop: 14,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 150,
                  padding: '12px 18px',
                  borderRadius: 999,
                  background: accentColor,
                  color: '#140e0a',
                  textDecoration: 'none',
                  fontWeight: 800,
                }}
              >
                Ver producto
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
