import { NextResponse } from 'next/server';
import type { ProductStatus, ShippingMode } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '@/lib/prisma';
import { buildProductPayload, validateProductPayload } from '@/lib/admin/products';

export const runtime = 'nodejs';

function configureCloudinary() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (!cloudinaryUrl) {
    throw new Error('CLOUDINARY_URL no está configurada en las variables de entorno.');
  }

  const parsedUrl = new URL(cloudinaryUrl);

  cloudinary.config({
    cloud_name: parsedUrl.hostname,
    api_key: decodeURIComponent(parsedUrl.username),
    api_secret: decodeURIComponent(parsedUrl.password),
    secure: true,
  });
}

async function uploadProductImageToCloudinary(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'amantra/products',
        resource_type: 'image',
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url) {
          reject(new Error(`Cloudinary no devolvió URL segura para ${file.name}.`));
          return;
        }

        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}

async function uploadProductImagesToCloudinary(files: File[]) {
  if (files.length === 0) {
    return [];
  }

  configureCloudinary();
  return Promise.all(files.map((file) => uploadProductImageToCloudinary(file)));
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const payload = buildProductPayload(formData);
    const validationError = validateProductPayload(payload);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const uploadedImages = await uploadProductImagesToCloudinary(payload.imageFiles);
    const images = [...payload.retainedImages, ...uploadedImages];

    if (images.length === 0) {
      return NextResponse.json(
        { error: 'Debes subir al menos una imagen.' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
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
            stock: variant.stock,
            price: variant.price,
          })),
        },
        ...(payload.tags.length > 0
          ? {
              tags: {
                connectOrCreate: payload.tags.map((tag) => ({
                  where: { name: tag },
                  create: { name: tag },
                })),
              },
            }
          : {}),
      },
      include: {
        variants: true,
        tags: true,
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('Admin product creation error:', error);
    const message =
      error instanceof Error ? error.message : 'No fue posible guardar el producto.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
