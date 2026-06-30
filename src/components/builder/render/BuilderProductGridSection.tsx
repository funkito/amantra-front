'use client';

import { useMemo, useState } from 'react';
import { Flame, Gem, Gift, Leaf, Package, Sparkles, Wind } from 'lucide-react';

type BuilderGridProduct = {
  id: string;
  slug?: string;
  name: string;
  description: string;
  images: string[];
  basePrice?: number;
  price?: number;
  tags: Array<{ name: string; imageUrl?: string | null }> | string[];
  tagDetails?: Array<{ name: string; imageUrl?: string | null }>;
};

interface BuilderProductGridSectionProps {
  title?: string;
  body?: string;
  products: BuilderGridProduct[];
  initialTag?: string;
  accentColor: string;
  limit: number;
  columns: 1 | 2 | 3 | 4;
  tagStyle?: 'chips' | 'tiles';
  tagAllLabel?: string;
  tagShowImages?: boolean;
  tagTileBackgroundColor?: string;
  tagTileTextColor?: string;
  tagTileActiveBackgroundColor?: string;
  tagTileActiveTextColor?: string;
  tagTileBorderColor?: string;
  tagTileOverlayColor?: string;
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

function getCategoryIcon(tag: string) {
  const normalized = tag.toLowerCase();

  if (normalized.includes('aceite') || normalized.includes('aroma')) {
    return Leaf;
  }

  if (normalized.includes('cuenco') || normalized.includes('sonor')) {
    return Wind;
  }

  if (normalized.includes('cristal') || normalized.includes('geoda')) {
    return Gem;
  }

  if (normalized.includes('anillo') || normalized.includes('joya')) {
    return Sparkles;
  }

  if (normalized.includes('limpieza') || normalized.includes('energia')) {
    return Flame;
  }

  if (normalized.includes('pack') || normalized.includes('regalo')) {
    return Gift;
  }

  return Package;
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
  tagStyle = 'tiles',
  tagAllLabel = 'Todas',
  tagShowImages = true,
  tagTileBackgroundColor = '#fbf4e8',
  tagTileTextColor = '#31513d',
  tagTileActiveBackgroundColor,
  tagTileActiveTextColor = '#140e0a',
  tagTileBorderColor = 'rgba(196,145,45,0.22)',
  tagTileOverlayColor = 'rgba(255,248,235,0.48)',
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
  
  
  const tagTileData = useMemo(() => {
    const uniqueTagsMap = new Map<string, { tag: string; image: string }>();

    products.forEach((product) => {
      const detailedTags = product.tagDetails?.length
        ? product.tagDetails
        : product.tags
            .filter((tag): tag is { name: string; imageUrl?: string | null } => typeof tag === 'object' && tag !== null)
            .map((tag) => ({ name: tag.name, imageUrl: tag.imageUrl ?? null }));

      detailedTags.forEach((tag) => {
        const nameTrimmed = tag.name.trim();
        const key = nameTrimmed.toLowerCase();

        if (!nameTrimmed || uniqueTagsMap.has(key)) {
          return;
        }

        uniqueTagsMap.set(key, {
          tag: nameTrimmed,
          image: tag.imageUrl?.trim() || product.images[0] || '',
        });
      });
    });

    return Array.from(uniqueTagsMap.values()).sort((left, right) => left.tag.localeCompare(right.tag, 'es'));
  }, [products]);

  const allTagImage =
    tagTileData.find((item) => item.image)?.image || products.find((product) => product.images[0])?.images[0] || '';

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
          <p style={{ margin: 0, color: 'rgba(75,64,56,0.72)', lineHeight: 1.8 }}>{body}</p>
        </div>

        {availableTags.length > 0 && tagStyle === 'tiles' ? (
          <div className="builder-product-category-rail" aria-label="Filtrar productos por categoría">
            <button
              type="button"
              onClick={() => setActiveTag('')}
              className="builder-product-category-tile"
              style={{
                backgroundColor: activeTag ? tagTileBackgroundColor : tagTileActiveBackgroundColor || '#fff7e8',
                borderColor: tagTileBorderColor,
                color: activeTag ? tagTileTextColor : tagTileActiveTextColor,
              }}
            >
              {tagShowImages && allTagImage ? (
                <span className="builder-product-category-image" style={{ backgroundImage: `url(${allTagImage})` }} />
              ) : null}
              <span className="builder-product-category-icon" aria-hidden="true">
                <Package size={24} strokeWidth={1.6} />
              </span>
              <span className="builder-product-category-label">{tagAllLabel}</span>
            </button>

            {tagTileData.map((item) => {
              const selected = activeTag.toLowerCase() === item.tag.toLowerCase();
              const Icon = getCategoryIcon(item.tag);

              return (
                <button
                  key={item.tag}
                  type="button"
                  onClick={() => setActiveTag(item.tag)}
                  className="builder-product-category-tile"
                  style={{
                    backgroundColor: selected ? tagTileActiveBackgroundColor || '#fff7e8' : tagTileBackgroundColor,
                    borderColor: tagTileBorderColor,
                    color: selected ? tagTileActiveTextColor : tagTileTextColor,
                  }}
                >
                  {tagShowImages && item.image ? (
                    <span className="builder-product-category-image" style={{ backgroundImage: `url(${item.image})` }} />
                  ) : null}
                  <span className="builder-product-category-icon" aria-hidden="true">
                    <Icon size={24} strokeWidth={1.6} />
                  </span>
                  <span className="builder-product-category-label">{item.tag}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        {availableTags.length > 0 && tagStyle === 'chips' ? (
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
              {tagAllLabel}
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
                minHeight: 430,
                borderRadius: 22,
                padding: 18,
                background: 'rgba(255,250,240,0.74)',
                border: '1px solid rgba(196,145,45,0.18)',
                boxShadow: '0 16px 36px rgba(98,74,48,0.08)',
                display: 'grid',
                gridTemplateRows: 'auto auto auto 1fr auto auto',
                alignContent: 'start',
                alignItems: 'start',
              }}
            >
              {product.images[0] ? (
                <div
                  style={{
                    width: '100%',
                    minHeight: 150,
                    borderRadius: 16,
                    marginBottom: 14,
                    background: `linear-gradient(rgba(20,14,10,0.04), rgba(20,14,10,0.04)), url(${product.images[0]}) center / cover no-repeat`,
                  }}
                />
              ) : null}

              <div
                style={{
                  width: '100%',
                  color: '#c4912d',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.16em',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                }}
              >
                Producto
              </div>
              <h3
                style={{
                  display: '-webkit-box',
                  minHeight: '6.25rem',
                  margin: '8px 0 8px',
                  overflow: 'hidden',
                  color: '#1f1a16',
                  fontSize: 'clamp(1.08rem, 1.35vw, 1.32rem)',
                  fontWeight: 650,
                  lineHeight: 1.25,
                  textAlign: 'center',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 4,
                }}
              >
                {truncateText(product.name, 92)}
              </h3>
              <p
                style={{
                  display: '-webkit-box',
                  minHeight: '5.4rem',
                  margin: 0,
                  overflow: 'hidden',
                  color: 'rgba(75,64,56,0.76)',
                  fontSize: 14,
                  lineHeight: 1.55,
                  textAlign: 'center',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 4,
                }}
              >
                {truncateText(product.description || 'Producto destacado desde el catálogo publicado de Amantra.', 170)}
              </p>
              <div style={{ marginTop: 14, color: '#a96f1f', fontWeight: 800 }}>
                {currency.format(product.price ?? product.basePrice ?? 0)}
              </div>
              <a
                href={`/products/${product.slug ?? product.id}`}
                style={{
                  justifySelf: 'center',
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


