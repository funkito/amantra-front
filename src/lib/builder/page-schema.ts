import { z } from 'zod';

export const responsiveVisibilitySchema = z.object({
  desktop: z.boolean(),
  tablet: z.boolean(),
  mobile: z.boolean(),
});

export const builderBlockPropsSchema = z.object({
  paddingY: z.string().optional(),
  paddingX: z.string().optional(),
  bgColor: z.string().optional(),
  textColor: z.string().optional(),
  containerWidth: z.enum(['full', 'xl', 'lg', 'md']).optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional(),
  limit: z.number().int().min(1).max(24).optional(),
  stylePreset: z.enum(['default', 'warm', 'editorial', 'contrast']).optional(),
  responsiveVisibility: responsiveVisibilitySchema.optional(),
});

export const builderBlockContentSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  body: z.string().optional(),
  image: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  eyebrow: z.string().optional(),
  brandName: z.string().optional(),
  logoUrl: z.string().optional(),
  menuBackgroundColor: z.string().optional(),
  menuTextColor: z.string().optional(),
  menuLinkColor: z.string().optional(),
  menuLinkBorderColor: z.string().optional(),
  menuCtaBackgroundColor: z.string().optional(),
  menuCtaTextColor: z.string().optional(),
  searchPlaceholder: z.string().optional(),
  showSearch: z.boolean().optional(),
  instagramUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  secondaryCtaLabel: z.string().optional(),
  secondaryCtaHref: z.string().optional(),
  bannerBackgroundColor: z.string().optional(),
  bannerTextColor: z.string().optional(),
  bannerAccentColor: z.string().optional(),
  bannerMutedColor: z.string().optional(),
  benefitOneTitle: z.string().optional(),
  benefitOneBody: z.string().optional(),
  benefitTwoTitle: z.string().optional(),
  benefitTwoBody: z.string().optional(),
  benefitThreeTitle: z.string().optional(),
  benefitThreeBody: z.string().optional(),
  productId: z.string().optional(),
  productTag: z.string().optional(),
  productTagStyle: z.enum(['chips', 'tiles']).optional(),
  productTagAllLabel: z.string().optional(),
  productTagShowImages: z.boolean().optional(),
  productTagTileBackgroundColor: z.string().optional(),
  productTagTileTextColor: z.string().optional(),
  productTagTileActiveBackgroundColor: z.string().optional(),
  productTagTileActiveTextColor: z.string().optional(),
  productTagTileBorderColor: z.string().optional(),
  productTagTileOverlayColor: z.string().optional(),
  postSlug: z.string().optional(),
  blogTag: z.string().optional(),
  leftTitle: z.string().optional(),
  leftBody: z.string().optional(),
  rightTitle: z.string().optional(),
  rightBody: z.string().optional(),
});

export const builderBlockNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['site_menu', 'hero', 'section', 'columns', 'product_grid', 'blog_grid', 'featured_product', 'blog_teaser', 'rich_text', 'image_banner', 'wellness_banner', 'newsletter_cta']),
  order: z.number().int().nonnegative(),
  props: builderBlockPropsSchema,
  content: builderBlockContentSchema,
});

export const builderPageThemeSchema = z.object({
  pageBg: z.string().default('#140f0c'),
  surfaceBg: z.string().default('#111111'),
  textColor: z.string().default('#f5efe4'),
  accentColor: z.string().default('#d4af37'),
});

export const builderVersionSnapshotSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  label: z.string(),
  status: z.enum(['draft', 'published']),
});

export const pageBuilderDocumentSchema = z.object({
  id: z.string(),
  slug: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(['draft', 'published']),
  theme: builderPageThemeSchema.default({
    pageBg: '#140f0c',
    surfaceBg: '#111111',
    textColor: '#f5efe4',
    accentColor: '#d4af37',
  }),
  versions: z.array(builderVersionSnapshotSchema).default([]),
  layout: z.array(builderBlockNodeSchema),
});

export type PageBuilderDocumentInput = z.infer<typeof pageBuilderDocumentSchema>;
