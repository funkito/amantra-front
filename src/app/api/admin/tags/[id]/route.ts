import { NextResponse } from 'next/server';
import { fetchBackendAdminApi } from '@/lib/admin/backend-admin-api';
import { getSessionFromCookies, isAdminRole } from '@/lib/auth/session';

async function authorizeTagsManager() {
  const session = await getSessionFromCookies();
  return session && isAdminRole(session.role) ? session : null;
}

export async function PATCH(request: Request, ctx: RouteContext<'/api/admin/tags/[id]'>) {
  const session = await authorizeTagsManager();

  if (!session) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const body = (await request.json()) as { name?: string };
  const response = await fetchBackendAdminApi(`/tags/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: body.name }),
  });
  const payload = (await response.json()) as { data?: unknown; error?: { message?: string } };

  if (!response.ok) {
    return NextResponse.json(
      { error: payload.error?.message ?? 'No fue posible actualizar la etiqueta.' },
      { status: response.status }
    );
  }

  return NextResponse.json({ success: true, tag: payload.data });
}

export async function DELETE(_request: Request, ctx: RouteContext<'/api/admin/tags/[id]'>) {
  const session = await authorizeTagsManager();

  if (!session) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const { id } = await ctx.params;
  const response = await fetchBackendAdminApi(`/tags/${id}`, {
    method: 'DELETE',
  });
  const payload = (await response.json()) as { error?: { message?: string } };

  if (!response.ok) {
    return NextResponse.json(
      { error: payload.error?.message ?? 'No fue posible eliminar la etiqueta.' },
      { status: response.status }
    );
  }

  return NextResponse.json({ success: true });
}
