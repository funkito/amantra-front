import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PublicPageRenderer from '@/components/builder/render/PublicPageRenderer';
import { BuilderBlock } from '@/lib/builder/types';

interface PageProps {
  params: Promise<{
    pageSlug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  // En Next.js 15, params es una Promesa y se le debe hacer await
  const { pageSlug } = await params;

  // 💡 Consulta corregida apuntando al campo único real: 'slug'
  const page = await prisma.pageLayout.findUnique({
    where: {
      slug: pageSlug,
    },
  });

  if (!page) {
    notFound();
  }

  // Parseamos los bloques guardados en el campo Json de tu BD
  const blocks = (page.blocks as unknown as BuilderBlock[]) || [];

  return (
    <div className="min-h-screen bg-transparent">
      {/* Usamos el renderizador real de tu tienda */}
      <PublicPageRenderer blocks={blocks} />
    </div>
  );
}

// Opcional: Para pre-renderizar las rutas en el servidor y que vuelen
export async function generateStaticParams() {
  const pages = await prisma.pageLayout.findMany({
    select: { slug: true },
  });

  return pages.map((page) => ({
    pageSlug: page.slug,
  }));
}