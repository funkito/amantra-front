'use client';

import InlineEditableText from '@/components/builder/inline/InlineEditableText';
import { usePageBuilderStore } from '@/lib/store/usePageBuilderStore';
import type { BuilderBlockNode } from '@/lib/builder/types';

interface NewsletterCtaPreviewProps {
  block: BuilderBlockNode;
  selected?: boolean;
}

export default function NewsletterCtaPreview({ block, selected = false }: NewsletterCtaPreviewProps) {
  const updateBlockContent = usePageBuilderStore((state) => state.updateBlockContent);

  return (
    <div
      style={{
        borderRadius: 18,
        padding: '24px',
        background: 'rgba(212,175,55,0.08)',
        border: '1px solid rgba(212,175,55,0.16)',
      }}
    >
      <div style={{ color: '#D4AF37', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
        Newsletter CTA
      </div>
      <InlineEditableText
        value={block.content.title ?? ''}
        placeholder="Título de captación"
        selected={selected}
        onChange={(value) => updateBlockContent(block.id, { title: value })}
        style={{ margin: '12px 0 8px', color: '#FFFFF0', fontSize: 24, fontWeight: 700 }}
      />
      <InlineEditableText
        value={block.content.body ?? ''}
        placeholder="Texto de newsletter"
        multiline
        selected={selected}
        onChange={(value) => updateBlockContent(block.id, { body: value })}
        style={{ margin: 0, color: '#BDBDBD', lineHeight: 1.7 }}
      />
      <InlineEditableText
        value={block.content.ctaLabel ?? ''}
        placeholder="Texto del botón"
        selected={selected}
        onChange={(value) => updateBlockContent(block.id, { ctaLabel: value })}
        style={{
          marginTop: 14,
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
  );
}
