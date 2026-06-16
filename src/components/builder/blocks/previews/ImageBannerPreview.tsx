'use client';

import InlineEditableText from '@/components/builder/inline/InlineEditableText';
import { usePageBuilderStore } from '@/lib/store/usePageBuilderStore';
import type { BuilderBlockNode } from '@/lib/builder/types';

interface ImageBannerPreviewProps {
  block: BuilderBlockNode;
  selected?: boolean;
}

export default function ImageBannerPreview({ block, selected = false }: ImageBannerPreviewProps) {
  const updateBlockContent = usePageBuilderStore((state) => state.updateBlockContent);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 0.8fr',
        gap: 18,
        alignItems: 'stretch',
      }}
    >
      <div
        style={{
          borderRadius: 20,
          minHeight: 180,
          background: 'linear-gradient(135deg, rgba(212,175,55,0.22), rgba(255,255,255,0.03))',
          border: '1px solid rgba(212,175,55,0.12)',
          display: 'grid',
          placeItems: 'center',
          color: '#8f846d',
          fontSize: 13,
        }}
      >
        Área de imagen
      </div>
      <div>
        <div style={{ color: '#D4AF37', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Image Banner
        </div>
        <InlineEditableText
          value={block.content.title ?? ''}
          placeholder="Título del banner"
          selected={selected}
          onChange={(value) => updateBlockContent(block.id, { title: value })}
          style={{ margin: '12px 0 8px', color: '#FFFFF0', fontSize: 24, fontWeight: 700 }}
        />
        <InlineEditableText
          value={block.content.body ?? ''}
          placeholder="Texto del banner"
          multiline
          selected={selected}
          onChange={(value) => updateBlockContent(block.id, { body: value })}
          style={{ margin: 0, color: '#BDBDBD', lineHeight: 1.7 }}
        />
      </div>
    </div>
  );
}
