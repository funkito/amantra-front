import { pageBuilderDocumentSchema, type PageBuilderDocumentInput } from '@/lib/builder/page-schema';
import type { BuilderPageLibraryItem } from '@/lib/builder/types';

const LOCAL_FALLBACK_PREFIX = 'amantra-builder-fallback';

function getFallbackKey(slug: string) {
  return `${LOCAL_FALLBACK_PREFIX}:${slug}`;
}

export async function fetchBuilderDocument(slug: string) {
  const response = await fetch(`/api/admin/pages?slug=${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  });

  const data = (await response.json()) as { page?: PageBuilderDocumentInput | null; error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? 'No fue posible cargar la página.');
  }

  return data.page ? pageBuilderDocumentSchema.parse(data.page) : null;
}

export async function fetchBuilderPageLibrary() {
  const response = await fetch('/api/admin/pages', {
    cache: 'no-store',
  });

  const data = (await response.json()) as { pages?: BuilderPageLibraryItem[]; error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? 'No fue posible cargar la biblioteca de páginas.');
  }

  return data.pages ?? [];
}

export async function createBuilderPage(payload: {
  mode: 'blank' | 'duplicate';
  sourceSlug?: string;
  slug: string;
  title: string;
}) {
  const response = await fetch('/api/admin/pages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as { error?: string; slug?: string };

  if (!response.ok) {
    throw new Error(data.error ?? 'No fue posible crear la página.');
  }

  return data;
}

export async function fetchBuilderVersion(versionId: string) {
  const response = await fetch(`/api/admin/pages/versions/${encodeURIComponent(versionId)}`, {
    cache: 'no-store',
  });

  const data = (await response.json()) as {
    version?: { snapshot: PageBuilderDocumentInput };
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? 'No fue posible cargar la versión.');
  }

  if (!data.version) {
    throw new Error('La versión no trae snapshot.');
  }

  return pageBuilderDocumentSchema.parse(data.version.snapshot);
}

export async function saveBuilderDraft(document: PageBuilderDocumentInput) {
  const payload = pageBuilderDocumentSchema.parse(document);

  const response = await fetch('/api/admin/pages', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as { error?: string };

  if (!response.ok) {
    persistBuilderFallback(payload);
    throw new Error(data.error ?? 'No fue posible guardar la página.');
  }

  clearBuilderFallback(payload.slug);
  return response;
}

export function persistBuilderFallback(document: PageBuilderDocumentInput) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getFallbackKey(document.slug), JSON.stringify(document));
}

export function readBuilderFallback(slug: string) {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(getFallbackKey(slug));
  if (!rawValue) {
    return null;
  }

  try {
    return pageBuilderDocumentSchema.parse(JSON.parse(rawValue));
  } catch {
    return null;
  }
}

export function clearBuilderFallback(slug: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(getFallbackKey(slug));
}
