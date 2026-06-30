'use client';

import InlineEditableText from '@/components/builder/inline/InlineEditableText';
import { usePageBuilderStore } from '@/lib/store/usePageBuilderStore';
import type { BuilderBlockNode } from '@/lib/builder/types';

interface ProductGridPreviewProps {
  block: BuilderBlockNode;
  selected?: boolean;
}

export default function ProductGridPreview({ block, selected = false }: ProductGridPreviewProps) {
  const updateBlockContent = usePageBuilderStore((state) => state.updateBlockContent);
  const columns = block.props.columns ?? 3;
  const previewItems = Math.min(block.props.limit ?? 6, 8);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        <div style={{ color: '#D4AF37', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Product Grid
        </div>
        <InlineEditableText
          value={block.content.title ?? ''}
          placeholder="Título de catálogo"
          selected={selected}
          onChange={(value) => updateBlockContent(block.id, { title: value })}
          style={{ margin: '10px 0 6px', color: '#FFFFF0', fontSize: 24, fontWeight: 700 }}
        />
        <InlineEditableText
          value={block.content.body ?? ''}
          placeholder="Texto del grid"
          multiline
          selected={selected}
          onChange={(value) => updateBlockContent(block.id, { body: value })}
          style={{ margin: 0, color: '#BDBDBD', lineHeight: 1.7 }}
        />
      </div>

      <div className="builder-product-category-rail">
        {['Todas', 'Aceites esenciales', 'Cuencos', 'Anillos energéticos'].map((tag, index) => (
          <span
            key={tag}
            className="builder-product-category-tile"
            style={{
              backgroundColor:
                index === 0
                  ? block.content.productTagTileActiveBackgroundColor || '#fff7e8'
                  : block.content.productTagTileBackgroundColor || '#fbf4e8',
              borderColor: block.content.productTagTileBorderColor || 'rgba(196,145,45,0.22)',
              color:
                index === 0
                  ? block.content.productTagTileActiveTextColor || '#140e0a'
                  : block.content.productTagTileTextColor || '#31513d',
            }}
          >
            <span
              className="builder-product-category-image"
              style={{
                background:
                  index === 0
                    ? 'radial-gradient(circle at 70% 40%, rgba(212,175,55,0.34), transparent 34%), linear-gradient(135deg, #fff7e8, #f1dec0)'
                    : 'radial-gradient(circle at 70% 40%, rgba(49,81,61,0.16), transparent 34%), linear-gradient(135deg, #fff7e8, #f6ead8)',
              }}
            />
            <span className="builder-product-category-icon" aria-hidden="true">✧</span>
            <span className="builder-product-category-label">{index === 0 ? block.content.productTagAllLabel || tag : tag}</span>
          </span>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: 12,
        }}
      >
        {Array.from({ length: previewItems }).map((_, index) => (
          <div
            key={index}
            style={{
              minHeight: 140,
              borderRadius: 18,
              border: '1px solid rgba(212,175,55,0.12)',
              background: 'rgba(255,255,255,0.03)',
              display: 'grid',
              placeItems: 'center',
              color: '#8f846d',
              fontSize: 13,
              alignContent: 'start',
              padding: 14,
            }}
          >
            <div style={{ display: 'grid', gap: 8, width: '100%' }}>
              <div
                style={{
                  minHeight: 62,
                  borderRadius: 12,
                  background: 'rgba(212,175,55,0.1)',
                }}
              />
              <strong style={{ color: '#FFFFF0', fontSize: 14 }}>Producto {index + 1}</strong>
              <span style={{ lineHeight: 1.5 }}>
                Extracto corto del producto para que el grid se vea más limpio.
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
