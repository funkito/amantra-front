import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getSessionFromCookies } from '@/lib/auth/session';

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

export async function POST() {
  try {
    const session = await getSessionFromCookies();

    if (!session || !['SUPERADMIN', 'EDITOR'].includes(session.role)) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
    }

    configureCloudinary();
    const config = cloudinary.config();
    const cloudName = config.cloud_name;
    const apiKey = config.api_key;
    const apiSecret = config.api_secret;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'La configuración de Cloudinary está incompleta.' }, { status: 500 });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'amantra/workshops';
    const publicId = crypto.randomUUID();
    const signature = cloudinary.utils.api_sign_request(
      {
        folder,
        public_id: publicId,
        timestamp,
      },
      apiSecret
    );

    return NextResponse.json({
      cloudName,
      apiKey,
      timestamp,
      folder,
      publicId,
      signature,
    });
  } catch (error) {
    console.error('Workshop video signature error:', error);
    return NextResponse.json({ error: 'No fue posible preparar la subida del video.' }, { status: 500 });
  }
}