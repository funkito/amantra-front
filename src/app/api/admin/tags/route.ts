import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookies, isAdminRole } from '@/lib/auth/session';
import { normalizeTag } from '@/lib/tags';

export async function GET(request: Request) {
  const session = await getSessionFromCookies();

  if (!session || !isAdminRole(session.role)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = normalizeTag(searchParams.get('q') ?? '');
  const isAdminList = searchParams.get('admin') === '1';

  if (!query && !isAdminList) {
    return NextResponse.json({ tags: [] });
  }

  const tags = await prisma.tag.findMany({
    where: query
      ? {
          name: {
            contains: query,
          },
        }
      : undefined,
    orderBy: { name: 'asc' },
    take: isAdminList ? 200 : 10,
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (isAdminList) {
    return NextResponse.json({
      tags: tags.map((tag, index) => ({
        id: index + 1,
        dbId: tag.id,
        name: tag.name,
        imageUrl: tag.imageUrl ?? '',
        slug: normalizeTag(tag.name).replace(/\s+/g, '-'),
        productCount: tag._count.products,
        blogCount: 0,
      })),
    });
  }

  return NextResponse.json({ tags: tags.map((tag) => tag.name) });
}

export async function POST(request: Request) {
  const session = await getSessionFromCookies();

  if (!session || !isAdminRole(session.role)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const body = (await request.json()) as { name?: string; imageUrl?: string };
  const name = normalizeTag(body.name ?? '');

  if (!name) {
    return NextResponse.json({ error: 'El nombre de la etiqueta es obligatorio.' }, { status: 400 });
  }

  const tag = await prisma.tag.upsert({
    where: { name },
    update: {
      imageUrl: body.imageUrl?.trim() || null,
    },
    create: {
      name,
      imageUrl: body.imageUrl?.trim() || null,
    },
  });

  return NextResponse.json({ success: true, tag });
}
