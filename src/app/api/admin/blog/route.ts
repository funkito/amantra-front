import { NextResponse } from 'next/server';
import { fetchBackendAdminApi } from '@/lib/admin/backend-admin-api';
import { getSessionFromCookies } from '@/lib/auth/session';
import { buildBlogContentData, normalizeBlogSlug, normalizeBlogTags, validateBlogPayload } from '@/lib/admin/blog';
import { getBackendApiUrl } from '@/lib/backend-api';
import { prisma } from '@/lib/prisma';

async function authorizeBlogManager() {
  const session = await getSessionFromCookies();

  if (!session || !['SUPERADMIN', 'EDITOR'].includes(session.role)) {
    return null;
  }

  return session;
}

export async function POST(request: Request) {
  try {
    const session = await authorizeBlogManager();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const body = (await request.json()) as {
      title?: string;
      slug?: string;
      excerpt?: string;
      body?: string;
      coverImage?: string;
      tags?: string[] | string;
      published?: boolean;
    };

    const payload = {
      title: body.title?.trim() ?? '',
      slug: normalizeBlogSlug(body.slug?.trim() || body.title?.trim() || ''),
      excerpt: body.excerpt?.trim() ?? '',
      body: body.body?.trim() ?? '',
      coverImage: body.coverImage?.trim() ?? '',
      tags: normalizeBlogTags(body.tags ?? []),
    };

    const validationError = validateBlogPayload(payload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (getBackendApiUrl()) {
      const response = await fetchBackendAdminApi('/blog-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: payload.title,
          slug: payload.slug,
          status: body.published ? 'published' : 'draft',
          content: buildBlogContentData(payload),
          tags: payload.tags,
          relatedProductIds: [],
        }),
      });
      const result = (await response.json()) as { data?: { id: number }; error?: { message?: string } };

      if (!response.ok) {
        return NextResponse.json(
          { error: result.error?.message ?? 'No fue posible crear el artículo en MariaDB.' },
          { status: response.status }
        );
      }

      return NextResponse.json({ success: true, post: result.data });
    }

    const duplicate = await prisma.post.findUnique({
      where: { slug: payload.slug },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json({ error: 'Ya existe un artículo con ese slug.' }, { status: 409 });
    }

    const post = await prisma.post.create({
      data: {
        title: payload.title,
        slug: payload.slug,
        content: buildBlogContentData(payload),
        authorId: session.userId,
        published: body.published ?? false,
      },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('Admin blog creation error:', error);
    return NextResponse.json({ error: 'No fue posible crear el artículo.' }, { status: 500 });
  }
}
