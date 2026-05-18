import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { pageBuilderDocumentSchema } from '@/lib/builder/page-schema';
import type { PageStatus } from '@/lib/builder/types';

async function authorizePageBuilder() {
  const session = await getSessionFromCookies();

  if (!session || !['SUPERADMIN', 'EDITOR'].includes(session.role)) {
    return null;
  }

  return session;
}

export async function GET(request: Request) {
  try {
    const session = await authorizePageBuilder();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug')?.trim();

    if (!slug) {
      const pages = await prisma.pageLayout.findMany({
        orderBy: { updatedAt: 'desc' },
      });

      const library = pages.flatMap((page) => {
        const parsed = pageBuilderDocumentSchema.safeParse(page.blocks);

        if (!parsed.success) {
          return [];
        }

        return [
          {
            id: page.id,
            slug: parsed.data.slug,
            title: parsed.data.title,
            status: parsed.data.status,
            updatedAt: page.updatedAt.toISOString(),
          },
        ];
      });

      return NextResponse.json({ pages: library });
    }

    const page = await prisma.pageLayout.findUnique({
      where: { pagePath: slug },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 12,
        },
      },
    });

    if (!page) {
      return NextResponse.json({ page: null });
    }

    const parsedDocument = pageBuilderDocumentSchema.safeParse(page.blocks);

    if (!parsedDocument.success) {
      return NextResponse.json({ error: 'La página guardada no tiene un formato válido.' }, { status: 500 });
    }

    return NextResponse.json({
      page: {
        ...parsedDocument.data,
        versions: page.versions.map((version) => ({
          id: version.id,
          createdAt: version.createdAt.toISOString(),
          label: version.label,
          status: (version.status === 'published' ? 'published' : 'draft') as PageStatus,
        })),
      },
    });
  } catch (error) {
    console.error('Page builder fetch error:', error);
    return NextResponse.json({ error: 'No fue posible cargar la página.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await authorizePageBuilder();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const body = (await request.json()) as {
      mode?: 'blank' | 'duplicate';
      sourceSlug?: string;
      slug?: string;
      title?: string;
    };

    const slug = body.slug?.trim().toLowerCase();
    const title = body.title?.trim();

    if (!slug || !title) {
      return NextResponse.json({ error: 'Slug y título son obligatorios.' }, { status: 400 });
    }

    const exists = await prisma.pageLayout.findUnique({
      where: { pagePath: slug },
      select: { id: true },
    });

    if (exists) {
      return NextResponse.json({ error: 'Ya existe una página con ese slug.' }, { status: 409 });
    }

    let document;

    if (body.mode === 'duplicate' && body.sourceSlug?.trim()) {
      const sourcePage = await prisma.pageLayout.findUnique({
        where: { pagePath: body.sourceSlug.trim() },
      });

      if (!sourcePage) {
        return NextResponse.json({ error: 'No encontramos la página origen.' }, { status: 404 });
      }

      const sourceDocument = pageBuilderDocumentSchema.parse(sourcePage.blocks);
      document = {
        ...sourceDocument,
        id: `page-${crypto.randomUUID()}`,
        slug,
        title,
        status: 'draft' as const,
      };
    } else {
      document = pageBuilderDocumentSchema.parse({
        id: `page-${crypto.randomUUID()}`,
        slug,
        title,
        status: 'draft',
        theme: {
          pageBg: '#140f0c',
          surfaceBg: '#111111',
          textColor: '#f5efe4',
          accentColor: '#d4af37',
        },
        versions: [],
        layout: [],
      });
    }

    const createdPage = await prisma.pageLayout.create({
      data: {
        pagePath: slug,
        blocks: document as unknown as Prisma.InputJsonValue,
        updatedBy: session.userId,
      },
    });

    return NextResponse.json({ success: true, pageId: createdPage.id, slug });
  } catch (error) {
    console.error('Page builder create error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'No fue posible crear la página.',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await authorizePageBuilder();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const body = await request.json();
    const document = pageBuilderDocumentSchema.parse(body);

    const page = await prisma.pageLayout.upsert({
      where: { pagePath: document.slug },
      create: {
        pagePath: document.slug,
        blocks: document as unknown as Prisma.InputJsonValue,
        updatedBy: session.userId,
      },
      update: {
        blocks: document as unknown as Prisma.InputJsonValue,
        updatedBy: session.userId,
      },
    });

    await prisma.pageLayoutVersion.create({
      data: {
        pageLayoutId: page.id,
        label: document.status === 'published' ? 'Versión publicada' : 'Versión de borrador',
        status: document.status,
        snapshot: document as unknown as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error('Page builder save error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'No fue posible guardar la página.',
      },
      { status: 500 }
    );
  }
}
