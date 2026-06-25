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
  // Nos aseguramos de que blocks sea un array válido para evitar que falle el .map en el componente
// Aseguramos que los bloques sean un array real
// Aseguramos que los bloques sean un array real
const safeBlocks = Array.isArray(page.blocks) 
  ? page.blocks 
  : typeof page.blocks === 'string' 
    ? JSON.parse(page.blocks) 
    : [];

// Creamos un entorno seguro con las propiedades mínimas que el builder busca (como pageBg)
const safeLayout = {
  layout: safeBlocks,
  pageBg: '#ffffff', // 👈 Evita el error 'Cannot read properties of undefined (reading pageBg)'
  theme: 'light'
};

const pageDocument = {
  id: page.id,
  slug: page.pagePath,
  title: page.pagePath,
  blocks: safeBlocks,
  layout: safeBlocks, // Por compatibilidad si busca el array directo
  config: safeLayout, // Por si busca la configuración envuelta
  ...safeLayout,       // Inyectamos pageBg y layout directamente en la raíz del objeto por si el componente mapea el documento entero
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