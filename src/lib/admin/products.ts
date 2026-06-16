import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { normalizeTags } from '@/lib/tags';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function parseNumber(value: FormDataEntryValue | null) {
  if (typeof value !== 'string' || !value.trim()) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function parseJsonArray(value: FormDataEntryValue | null) {
  if (typeof value !== 'string' || !value.trim()) {
    return [];
  }

  const parsed = JSON.parse(value);
  return Array.isArray(parsed) ? parsed : [];
}

export async function storeProductImages(files: File[]) {
  const uploadDirectory = path.join(process.cwd(), 'public', 'uploads', 'products');
  await mkdir(uploadDirectory, { recursive: true });

  const storedImages: string[] = [];

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      throw new Error(`Formato no permitido: ${file.name}`);
    }

    if (file.size > MAX_IMAGE_SIZE) {
      throw new Error(`La imagen ${file.name} supera los 5MB permitidos.`);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${Date.now()}-${crypto.randomUUID()}.webp`;
    const outputPath = path.join(uploadDirectory, filename);

    await sharp(buffer)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outputPath);

    storedImages.push(`/uploads/products/${filename}`);
  }

  return storedImages;
}

type VariantInput = {
  sku?: string;
  size?: string;
  color?: string;
  stoneType?: string;
  stock?: number;
  price?: string;
};

export function buildProductPayload(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const basePrice = parseNumber(formData.get('basePrice'));
  const status = String(formData.get('status') ?? 'DRAFT');
  const shippingMode = String(formData.get('shippingMode') ?? 'FIXED');
  const shippingCost = shippingMode === 'FREE' ? 0 : parseNumber(formData.get('shippingCost'));
  const shippingNotes = String(formData.get('shippingNotes') ?? '').trim() || null;
  const tags = normalizeTags(parseJsonArray(formData.get('tags')));
  const retainedImages = parseJsonArray(formData.get('retainedImages')).filter(
    (image): image is string => typeof image === 'string' && image.trim().length > 0
  );
  const rawVariants = parseJsonArray(formData.get('variants')) as VariantInput[];
  const imageFiles = formData
    .getAll('images')
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  const variants = rawVariants
    .map((variant) => {
      const stock = Number(variant.stock ?? 0);
      const rawPrice = String(variant.price ?? '').trim();
      const price = rawPrice ? Number(rawPrice) : null;

      return {
        sku: String(variant.sku ?? '').trim(),
        size: String(variant.size ?? '').trim() || null,
        color: String(variant.color ?? '').trim() || null,
        stoneType: String(variant.stoneType ?? '').trim() || null,
        stock,
        price,
      };
    })
    .filter((variant) => variant.sku);

  return {
    name,
    description,
    basePrice,
    status,
    shippingMode,
    shippingCost,
    shippingNotes,
    tags,
    retainedImages,
    variants,
    imageFiles,
  };
}

export function validateProductPayload(payload: ReturnType<typeof buildProductPayload>) {
  if (!payload.name || !payload.description || Number.isNaN(payload.basePrice) || payload.basePrice <= 0) {
    return 'Nombre, descripción y precio base son obligatorios.';
  }

  if (!['PUBLISHED', 'DRAFT', 'UNPUBLISHED'].includes(payload.status)) {
    return 'Estado del producto inválido.';
  }

  if (!['FIXED', 'FREE'].includes(payload.shippingMode)) {
    return 'Modo de envío inválido.';
  }

  if (payload.shippingMode === 'FIXED' && (Number.isNaN(payload.shippingCost) || payload.shippingCost < 0)) {
    return 'El costo de envío fijo debe ser válido.';
  }

  if (payload.variants.length === 0) {
    return 'Agrega al menos una variante con SKU.';
  }

  if (payload.variants.some((variant) => !Number.isFinite(variant.stock) || variant.stock < 0)) {
    return 'El stock de las variantes debe ser un número válido mayor o igual a cero.';
  }

  if (
    payload.variants.some(
      (variant) => variant.price !== null && (!Number.isFinite(variant.price) || variant.price < 0)
    )
  ) {
    return 'El precio opcional de las variantes debe ser un número válido mayor o igual a cero.';
  }

  if (new Set(payload.variants.map((variant) => variant.sku)).size !== payload.variants.length) {
    return 'No repitas SKUs dentro del mismo producto.';
  }

  return null;
}
