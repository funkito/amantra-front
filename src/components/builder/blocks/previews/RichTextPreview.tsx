'use client';

import InlineEditableText from '@/components/builder/inline/InlineEditableText';
import { usePageBuilderStore } from '@/lib/store/usePageBuilderStore';
import type { BuilderBlockNode } from '@/lib/builder/types';

interface RichTextPreviewProps {
  block: BuilderBlockNode;
  selected?: boolean;
}

export default function RichTextPreview({ block, selected = false }: RichTextPreviewProps) {
  const updateBlockContent = usePageBuilderStore((state) => state.updateBlockContent);

  return (
    <div
      style={{
        borderRadius: 18,
        padding: '22px 24px',
        border: '1px solid rgba(212,175,55,0.12)',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <div style={{ color: '#D4AF37', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
        Rich Text
      </div>
      <InlineEditableText
        value={block.content.title ?? ''}
        placeholder="Título editorial"
        selected={selected}
        onChange={(value) => updateBlockContent(block.id, { title: value })}
        style={{ margin: '12px 0 8px', color: '#FFFFF0', fontSize: 26, fontWeight: 700 }}
      />
      <InlineEditableText
        value={block.content.body ?? ''}
        placeholder="Contenido enriquecido"
        multiline
        selected={selected}
        onChange={(value) => updateBlockContent(block.id, { body: value })}
        style={{ margin: 0, color: '#BDBDBD', lineHeight: 1.8 }}
      />
    </div>
  );
}
