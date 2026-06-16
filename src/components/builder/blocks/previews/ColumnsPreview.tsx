'use client';

import InlineEditableText from '@/components/builder/inline/InlineEditableText';
import { usePageBuilderStore } from '@/lib/store/usePageBuilderStore';
import type { BuilderBlockNode } from '@/lib/builder/types';

interface ColumnsPreviewProps {
  block: BuilderBlockNode;
  selected?: boolean;
}

export default function ColumnsPreview({ block, selected = false }: ColumnsPreviewProps) {
  const updateBlockContent = usePageBuilderStore((state) => state.updateBlockContent);

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div>
        <div style={{ color: '#D4AF37', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Columns
        </div>
        <InlineEditableText
          value={block.content.title ?? ''}
          placeholder="Título de sección"
          selected={selected}
          onChange={(value) => updateBlockContent(block.id, { title: value })}
          style={{ margin: '10px 0 6px', color: '#FFFFF0', fontSize: 26, fontWeight: 700 }}
        />
        <InlineEditableText
          value={block.content.body ?? ''}
          placeholder="Introducción"
          multiline
          selected={selected}
          onChange={(value) => updateBlockContent(block.id, { body: value })}
          style={{ margin: 0, color: '#BDBDBD', lineHeight: 1.7 }}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 14,
        }}
      >
        <div
          style={{
            borderRadius: 18,
            border: '1px solid rgba(212,175,55,0.12)',
            background: 'rgba(255,255,255,0.02)',
            padding: 18,
          }}
        >
          <InlineEditableText
            value={block.content.leftTitle ?? ''}
            placeholder="Título izquierdo"
            selected={selected}
            onChange={(value) => updateBlockContent(block.id, { leftTitle: value })}
            style={{ margin: '0 0 8px', color: '#FFFFF0', fontSize: 20, fontWeight: 700 }}
          />
          <InlineEditableText
            value={block.content.leftBody ?? ''}
            placeholder="Texto izquierdo"
            multiline
            selected={selected}
            onChange={(value) => updateBlockContent(block.id, { leftBody: value })}
            style={{ margin: 0, color: '#BDBDBD', lineHeight: 1.7 }}
          />
        </div>

        <div
          style={{
            borderRadius: 18,
            border: '1px solid rgba(212,175,55,0.12)',
            background: 'rgba(255,255,255,0.02)',
            padding: 18,
          }}
        >
          <InlineEditableText
            value={block.content.rightTitle ?? ''}
            placeholder="Título derecho"
            selected={selected}
            onChange={(value) => updateBlockContent(block.id, { rightTitle: value })}
            style={{ margin: '0 0 8px', color: '#FFFFF0', fontSize: 20, fontWeight: 700 }}
          />
          <InlineEditableText
            value={block.content.rightBody ?? ''}
            placeholder="Texto derecho"
            multiline
            selected={selected}
            onChange={(value) => updateBlockContent(block.id, { rightBody: value })}
            style={{ margin: 0, color: '#BDBDBD', lineHeight: 1.7 }}
          />
        </div>
      </div>
    </div>
  );
}
