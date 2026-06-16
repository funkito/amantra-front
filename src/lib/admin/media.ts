import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

export const MAX_MEDIA_IMAGE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_MEDIA_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function storeBuilderMediaImages(files: File[]) {
  const uploadDirectory = path.join(process.cwd(), 'public', 'uploads', 'media');
  await mkdir(uploadDirectory, { recursive: true });

  const storedImages: string[] = [];

  for (const file of files) {
    if (!ALLOWED_MEDIA_IMAGE_TYPES.has(file.type)) {
      throw new Error(`Formato no permitido: ${file.name}`);
    }

    if (file.size > MAX_MEDIA_IMAGE_SIZE) {
      throw new Error(`La imagen ${file.name} supera los 5MB permitidos.`);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${crypto.randomUUID()}.webp`;
    const outputPath = path.join(uploadDirectory, filename);

    await sharp(buffer)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 84 })
      .toFile(outputPath);

    storedImages.push(`/uploads/media/${filename}`);
  }

  return storedImages;
}
