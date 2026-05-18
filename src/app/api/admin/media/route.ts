import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { getSessionFromCookies } from '@/lib/auth/session';
import { storeBuilderMediaImages } from '@/lib/admin/media';
import { prisma } from '@/lib/prisma';

async function authorizeMediaManager() {
  const session = await getSessionFromCookies();

  if (!session || !['SUPERADMIN', 'EDITOR'].includes(session.role)) {
    return null;
  }

  return session;
}

export async function GET() {
  try {
    const session = await authorizeMediaManager();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    const builderUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'media');
    const localFiles = await readdir(uploadsDir).catch(() => []);
    const builderFiles = await readdir(builderUploadsDir).catch(() => []);

    const localMedia = localFiles
      .filter((fileName) => /\.(png|jpe?g|webp)$/i.test(fileName))
      .map((fileName) => ({
        id: `upload:${fileName}`,
        label: fileName,
        url: `/uploads/products/${fileName}`,
        source: 'uploads',
      }));

    const builderMedia = builderFiles
      .filter((fileName) => /\.(png|jpe?g|webp)$/i.test(fileName))
      .map((fileName) => ({
        id: `builder:${fileName}`,
        label: fileName,
        url: `/uploads/media/${fileName}`,
        source: 'builder',
      }));

    const productImages = await prisma.product.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        images: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    const catalogMedia = productImages.flatMap((product) =>
      product.images.map((imageUrl, index) => ({
        id: `product:${product.id}:${index}`,
        label: `${product.name} ${index + 1}`,
        url: imageUrl,
        source: 'products',
      }))
    );

    const uniqueMedia = [...builderMedia, ...localMedia, ...catalogMedia].filter(
      (item, index, array) => array.findIndex((candidate) => candidate.url === item.url) === index
    );

    return NextResponse.json({ media: uniqueMedia });
  } catch (error) {
    console.error('Admin media fetch error:', error);
    return NextResponse.json({ error: 'No fue posible cargar la librería de medios.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await authorizeMediaManager();

    if (!session) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const formData = await request.formData();
    const imageFiles = formData
      .getAll('images')
      .filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (imageFiles.length === 0) {
      return NextResponse.json({ error: 'Debes seleccionar al menos una imagen.' }, { status: 400 });
    }

    const uploadedUrls = await storeBuilderMediaImages(imageFiles);
    const media = uploadedUrls.map((url, index) => ({
      id: `builder-upload:${Date.now()}:${index}`,
      label: url.split('/').at(-1) ?? `media-${index + 1}`,
      url,
      source: 'builder',
    }));

    return NextResponse.json({ success: true, media });
  } catch (error) {
    console.error('Admin media upload error:', error);
    const message = error instanceof Error ? error.message : 'No fue posible subir la imagen.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
