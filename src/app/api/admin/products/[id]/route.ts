import { NextResponse } from 'next/server';
import type { ProductStatus, ShippingMode } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';
import { getSessionFromCookies } from '@/lib/auth/session';
import { buildProductPayload, validateProductPayload } from '@/lib/admin/products';

export const runtime = 'nodejs';

// Configuración de Cloudinary con tus variables de entorno desglosadas
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Función auxiliar para subir las imágenes a Cloudinary de forma nativa
async function uploadToCloudinary(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'products' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url || '');
      }
    ).end(buffer);
  });
}

// Validador de sesión original del administrador
async function authorizeProductManager() {
  const session = await getSessionFromCookies();
  if (!session || !['SUPERADMIN', 'EDITOR'].includes(session.role)) {
    return null;
  }
  return session;
}

// 1. ENDPOINT PARA ACTUALIZAR / EDITAR / DESPUBLICAR (PATCH)
export async function PATCH(request: Request, ctx: any) {
  try {
    const session = await authorizeProductManager();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const { id } = await ctx.params;
    const contentType = request.headers.get('content-type') ?? '';

    // CASO A: Acción rápida por JSON (Ej: Despublicar desde la tabla)
    if (contentType.includes('application/json')) {
      const body = (await request.json()) as { action?: 'unpublish' };

      if (body.action === 'unpublish') {
        const updatedProduct = await prisma.product.update({
          where: { id },
          data: { status: 'UNPUBLISHED' },
        });
        return NextResponse.json({ success: true, product: updatedProduct });
      }
      return NextResponse.json({ error: 'Acción inválida.' }, { status: 400 });
    }

    // CASO B: Formulario completo de Edición (FormData con imágenes y variantes)
    const formData = await request.formData();
    const payload = buildProductPayload(formData);
    const validationError = validateProductPayload(payload);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Subir nuevas imágenes si se adjuntaron en el formulario
    const uploadedImages = await Promise.all(
      payload.imageFiles.map((file) => uploadToCloudinary(file))
    );
    const images = [...payload.retainedImages, ...uploadedImages];

    if (images.length === 0) {
      return NextResponse.json({ error: 'Debes mantener o subir al menos una imagen.' }, { status: 400 });
    }

    // 🔥 PASO CLAVE: Borramos las variantes viejas primero para evitar colisiones de SKU único
    await prisma.productVariant.deleteMany({
      where: { productId: id }
    });

    // Actualizamos el producto de forma directa y limpia en Prisma
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: payload.name,
        description: payload.description,
        basePrice: payload.basePrice,
        status: payload.status as ProductStatus,
        shippingMode: payload.shippingMode as ShippingMode,
        shippingCost: payload.shippingCost,
        shippingNotes: payload.shippingNotes,
        images,
        variants: {
          create: payload.variants.map((variant) => ({
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            stoneType: variant.stoneType,
            stock: Number(variant.stock) || 0,
            price: Number(variant.price) || payload.basePrice,
          })),
        },
        ...(payload.tags && {
          tags: {
            set: [],
            connectOrCreate: payload.tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        }),
      },
      include: {
        variants: true,
        tags: true,
      },
    });

    return NextResponse.json({ success: true, product: updatedProduct }, { status: 200 });
  } catch (error) {
    console.error('Admin product update error:', error);
    const message = error instanceof Error ? error.message : 'No fue posible actualizar el producto.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 2. ENDPOINT PARA ELIMINAR UN PRODUCTO (DELETE)
export async function DELETE(_request: Request, ctx: any) {
  try {
    const session = await authorizeProductManager();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const { id } = await ctx.params;

    // Eliminamos el producto de la base de datos (Prisma limpia las relaciones en cascada si están configuradas)
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin product delete error:', error);
    return NextResponse.json({ error: 'No fue posible eliminar el producto.' }, { status: 500 });
  }
}