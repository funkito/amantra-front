'use client';

import InlineEditableText from '@/components/builder/inline/InlineEditableText';
import { usePageBuilderStore } from '@/lib/store/usePageBuilderStore';
import type { BuilderBlockNode } from '@/lib/builder/types';

interface FeaturedProductPreviewProps {
  block: BuilderBlockNode;
  selected?: boolean;
}

export default function FeaturedProductPreview({ block, selected = false }: FeaturedProductPreviewProps) {
  const updateBlockContent = usePageBuilderStore((state) => state.updateBlockContent);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.1fr) minmax(280px, 0.9fr)',
        gap: 18,
        alignItems: 'stretch',
      }}
    >
      <div style={{ display: 'grid', gap: 10 }}>
        <div style={{ color: '#D4AF37', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Featured Product
        </div>
        {block.content.productId ? (
          <div style={{ color: '#8f846d', fontSize: 12 }}>Conectado al producto {block.content.productId}</div>
        ) : null}
        <InlineEditableText
          value={block.content.subtitle ?? ''}
          placeholder="Etiqueta superior"
          selected={selected}
          onChange={(value) => updateBlockContent(block.id, { subtitle: value })}
          style={{ color: '#D4AF37', fontWeight: 700 }}
        />
        <InlineEditableText
          value={block.content.title ?? ''}
          placeholder="Título del producto"
          selected={selected}
          onChange={(value) => updateBlockContent(block.id, { title: value })}
          style={{ margin: 0, color: '#FFFFF0', fontSize: 30, fontWeight: 700 }}
        />
        <InlineEditableText
          value={block.content.body ?? ''}
          placeholder="Descripción"
          multiline
          selected={selected}
          onChange={(value) => updateBlockContent(block.id, { body: value })}
          style={{ margin: 0, color: '#BDBDBD', lineHeight: 1.7 }}
        />
        <InlineEditableText
          value={block.content.ctaLabel ?? ''}
          placeholder="Texto CTA"
          selected={selected}
          onChange={(value) => updateBlockContent(block.id, { ctaLabel: value })}
          style={{
            marginTop: 8,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 180,
            borderRadius: 999,
            padding: '12px 18px',
            background: '#D4AF37',
            color: '#140e0a',
            fontWeight: 800,
          }}
        />
      </div>

      <div
        style={{
          minHeight: 260,
          borderRadius: 24,
          border: '1px solid rgba(212,175,55,0.12)',
          background:
            block.content.image
              ? `linear-gradient(rgba(20,14,10,0.18), rgba(20,14,10,0.18)), url(${block.content.image}) center / cover no-repeat`
              : 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(255,255,255,0.03))',
        }}
      />
    </div>
  );
}
