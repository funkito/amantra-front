import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

function getPostTags(content: unknown) {
  if (!content || typeof content !== 'object') {
    return [];
  }

  const tags = (content as Record<string, unknown>).tags;
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function GET() {
  try {
    const session = await getSessionFromCookies();

    if (!session || !['SUPERADMIN', 'EDITOR'].includes(session.role)) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const [products, posts] = await Promise.all([
      prisma.product.findMany({
        where: {
          deletedAt: null,
          status: 'PUBLISHED',
        },
        orderBy: { updatedAt: 'desc' },
        take: 50,
        select: {
          id: true,
          name: true,
          description: true,
          images: true,
          tags: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.post.findMany({
        where: { published: true },
        orderBy: { updatedAt: 'desc' },
        take: 50,
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          createdAt: true,
        },
      }),
    ]);

    const productTags = Array.from(
      new Set(products.flatMap((product) => product.tags.map((tag) => tag.name)))
    ).sort((left, right) => left.localeCompare(right, 'es'));

    const postTags = Array.from(
      new Set(posts.flatMap((post) => getPostTags(post.content)))
    ).sort((left, right) => left.localeCompare(right, 'es'));

    return NextResponse.json({
      products: products.map((product) => ({
        id: product.id,
        title: product.name,
        body: product.description,
        image: product.images[0] ?? '',
        tags: product.tags.map((tag) => tag.name),
      })),
      posts: posts.map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title,
        body:
          typeof post.content === 'object' && post.content && 'excerpt' in (post.content as Record<string, unknown>)
            ? String((post.content as Record<string, unknown>).excerpt ?? '')
            : '',
        image:
          typeof post.content === 'object' && post.content && 'coverImage' in (post.content as Record<string, unknown>)
            ? String((post.content as Record<string, unknown>).coverImage ?? '')
            : '',
        tags: getPostTags(post.content),
      })),
      productTags,
      postTags,
    });
  } catch (error) {
    console.error('Admin content sources error:', error);
    return NextResponse.json({ error: 'No fue posible cargar las fuentes de contenido.' }, { status: 500 });
  }
}
