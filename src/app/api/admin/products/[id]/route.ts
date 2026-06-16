import { NextResponse } from 'next/server';
import { fetchBackendAdminApi, uploadProductImagesToBackend } from '@/lib/admin/backend-admin-api';
import { getSessionFromCookies } from '@/lib/auth/session';
import { buildProductPayload, validateProductPayload } from '@/lib/admin/products';

function mapStatus(status: 'PUBLISHED' | 'DRAFT' | 'UNPUBLISHED') {
  if (status === 'PUBLISHED') {
    return 'published';
  }

  if (status === 'UNPUBLISHED') {
    return 'unpublished';
  }

  return 'draft';
}

async function authorizeProductManager() {
  const session = await getSessionFromCookies();

  if (!session || !['SUPERADMIN', 'EDITOR'].includes(session.role)) {
    return null;
  }

  return session;
}

export async function PATCH(request: Request, ctx: RouteContext<'/api/admin/products/[id]'>) {
  try {
    const session = await authorizeProductManager();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const contentType = request.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
      const body = (await request.json()) as { action?: 'unpublish' };

      if (body.action === 'unpublish') {
        const response = await fetchBackendAdminApi(`/products/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'unpublished' }),
        });
        const result = (await response.json()) as { data?: unknown; error?: { message?: string } };

        if (!response.ok) {
          return NextResponse.json(
            { error: result.error?.message ?? 'No fue posible despublicar el producto.' },
            { status: response.status }
          );
        }

        return NextResponse.json({ success: true, product: result.data });
      }

      return NextResponse.json({ error: 'Acción inválida.' }, { status: 400 });
    }

    const formData = await request.formData();
    const payload = buildProductPayload(formData);
    const validationError = validateProductPayload(payload);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const newImages = await uploadProductImagesToBackend(payload.imageFiles);
    const images = [...payload.retainedImages, ...newImages];

    if (images.length === 0) {
      return NextResponse.json({ error: 'Debes mantener o subir al menos una imagen.' }, { status: 400 });
    }

    const totalStock = payload.variants.reduce((sum, variant) => sum + Math.max(0, Number(variant.stock) || 0), 0);
    const response = await fetchBackendAdminApi(`/products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: payload.name,
        description: payload.description,
        price: payload.basePrice,
        stock: totalStock,
        status: mapStatus(payload.status as 'PUBLISHED' | 'DRAFT' | 'UNPUBLISHED'),
        images: images.map((url, index) => ({
          url,
          isPrimary: index === 0,
          orderIndex: index,
        })),
        tags: payload.tags,
      }),
    });
    const result = (await response.json()) as { data?: unknown; error?: { message?: string } };

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error?.message ?? 'No fue posible actualizar el producto en MariaDB.' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, product: result.data });
  } catch (error) {
    console.error('Admin product update error:', error);
    const message = error instanceof Error ? error.message : 'No fue posible actualizar el producto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: RouteContext<'/api/admin/products/[id]'>) {
  try {
    const session = await authorizeProductManager();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const response = await fetchBackendAdminApi(`/products/${id}`, {
      method: 'DELETE',
    });
    const result = (await response.json()) as { error?: { message?: string } };

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error?.message ?? 'No fue posible eliminar el producto.' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin product delete error:', error);
    return NextResponse.json({ error: 'No fue posible eliminar el producto.' }, { status: 500 });
  }
}
