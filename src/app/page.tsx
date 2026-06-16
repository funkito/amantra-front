import { Prisma } from '@prisma/client';
import PublicPageRenderer from '@/components/builder/render/PublicPageRenderer';
import StorefrontPage from '@/components/storefront/StorefrontPage';
import { pageBuilderDocumentSchema } from '@/lib/builder/page-schema';
import { getPublishedCatalogProductsFiltered, getPublishedCatalogTags } from '@/lib/catalog/public-products';
import { prisma } from '@/lib/prisma';

interface HomeProps {
  searchParams?: Promise<{
    tag?: string | string[];
    q?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activeTags = Array.isArray(resolvedSearchParams.tag)
    ? resolvedSearchParams.tag.map((tag) => tag.trim()).filter(Boolean)
    : resolvedSearchParams.tag
      ? [resolvedSearchParams.tag.trim()].filter(Boolean)
      : [];
  const searchQuery = resolvedSearchParams.q?.trim() || '';

  const homePage = await prisma.pageLayout.findUnique({
    where: { pagePath: 'inicio' },
    select: { blocks: true },
  });

  if (homePage && !searchQuery) {
    const parsedDocument = pageBuilderDocumentSchema.safeParse(homePage.blocks as Prisma.JsonValue);

    if (parsedDocument.success && parsedDocument.data.status === 'published') {
      return <PublicPageRenderer document={parsedDocument.data} activeProductTag={activeTags[0] ?? ''} />;
    }
  }

  const [products, availableTags] = await Promise.all([
    getPublishedCatalogProductsFiltered({
      tags: activeTags,
      query: searchQuery,
    }),
    getPublishedCatalogTags(),
  ]);

  return (
    <StorefrontPage
      products={products}
      availableTags={availableTags}
      activeTags={activeTags}
      searchQuery={searchQuery}
    />
  );
}
