'use client';

import InlineEditableText from '@/components/builder/inline/InlineEditableText';
import { usePageBuilderStore } from '@/lib/store/usePageBuilderStore';
import type { BuilderBlockNode } from '@/lib/builder/types';

interface BlogGridPreviewProps {
  block: BuilderBlockNode;
  selected?: boolean;
}

export default function BlogGridPreview({ block, selected = false }: BlogGridPreviewProps) {
  const updateBlockContent = usePageBuilderStore((state) => state.updateBlockContent);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ color: '#D4AF37', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Blog Grid
        </div>
        {block.content.blogTag ? (
          <div style={{ color: '#8f846d', fontSize: 12 }}>Filtrado por etiqueta: {block.content.blogTag}</div>
        ) : null}
        <InlineEditableText
          value={block.content.title ?? ''}
          placeholder="Título del grid de blog"
          selected={selected}
          onChange={(value) => updateBlockContent(block.id, { title: value })}
          style={{ margin: 0, color: '#FFFFF0', fontSize: 28, fontWeight: 700 }}
        />
        <InlineEditableText
          value={block.content.body ?? ''}
          placeholder="Texto introductorio"
          multiline
          selected={selected}
          onChange={(value) => updateBlockContent(block.id, { body: value })}
          style={{ margin: 0, color: '#BDBDBD', lineHeight: 1.7 }}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
        }}
      >
        {Array.from({ length: Math.min(block.props.limit ?? 6, 6) }).map((_, index) => (
          <article
            key={index}
            style={{
              borderRadius: 20,
              border: '1px solid rgba(212,175,55,0.12)',
              background: 'rgba(255,255,255,0.03)',
              padding: 16,
              display: 'grid',
              gap: 10,
            }}
          >
            <div
              style={{
                minHeight: 120,
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(255,255,255,0.03))',
              }}
            />
            <div style={{ color: '#D4AF37', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Blog
            </div>
            <h3 style={{ margin: 0, color: '#FFFFF0', fontSize: 20 }}>Artículo {index + 1}</h3>
            <p style={{ margin: 0, color: '#BDBDBD', lineHeight: 1.6 }}>
              Vista previa del grid editorial conectado a posts publicados.
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
