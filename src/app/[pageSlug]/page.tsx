import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PublicPageRenderer from '@/components/builder/render/PublicPageRenderer';

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

  // Aseguramos que los bloques sean un array real y procesable
  const safeBlocks = Array.isArray(page.blocks) 
    ? page.blocks 
    : typeof page.blocks === 'string' 
      ? JSON.parse(page.blocks) 
      : [];

  // Creamos la configuración base que exige el componente para no fallar en el prerenderizado
  const safeLayout = {
    layout: safeBlocks,
    pageBg: '#ffffff', // 👈 Soluciona el error 'Cannot read properties of undefined (reading pageBg)'
    theme: 'light'
  };

  // Armamos el documento unificado sin propiedades duplicadas
  const pageDocument = {
    id: page.id,
    slug: page.pagePath,
    title: page.pagePath,
    blocks: safeBlocks,
    config: safeLayout, // Por si el constructor busca los datos envueltos
    ...safeLayout,      // 👈 Inyecta directamente 'layout', 'pageBg' y 'theme' en la raíz sin chocar con TypeScript
    status: 'published', 
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
    select: { pagePath: true },
  });

  return pages.map((page) => ({
    pageSlug: page.pagePath,
  }));
}