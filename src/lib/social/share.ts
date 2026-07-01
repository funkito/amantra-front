export type ShareNetworkKey = 'WHATSAPP' | 'FACEBOOK' | 'TWITTER' | 'LINKEDIN' | 'COPY_LINK';

export interface ShareableProduct {
  id: string;
  slug?: string;
  title: string;
  description: string;
  price: number;
  url: string;
  imageUrl?: string | null;
}

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}

export function buildProductPublicUrl(productSlug: string) {
  return `${getSiteUrl()}/products/${productSlug}`;
}

export function buildShareText(product: ShareableProduct) {
  return `¡Mira este producto! ${product.title} - ${currency.format(product.price)} ${product.url}`;
}

export function buildShareLinks(product: ShareableProduct) {
  const shareText = buildShareText(product);
  const encodedUrl = encodeURIComponent(product.url);
  const encodedText = encodeURIComponent(shareText);

  return {
    WHATSAPP: `https://wa.me/?text=${encodedText}`,
    FACEBOOK: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    TWITTER: `https://twitter.com/intent/tweet?text=${encodedText}`,
    LINKEDIN: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  } satisfies Record<Exclude<ShareNetworkKey, 'COPY_LINK'>, string>;
}

export async function recordShareEvent(productId: string, network: ShareNetworkKey) {
  await fetch('/api/share-events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productId,
      network,
    }),
  });
}

// TODO: FASE 2
// Integrar publicación directa o analítica avanzada con Meta Graph API.
export async function queueMetaGraphShare(product: ShareableProduct) {
  void product;
  return {
    ok: false,
    reason: 'TODO: FASE 2 - Integración pendiente con Meta Graph API.',
  };
}

// TODO: FASE 2
// Integrar publicación directa o analítica avanzada con Twitter/X API v2.
export async function queueTwitterShare(product: ShareableProduct) {
  void product;
  return {
    ok: false,
    reason: 'TODO: FASE 2 - Integración pendiente con Twitter API v2.',
  };
}
