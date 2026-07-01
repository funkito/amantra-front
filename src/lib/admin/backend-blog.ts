import { fetchBackendAdminApi } from '@/lib/admin/backend-admin-api';
import { resolveBackendAssetUrl } from '@/lib/backend-api';

type BackendBlogTag = {
  name: string;
};

type BackendBlogPost = {
  id: number;
  title: string;
  slug: string;
  content: Record<string, unknown>;
  status: 'draft' | 'published';
  createdAt: string;
  author?: {
    name?: string | null;
    email?: string | null;
  };
  tags: BackendBlogTag[];
};

type BackendBlogListResponse = {
  data?: BackendBlogPost[];
};

type BackendBlogPostResponse = {
  data?: BackendBlogPost;
};

export type AdminBackendBlogRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  published: boolean;
  createdAt: string;
  authorName: string;
};

export type AdminBackendBlogFormData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImage: string;
  videoUrl: string;
  tags: string[];
  published: boolean;
  accessType: 'PUBLIC' | 'PAID_WORKSHOP';
  workshopPrice: number | null;
};

function getStringField(content: Record<string, unknown>, field: 'excerpt' | 'body' | 'coverImage' | 'videoUrl') {
  const value = content[field];
  return typeof value === 'string' ? value : '';
}

function getWorkshopSettings(content: Record<string, unknown>) {
  const accessType = content.accessType === 'PAID_WORKSHOP' ? 'PAID_WORKSHOP' : 'PUBLIC';
  const rawPrice = content.workshopPrice;
  const workshopPrice =
    typeof rawPrice === 'number' && Number.isFinite(rawPrice)
      ? rawPrice
      : typeof rawPrice === 'string' && rawPrice.trim() && Number.isFinite(Number(rawPrice))
        ? Number(rawPrice)
        : null;

  return { accessType, workshopPrice } as const;
}

function blocksToPlainBody(content: Record<string, unknown>) {
  const directBody = getStringField(content, 'body');

  if (directBody) {
    return directBody;
  }

  const blocks = Array.isArray(content.blocks) ? content.blocks : [];
  return blocks
    .map((block) => {
      if (!block || typeof block !== 'object') {
        return '';
      }

      const typedBlock = block as { data?: Record<string, unknown> };
      const text = typedBlock.data?.text;
      return typeof text === 'string' ? text : '';
    })
    .filter(Boolean)
    .join('\n\n');
}

function mapBackendBlogPost(post: BackendBlogPost): AdminBackendBlogRow {
  return {
    id: String(post.id),
    title: post.title,
    slug: post.slug,
    excerpt: getStringField(post.content, 'excerpt'),
    tags: post.tags.map((tag) => tag.name),
    published: post.status === 'published',
    createdAt: post.createdAt,
    authorName: post.author?.name ?? post.author?.email ?? 'Amantra',
  };
}

export async function getAdminBlogPostsFromBackend() {
  const response = await fetchBackendAdminApi('/blog-posts?limit=50');

  if (!response.ok) {
    throw new Error('No fue posible cargar artículos desde MariaDB.');
  }

  const payload = (await response.json()) as BackendBlogListResponse;
  return (payload.data ?? []).map(mapBackendBlogPost);
}

export async function getAdminBlogPostFromBackend(postId: string): Promise<AdminBackendBlogFormData | null> {
  const response = await fetchBackendAdminApi(`/blog-posts/${postId}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('No fue posible cargar el artículo desde MariaDB.');
  }

  const payload = (await response.json()) as BackendBlogPostResponse;
  const post = payload.data;

  if (!post) {
    return null;
  }

  const workshopSettings = getWorkshopSettings(post.content);

  return {
    id: String(post.id),
    title: post.title,
    slug: post.slug,
    excerpt: getStringField(post.content, 'excerpt'),
    body: blocksToPlainBody(post.content),
    coverImage: resolveBackendAssetUrl(getStringField(post.content, 'coverImage')) || '',
    videoUrl: getStringField(post.content, 'videoUrl'),
    tags: post.tags.map((tag) => tag.name),
    published: post.status === 'published',
    accessType: workshopSettings.accessType,
    workshopPrice: workshopSettings.workshopPrice,
  };
}

