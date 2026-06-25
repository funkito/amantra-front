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

  // Consulta apuntando al campo único real de la BD de Amantra
  const page = await prisma.pageLayout.findUnique({
    where: {
      slug: pageSlug,
    },
  });

  if (!page) {
    notFound();
  }

  // Parseamos usando el tipo correcto que TypeScript ya conoce
  const blocks = (page.blocks as unknown as BuilderBlockType[]) || [];

  // 💡 Adaptamos la estructura al formato 'PageBuilderDocument' que espera el componente
  const pageDocument = {
    id: page.id,
    slug: page.slug,
    title: page.title,
    blocks: blocks,
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* ⚡ Enviamos el prop exacto que 'PublicPageRenderer' necesita */}
      <PublicPageRenderer document={pageDocument} />
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