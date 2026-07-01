import { cache } from 'react';
import { fetchBackendAdminApi } from '@/lib/admin/backend-admin-api';
import { fetchBackendApi, getBackendApiUrl, resolveBackendAssetUrl } from '@/lib/backend-api';
import { normalizeBlogBodyMarkup } from '@/lib/content/blog-rich-text';
import { prisma } from '@/lib/prisma';

export interface PublicBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  videoUrl: string;
  body: string;
  tags: string[];
  accessType: 'PUBLIC' | 'PAID_WORKSHOP';
  workshopPrice: number | null;
  createdAt: string;
}

type BackendTag = {
  id: number;
  name: string;
  slug: string;
};

type BackendBlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  coverImage?: string | null;
  content: Record<string, unknown>;
  tags: BackendTag[];
  createdAt: string;
  relatedProducts?: unknown[];
  relatedPosts?: BackendBlogPost[];
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function blocksToHtml(content: Record<string, unknown>) {
  const blocks = Array.isArray(content.blocks) ? content.blocks : [];

  if (blocks.length === 0) {
    const directBody = typeof content.body === 'string' ? content.body : '';
    return normalizeBlogBodyMarkup(directBody);
  }

  const html = blocks
    .map((block) => {
      if (!block || typeof block !== 'object') {
        return '';
      }

      const typedBlock = block as { type?: string; data?: Record<string, unknown> };
      const text = typeof typedBlock.data?.text === 'string' ? typedBlock.data.text : '';
      const items = Array.isArray(typedBlock.data?.items)
        ? typedBlock.data.items.filter((item): item is string => typeof item === 'string')
        : [];

      switch (typedBlock.type) {
        case 'header': {
          const level = Math.min(3, Math.max(2, Number(typedBlock.data?.level ?? 2)));
          return `<h${level}>${escapeHtml(text)}</h${level}>`;
        }
        case 'list':
          return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
        case 'quote':
          return `<blockquote>${escapeHtml(text)}</blockquote>`;
        case 'paragraph':
        default:
          return `<p>${escapeHtml(text)}</p>`;
      }
    })
    .filter(Boolean)
    .join('');

  return normalizeBlogBodyMarkup(html);
}

function getPostField(content: unknown, field: 'excerpt' | 'coverImage' | 'videoUrl' | 'body') {
  if (!content || typeof content !== 'object') {
    return '';
  }

  const value = (content as Record<string, unknown>)[field];
  return typeof value === 'string' ? value : '';
}

function getWorkshopSettings(content: unknown) {
  if (!content || typeof content !== 'object') {
    return { accessType: 'PUBLIC' as const, workshopPrice: null };
  }

  const record = content as Record<string, unknown>;
  const accessType = record.accessType === 'PAID_WORKSHOP' ? 'PAID_WORKSHOP' : 'PUBLIC';
  const rawPrice = record.workshopPrice;
  const workshopPrice =
    typeof rawPrice === 'number' && Number.isFinite(rawPrice)
      ? rawPrice
      : typeof rawPrice === 'string' && rawPrice.trim() && Number.isFinite(Number(rawPrice))
        ? Number(rawPrice)
        : null;

  return { accessType, workshopPrice } as const;
}

function mapPostToPublicPost(post: BackendBlogPost): PublicBlogPost {
  const workshopSettings = getWorkshopSettings(post.content);

  return {
    id: String(post.id),
    slug: post.slug,
    title: post.title,
    excerpt:
      post.excerpt ||
      (typeof post.content.excerpt === 'string' ? post.content.excerpt : ''),
    coverImage:
      resolveBackendAssetUrl(
        post.coverImage ||
          (typeof post.content.coverImage === 'string' ? post.content.coverImage : '')
      ) ||
      '',
    videoUrl: getPostField(post.content, 'videoUrl'),
    body: blocksToHtml(post.content),
    tags: post.tags.map((tag) => tag.name),
    accessType: workshopSettings.accessType,
    workshopPrice: workshopSettings.workshopPrice,
    createdAt: post.createdAt,
  };
}

type BackendBlogListResponse = {
  items: BackendBlogPost[];
  tags: BackendTag[];
};

type LocalPost = Awaited<ReturnType<typeof getLocalPublishedPosts>>[number];

function mapLocalPostToPublicPost(post: LocalPost): PublicBlogPost {
  const contentSettings = getWorkshopSettings(post.content);
  const accessType = post.accessType ?? contentSettings.accessType;
  const workshopPrice = post.workshopPrice ?? contentSettings.workshopPrice;

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: getPostField(post.content, 'excerpt'),
    coverImage: getPostField(post.content, 'coverImage'),
    videoUrl: getPostField(post.content, 'videoUrl'),
    body: normalizeBlogBodyMarkup(getPostField(post.content, 'body')),
    tags: getPostTags(post.content),
    accessType,
    workshopPrice,
    createdAt: post.createdAt.toISOString(),
  };
}

const getLocalPublishedPosts = cache(async () => {
  return prisma.post.findMany({
    where: {
      published: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      slug: true,
      title: true,
      content: true,
      accessType: true,
      workshopPrice: true,
      createdAt: true,
    },
  });
});

async function getLocalBlogList(tag?: string): Promise<BackendBlogListResponse> {
  const posts = await getLocalPublishedPosts();
  const normalizedTag = tag?.trim().toLowerCase();
  const filteredPosts = normalizedTag
    ? posts.filter((post) => getPostTags(post.content).some((item) => item.toLowerCase() === normalizedTag))
    : posts;
  const allTags = Array.from(new Set(posts.flatMap((post) => getPostTags(post.content)))).sort((left, right) =>
    left.localeCompare(right, 'es')
  );

  return {
    items: filteredPosts.map((post, index) => ({
      id: index + 1,
      slug: post.slug,
      title: post.title,
      excerpt: getPostField(post.content, 'excerpt'),
      coverImage: getPostField(post.content, 'coverImage'),
      content: {
        ...(typeof post.content === 'object' && post.content ? (post.content as Record<string, unknown>) : {}),
        accessType: post.accessType,
        workshopPrice: post.workshopPrice,
      },
      tags: getPostTags(post.content).map((name, tagIndex) => ({
        id: index * 100 + tagIndex + 1,
        name,
        slug: name.toLowerCase(),
      })),
      createdAt: post.createdAt.toISOString(),
    })),
    tags: allTags.map((name, index) => ({
      id: index + 1,
      name,
      slug: name.toLowerCase(),
    })),
  };
}

const fetchBlogList = cache(
  async (tag?: string): Promise<BackendBlogListResponse> => {
    try {
      const backendApiUrl = getBackendApiUrl();

      if (!backendApiUrl) {
        return getLocalBlogList(tag);
      }

      const params = new URLSearchParams();

      if (tag?.trim()) {
        params.append('tags', tag.trim());
      }

      const suffix = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`${backendApiUrl}/public/blog-posts${suffix}`, {
        cache: 'no-store',
      });
      const payload = (await response.json()) as {
        data?: BackendBlogPost[];
        tags?: BackendTag[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || 'No fue posible cargar el blog público');
      }

      return {
        items: payload.data ?? [],
        tags: payload.tags ?? [],
      };
    } catch (error) {
      console.warn('Falling back to local blog content because backend API is unavailable.', error);
      return getLocalBlogList(tag);
    }
  }
);

export const getPublishedBlogPosts = cache(async (tag?: string): Promise<PublicBlogPost[]> => {
  const result = await fetchBlogList(tag);
  return result.items.map(mapPostToPublicPost);
});

export const getPublishedBlogTags = cache(async () => {
  const result = await fetchBlogList();
  return result.tags.map((tag) => tag.name);
});

export const getPublishedBlogPostBySlug = cache(async (slug: string): Promise<PublicBlogPost | null> => {
  try {
    const post = await fetchBackendApi<BackendBlogPost>(`/public/blog-posts/${encodeURIComponent(slug)}`);
    return mapPostToPublicPost(post);
  } catch {
    const post = await prisma.post.findFirst({
      where: {
        slug,
        published: true,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        accessType: true,
        workshopPrice: true,
        createdAt: true,
      },
    });

    return post ? mapLocalPostToPublicPost(post) : null;
  }
});

export async function getProtectedBlogPostById(postId: string): Promise<PublicBlogPost | null> {
  if (!getBackendApiUrl()) {
    return null;
  }

  try {
    const response = await fetchBackendAdminApi('/blog-posts/' + encodeURIComponent(postId));

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { data?: BackendBlogPost };
    return payload.data ? mapPostToPublicPost(payload.data) : null;
  } catch (error) {
    console.error('Protected workshop content fetch failed:', error);
    return null;
  }
}

export function getPostTags(content: unknown) {
  if (!content || typeof content !== 'object') {
    return [];
  }

  const value = (content as Record<string, unknown>).tags;
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export const getRelatedPostsByTags = cache(
  async (tags: string[], excludeSlug?: string, limit = 3): Promise<PublicBlogPost[]> => {
    if (tags.length === 0) {
      return [];
    }

    const posts = await getPublishedBlogPosts(tags[0]);
    return posts.filter((post) => post.slug !== excludeSlug).slice(0, limit);
  }
);
