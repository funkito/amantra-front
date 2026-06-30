import sharp from 'sharp';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

export const MAX_MEDIA_IMAGE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_MEDIA_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

function uploadImageBuffer(buffer: Buffer, fileName: string) {
  if (!process.env.CLOUDINARY_URL) {
    throw new Error('Cloudinary no está configurado. Define CLOUDINARY_URL para subir imágenes.');
  }

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'amantra_media',
        public_id: `${Date.now()}-${fileName.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-_]/gi, '-')}`,
        resource_type: 'image',
        format: 'webp',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error('Cloudinary no devolvió una respuesta válida.'));
          return;
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });
}

export async function storeBuilderMediaImages(files: File[]) {
  const storedImages: string[] = [];

  for (const file of files) {
    if (!ALLOWED_MEDIA_IMAGE_TYPES.has(file.type)) {
      throw new Error(`Formato no permitido: ${file.name}`);
    }

    if (file.size > MAX_MEDIA_IMAGE_SIZE) {
      throw new Error(`La imagen ${file.name} supera los 5MB permitidos.`);
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const optimizedBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer();

    const uploadResult = await uploadImageBuffer(optimizedBuffer, file.name);

    if (!uploadResult.secure_url) {
      throw new Error(`Cloudinary no devolvió URL segura para ${file.name}.`);
    }

    storedImages.push(uploadResult.secure_url);
  }

  return storedImages;
}
