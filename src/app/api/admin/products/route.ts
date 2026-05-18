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

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies();

    if (!session || !['SUPERADMIN', 'EDITOR'].includes(session.role)) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const formData = await request.formData();
    const payload = buildProductPayload(formData);
    const validationError = validateProductPayload(payload);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (payload.imageFiles.length === 0) {
      return NextResponse.json({ error: 'Debes subir al menos una imagen.' }, { status: 400 });
    }

    const images = await uploadProductImagesToBackend(payload.imageFiles);
    const totalStock = payload.variants.reduce((sum, variant) => sum + Math.max(0, Number(variant.stock) || 0), 0);

    const response = await fetchBackendAdminApi('/products', {
      method: 'POST',
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
        { error: result.error?.message ?? 'No fue posible guardar el producto en MariaDB.' },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, product: result.data });
  } catch (error) {
    console.error('Admin product creation error:', error);
    const message = error instanceof Error ? error.message : 'No fue posible guardar el producto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
