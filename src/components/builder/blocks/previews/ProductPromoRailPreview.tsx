'use client';

import InlineEditableText from '@/components/builder/inline/InlineEditableText';
import { usePageBuilderStore } from '@/lib/store/usePageBuilderStore';
import type { BuilderBlockNode } from '@/lib/builder/types';

interface ProductPromoRailPreviewProps {
  block: BuilderBlockNode;
  selected?: boolean;
}

export default function ProductPromoRailPreview({ block, selected = false }: ProductPromoRailPreviewProps) {
  const updateBlockContent = usePageBuilderStore((state) => state.updateBlockContent);
  const previewItems = Math.min(block.props.limit ?? 6, 5);
  const accentColor = '#d4a642';

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <InlineEditableText
            value={block.content.eyebrow ?? ''}
            placeholder="Oferta destacada"
            selected={selected}
            onChange={(value) => updateBlockContent(block.id, { eyebrow: value })}
            style={{ color: accentColor, fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase' }}
          />
          <InlineEditableText
            value={block.content.title ?? ''}
            placeholder="Promociones especiales"
            selected={selected}
            onChange={(value) => updateBlockContent(block.id, { title: value })}
            style={{ margin: '8px 0 6px', color: '#FFFFF0', fontSize: 26, fontWeight: 750 }}
          />
          <InlineEditableText
            value={block.content.body ?? ''}
            placeholder="Describe la campaña comercial."
            multiline
            selected={selected}
            onChange={(value) => updateBlockContent(block.id, { body: value })}
            style={{ margin: 0, color: '#BDBDBD', lineHeight: 1.65 }}
          />
        </div>
        <span style={{ color: accentColor, fontSize: 12, fontWeight: 800 }}>
          tag: {block.content.productTag || 'promociones'}
        </span>
      </div>

      <div style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(180px, 220px)', gap: 12, overflow: 'hidden' }}>
        {Array.from({ length: previewItems }).map((_, index) => (
          <article
            key={index}
            style={{
              overflow: 'hidden',
              borderRadius: 18,
              border: '1px solid rgba(212,175,55,0.18)',
              background: '#fff8ec',
              color: '#201814',
            }}
          >
            <div
              style={{
                minHeight: 96,
                background:
                  index % 2 === 0
                    ? 'linear-gradient(135deg, #f6e4c5, #fff8ec)'
                    : 'linear-gradient(135deg, #ead2a8, #fff6e7)',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: 10,
                  top: 10,
                  borderRadius: 999,
                  background: accentColor,
                  color: '#140e0a',
                  padding: '5px 8px',
                  fontSize: 10,
                  fontWeight: 900,
                }}
              >
                PROMO
              </span>
            </div>
            <div style={{ display: 'grid', gap: 8, padding: 12 }}>
              <span style={{ color: '#c4912d', fontSize: 10, fontWeight: 900, letterSpacing: '0.14em' }}>PRODUCTO</span>
              <strong style={{ fontSize: 15, lineHeight: 1.25 }}>Producto en promoción {index + 1}</strong>
              <span style={{ color: 'rgba(75,64,56,0.72)', fontSize: 12, lineHeight: 1.5 }}>
                Tarjeta comercial conectada por etiqueta.
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}