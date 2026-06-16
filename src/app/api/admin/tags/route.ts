import { NextResponse } from 'next/server';
import { fetchBackendAdminApi } from '@/lib/admin/backend-admin-api';
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

  const response = await fetchBackendAdminApi(
    `/tags?query=${encodeURIComponent(query)}&limit=${isAdminList ? '200' : '10'}`
  );
  const payload = (await response.json()) as {
    data?: Array<{ id: number; name: string; slug: string; _count?: { productTags?: number; blogTags?: number } }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    return NextResponse.json({ error: payload.error?.message ?? 'No fue posible cargar etiquetas.' }, { status: 500 });
  }

  if (isAdminList) {
    return NextResponse.json({
      tags: (payload.data ?? []).map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        productCount: tag._count?.productTags ?? 0,
        blogCount: tag._count?.blogTags ?? 0,
      })),
    });
  }

  return NextResponse.json({ tags: (payload.data ?? []).map((tag) => tag.name) });
}

export async function POST(request: Request) {
  const session = await getSessionFromCookies();

  if (!session || !isAdminRole(session.role)) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const body = (await request.json()) as { name?: string };
  const response = await fetchBackendAdminApi('/tags/upsert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: body.name }),
  });
  const payload = (await response.json()) as { data?: unknown; error?: { message?: string } };

  if (!response.ok) {
    return NextResponse.json(
      { error: payload.error?.message ?? 'No fue posible crear la etiqueta.' },
      { status: response.status }
    );
  }

  return NextResponse.json({ success: true, tag: payload.data });
}
