import Link from 'next/link';
import { notFound } from 'next/navigation';
import PublicPageRenderer from '@/components/builder/render/PublicPageRenderer';
import { requireProductManager } from '@/lib/auth/guards';
import { pageBuilderDocumentSchema } from '@/lib/builder/page-schema';
import { prisma } from '@/lib/prisma';

interface BuilderPreviewPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BuilderPreviewPage({ params }: BuilderPreviewPageProps) {
  await requireProductManager();

  const { slug } = await params;

  const page = await prisma.pageLayout.findUnique({
    where: { slug: slug },
    select: { blocks: true },
  });

  if (!page) {
    notFound();
  }

  const parsedDocument = pageBuilderDocumentSchema.safeParse(page.blocks);

  if (!parsedDocument.success) {
    notFound();
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0907' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '14px 20px',
          borderBottom: '1px solid rgba(212,175,55,0.14)',
          background: 'rgba(17, 17, 17, 0.92)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div style={{ display: 'grid', gap: 4 }}>
          <div style={{ color: '#D4AF37', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            Vista previa
          </div>
          <div style={{ color: '#FFFFF0', fontWeight: 700 }}>
            {parsedDocument.data.title} · {parsedDocument.data.status === 'published' ? 'Publicado' : 'Borrador'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link
            href="/admin_group/admin/builder"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 42,
              padding: '0 16px',
              borderRadius: 999,
              border: '1px solid rgba(212,175,55,0.12)',
              background: 'rgba(255,255,255,0.02)',
              color: '#FFFFF0',
              textDecoration: 'none',
              fontWeight: 700,
            }}
          >
            Volver al builder
          </Link>
          <Link
            href={`/${parsedDocument.data.slug}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 42,
              padding: '0 16px',
              borderRadius: 999,
              background: 'linear-gradient(135deg, #f2c86b 0%, #c9922b 100%)',
              color: '#140e0a',
              textDecoration: 'none',
              fontWeight: 800,
            }}
          >
            Abrir ruta pública
          </Link>
        </div>
      </div>

      <PublicPageRenderer document={parsedDocument.data} />
    </div>
  );
}
