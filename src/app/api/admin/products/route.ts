import { fetchBackendAdminApi, uploadProductImagesToBackend } from '@/lib/admin/backend-admin-api';
import { getSessionFromCookies } from '@/lib/auth/session';
import { buildProductPayload, validateProductPayload } from '@/lib/admin/products';
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
    
    // 1. Calcular el stock total sumando las variantes
    const totalStock = payload.variants?.reduce((acc: number, v: any) => acc + (Number(v.stock) || 0), 0) || 0;

    // 2. Guardar el producto directo en Railway usando Prisma
    const product = await prisma.product.create({
      data: {
        title: payload.name,
        description: payload.description,
        price: payload.basePrice,
        stock: totalStock,
        status: payload.status || 'DRAFT',
        images: payload.images || [], 
        tags: payload.tags || [],
        variants: {
          create: payload.variants?.map((v: any) => ({
            sku: v.sku,
            size: v.talla,
            color: v.color,
            material: v.material,
            stock: Number(v.stock) || 0,
            price: Number(v.price) || payload.basePrice,
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