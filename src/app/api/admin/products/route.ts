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

    // 1. Parsear imágenes de forma segura (si vienen como string JSON corrupto o vacío)
    let safeImages: any = [];
    if (payload.images) {
      if (typeof payload.images === 'string') {
        try {
          safeImages = JSON.parse(payload.images);
        } catch {
          safeImages = [];
        }
      } else if (Array.isArray(payload.images)) {
        safeImages = payload.images;
      }
    }

    // 2. Resolver los tags para que no rompan el JSON
    // Tu esquema dice que tags se conecta con un modelo de relación (Tag[])
    // Si viene texto o un formato extraño, lo procesamos de manera segura
    let tagConnect: any = [];
    if (Array.isArray(payload.tags)) {
      tagConnect = payload.tags.map((t: any) => ({
        where: { name: typeof t === 'string' ? t : t.name },
        create: { name: typeof t === 'string' ? t : t.name }
      }));
    }

    // 3. Guardar el producto directo en Railway usando Prisma
    const product = await prisma.product.create({
      data: {
        name: payload.name,
        description: payload.description,
        basePrice: Number(payload.basePrice) || 0,
        status: payload.status || 'DRAFT',
        images: safeImages, // Inyecta el array ya limpiado y validado
        variants: {
          create: payload.variants?.map((v: any) => ({
            sku: v.sku,
            size: v.talla || null,
            color: v.color || null,
            stock: Number(v.stock) || 0,
            price: Number(v.price) || Number(payload.basePrice) || 0,
          })) || []
        },
        // Conexión de relación muchos a muchos para Tags según tu schema
        ...(tagConnect.length > 0 && {
          tags: {
            connectOrCreate: tagConnect
          }
        })
      },
      include: {
        variants: true,
        tags: true
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