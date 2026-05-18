import { notFound } from 'next/navigation';
import { Prisma } from '@prisma/client';
import PublicPageRenderer from '@/components/builder/render/PublicPageRenderer';
import { pageBuilderDocumentSchema } from '@/lib/builder/page-schema';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

interface DynamicPageProps {
  params: Promise<{
    pageSlug: string;
  }>;
  searchParams?: Promise<{
    preview?: string;
  }>;
}

export default async function DynamicBuilderPage({ params, searchParams }: DynamicPageProps) {
  const { pageSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const isPreview = resolvedSearchParams.preview === '1';

  const page = await prisma.pageLayout.findUnique({
    where: { pagePath: pageSlug },
  });

  if (!page) {
    notFound();
  }

  const parsedDocument = pageBuilderDocumentSchema.safeParse(page.blocks);

  if (!parsedDocument.success) {
    notFound();
  }

  if (parsedDocument.data.status !== 'published') {
    if (!isPreview) {
      notFound();
    }

    const session = await getSessionFromCookies();
    if (!session || !['SUPERADMIN', 'EDITOR'].includes(session.role)) {
      notFound();
    }
  }

  return <PublicPageRenderer document={parsedDocument.data} />;
}

export async function generateMetadata({ params, searchParams }: DynamicPageProps) {
  const { pageSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const isPreview = resolvedSearchParams.preview === '1';

  const page = await prisma.pageLayout.findUnique({
    where: { pagePath: pageSlug },
    select: { blocks: true },
  });

  if (!page) {
    return {};
  }

  const parsedDocument = pageBuilderDocumentSchema.safeParse(page.blocks as Prisma.JsonValue);

  if (!parsedDocument.success) {
    return {};
  }

  if (parsedDocument.data.status !== 'published') {
    if (!isPreview) {
      return {};
    }

    const session = await getSessionFromCookies();
    if (!session || !['SUPERADMIN', 'EDITOR'].includes(session.role)) {
      return {};
    }
  }

  return {
    title: parsedDocument.data.title,
    description: parsedDocument.data.layout[0]?.content.body ?? parsedDocument.data.title,
  };
}
