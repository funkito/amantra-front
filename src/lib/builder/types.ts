// Core JSON schema for the visual page builder.
// We persist only structured JSON and map block `type` to React components at render time.

export type BuilderViewport = 'desktop' | 'tablet' | 'mobile';

export type BuilderBlockCategory =
  | 'structure'
  | 'products'
  | 'blog'
  | 'multimedia'
  | 'marketing'
  | 'utility';

export type BuilderBlockType =
  | 'site_menu'
  | 'hero'
  | 'section'
  | 'columns'
  | 'product_grid'
  | 'blog_grid'
  | 'featured_product'
  | 'blog_teaser'
  | 'rich_text'
  | 'image_banner'
  | 'newsletter_cta';

export type BuilderStylePreset = 'default' | 'warm' | 'editorial' | 'contrast';

export type PageStatus = 'draft' | 'published';

export interface ResponsiveVisibility {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
}

export interface BuilderBlockProps {
  paddingY?: string;
  paddingX?: string;
  bgColor?: string;
  textColor?: string;
  containerWidth?: 'full' | 'xl' | 'lg' | 'md';
  textAlign?: 'left' | 'center' | 'right';
  columns?: 1 | 2 | 3 | 4;
  limit?: number;
  stylePreset?: BuilderStylePreset;
  responsiveVisibility?: ResponsiveVisibility;
}

export interface BuilderBlockContent {
  title?: string;
  subtitle?: string;
  body?: string;
  image?: string;
  ctaLabel?: string;
  ctaHref?: string;
  productId?: string;
  productTag?: string;
  postSlug?: string;
  blogTag?: string;
  leftTitle?: string;
  leftBody?: string;
  rightTitle?: string;
  rightBody?: string;
}

export interface BuilderBlockNode {
  id: string;
  type: BuilderBlockType;
  order: number;
  props: BuilderBlockProps;
  content: BuilderBlockContent;
}

export interface BuilderPageTheme {
  pageBg: string;
  surfaceBg: string;
  textColor: string;
  accentColor: string;
}

export interface BuilderVersionSnapshot {
  id: string;
  createdAt: string;
  label: string;
  status: PageStatus;
}

export interface BuilderPageLibraryItem {
  id: string;
  slug: string;
  title: string;
  status: PageStatus;
  updatedAt: string;
}

export interface PageBuilderDocument {
  id: string;
  slug: string;
  title: string;
  status: PageStatus;
  theme: BuilderPageTheme;
  versions: BuilderVersionSnapshot[];
  layout: BuilderBlockNode[];
}

export interface BuilderBlockDefinition {
  type: BuilderBlockType;
  label: string;
  description: string;
  category: BuilderBlockCategory;
  icon: string;
  defaultNode: Omit<BuilderBlockNode, 'id' | 'order'>;
}

export interface BuilderTemplateBlockSeed {
  type: BuilderBlockType;
  props?: Partial<BuilderBlockProps>;
  content?: Partial<BuilderBlockContent>;
}

export interface BuilderTemplateDefinition {
  id: string;
  label: string;
  description: string;
  blocks: BuilderTemplateBlockSeed[];
}
