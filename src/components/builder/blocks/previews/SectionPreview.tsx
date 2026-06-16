'use client';

import InlineEditableText from '@/components/builder/inline/InlineEditableText';
import { usePageBuilderStore } from '@/lib/store/usePageBuilderStore';
import type { BuilderBlockNode } from '@/lib/builder/types';

interface SectionPreviewProps {
  block: BuilderBlockNode;
  selected?: boolean;
}

export default function SectionPreview({ block, selected = false }: SectionPreviewProps) {
  const updateBlockContent = usePageBuilderStore((state) => state.updateBlockContent);

  return (
    <div
      style={{
        borderRadius: 18,
        padding: '24px',
        border: '1px dashed rgba(212,175,55,0.26)',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <div style={{ color: '#D4AF37', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
        Section
      </div>
      <InlineEditableText
        value={block.content.title ?? ''}
        placeholder="Título de sección"
        selected={selected}
        onChange={(value) => updateBlockContent(block.id, { title: value })}
        style={{ margin: '12px 0 6px', color: '#FFFFF0', fontSize: 24, fontWeight: 700 }}
      />
      <InlineEditableText
        value={block.content.body ?? ''}
        placeholder="Texto de sección"
        multiline
        selected={selected}
        onChange={(value) => updateBlockContent(block.id, { body: value })}
        style={{ margin: 0, color: '#BDBDBD', lineHeight: 1.7 }}
      />
    </div>
  );
}
