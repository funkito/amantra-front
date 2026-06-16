'use client';

import InlineEditableText from '@/components/builder/inline/InlineEditableText';
import { usePageBuilderStore } from '@/lib/store/usePageBuilderStore';
import type { BuilderBlockNode } from '@/lib/builder/types';

interface BlogTeaserPreviewProps {
  block: BuilderBlockNode;
  selected?: boolean;
}

export default function BlogTeaserPreview({ block, selected = false }: BlogTeaserPreviewProps) {
  const updateBlockContent = usePageBuilderStore((state) => state.updateBlockContent);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '240px minmax(0, 1fr)',
        gap: 18,
        alignItems: 'stretch',
      }}
    >
      <div
        style={{
          minHeight: 220,
          borderRadius: 20,
          border: '1px solid rgba(212,175,55,0.12)',
          background:
            block.content.image
              ? `linear-gradient(rgba(20,14,10,0.18), rgba(20,14,10,0.18)), url(${block.content.image}) center / cover no-repeat`
              : 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(255,255,255,0.03))',
        }}
      />
      <div style={{ display: 'grid', gap: 10 }}>
        {block.content.postSlug ? (
          <div style={{ color: '#8f846d', fontSize: 12 }}>Conectado al post {block.content.postSlug}</div>
        ) : null}
        <InlineEditableText
          value={block.content.subtitle ?? ''}
          placeholder="Etiqueta editorial"
          selected={selected}
          onChange={(value) => updateBlockContent(block.id, { subtitle: value })}
          style={{ color: '#D4AF37', fontWeight: 700 }}
        />
        <InlineEditableText
          value={block.content.title ?? ''}
          placeholder="Título del artículo"
          selected={selected}
          onChange={(value) => updateBlockContent(block.id, { title: value })}
          style={{ margin: 0, color: '#FFFFF0', fontSize: 28, fontWeight: 700 }}
        />
        <InlineEditableText
          value={block.content.body ?? ''}
          placeholder="Resumen del artículo"
          multiline
          selected={selected}
          onChange={(value) => updateBlockContent(block.id, { body: value })}
          style={{ margin: 0, color: '#BDBDBD', lineHeight: 1.7 }}
        />
        <InlineEditableText
          value={block.content.ctaLabel ?? ''}
          placeholder="Leer más"
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
    </div>
  );
}
