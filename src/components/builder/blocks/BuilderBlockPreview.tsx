'use client';

import dynamic from 'next/dynamic';
import type { BuilderBlockNode } from '@/lib/builder/types';

const HeroPreview = dynamic(() => import('@/components/builder/blocks/previews/HeroPreview'));
const SiteMenuPreview = dynamic(() => import('@/components/builder/blocks/previews/SiteMenuPreview'));
const SectionPreview = dynamic(() => import('@/components/builder/blocks/previews/SectionPreview'));
const ColumnsPreview = dynamic(() => import('@/components/builder/blocks/previews/ColumnsPreview'));
const ProductGridPreview = dynamic(() => import('@/components/builder/blocks/previews/ProductGridPreview'));
const BlogGridPreview = dynamic(() => import('@/components/builder/blocks/previews/BlogGridPreview'));
const FeaturedProductPreview = dynamic(() => import('@/components/builder/blocks/previews/FeaturedProductPreview'));
const BlogTeaserPreview = dynamic(() => import('@/components/builder/blocks/previews/BlogTeaserPreview'));
const RichTextPreview = dynamic(() => import('@/components/builder/blocks/previews/RichTextPreview'));
const ImageBannerPreview = dynamic(() => import('@/components/builder/blocks/previews/ImageBannerPreview'));
const WellnessBannerPreview = dynamic(() => import('@/components/builder/blocks/previews/WellnessBannerPreview'));
const NewsletterCtaPreview = dynamic(() => import('@/components/builder/blocks/previews/NewsletterCtaPreview'));

interface BuilderBlockPreviewProps {
  block: BuilderBlockNode;
  selected?: boolean;
}

export default function BuilderBlockPreview({ block, selected = false }: BuilderBlockPreviewProps) {
  switch (block.type) {
    case 'site_menu':
      return <SiteMenuPreview block={block} selected={selected} />;
    case 'hero':
      return <HeroPreview block={block} selected={selected} />;
    case 'section':
      return <SectionPreview block={block} selected={selected} />;
    case 'columns':
      return <ColumnsPreview block={block} selected={selected} />;
    case 'product_grid':
      return <ProductGridPreview block={block} selected={selected} />;
    case 'blog_grid':
      return <BlogGridPreview block={block} selected={selected} />;
    case 'featured_product':
      return <FeaturedProductPreview block={block} selected={selected} />;
    case 'blog_teaser':
      return <BlogTeaserPreview block={block} selected={selected} />;
    case 'rich_text':
      return <RichTextPreview block={block} selected={selected} />;
    case 'image_banner':
      return <ImageBannerPreview block={block} selected={selected} />;
    case 'wellness_banner':
      return <WellnessBannerPreview block={block} selected={selected} />;
    case 'newsletter_cta':
      return <NewsletterCtaPreview block={block} selected={selected} />;
    default:
      return null;
  }
}
