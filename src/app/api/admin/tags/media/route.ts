import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getSessionFromCookies, isAdminRole } from '@/lib/auth/session';

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

async function uploadTagImageToCloudinary(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'amantra/tags',
        resource_type: 'image',
        overwrite: false,
        transformation: [
          { width: 1000, height: 520, crop: 'fill', gravity: 'auto' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
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

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies();

    if (!session || !isAdminRole(session.role)) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image');

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'Debes seleccionar una imagen.' }, { status: 400 });
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return NextResponse.json({ error: 'Formato no permitido. Usa JPG, PNG o WEBP.' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'La imagen supera los 5MB permitidos.' }, { status: 400 });
    }

    configureCloudinary();
    const url = await uploadTagImageToCloudinary(file);

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Admin tag image upload error:', error);
    const message = error instanceof Error ? error.message : 'No fue posible subir la imagen de la etiqueta.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
