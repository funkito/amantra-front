import { sanitizeBlogHtml, stripHtmlToText } from '@/lib/content/blog-rich-text';

function slugifySegment(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeBlogSlug(value: string) {
  return slugifySegment(value);
}

export function normalizeBlogTags(value: string | string[]) {
  const rawTags = Array.isArray(value) ? value : value.split(',');
  const unique = new Set<string>();

  for (const tag of rawTags) {
    const normalized = slugifySegment(tag).replace(/-/g, ' ');
    if (normalized) {
      unique.add(normalized);
    }
  }

  return Array.from(unique);
}

export type BlogAccessType = 'PUBLIC' | 'PAID_WORKSHOP';

interface BlogPayload {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage?: string;
  tags: string[];
  accessType: BlogAccessType;
  workshopPrice: number | null;
}

export function normalizeBlogAccessType(value: unknown, tags: string[]): BlogAccessType {
  const hasWorkshopTag = tags.some((tag) => tag.trim().toLowerCase() === 'talleres online');
  return value === 'PAID_WORKSHOP' || hasWorkshopTag ? 'PAID_WORKSHOP' : 'PUBLIC';
}

export function normalizeWorkshopPrice(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const price = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(price) ? price : null;
}

export function validateBlogPayload(payload: BlogPayload) {
  if (!payload.title.trim()) {
    return 'El título es obligatorio.';
  }

  if (!payload.slug.trim()) {
    return 'El slug es obligatorio.';
  }

  if (!payload.excerpt.trim()) {
    return 'El extracto es obligatorio.';
  }

  if (!stripHtmlToText(payload.body).trim()) {
    return 'El contenido del artículo es obligatorio.';
  }

  if (payload.accessType === 'PAID_WORKSHOP' && (!payload.workshopPrice || payload.workshopPrice <= 0)) {
    return 'El precio del taller debe ser mayor que cero.';
  }

  return null;
}

export function buildBlogContentData(payload: BlogPayload) {
  return {
    excerpt: payload.excerpt.trim(),
    coverImage: payload.coverImage?.trim() ?? '',
    body: sanitizeBlogHtml(payload.body),
    tags: payload.tags,
    accessType: payload.accessType,
    workshopPrice: payload.accessType === 'PAID_WORKSHOP' ? payload.workshopPrice : null,
  };
}
