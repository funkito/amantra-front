'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { PublicProduct } from '@/lib/catalog/public-products';
import ProductShareButton from '@/components/storefront/ProductShareButton';
import CheckoutPanel from '@/components/storefront/CheckoutPanel';
import { useCheckoutStore } from '@/lib/store/useCheckoutStore';
import type { ShareableProduct } from '@/lib/social/share';

const currency = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

const highlights = [
  'Curaduria con inspiracion india',
  'Entrega nacional desde Colombia',
  'Regalos, rituales y piezas boutique',
];

const DESCRIPTION_TOGGLE_THRESHOLD = 500;
const DESCRIPTION_PREVIEW_LENGTH = 260;

interface StorefrontPageProps {
  products: PublicProduct[];
  availableTags: string[];
  activeTags: string[];
  searchQuery?: string;
}

export default function StorefrontPage({
  products,
  availableTags,
  activeTags,
  searchQuery = '',
}: StorefrontPageProps) {
  const [zoomedGallery, setZoomedGallery] = useState<{
    productName: string;
    images: string[];
    currentIndex: number;
  } | null>(null);
  const {
    cartItems,
    isCartOpen,
    step,
    openCart,
    closeCart,
    addToCart,
    incrementItem,
    decrementItem,
    removeFromCart,
    clearCart,
    setStep,
  } = useCheckoutStore();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingTotal = cartItems.reduce((sum, item) => sum + (item.shippingCost ?? 0) * item.quantity, 0);
  const orderTotal = subtotal + shippingTotal;
  const normalizedActiveTags = activeTags.map((tag) => tag.toLowerCase());

  function buildCatalogHref(nextTags: string[], nextQuery = searchQuery) {
    const params = new URLSearchParams();

    for (const tag of nextTags) {
      params.append('tag', tag);
    }

    if (nextQuery.trim()) {
      params.set('q', nextQuery.trim());
    }

    const queryString = params.toString();
    return queryString ? `/?${queryString}#catalogo` : '/#catalogo';
  }

  return (
    <main className="amantra-shell">
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Amantra Boutique Digital</p>
          <h1>Productos de la India para una tienda online elegante, espiritual y lista para vender.</h1>
          <p className="hero-text">
            Esta primera version ya presenta el catalogo, permite agregar productos al carrito
            y muestra un recorrido visual mucho mas cercano a una marca premium.
          </p>

          <div className="hero-actions">
            <a href="#catalogo" className="primary-link">
              Explorar catalogo
            </a>
            <button type="button" className="secondary-button" onClick={openCart}>
              Ver carrito
            </button>
          </div>

          <div className="highlight-list">
            {highlights.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <div className="hero-panel">
          <div className="panel-card">
            <p className="panel-label">Coleccion destacada</p>
            <h2>Rituales, hogar y moda con identidad india.</h2>
            <p>
              Base ideal para seguir conectando inventario, autenticacion, pagos y administracion
              de productos desde Prisma.
            </p>
            <div className="panel-metrics">
              <div>
                <strong>{products.length}</strong>
                <span>productos publicados</span>
              </div>
              <div>
                <strong>{currency.format(subtotal)}</strong>
                <span>valor actual del carrito</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="story-strip">
        <div>
          <p className="story-label">Concepto de marca</p>
          <h3>Un escaparate digital para Amantra</h3>
        </div>
        <p>
          El tono visual combina negro, marfil y dorado para mantener una sensacion de lujo
          accesible, con mensajes centrados en bienestar, artesania y origen.
        </p>
      </section>

      <section className="catalog-section" id="catalogo">
        <div className="section-heading">
          <p className="eyebrow">Catalogo inicial</p>
          <h2>Selecciones inspiradas en la India</h2>
          <p>
            Comparte cada producto en redes y lleva a tus clientes a una página pública lista para mostrar preview.
          </p>
        </div>

        <form action="/" method="get" className="catalog-search-form">
          {activeTags.map((tag) => (
            <input key={tag} type="hidden" name="tag" value={tag} />
          ))}
          <input
            type="search"
            name="q"
            defaultValue={searchQuery}
            placeholder="Buscar por nombre, estilo, material o etiqueta"
            className="catalog-search-input"
          />
          <button type="submit" className="catalog-search-button">
            Buscar
          </button>
        </form>

        {availableTags.length > 0 ? (
          <div className="catalog-tag-bar">
            <Link href={buildCatalogHref([], searchQuery)} className={`catalog-tag-chip ${activeTags.length === 0 ? 'active' : ''}`}>
              Sin etiquetas
            </Link>
            {availableTags.map((tag) => (
              <Link
                key={tag}
                href={
                  normalizedActiveTags.includes(tag.toLowerCase())
                    ? buildCatalogHref(activeTags.filter((item) => item.toLowerCase() !== tag.toLowerCase()), searchQuery)
                    : buildCatalogHref([...activeTags, tag], searchQuery)
                }
                className={`catalog-tag-chip ${normalizedActiveTags.includes(tag.toLowerCase()) ? 'active' : ''}`}
              >
                {tag}
              </Link>
            ))}
          </div>
        ) : null}

        {activeTags.length > 0 || searchQuery ? (
          <div className="catalog-filter-state">
            {searchQuery ? (
              <>
                <span>Búsqueda:</span>
                <strong>{searchQuery}</strong>
              </>
            ) : null}
            {activeTags.length > 0 ? (
              <>
                <span>Etiquetas activas:</span>
                <strong>{activeTags.join(', ')}</strong>
              </>
            ) : null}
            <Link href="/#catalogo">Limpiar filtros</Link>
          </div>
        ) : null}

        {products.length === 0 ? (
          <div className="service-card">
            <p className="eyebrow">Sin resultados</p>
            <h3>No encontramos productos con esos filtros</h3>
            <p>
              Prueba con otra búsqueda, quita alguna etiqueta o revisa que existan productos publicados para esa combinación.
            </p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => {
              const shareProduct: ShareableProduct = {
                id: product.id,
                title: product.name,
                description: product.description,
                price: product.price,
                url: product.productUrl ?? '',
                imageUrl: product.imageUrl,
              };

              return (
                <article key={product.id} className="product-card">
                  <button
                    type="button"
                    className={`product-visual product-image-trigger bg-gradient-to-br ${product.accent}`}
                    onClick={() => {
                      const galleryImages =
                        product.images && product.images.length > 0
                          ? product.images
                          : product.imageUrl
                            ? [product.imageUrl]
                            : [];

                      if (galleryImages.length > 0) {
                        setZoomedGallery({
                          productName: product.name,
                          images: galleryImages,
                          currentIndex: 0,
                        });
                      }
                    }}
                    aria-label={product.imageUrl ? `Ver imagen ampliada de ${product.name}` : `Imagen de ${product.name}`}
                  >
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.imageUrl} alt={product.name} className="product-image-cover" />
                    ) : (
                      <span>{product.imageLabel}</span>
                    )}
                  </button>

                  <div className="product-body">
                    <div className="product-meta">
                      <span>{product.category}</span>
                      <span>{product.origin}</span>
                    </div>

                    <h3>
                      <Link href={product.productUrl ?? `/products/${product.id}`}>{product.name}</Link>
                    </h3>
                    <ProductDescription text={product.description} />

                    <div className="product-notes">
                      {product.notes.map((note) => (
                        <span key={note}>{note}</span>
                      ))}
                    </div>

                    {product.tags.length > 0 ? (
                      <div className="product-tag-links">
                        {product.tags.map((tag) => (
                          <Link key={tag} href={buildCatalogHref([tag])} className="product-tag-link">
                            #{tag}
                          </Link>
                        ))}
                      </div>
                    ) : null}

                    <div className="product-footer">
                      <strong>{currency.format(product.price)}</strong>
                      <div className="product-footer-actions">
                        <ProductShareButton product={shareProduct} />
                        <button type="button" onClick={() => addToCart(product)}>
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="service-section">
        <div className="service-card">
          <p className="eyebrow">Siguiente fase sugerida</p>
          <h3>Lo que podemos conectar despues</h3>
          <ul>
            <li>Productos reales desde Prisma y panel admin.</li>
            <li>Autenticacion de clientes y direccion de envio.</li>
            <li>Checkout conectado al gateway de pago.</li>
          </ul>
        </div>
      </section>

      <button type="button" className="cart-fab" onClick={openCart}>
        <span>Carrito</span>
        <strong>{totalItems}</strong>
      </button>

      <aside className={`cart-drawer ${isCartOpen ? 'open' : ''}`} aria-hidden={!isCartOpen}>
        <div className="cart-header">
          <div>
            <p className="eyebrow">Shopping cart</p>
            <h2>Tu seleccion</h2>
          </div>
          <button type="button" className="icon-button" onClick={closeCart}>
            Cerrar
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Tu carrito aun esta vacio.</p>
            <span>Agrega productos del catalogo para comenzar la compra.</span>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <article key={item.id} className="cart-item">
                  <div>
                    <p>{item.name}</p>
                    <span>{currency.format(item.price)}</span>
                  </div>

                  <div className="cart-controls">
                    <button type="button" onClick={() => decrementItem(item.id)}>
                      -
                    </button>
                    <strong>{item.quantity}</strong>
                    <button type="button" onClick={() => incrementItem(item.id)}>
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Quitar
                  </button>
                </article>
              ))}
            </div>

            <div className="cart-summary">
              <div>
                <span>Subtotal</span>
                <strong>{currency.format(subtotal)}</strong>
              </div>
              <div>
                <span>Envio</span>
                <strong>{shippingTotal > 0 ? currency.format(shippingTotal) : 'Gratis'}</strong>
              </div>

              <button
                type="button"
                className="checkout-button"
                onClick={() => {
                  closeCart();
                  setStep('payment');
                }}
              >
                Continuar al checkout
              </button>
              <button type="button" className="ghost-button" onClick={clearCart}>
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </aside>

      {isCartOpen ? <button type="button" className="cart-backdrop" onClick={closeCart} /> : null}

      <CheckoutPanel
        open={step === 'payment' && cartItems.length > 0}
        totalAmount={orderTotal}
        cartItems={cartItems}
        onClose={() => {
          setStep('cart');
          openCart();
        }}
        onSuccess={() => {
          clearCart();
          closeCart();
          setStep('success');
        }}
      />

      {zoomedGallery ? (
        <>
          <button
            type="button"
            className="image-lightbox-backdrop"
            onClick={() => setZoomedGallery(null)}
            aria-label="Cerrar vista ampliada"
          />
          <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={zoomedGallery.productName}>
            <div className="image-lightbox-panel">
              <div className="image-lightbox-header">
                <div>
                  <div className="eyebrow">Galería del producto</div>
                  <h3 className="image-lightbox-title">{zoomedGallery.productName}</h3>
                </div>
                <button
                  type="button"
                  className="image-lightbox-close"
                  onClick={() => setZoomedGallery(null)}
                >
                  Cerrar
                </button>
              </div>

              <div className="image-lightbox-stage">
                {zoomedGallery.images.length > 1 ? (
                  <button
                    type="button"
                    className="image-lightbox-nav image-lightbox-nav-left"
                    onClick={() =>
                      setZoomedGallery((current) =>
                        current
                          ? {
                              ...current,
                              currentIndex:
                                current.currentIndex === 0
                                  ? current.images.length - 1
                                  : current.currentIndex - 1,
                            }
                          : current
                      )
                    }
                    aria-label="Imagen anterior"
                  >
                    ‹
                  </button>
                ) : null}

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={zoomedGallery.images[zoomedGallery.currentIndex]}
                  alt={`${zoomedGallery.productName} ${zoomedGallery.currentIndex + 1}`}
                  className="image-lightbox-image"
                />

                {zoomedGallery.images.length > 1 ? (
                  <button
                    type="button"
                    className="image-lightbox-nav image-lightbox-nav-right"
                    onClick={() =>
                      setZoomedGallery((current) =>
                        current
                          ? {
                              ...current,
                              currentIndex:
                                current.currentIndex === current.images.length - 1
                                  ? 0
                                  : current.currentIndex + 1,
                            }
                          : current
                      )
                    }
                    aria-label="Siguiente imagen"
                  >
                    ›
                  </button>
                ) : null}
              </div>

              {zoomedGallery.images.length > 1 ? (
                <div className="image-lightbox-thumbs">
                  {zoomedGallery.images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`image-lightbox-thumb ${zoomedGallery.currentIndex === index ? 'active' : ''}`}
                      onClick={() =>
                        setZoomedGallery((current) =>
                          current
                            ? {
                                ...current,
                                currentIndex: index,
                              }
                            : current
                        )
                      }
                      aria-label={`Ver imagen ${index + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt={`${zoomedGallery.productName} miniatura ${index + 1}`} />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
}

function ProductDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const shouldToggle = text.length > DESCRIPTION_TOGGLE_THRESHOLD;
  const previewText = shouldToggle ? `${text.slice(0, DESCRIPTION_PREVIEW_LENGTH).trimEnd()}...` : text;
  const displayedText = expanded ? text : previewText;

  return (
    <div className="product-description-block">
      <p>{displayedText}</p>
      {shouldToggle ? (
        <button
          type="button"
          className="product-description-toggle"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? 'Ver menos' : 'Leer más'}
        </button>
      ) : null}
    </div>
  );
}
