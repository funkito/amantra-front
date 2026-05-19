import { cache } from 'react';
import type { CatalogProduct } from '@/lib/catalog/types';
import { fetchBackendApi, getBackendApiUrl, resolveBackendAssetUrl } from '@/lib/backend-api';
import { prisma } from '@/lib/prisma';
import { buildProductPublicUrl } from '@/lib/social/share';

const accentPalette = [
  'from-amber-500/80 via-orange-500/50 to-stone-950',
  'from-rose-400/80 via-fuchsia-500/40 to-stone-950',
  'from-emerald-400/80 via-lime-500/40 to-stone-950',
  'from-sky-400/80 via-cyan-500/40 to-stone-950',
  'from-yellow-300/80 via-amber-600/40 to-stone-950',
  'from-violet-400/70 via-purple-500/35 to-stone-950',
];

function selectAccent(seed: string) {
  const total = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return accentPalette[total % accentPalette.length];
}

function formatShipping(cost?: number) {
  if (!cost || cost <= 0) {
    return 'Envío gratis';
  }

  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(cost);

  return `Envío fijo ${formatted}`;
}

type BackendTag = {
  id: number;
  name: string;
  slug: string;
};

type BackendProduct = {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
  images: Array<{
    id: number;
    url: string;
    isPrimary: boolean;
    orderIndex: number;
  }>;
  tags: BackendTag[];
  relatedProducts?: BackendProduct[];
  relatedPosts?: Array<{
    id: number;
    slug: string;
    title: string;
    excerpt: string;
    coverImage: string | null;
    createdAt: string;
    tags: BackendTag[];
  }>;
};

export interface PublicProduct extends CatalogProduct {
  shippingMode: 'FIXED' | 'FREE';
  shippingCost: number;
  shippingNotes: string | null;
  tags: string[];
  images: string[];
  variants: Array<{
    id: string;
    sku: string;
    size: string | null;
    color: string | null;
    stoneType: string | null;
    stock: number;
    price: number | null;
  }>;
}

function mapBackendProduct(product: BackendProduct): PublicProduct {
  const tagNames = product.tags.map((tag) => tag.name);
  const images = product.images
    .slice()
    .sort((left, right) => {
      if (left.isPrimary !== right.isPrimary) {
        return left.isPrimary ? -1 : 1;
      }

      return left.orderIndex - right.orderIndex;
    })
    .map((image) => resolveBackendAssetUrl(image.url) || image.url);
  const shippingCost = 0;
  const shippingMode: 'FIXED' | 'FREE' = shippingCost > 0 ? 'FIXED' : 'FREE';

  return {
    id: String(product.id),
    slug: product.slug,
    name: product.title,
    description: product.description,
    origin: 'Amantra',
    category: tagNames[0] ?? 'Colección Amantra',
    imageLabel: product.title.split(' ').slice(0, 2).join(' '),
    price: Number(product.price),
    accent: selectAccent(product.slug),
    notes: [
      formatShipping(shippingCost),
      ...(tagNames.length > 0 ? [tagNames[0]] : []),
      product.stock > 0 ? `Stock ${product.stock}` : 'Sin stock',
    ].slice(0, 3),
    imageUrl: images[0] ?? null,
    productUrl: buildProductPublicUrl(product.slug),
    shippingLabel: formatShipping(shippingCost),
    shippingMode,
    shippingCost,
    shippingNotes: null,
    tags: tagNames,
    images,
    variants: [],
  };
}

type BackendListResponse = {
  items: BackendProduct[];
  tags: BackendTag[];
};

type LocalProduct = Awaited<ReturnType<typeof getLocalPublishedProducts>>[number];

function mapLocalProduct(product: LocalProduct): PublicProduct {
  const tagNames = product.tags.map((tag) => tag.name);
  const shippingCost = product.shippingMode === 'FIXED' ? product.shippingCost : 0;
  const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);

  return {
    id: product.id,
    slug: product.id,
    name: product.name,
    description: product.description,
    origin: 'Amantra',
    category: tagNames[0] ?? 'Colección Amantra',
    imageLabel: product.name.split(' ').slice(0, 2).join(' '),
    price: product.basePrice,
    accent: selectAccent(product.id),
    notes: [
      formatShipping(shippingCost),
      ...(tagNames.length > 0 ? [tagNames[0]] : []),
      totalStock > 0 ? `Stock ${totalStock}` : 'Sin stock',
    ].slice(0, 3),
    imageUrl: (product.images as string[])?.[0] ?? null,
    productUrl: buildProductPublicUrl(product.id),
    shippingLabel: formatShipping(shippingCost),
    shippingMode: product.shippingMode,
    shippingCost,
    shippingNotes: product.shippingNotes,
    tags: tagNames,
    images: product.images,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      stoneType: variant.stoneType,
      stock: variant.stock,
      price: variant.price,
    })),
  };
}

const getLocalPublishedProducts = cache(async () => {
  return prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      tags: true,
      variants: true,
    },
  });
});

async function getLocalCatalogList({
  tags = [],
  query,
}: {
  tags?: string[];
  query?: string;
}): Promise<BackendListResponse> {
  const products = await getLocalPublishedProducts();
  const normalizedTags = tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean);
  const normalizedQuery = query?.trim().toLowerCase() ?? '';

  const filteredProducts = products.filter((product) => {
    const productTagNames = product.tags.map((tag) => tag.name);
    const matchesTags =
      normalizedTags.length === 0 ||
      normalizedTags.every((tag) => productTagNames.some((productTag) => productTag.toLowerCase() === tag));

    const searchableText = [product.name, product.description, ...productTagNames].join(' ').toLowerCase();
    const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);

    return matchesTags && matchesQuery;
  });

  return {
    items: filteredProducts.map((product, index) => ({
      id: index + 1,
      slug: product.id,
      title: product.name,
      description: product.description,
      price: product.basePrice,
      stock: product.variants.reduce((sum, variant) => sum + variant.stock, 0),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      images: product.images.map((url, index) => ({
        id: index + 1,
        url,
        isPrimary: index === 0,
        orderIndex: index,
      })),
      tags: product.tags.map((tag, index) => ({
        id: index + 1,
        name: tag.name,
        slug: tag.name.toLowerCase(),
      })),
    })),
    tags: Array.from(new Set(products.flatMap((product) => product.tags.map((tag) => tag.name))))
      .sort((left, right) => left.localeCompare(right, 'es'))
      .map((name, index) => ({
        id: index + 1,
        name,
        slug: name.toLowerCase(),
      })),
  };
}

const fetchCatalogList = cache(
  async ({
    tags = [],
    query,
  }: {
    tags?: string[];
    query?: string;
  }): Promise<BackendListResponse> => {
    try {
      const backendApiUrl = getBackendApiUrl();

      if (!backendApiUrl) {
        return getLocalCatalogList({ tags, query });
      }

      const params = new URLSearchParams();

      for (const tag of tags) {
        params.append('tags', tag);
      }

      if (query?.trim()) {
        params.set('query', query.trim());
      }

      const suffix = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`${backendApiUrl}/public/products${suffix}`, {
        cache: 'no-store',
      });
      const payload = (await response.json()) as {
        data?: BackendProduct[];
        tags?: BackendTag[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || 'No fue posible cargar el catálogo público');
      }

      return {
        items: payload.data ?? [],
        tags: payload.tags ?? [],
      };
    } catch (error) {
      console.warn('Falling back to local product catalog because backend API is unavailable.', error);
      return getLocalCatalogList({ tags, query });
    }
  }
);

export const getPublishedCatalogProducts = cache(async (): Promise<PublicProduct[]> => {
  const result = await fetchCatalogList({});
  return result.items.map(mapBackendProduct);
});

export const getPublishedCatalogProductsFiltered = cache(
  async ({
    tags = [],
    query,
  }: {
    tags?: string[];
    query?: string;
  }): Promise<PublicProduct[]> => {
    const result = await fetchCatalogList({ tags, query });
    return result.items.map(mapBackendProduct);
  }
);

export const getPublishedCatalogProductsByTag = cache(async (tag?: string): Promise<PublicProduct[]> => {
  return getPublishedCatalogProductsFiltered({ tags: tag ? [tag] : [] });
});

export const getPublishedCatalogTags = cache(async () => {
  const result = await fetchCatalogList({});
  return result.tags.map((tag) => tag.name);
});

export const getPublishedProductById = cache(async (slug: string): Promise<PublicProduct | null> => {
  try {
    const product = await fetchBackendApi<BackendProduct>(`/public/products/${encodeURIComponent(slug)}`);
    return mapBackendProduct(product);
  } catch {
    const localProduct = await prisma.product.findFirst({
      where: {
        id: slug,
        status: 'PUBLISHED',
        deletedAt: null,
      },
      include: {
        tags: true,
        variants: true,
      },
    });

    return localProduct ? mapLocalProduct(localProduct) : null;
  }
});

export const getRelatedProductsByTags = cache(
  async (productId: string | null, tags: string[], limit = 3): Promise<PublicProduct[]> => {
    const products = await getPublishedCatalogProductsFiltered({ tags });

    return products
      .filter((product) => !productId || product.id !== productId)
      .slice(0, limit);
  }
);
