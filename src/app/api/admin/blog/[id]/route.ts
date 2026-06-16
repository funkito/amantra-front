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

export async function PATCH(request: Request, ctx: RouteContext<'/api/admin/blog/[id]'>) {
  try {
    const session = await authorizeBlogManager();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const body = (await request.json()) as {
      action?: 'toggle-published';
      title?: string;
      slug?: string;
      excerpt?: string;
      body?: string;
      coverImage?: string;
      tags?: string[] | string;
      published?: boolean;
    };

    if (getBackendApiUrl()) {
      if (body.action === 'toggle-published') {
        const currentResponse = await fetchBackendAdminApi(`/blog-posts/${id}`);
        const currentPayload = (await currentResponse.json()) as {
          data?: { status?: 'draft' | 'published' };
          error?: { message?: string };
        };

        if (!currentResponse.ok) {
          return NextResponse.json(
            { error: currentPayload.error?.message ?? 'Artículo no encontrado.' },
            { status: currentResponse.status }
          );
        }

        const response = await fetchBackendAdminApi(`/blog-posts/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: currentPayload.data?.status === 'published' ? 'draft' : 'published',
          }),
        });
        const result = (await response.json()) as { data?: unknown; error?: { message?: string } };

        if (!response.ok) {
          return NextResponse.json(
            { error: result.error?.message ?? 'No fue posible actualizar el artículo en MariaDB.' },
            { status: response.status }
          );
        }

        return NextResponse.json({ success: true, post: result.data });
      }

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

      const response = await fetchBackendAdminApi(`/blog-posts/${id}`, {
        method: 'PATCH',
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
      const result = (await response.json()) as { data?: unknown; error?: { message?: string } };

      if (!response.ok) {
        return NextResponse.json(
          { error: result.error?.message ?? 'No fue posible actualizar el artículo en MariaDB.' },
          { status: response.status }
        );
      }

      return NextResponse.json({ success: true, post: result.data });
    }

    if (body.action === 'toggle-published') {
      const currentPost = await prisma.post.findUnique({
        where: { id },
        select: { id: true, published: true },
      });

      if (!currentPost) {
        return NextResponse.json({ error: 'Artículo no encontrado.' }, { status: 404 });
      }

      const post = await prisma.post.update({
        where: { id },
        data: { published: !currentPost.published },
      });

      return NextResponse.json({ success: true, post });
    }

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

    const duplicate = await prisma.post.findFirst({
      where: {
        slug: payload.slug,
        id: { not: id },
      },
      select: { id: true },
    });

    if (duplicate) {
      return NextResponse.json({ error: 'Ya existe otro artículo con ese slug.' }, { status: 409 });
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title: payload.title,
        slug: payload.slug,
        content: buildBlogContentData(payload),
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
    console.error('Admin blog update error:', error);
    return NextResponse.json({ error: 'No fue posible actualizar el artículo.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: RouteContext<'/api/admin/blog/[id]'>) {
  try {
    const session = await authorizeBlogManager();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const { id } = await ctx.params;

    if (getBackendApiUrl()) {
      const response = await fetchBackendAdminApi(`/blog-posts/${id}`, {
        method: 'DELETE',
      });
      const result = (await response.json()) as { error?: { message?: string } };

      if (!response.ok) {
        return NextResponse.json(
          { error: result.error?.message ?? 'No fue posible eliminar el artículo en MariaDB.' },
          { status: response.status }
        );
      }

      return NextResponse.json({ success: true });
    }

    await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin blog delete error:', error);
    return NextResponse.json({ error: 'No fue posible eliminar el artículo.' }, { status: 500 });
  }
}
