'use client';

import InlineEditableText from '@/components/builder/inline/InlineEditableText';
import { usePageBuilderStore } from '@/lib/store/usePageBuilderStore';
import type { BuilderBlockNode } from '@/lib/builder/types';

interface HeroPreviewProps {
  block: BuilderBlockNode;
  selected?: boolean;
}

export default function HeroPreview({ block, selected = false }: HeroPreviewProps) {
  const updateBlockContent = usePageBuilderStore((state) => state.updateBlockContent);

  return (
    <div
      style={{
        borderRadius: 20,
        padding: '28px 24px',
        background: 'linear-gradient(135deg, rgba(212,175,55,0.18), rgba(255,255,255,0.02))',
        border: '1px solid rgba(212,175,55,0.14)',
      }}
    >
      <div style={{ color: '#D4AF37', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
        Hero
      </div>
      <InlineEditableText
        value={block.content.title ?? ''}
        placeholder="Título del hero"
        selected={selected}
        onChange={(value) => updateBlockContent(block.id, { title: value })}
        style={{ margin: '14px 0 8px', color: '#FFFFF0', fontSize: 30, lineHeight: 1.05, fontWeight: 700 }}
      />
      <InlineEditableText
        value={block.content.body ?? ''}
        placeholder="Texto descriptivo"
        multiline
        selected={selected}
        onChange={(value) => updateBlockContent(block.id, { body: value })}
        style={{ margin: 0, color: '#BDBDBD', lineHeight: 1.7 }}
      />
    </div>
  );
}
