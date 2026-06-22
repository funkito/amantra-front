import SiteMenu from '@/components/storefront/SiteMenu';
import type { BuilderBlockNode } from '@/lib/builder/types';

interface SiteMenuPreviewProps {
  block: BuilderBlockNode;
  selected?: boolean;
}

export default function SiteMenuPreview({ block, selected = false }: SiteMenuPreviewProps) {
  return (
    <div
      style={{
        borderRadius: 22,
        outline: selected ? '2px solid #D4AF37' : '1px solid rgba(212,175,55,0.12)',
        outlineOffset: selected ? 3 : 0,
      }}
    >
      <SiteMenu
        brandLabel={block.content.title || 'Amantra'}
        ctaLabel={block.content.ctaLabel || 'Explorar colección'}
        ctaHref={block.content.ctaHref || '/#catalogo'}
        content={block.content}
        compact
      />
    </div>
  );
}
