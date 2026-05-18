'use client';

import InlineEditableText from '@/components/builder/inline/InlineEditableText';
import { usePageBuilderStore } from '@/lib/store/usePageBuilderStore';
import type { BuilderBlockNode } from '@/lib/builder/types';

interface SiteMenuPreviewProps {
  block: BuilderBlockNode;
  selected?: boolean;
}

export default function SiteMenuPreview({ block, selected = false }: SiteMenuPreviewProps) {
  const updateBlockContent = usePageBuilderStore((state) => state.updateBlockContent);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        padding: '14px 18px',
        borderRadius: 18,
        border: '1px solid rgba(212,175,55,0.14)',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <InlineEditableText
        value={block.content.title ?? ''}
        placeholder="Marca"
        selected={selected}
        onChange={(value) => updateBlockContent(block.id, { title: value })}
        style={{ color: '#fff8ea', fontWeight: 800, fontSize: 20 }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#bdbdbd', flexWrap: 'wrap' }}>
        <span>Inicio</span>
        <span>Catálogo</span>
        <span>Blog</span>
      </div>

      <InlineEditableText
        value={block.content.ctaLabel ?? ''}
        placeholder="Botón"
        selected={selected}
        onChange={(value) => updateBlockContent(block.id, { ctaLabel: value })}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 160,
          borderRadius: 999,
          padding: '10px 16px',
          background: '#D4AF37',
          color: '#140e0a',
          fontWeight: 800,
        }}
      />
    </div>
  );
}
