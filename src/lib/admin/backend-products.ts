import { fetchBackendAdminApi } from '@/lib/admin/backend-admin-api';

type BackendTag = {
  name: string;
};

type BackendImage = {
  url: string;
};

type BackendProduct = {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  status: 'draft' | 'published' | 'unpublished';
  slug: string;
  createdAt: string;
  images: BackendImage[];
  tags: BackendTag[];
};

type BackendProductsResponse = {
  data?: BackendProduct[];
};

type BackendProductResponse = {
  data?: BackendProduct;
};

export type AdminBackendProductRow = {
  id: string;
  name: string;
  description: string;
  status: 'PUBLISHED' | 'DRAFT' | 'UNPUBLISHED';
  basePrice: number;
  shippingMode: 'FIXED' | 'FREE';
  shippingCost: number;
  images: string[];
  variantCount: number;
  tagNames: string[];
  createdAt: string;
};

export type AdminBackendProductFormData = {
  id?: string;
  name: string;
  description: string;
  basePrice: string;
  status: 'PUBLISHED' | 'DRAFT' | 'UNPUBLISHED';
  shippingMode: 'FIXED' | 'FREE';
  shippingCost: string;
  shippingNotes: string;
  tags: string[];
  images: string[];
  variants: Array<{
    sku: string;
    size: string;
    color: string;
    stoneType: string;
    stock: number;
    price: string;
  }>;
};

function mapBackendStatus(status: BackendProduct['status']) {
  if (status === 'published') {
    return 'PUBLISHED' as const;
  }

  if (status === 'unpublished') {
    return 'UNPUBLISHED' as const;
  }

  return 'DRAFT' as const;
}

function mapBackendProduct(product: BackendProduct): AdminBackendProductRow {
  return {
    id: String(product.id),
    name: product.title,
    description: product.description,
    status: mapBackendStatus(product.status),
    basePrice: Number(product.price),
    shippingMode: 'FREE',
    shippingCost: 0,
    images: product.images.map((image) => image.url),
    variantCount: 1,
    tagNames: product.tags.map((tag) => tag.name),
    createdAt: product.createdAt,
  };
}

export async function getAdminProductsFromBackend() {
  const response = await fetchBackendAdminApi('/products?limit=50');

  if (!response.ok) {
    throw new Error('No fue posible cargar productos desde MariaDB.');
  }

  const payload = (await response.json()) as BackendProductsResponse;
  return (payload.data ?? []).map(mapBackendProduct);
}

export async function getAdminProductFromBackend(productId: string): Promise<AdminBackendProductFormData | null> {
  const response = await fetchBackendAdminApi(`/products/${productId}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('No fue posible cargar el producto desde MariaDB.');
  }

  const payload = (await response.json()) as BackendProductResponse;
  const product = payload.data;

  if (!product) {
    return null;
  }

  return {
    id: String(product.id),
    name: product.title,
    description: product.description,
    basePrice: String(product.price),
    status: mapBackendStatus(product.status),
    shippingMode: 'FREE',
    shippingCost: '0',
    shippingNotes: '',
    tags: product.tags.map((tag) => tag.name),
    images: product.images.map((image) => image.url),
    variants: [
      {
        sku: product.slug || `producto-${product.id}`,
        size: '',
        color: '',
        stoneType: '',
        stock: product.stock,
        price: String(product.price),
      },
    ],
  };
}
