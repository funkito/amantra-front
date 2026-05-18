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

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <span
          style={{
            padding: '8px 12px',
            borderRadius: 999,
            border: '1px solid rgba(212,175,55,0.18)',
            background: block.content.productTag ? 'rgba(255,255,255,0.03)' : 'rgba(212,175,55,0.14)',
            color: block.content.productTag ? '#FFFFF0' : '#D4AF37',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          Todas
        </span>
        {block.content.productTag ? (
          <span
            style={{
              padding: '8px 12px',
              borderRadius: 999,
              border: '1px solid rgba(212,175,55,0.24)',
              background: 'rgba(212,175,55,0.14)',
              color: '#D4AF37',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            #{block.content.productTag}
          </span>
        ) : null}
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
