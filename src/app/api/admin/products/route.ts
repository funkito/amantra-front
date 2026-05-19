import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Asegúrate de que la ruta a tu cliente de prisma sea la correcta

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
    const payload = await request.json();

    // 1. Guardar el producto directo en Railway usando Prisma con los nombres reales del esquema
    const product = await prisma.product.create({
      data: {
        name: payload.name,
        description: payload.description,
        basePrice: Number(payload.basePrice) || 0, // Aseguramos que sea un número flotante
        status: payload.status || 'DRAFT',
        images: payload.images || [],
        // Mapeamos las variantes usando el nombre exacto del modelo: ProductVariant
        variants: {
          create: payload.variants?.map((v: any) => ({
            sku: v.sku,
            size: v.talla || null,  // Mapea 'talla' del formulario a 'size' del esquema
            color: v.color || null,
            stock: Number(v.stock) || 0,
            price: Number(v.price) || Number(payload.basePrice) || 0,
          })) || []
        }
      },
      include: {
        variants: true
      }
    });

    return NextResponse.json({ success: true, product: product });

  } catch (error: any) {
    console.error('Admin product creation error:', error);
    return NextResponse.json(
      { error: error.message || 'No fue posible guardar el producto.' }, 
      { status: 500 }
    );
  }
}