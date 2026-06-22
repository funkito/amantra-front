'use client';

import WellnessBannerBlock from '@/components/blocks/WellnessBannerBlock';
import type { BuilderBlockNode } from '@/lib/builder/types';

interface WellnessBannerPreviewProps {
  block: BuilderBlockNode;
  selected?: boolean;
}

export default function WellnessBannerPreview({ block, selected = false }: WellnessBannerPreviewProps) {
  return (
    <div
      style={{
        borderRadius: 34,
        outline: selected ? '2px solid #D4AF37' : '1px solid rgba(212,175,55,0.12)',
        outlineOffset: selected ? 3 : 0,
      }}
    >
      <WellnessBannerBlock content={block.content} />
    </div>
  );
}
