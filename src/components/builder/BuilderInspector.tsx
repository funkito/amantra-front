'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { fetchBuilderVersion } from '@/lib/builder/api';
import { builderStylePresets } from '@/lib/builder/style-presets';
import { usePageBuilderStore } from '@/lib/store/usePageBuilderStore';
import WellnessBannerEditor from '@/components/admin/builder/sidebar/WellnessBannerEditor';
import SiteMenuEditor from '@/components/admin/builder/sidebar/SiteMenuEditor';

const viewportButtons = [
  { key: 'desktop', label: 'Desktop', icon: Monitor },
  { key: 'tablet', label: 'Tablet', icon: Tablet },
  { key: 'mobile', label: 'Mobile', icon: Smartphone },
] as const;

export default function BuilderInspector() {
  const [mediaQuery, setMediaQuery] = useState('');
  const [mediaItems, setMediaItems] = useState<
    Array<{ id: string; label: string; url: string; source: string }>
  >([]);
  const [mediaUploadStatus, setMediaUploadStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({
    type: 'idle',
    message: '',
  });
  const [contentSources, setContentSources] = useState<{
    products: Array<{ id: string; title: string; body: string; image: string; tags: string[] }>;
    posts: Array<{ id: string; slug: string; title: string; body: string; image: string; tags: string[] }>;
    productTags: string[];
    postTags: string[];
  }>({
    products: [],
    posts: [],
    productTags: [],
    postTags: [],
  });
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const document = usePageBuilderStore((state) => state.document);
  const viewport = usePageBuilderStore((state) => state.viewport);
  const selectedBlockId = usePageBuilderStore((state) => state.selectedBlockId);
  const layout = usePageBuilderStore((state) => state.document.layout);
  const selectedBlock = layout.find((block) => block.id === selectedBlockId) ?? null;
  const setViewport = usePageBuilderStore((state) => state.setViewport);
  const updateBlockProps = usePageBuilderStore((state) => state.updateBlockProps);
  const updateBlockContent = usePageBuilderStore((state) => state.updateBlockContent);
  const duplicateBlock = usePageBuilderStore((state) => state.duplicateBlock);
  const updateTheme = usePageBuilderStore((state) => state.updateTheme);
  const restoreVersion = usePageBuilderStore((state) => state.restoreVersion);
  const replaceDocument = usePageBuilderStore((state) => state.replaceDocument);
  const versionPayloads = usePageBuilderStore((state) => state.versionPayloads);

  useEffect(() => {
    let cancelled = false;

    void loadMediaLibrary().then((items) => {
      if (!cancelled) {
        setMediaItems(items);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    void fetch('/api/admin/content-sources', { cache: 'no-store' })
      .then(async (response) => {
        const data = (await response.json()) as {
          products?: Array<{ id: string; title: string; body: string; image: string; tags: string[] }>;
          posts?: Array<{ id: string; slug: string; title: string; body: string; image: string; tags: string[] }>;
          productTags?: string[];
          postTags?: string[];
        };

        if (!response.ok) {
          return { products: [], posts: [], productTags: [], postTags: [] };
        }

        return {
          products: data.products ?? [],
          posts: data.posts ?? [],
          productTags: data.productTags ?? [],
          postTags: data.postTags ?? [],
        };
      })
      .then((data) => {
        if (!cancelled) {
          setContentSources(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setContentSources({ products: [], posts: [], productTags: [], postTags: [] });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredMedia = useMemo(() => {
    const normalized = mediaQuery.trim().toLowerCase();

    if (!normalized) {
      return mediaItems;
    }

    return mediaItems.filter((media) => media.label.toLowerCase().includes(normalized));
  }, [mediaItems, mediaQuery]);

  const visibility = {
    desktop: selectedBlock?.props.responsiveVisibility?.desktop ?? true,
    tablet: selectedBlock?.props.responsiveVisibility?.tablet ?? true,
    mobile: selectedBlock?.props.responsiveVisibility?.mobile ?? true,
  };

  async function handleMediaUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }

    setMediaUploadStatus({
      type: 'loading',
      message: files.length === 1 ? 'Subiendo imagen...' : `Subiendo ${files.length} imágenes...`,
    });

    try {
      const response = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      const data = (await response.json()) as {
        error?: string;
        media?: Array<{ id: string; label: string; url: string; source: string }>;
      };

      if (!response.ok) {
        throw new Error(data.error ?? 'No fue posible subir la imagen.');
      }

      const uploadedMedia = data.media ?? [];
      const refreshedMedia = await loadMediaLibrary();
      setMediaItems(refreshedMedia);

      if (selectedBlock && uploadedMedia[0]) {
        updateBlockContent(selectedBlock.id, { image: uploadedMedia[0].url });
      }

      setMediaUploadStatus({
        type: 'success',
        message:
          uploadedMedia.length === 1
            ? 'Imagen subida y lista para usar.'
            : `${uploadedMedia.length} imágenes subidas y añadidas a la librería.`,
      });
    } catch (error) {
      setMediaUploadStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'No fue posible subir la imagen.',
      });
    } finally {
      if (mediaInputRef.current) {
        mediaInputRef.current.value = '';
      }
    }
  }

  return (
    <aside
      style={{
        display: 'grid',
        gap: 18,
        padding: 20,
        borderRadius: 24,
        background: '#111111',
        border: '1px solid rgba(212,175,55,0.14)',
        alignSelf: 'start',
      }}
    >
      <div>
        <div style={{ color: '#D4AF37', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Inspector
        </div>
        <h2 style={{ margin: '10px 0 6px', color: '#FFFFF0', fontSize: 26 }}>Propiedades</h2>
        <p style={{ margin: 0, color: '#BDBDBD', lineHeight: 1.7 }}>
          Ajusta contenido, espaciado, estilos, responsive y enlaces sin salir del builder.
        </p>
      </div>

      <section style={{ display: 'grid', gap: 10 }}>
        <div style={{ color: '#D4AF37', fontWeight: 700 }}>Preview responsive</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {viewportButtons.map((item) => {
            const Icon = item.icon;
            const active = viewport === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setViewport(item.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 999,
                  border: active ? '1px solid #D4AF37' : '1px solid rgba(212,175,55,0.12)',
                  background: active ? '#D4AF37' : 'rgba(255,255,255,0.02)',
                  color: active ? '#140e0a' : '#FFFFF0',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
        </div>
      </section>

      <section
        style={{
          borderRadius: 18,
          border: '1px solid rgba(212,175,55,0.1)',
          background: 'rgba(255,255,255,0.02)',
          padding: 16,
          display: 'grid',
          gap: 12,
        }}
      >
        <div style={{ color: '#D4AF37', fontWeight: 700 }}>Tema global de la página</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ color: '#D4AF37', fontSize: 13 }}>Fondo de página</span>
            <input
              value={document.theme.pageBg}
              onChange={(event) => updateTheme({ pageBg: event.target.value })}
              style={fieldStyle}
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ color: '#D4AF37', fontSize: 13 }}>Superficie</span>
            <input
              value={document.theme.surfaceBg}
              onChange={(event) => updateTheme({ surfaceBg: event.target.value })}
              style={fieldStyle}
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ color: '#D4AF37', fontSize: 13 }}>Texto</span>
            <input
              value={document.theme.textColor}
              onChange={(event) => updateTheme({ textColor: event.target.value })}
              style={fieldStyle}
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ color: '#D4AF37', fontSize: 13 }}>Acento</span>
            <input
              value={document.theme.accentColor}
              onChange={(event) => updateTheme({ accentColor: event.target.value })}
              style={fieldStyle}
            />
          </label>
        </div>
        {document.versions.length > 0 ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ color: '#D4AF37', fontSize: 13 }}>Últimas versiones</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {document.versions.slice(0, 3).map((version) => {
                const canRestore = Boolean(versionPayloads[version.id]);

                return (
                <div
                  key={version.id}
                  style={{
                    borderRadius: 14,
                    border: '1px solid rgba(212,175,55,0.12)',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '10px 12px',
                  }}
                >
                  <div style={{ color: '#FFFFF0', fontWeight: 700 }}>{version.label}</div>
                  <div style={{ color: '#8f846d', fontSize: 12, marginTop: 4 }}>
                    {new Date(version.createdAt).toLocaleString('es-CO')} · {version.status}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (canRestore) {
                        restoreVersion(version.id);
                        return;
                      }

                      void fetchBuilderVersion(version.id).then((snapshot) => {
                        replaceDocument(snapshot, { markClean: false });
                      });
                    }}
                    style={{
                      marginTop: 10,
                      borderRadius: 999,
                      border: '1px solid rgba(212,175,55,0.12)',
                      background: 'rgba(255,255,255,0.02)',
                      color: '#FFFFF0',
                      padding: '8px 10px',
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    {canRestore ? 'Restaurar' : 'Restaurar desde servidor'}
                  </button>
                </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      <section
        style={{
          borderRadius: 18,
          border: '1px solid rgba(212,175,55,0.1)',
          background: 'rgba(255,255,255,0.02)',
          padding: 16,
        }}
      >
        <div style={{ color: '#D4AF37', fontWeight: 700, marginBottom: 10 }}>Bloque seleccionado</div>
        {selectedBlock ? (
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ color: '#FFFFF0', fontWeight: 700 }}>{selectedBlock.type}</div>
            <div style={{ color: '#BDBDBD', lineHeight: 1.65 }}>ID: {selectedBlock.id}</div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => duplicateBlock(selectedBlock.id)}
                style={secondaryButtonStyle}
              >
                Duplicar bloque
              </button>
            </div>

            {selectedBlock.type === 'wellness_banner' ? (
              <WellnessBannerEditor block={selectedBlock} />
            ) : null}

            {selectedBlock.type === 'site_menu' ? (
              <SiteMenuEditor block={selectedBlock} />
            ) : null}

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ color: '#D4AF37', fontSize: 13 }}>Título visible</span>
              <input
                value={selectedBlock.content.title ?? ''}
                onChange={(event) => updateBlockContent(selectedBlock.id, { title: event.target.value })}
                style={{
                  border: '1px solid rgba(212,175,55,0.12)',
                  background: 'rgba(255,255,255,0.02)',
                  color: '#FFFFF0',
                  borderRadius: 14,
                  padding: '10px 12px',
                  outline: 'none',
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ color: '#D4AF37', fontSize: 13 }}>Subtítulo</span>
              <input
                value={selectedBlock.content.subtitle ?? ''}
                onChange={(event) => updateBlockContent(selectedBlock.id, { subtitle: event.target.value })}
                style={fieldStyle}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ color: '#D4AF37', fontSize: 13 }}>Texto / cuerpo</span>
              <textarea
                value={selectedBlock.content.body ?? ''}
                onChange={(event) => updateBlockContent(selectedBlock.id, { body: event.target.value })}
                rows={4}
                style={{ ...fieldStyle, resize: 'vertical' }}
              />
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: '#D4AF37', fontSize: 13 }}>Padding Y</span>
                <input
                  value={selectedBlock.props.paddingY ?? ''}
                  onChange={(event) => updateBlockProps(selectedBlock.id, { paddingY: event.target.value })}
                  style={fieldStyle}
                />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: '#D4AF37', fontSize: 13 }}>Padding X</span>
                <input
                  value={selectedBlock.props.paddingX ?? ''}
                  onChange={(event) => updateBlockProps(selectedBlock.id, { paddingX: event.target.value })}
                  style={fieldStyle}
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: '#D4AF37', fontSize: 13 }}>Color de fondo</span>
                <input
                  value={selectedBlock.props.bgColor ?? ''}
                  onChange={(event) => updateBlockProps(selectedBlock.id, { bgColor: event.target.value })}
                  style={fieldStyle}
                />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: '#D4AF37', fontSize: 13 }}>Color de texto</span>
                <input
                  value={selectedBlock.props.textColor ?? ''}
                  onChange={(event) => updateBlockProps(selectedBlock.id, { textColor: event.target.value })}
                  style={fieldStyle}
                />
              </label>
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ color: '#D4AF37', fontSize: 13 }}>Preset visual</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }}>
                {builderStylePresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() =>
                      updateBlockProps(selectedBlock.id, {
                        stylePreset: preset.id,
                        bgColor: preset.bgColor,
                        textColor: preset.textColor,
                      })
                    }
                    style={{
                      borderRadius: 14,
                      border:
                        selectedBlock.props.stylePreset === preset.id
                          ? '1px solid #D4AF37'
                          : '1px solid rgba(212,175,55,0.12)',
                      background: preset.bgColor,
                      color: preset.textColor,
                      padding: '12px 10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{preset.label}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{preset.accentColor}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: '#D4AF37', fontSize: 13 }}>Ancho de contenedor</span>
                <select
                  value={selectedBlock.props.containerWidth ?? 'xl'}
                  onChange={(event) =>
                    updateBlockProps(selectedBlock.id, {
                      containerWidth: event.target.value as 'full' | 'xl' | 'lg' | 'md',
                    })
                  }
                  style={fieldStyle}
                >
                  <option value="full">Full</option>
                  <option value="xl">XL</option>
                  <option value="lg">LG</option>
                  <option value="md">MD</option>
                </select>
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: '#D4AF37', fontSize: 13 }}>Alineación</span>
                <select
                  value={selectedBlock.props.textAlign ?? 'left'}
                  onChange={(event) =>
                    updateBlockProps(selectedBlock.id, {
                      textAlign: event.target.value as 'left' | 'center' | 'right',
                    })
                  }
                  style={fieldStyle}
                >
                  <option value="left">Izquierda</option>
                  <option value="center">Centro</option>
                  <option value="right">Derecha</option>
                </select>
              </label>
            </div>

            {selectedBlock.type === 'product_grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: '#D4AF37', fontSize: 13 }}>Columnas</span>
                  <select
                    value={selectedBlock.props.columns ?? 3}
                    onChange={(event) =>
                      updateBlockProps(selectedBlock.id, {
                        columns: Number(event.target.value) as 1 | 2 | 3 | 4,
                      })
                    }
                    style={fieldStyle}
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: '#D4AF37', fontSize: 13 }}>Límite</span>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={selectedBlock.props.limit ?? 6}
                    onChange={(event) =>
                      updateBlockProps(selectedBlock.id, {
                        limit: Number(event.target.value),
                      })
                    }
                    style={fieldStyle}
                  />
                </label>

                <label style={{ display: 'grid', gap: 6, gridColumn: '1 / -1' }}>
                  <span style={{ color: '#D4AF37', fontSize: 13 }}>Etiqueta de producto</span>
                  <select
                    value={selectedBlock.content.productTag ?? ''}
                    onChange={(event) =>
                      updateBlockContent(selectedBlock.id, {
                        productTag: event.target.value,
                      })
                    }
                    style={fieldStyle}
                  >
                    <option value="">Todas las etiquetas</option>
                    {contentSources.productTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                  {contentSources.productTags.length === 0 ? (
                    <span style={{ color: '#8f846d', fontSize: 12, lineHeight: 1.5 }}>
                      Aún no hay etiquetas guardadas en productos publicados. Puedes escribir una etiqueta manual o
                      agregar tags desde el módulo de productos.
                    </span>
                  ) : null}
                </label>

                <label style={{ display: 'grid', gap: 6, gridColumn: '1 / -1' }}>
                  <span style={{ color: '#D4AF37', fontSize: 13 }}>Etiqueta manual</span>
                  <input
                    value={selectedBlock.content.productTag ?? ''}
                    onChange={(event) =>
                      updateBlockContent(selectedBlock.id, {
                        productTag: event.target.value,
                      })
                    }
                    style={fieldStyle}
                    placeholder="ej. joyas, tunicas"
                  />
                </label>
              </div>
            ) : null}

            {selectedBlock.type === 'blog_grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: '#D4AF37', fontSize: 13 }}>Columnas</span>
                  <select
                    value={selectedBlock.props.columns ?? 3}
                    onChange={(event) =>
                      updateBlockProps(selectedBlock.id, {
                        columns: Number(event.target.value) as 1 | 2 | 3 | 4,
                      })
                    }
                    style={fieldStyle}
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: '#D4AF37', fontSize: 13 }}>Límite</span>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={selectedBlock.props.limit ?? 6}
                    onChange={(event) =>
                      updateBlockProps(selectedBlock.id, {
                        limit: Number(event.target.value),
                      })
                    }
                    style={fieldStyle}
                  />
                </label>

                <label style={{ display: 'grid', gap: 6, gridColumn: '1 / -1' }}>
                  <span style={{ color: '#D4AF37', fontSize: 13 }}>Etiqueta del blog</span>
                  <select
                    value={selectedBlock.content.blogTag ?? ''}
                    onChange={(event) =>
                      updateBlockContent(selectedBlock.id, {
                        blogTag: event.target.value,
                      })
                    }
                    style={fieldStyle}
                  >
                    <option value="">Todas las etiquetas</option>
                    {contentSources.postTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}

            {selectedBlock.type === 'featured_product' ? (
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: '#D4AF37', fontSize: 13 }}>Producto real</span>
                <select
                  value={selectedBlock.content.productId ?? ''}
                  onChange={(event) => {
                    const product = contentSources.products.find((item) => item.id === event.target.value);
                    updateBlockContent(selectedBlock.id, {
                      productId: product?.id ?? '',
                      title: product?.title ?? selectedBlock.content.title,
                      body: product?.body ?? selectedBlock.content.body,
                      image: product?.image ?? selectedBlock.content.image,
                      ctaHref: product ? `/products/${product.id}` : selectedBlock.content.ctaHref,
                    });
                  }}
                  style={fieldStyle}
                >
                  <option value="">Seleccionar producto</option>
                  {contentSources.products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {selectedBlock.type === 'blog_teaser' ? (
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: '#D4AF37', fontSize: 13 }}>Post real</span>
                <select
                  value={selectedBlock.content.postSlug ?? ''}
                  onChange={(event) => {
                    const post = contentSources.posts.find((item) => item.slug === event.target.value);
                    updateBlockContent(selectedBlock.id, {
                      postSlug: post?.slug ?? '',
                      title: post?.title ?? selectedBlock.content.title,
                      body: post?.body ?? selectedBlock.content.body,
                      image: post?.image ?? selectedBlock.content.image,
                      ctaHref: post ? `/blog/${post.slug}` : selectedBlock.content.ctaHref,
                    });
                  }}
                  style={fieldStyle}
                >
                  <option value="">Seleccionar post</option>
                  {contentSources.posts.map((post) => (
                    <option key={post.slug} value={post.slug}>
                      {post.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {selectedBlock.type === 'columns' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: '#D4AF37', fontSize: 13 }}>Título izquierda</span>
                  <input
                    value={selectedBlock.content.leftTitle ?? ''}
                    onChange={(event) => updateBlockContent(selectedBlock.id, { leftTitle: event.target.value })}
                    style={fieldStyle}
                  />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: '#D4AF37', fontSize: 13 }}>Título derecha</span>
                  <input
                    value={selectedBlock.content.rightTitle ?? ''}
                    onChange={(event) => updateBlockContent(selectedBlock.id, { rightTitle: event.target.value })}
                    style={fieldStyle}
                  />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: '#D4AF37', fontSize: 13 }}>Texto izquierda</span>
                  <textarea
                    value={selectedBlock.content.leftBody ?? ''}
                    onChange={(event) => updateBlockContent(selectedBlock.id, { leftBody: event.target.value })}
                    rows={3}
                    style={{ ...fieldStyle, resize: 'vertical' }}
                  />
                </label>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ color: '#D4AF37', fontSize: 13 }}>Texto derecha</span>
                  <textarea
                    value={selectedBlock.content.rightBody ?? ''}
                    onChange={(event) => updateBlockContent(selectedBlock.id, { rightBody: event.target.value })}
                    rows={3}
                    style={{ ...fieldStyle, resize: 'vertical' }}
                  />
                </label>
              </div>
            ) : null}

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ color: '#D4AF37', fontSize: 13 }}>Imagen / media URL</span>
              <input
                value={selectedBlock.content.image ?? ''}
                onChange={(event) => updateBlockContent(selectedBlock.id, { image: event.target.value })}
                style={fieldStyle}
                placeholder="https://..."
              />
            </label>

            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ color: '#D4AF37', fontSize: 13 }}>Galería rápida</div>
              <input
                ref={mediaInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={handleMediaUpload}
                style={{ display: 'none' }}
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => mediaInputRef.current?.click()}
                  style={secondaryButtonStyle}
                >
                  Subir imágenes
                </button>
                <div style={{ color: '#8f846d', fontSize: 12, alignSelf: 'center' }}>
                  JPG, PNG o WEBP. Máximo 5MB por archivo.
                </div>
              </div>
              {mediaUploadStatus.type !== 'idle' ? (
                <div
                  style={{
                    borderRadius: 14,
                    border:
                      mediaUploadStatus.type === 'error'
                        ? '1px solid rgba(255,99,99,0.28)'
                        : mediaUploadStatus.type === 'success'
                          ? '1px solid rgba(72,187,120,0.28)'
                          : '1px solid rgba(212,175,55,0.12)',
                    background:
                      mediaUploadStatus.type === 'error'
                        ? 'rgba(255,99,99,0.08)'
                        : mediaUploadStatus.type === 'success'
                          ? 'rgba(72,187,120,0.08)'
                          : 'rgba(255,255,255,0.02)',
                    color:
                      mediaUploadStatus.type === 'error'
                        ? '#ffb3b3'
                        : mediaUploadStatus.type === 'success'
                          ? '#9ae6b4'
                          : '#FFFFF0',
                    padding: '10px 12px',
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  {mediaUploadStatus.message}
                </div>
              ) : null}
              <input
                value={mediaQuery}
                onChange={(event) => setMediaQuery(event.target.value)}
                placeholder="Buscar imagen"
                style={fieldStyle}
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                {filteredMedia.map((media) => (
                  <button
                    key={media.id}
                    type="button"
                    onClick={() => updateBlockContent(selectedBlock.id, { image: media.url })}
                    style={{
                      borderRadius: 16,
                      overflow: 'hidden',
                      border: '1px solid rgba(212,175,55,0.12)',
                      background: '#0f0f0f',
                      padding: 0,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- Admin media picker needs arbitrary remote previews without image config coupling. */}
                    <img
                      src={media.url}
                      alt={media.label}
                      style={{
                        display: 'block',
                        width: '100%',
                        height: 92,
                        objectFit: 'cover',
                      }}
                    />
                    <div style={{ padding: '10px 12px', color: '#FFFFF0', fontSize: 12 }}>{media.label}</div>
                    <div style={{ padding: '0 12px 12px', color: '#8f846d', fontSize: 11 }}>{media.source}</div>
                  </button>
                ))}
              </div>
              {selectedBlock.content.image ? (
                <div
                  style={{
                    borderRadius: 18,
                    overflow: 'hidden',
                    border: '1px solid rgba(212,175,55,0.12)',
                    background: '#0f0f0f',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- Remote arbitrary previews are expected in the admin inspector. */}
                  <img
                    src={selectedBlock.content.image}
                    alt="Preview seleccionada"
                    style={{ display: 'block', width: '100%', height: 160, objectFit: 'cover' }}
                  />
                </div>
              ) : null}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: '#D4AF37', fontSize: 13 }}>CTA label</span>
                <input
                  value={selectedBlock.content.ctaLabel ?? ''}
                  onChange={(event) => updateBlockContent(selectedBlock.id, { ctaLabel: event.target.value })}
                  style={fieldStyle}
                />
              </label>

              <label style={{ display: 'grid', gap: 6 }}>
                <span style={{ color: '#D4AF37', fontSize: 13 }}>CTA href</span>
                <input
                  value={selectedBlock.content.ctaHref ?? ''}
                  onChange={(event) => updateBlockContent(selectedBlock.id, { ctaHref: event.target.value })}
                  style={fieldStyle}
                  placeholder="/productos o https://..."
                />
              </label>
            </div>

            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ color: '#D4AF37', fontSize: 13 }}>Visibilidad responsive</div>
              {(['desktop', 'tablet', 'mobile'] as const).map((key) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#D7D0C3' }}>
                  <input
                    type="checkbox"
                    checked={visibility[key]}
                    onChange={(event) =>
                      updateBlockProps(selectedBlock.id, {
                        responsiveVisibility: {
                          ...visibility,
                          [key]: event.target.checked,
                        },
                      })
                    }
                  />
                  {key}
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ color: '#BDBDBD', lineHeight: 1.7 }}>
            Selecciona un bloque en el canvas para ver sus propiedades base.
          </div>
        )}
      </section>
    </aside>
  );
}

async function loadMediaLibrary() {
  try {
    const response = await fetch('/api/admin/media', { cache: 'no-store' });
    const data = (await response.json()) as {
      media?: Array<{ id: string; label: string; url: string; source: string }>;
    };

    if (!response.ok) {
      return [];
    }

    return data.media ?? [];
  } catch {
    return [];
  }
}

const fieldStyle: React.CSSProperties = {
  border: '1px solid rgba(212,175,55,0.12)',
  background: 'rgba(255,255,255,0.02)',
  color: '#FFFFF0',
  borderRadius: 14,
  padding: '10px 12px',
  outline: 'none',
};

const secondaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 12px',
  borderRadius: 999,
  border: '1px solid rgba(212,175,55,0.12)',
  background: 'rgba(255,255,255,0.02)',
  color: '#FFFFF0',
  cursor: 'pointer',
  fontWeight: 700,
};
