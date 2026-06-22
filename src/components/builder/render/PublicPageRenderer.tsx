import type { BuilderBlockNode, PageBuilderDocument, BuilderViewport } from '@/lib/builder/types';
import { getBuilderStylePreset } from '@/lib/builder/style-presets';
import { getPublishedCatalogProductsFiltered } from '@/lib/catalog/public-products';
import { getPublishedBlogPosts } from '@/lib/content/public-blog';
import { prisma } from '@/lib/prisma';
import NewsletterSignupForm from '@/components/storefront/NewsletterSignupForm';
import SiteMenu from '@/components/storefront/SiteMenu';
import BuilderProductGridSection from '@/components/builder/render/BuilderProductGridSection';
import BuilderBlogGridSection from '@/components/builder/render/BuilderBlogGridSection';
import WellnessBannerBlock from '@/components/blocks/WellnessBannerBlock';

function getPostField(content: unknown, field: 'excerpt' | 'coverImage' | 'body') {
  if (!content || typeof content !== 'object') {
    return '';
  }

  const value = (content as Record<string, unknown>)[field];
  return typeof value === 'string' ? value : '';
}

function isVisibleOnViewport(block: BuilderBlockNode, viewport: BuilderViewport) {
  const visibility = block.props.responsiveVisibility;

  if (!visibility) {
    return true;
  }

  return visibility[viewport];
}

function getContainerWidth(width?: BuilderBlockNode['props']['containerWidth']) {
  switch (width) {
    case 'md':
      return '760px';
    case 'lg':
      return '980px';
    case 'full':
      return '100%';
    case 'xl':
    default:
      return '1200px';
  }
}

async function loadDynamicPageData(document: PageBuilderDocument) {
  const productIds = Array.from(
    new Set(
      document.layout
        .map((block) => block.content.productId)
        .filter((value): value is string => Boolean(value))
    )
  );
  const postSlugs = Array.from(
    new Set(
      document.layout
        .map((block) => block.content.postSlug)
        .filter((value): value is string => Boolean(value))
    )
  );
  const [linkedProducts, publishedProducts, linkedPosts, publishedPosts] = await Promise.all([
    productIds.length
      ? prisma.product.findMany({
          where: { id: { in: productIds }, deletedAt: null, status: 'PUBLISHED' },
          select: { id: true, name: true, description: true, images: true, basePrice: true, tags: { select: { name: true } } },
        })
      : Promise.resolve([]),
    getPublishedCatalogProductsFiltered({}),
    postSlugs.length
      ? prisma.post.findMany({
          where: { slug: { in: postSlugs }, published: true },
          select: { id: true, slug: true, title: true, content: true, createdAt: true },
        })
      : Promise.resolve([]),
    getPublishedBlogPosts(),
  ]);

  return {
    linkedProducts,
    publishedProducts,
    linkedPosts,
    publishedPosts,
  };
}

function PublicBlockRenderer({
  block,
  accentColor,
  dynamicData,
  documentSlug,
  activeProductTag,
}: {
  block: BuilderBlockNode;
  accentColor: string;
  dynamicData: Awaited<ReturnType<typeof loadDynamicPageData>>;
  documentSlug: string;
  activeProductTag?: string;
}) {
  const preset = getBuilderStylePreset(block.props.stylePreset);
  const featuredProduct = block.content.productId
    ? dynamicData.linkedProducts.find((product) => product.id === block.content.productId)
    : null;
  const linkedPost = block.content.postSlug
    ? dynamicData.linkedPosts.find((post) => post.slug === block.content.postSlug)
    : null;
  const featuredProductTitle = featuredProduct?.name ?? block.content.title;
  const featuredProductBody = featuredProduct?.description ?? block.content.body;
  const featuredProductImage = (featuredProduct?.images as string[])?.[0] ?? block.content.image;
  const featuredProductHref = featuredProduct ? `/products/${featuredProduct.id}` : (block.content.ctaHref ?? '#');
  const linkedPostTitle = linkedPost?.title ?? block.content.title;
  const linkedPostBody = linkedPost ? getPostField(linkedPost.content, 'excerpt') || block.content.body : block.content.body;
  const linkedPostImage = linkedPost ? getPostField(linkedPost.content, 'coverImage') || block.content.image : block.content.image;
  const linkedPostHref = linkedPost ? `/blog/${linkedPost.slug}` : (block.content.ctaHref ?? '#');
  const filteredPosts = block.content.blogTag
    ? dynamicData.publishedPosts.filter((post) =>
        post.tags.some((tag) => tag.toLowerCase() === block.content.blogTag?.toLowerCase())
      )
    : dynamicData.publishedPosts;
  const outerStyle: React.CSSProperties = {
    background: block.props.bgColor ?? preset.bgColor,
    color: block.props.textColor ?? preset.textColor,
    paddingTop: `${block.props.paddingY ?? '0'}px`,
    paddingBottom: `${block.props.paddingY ?? '0'}px`,
    paddingLeft: `${block.props.paddingX ?? '0'}px`,
    paddingRight: `${block.props.paddingX ?? '0'}px`,
    textAlign: block.props.textAlign ?? 'left',
  };

  const innerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: getContainerWidth(block.props.containerWidth),
    margin: '0 auto',
  };

  switch (block.type) {
    case 'site_menu':
      return (
        <section style={{ ...outerStyle, background: 'transparent' }}>
          <div style={innerStyle}>
            <SiteMenu
              brandLabel={block.content.title || 'Amantra'}
              ctaLabel={block.content.ctaLabel || 'Explorar colección'}
              ctaHref={block.content.ctaHref || '/#catalogo'}
              content={block.content}
              compact
            />
          </div>
        </section>
      );
    case 'hero':
      return (
        <section style={outerStyle}>
          <div style={innerStyle}>
            <div
              style={{
                borderRadius: 28,
                padding: '72px 32px',
                border: '1px solid rgba(212,175,55,0.16)',
                background: 'linear-gradient(135deg, rgba(212,175,55,0.16), rgba(255,255,255,0.03))',
              }}
            >
              <div style={{ color: '#D4AF37', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                Amantra
              </div>
              <h1 style={{ margin: '16px 0 12px', fontSize: 'clamp(2.5rem, 6vw, 5rem)', lineHeight: 0.95 }}>
                {block.content.title}
              </h1>
              <p style={{ maxWidth: 720, margin: 0, color: 'rgba(245,239,228,0.82)', fontSize: 18, lineHeight: 1.75 }}>
                {block.content.body}
              </p>
            </div>
          </div>
        </section>
      );
    case 'section':
      return (
        <section style={outerStyle}>
          <div style={innerStyle}>
            <div style={{ display: 'grid', gap: 14 }}>
              <h2 style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 3.4rem)' }}>{block.content.title}</h2>
              <p style={{ margin: 0, color: 'rgba(245,239,228,0.8)', lineHeight: 1.8 }}>{block.content.body}</p>
            </div>
          </div>
        </section>
      );
    case 'columns':
      return (
        <section style={outerStyle}>
          <div style={innerStyle}>
            <div style={{ display: 'grid', gap: 18 }}>
              <div>
                <h2 style={{ margin: '0 0 10px', fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>{block.content.title}</h2>
                <p style={{ margin: 0, color: 'inherit', opacity: 0.84, lineHeight: 1.8 }}>{block.content.body}</p>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 18,
                }}
              >
                <article
                  style={{
                    borderRadius: 22,
                    border: '1px solid rgba(212,175,55,0.14)',
                    background: 'rgba(255,255,255,0.03)',
                    padding: 20,
                  }}
                >
                  <h3 style={{ margin: '0 0 8px', fontSize: 24 }}>{block.content.leftTitle}</h3>
                  <p style={{ margin: 0, lineHeight: 1.8, opacity: 0.84 }}>{block.content.leftBody}</p>
                </article>
                <article
                  style={{
                    borderRadius: 22,
                    border: '1px solid rgba(212,175,55,0.14)',
                    background: 'rgba(255,255,255,0.03)',
                    padding: 20,
                  }}
                >
                  <h3 style={{ margin: '0 0 8px', fontSize: 24 }}>{block.content.rightTitle}</h3>
                  <p style={{ margin: 0, lineHeight: 1.8, opacity: 0.84 }}>{block.content.rightBody}</p>
                </article>
              </div>
            </div>
          </div>
        </section>
      );
    case 'product_grid':
      return (
        <section id="catalogo" style={outerStyle}>
          <div style={innerStyle}>
            <BuilderProductGridSection
              title={block.content.title}
              body={block.content.body}
              products={dynamicData.publishedProducts}
              initialTag={activeProductTag || block.content.productTag}
              accentColor={accentColor}
              limit={block.props.limit ?? 6}
              columns={block.props.columns ?? 3}
              tagStyle={block.content.productTagStyle ?? 'tiles'}
              tagAllLabel={block.content.productTagAllLabel ?? 'Todas'}
              tagShowImages={block.content.productTagShowImages ?? true}
              tagTileBackgroundColor={block.content.productTagTileBackgroundColor}
              tagTileTextColor={block.content.productTagTileTextColor}
              tagTileActiveBackgroundColor={block.content.productTagTileActiveBackgroundColor}
              tagTileActiveTextColor={block.content.productTagTileActiveTextColor}
              tagTileBorderColor={block.content.productTagTileBorderColor}
              tagTileOverlayColor={block.content.productTagTileOverlayColor}
            />
          </div>
        </section>
      );
    case 'blog_grid':
      return (
        <section style={outerStyle}>
          <div style={innerStyle}>
            <BuilderBlogGridSection
              title={block.content.title}
              body={block.content.body}
              posts={filteredPosts}
              initialTag={block.content.blogTag}
              accentColor={accentColor}
              limit={block.props.limit ?? 6}
              columns={block.props.columns ?? 3}
            />
          </div>
        </section>
      );
    case 'featured_product':
      return (
        <section style={outerStyle}>
          <div style={innerStyle}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.05fr) minmax(280px, 0.95fr)',
                gap: 24,
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ color: 'inherit', opacity: 0.72, letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: 12 }}>
                  {block.content.subtitle}
                </div>
                <h2 style={{ margin: 0, fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}>{featuredProductTitle}</h2>
                <p style={{ margin: 0, opacity: 0.84, lineHeight: 1.85 }}>{featuredProductBody}</p>
                <div>
                  <a
                    href={featuredProductHref}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 190,
                      padding: '14px 22px',
                      borderRadius: 999,
                      background: accentColor,
                      color: '#140e0a',
                      textDecoration: 'none',
                      fontWeight: 800,
                    }}
                  >
                    {block.content.ctaLabel ?? 'Ver producto'}
                  </a>
                </div>
              </div>
              <div
                style={{
                  minHeight: 360,
                  borderRadius: 28,
                  border: '1px solid rgba(212,175,55,0.14)',
                  background:
                    featuredProductImage
                      ? `linear-gradient(rgba(20,14,10,0.18), rgba(20,14,10,0.18)), url(${featuredProductImage}) center / cover no-repeat`
                      : 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(255,255,255,0.03))',
                }}
              />
            </div>
          </div>
        </section>
      );
    case 'blog_teaser':
      return (
        <section style={outerStyle}>
          <div style={innerStyle}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(260px, 360px) minmax(0, 1fr)',
                gap: 24,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  minHeight: 280,
                  borderRadius: 24,
                  border: '1px solid rgba(212,175,55,0.14)',
                  background:
                    linkedPostImage
                      ? `linear-gradient(rgba(20,14,10,0.18), rgba(20,14,10,0.18)), url(${linkedPostImage}) center / cover no-repeat`
                      : 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(255,255,255,0.03))',
                }}
              />
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ color: 'inherit', opacity: 0.72, letterSpacing: '0.16em', textTransform: 'uppercase', fontSize: 12 }}>
                  {block.content.subtitle}
                </div>
                <h2 style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>{linkedPostTitle}</h2>
                <p style={{ margin: 0, opacity: 0.84, lineHeight: 1.85 }}>{linkedPostBody}</p>
                <div>
                  <a
                    href={linkedPostHref}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 180,
                      padding: '14px 22px',
                      borderRadius: 999,
                      background: accentColor,
                      color: '#140e0a',
                      textDecoration: 'none',
                      fontWeight: 800,
                    }}
                  >
                    {block.content.ctaLabel ?? 'Leer artículo'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    case 'rich_text':
      return (
        <section style={outerStyle}>
          <div style={innerStyle}>
            <article style={{ display: 'grid', gap: 14 }}>
              <h2 style={{ margin: 0, fontSize: 'clamp(1.8rem, 3vw, 2.8rem)' }}>{block.content.title}</h2>
              <p style={{ margin: 0, color: 'rgba(245,239,228,0.8)', lineHeight: 1.85 }}>{block.content.body}</p>
            </article>
          </div>
        </section>
      );
    case 'image_banner':
      return (
        <section style={outerStyle}>
          <div style={innerStyle}>
            <div
              style={{
                minHeight: 360,
                borderRadius: 28,
                overflow: 'hidden',
                border: '1px solid rgba(212,175,55,0.14)',
                background:
                  block.content.image
                    ? `linear-gradient(rgba(20,14,10,0.24), rgba(20,14,10,0.24)), url(${block.content.image}) center / cover no-repeat`
                    : 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(255,255,255,0.03))',
                display: 'grid',
                alignItems: 'end',
              }}
            >
              <div style={{ padding: 28 }}>
                <h2 style={{ margin: 0, fontSize: 'clamp(2rem, 5vw, 4rem)' }}>{block.content.title}</h2>
                <p style={{ margin: '10px 0 0', maxWidth: 720, color: 'rgba(245,239,228,0.84)', lineHeight: 1.75 }}>
                  {block.content.body}
                </p>
              </div>
            </div>
          </div>
        </section>
      );
    case 'wellness_banner':
      return (
        <section style={outerStyle}>
          <div style={innerStyle}>
            <WellnessBannerBlock content={block.content} />
          </div>
        </section>
      );
    case 'newsletter_cta':
      return (
        <section style={outerStyle}>
          <div style={innerStyle}>
            <div
              style={{
                borderRadius: 28,
                padding: '40px 28px',
                border: '1px solid rgba(212,175,55,0.16)',
                background: 'rgba(255,255,255,0.03)',
                display: 'grid',
                gap: 14,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 3rem)' }}>{block.content.title}</h2>
              <p style={{ margin: 0, color: 'rgba(245,239,228,0.8)', lineHeight: 1.8 }}>{block.content.body}</p>
              <NewsletterSignupForm sourcePage={documentSlug} buttonLabel={block.content.ctaLabel ?? 'Suscribirme'} />
            </div>
          </div>
        </section>
      );
    default:
      return null;
  }
}

export default async function PublicPageRenderer({
  document,
  activeProductTag,
}: {
  document: PageBuilderDocument;
  activeProductTag?: string;
}) {
  const dynamicData = await loadDynamicPageData(document);

  return (
    <main
      style={{
        background: document.theme.pageBg,
        color: document.theme.textColor,
        minHeight: '100vh',
      }}
    >
      {document.layout
        .filter((block) => isVisibleOnViewport(block, 'desktop'))
        .sort((left, right) => left.order - right.order)
        .map((block) => (
          <PublicBlockRenderer
            key={block.id}
            block={block}
            accentColor={document.theme.accentColor}
            dynamicData={dynamicData}
            documentSlug={document.slug}
            activeProductTag={activeProductTag}
          />
        ))}
    </main>
  );
}
