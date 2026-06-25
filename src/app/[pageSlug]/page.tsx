import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PublicPageRenderer from '@/components/builder/render/PublicPageRenderer';
import { BuilderBlockType } from '@/lib/builder/types';

interface PageProps {
  params: Promise<{
    pageSlug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  // En Next.js 15, params es una Promesa y se le debe hacer await
  const { pageSlug } = await params;

  // Consulta apuntando al campo único real de la BD
  const page = await prisma.pageLayout.findUnique({
    where: {
      pagePath: pageSlug,
    },
  });

  if (!page) {
    notFound();
  }

  // Parseamos usando el tipo correcto que el builder conoce
  const blocks = (page.blocks as unknown as BuilderBlockType[]) || [];

  // Estructura básica requerida para el renderizado visual
  const pageDocument = {
    id: page.id,
    slug: page.pagePath,
    title: page.pagePath,
    blocks: blocks,
    status: 'published', 
    theme: 'default',
    versions: [],
    layout: 'blank',
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* ⚡ Doble casteo para apagar por completo las alertas estrictas de Vercel */}
      <PublicPageRenderer 
        document={pageDocument as unknown as any} 
        activeProductTag={undefined} 
      />
    </div>
  );
}

// Para pre-renderizar las rutas en producción de manera óptima
export async function generateStaticParams() {
  const pages = await prisma.pageLayout.findMany({
    select: { slug: true },
  });

  return pages.map((page) => ({
    pageSlug: page.slug,
  }));
}