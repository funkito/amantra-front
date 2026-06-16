'use client';

import { useMemo, useState } from 'react';

interface ProductDetailGalleryProps {
  productName: string;
  images: string[];
  fallbackLabel: string;
  fallbackAccent: string;
}

export default function ProductDetailGallery({
  productName,
  images,
  fallbackLabel,
  fallbackAccent,
}: ProductDetailGalleryProps) {
  const galleryImages = useMemo(() => images.filter(Boolean), [images]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const activeImage = galleryImages[currentIndex];

  return (
    <>
      <div className="product-detail-gallery">
        {activeImage ? (
          <>
            <button
              type="button"
              className="product-detail-gallery-main"
              onClick={() => setIsLightboxOpen(true)}
              aria-label={`Ver imagen ampliada de ${productName}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activeImage} alt={`${productName} imagen ${currentIndex + 1}`} className="product-detail-image" />

              {galleryImages.length > 1 ? (
                <span className="product-detail-gallery-count">
                  {currentIndex + 1} / {galleryImages.length}
                </span>
              ) : null}
            </button>

            {galleryImages.length > 1 ? (
              <div className="product-detail-gallery-thumbs">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={`product-detail-gallery-thumb ${currentIndex === index ? 'active' : ''}`}
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Ver imagen ${index + 1} de ${productName}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={`${productName} miniatura ${index + 1}`} />
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className={`product-visual bg-gradient-to-br ${fallbackAccent}`}>
            <span>{fallbackLabel}</span>
          </div>
        )}
      </div>

      {isLightboxOpen && activeImage ? (
        <>
          <button
            type="button"
            className="image-lightbox-backdrop"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Cerrar vista ampliada"
          />

          <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={productName}>
            <div className="image-lightbox-panel">
              <div className="image-lightbox-header">
                <div>
                  <div className="eyebrow">Galería del producto</div>
                  <h3 className="image-lightbox-title">{productName}</h3>
                </div>
                <button type="button" className="image-lightbox-close" onClick={() => setIsLightboxOpen(false)}>
                  Cerrar
                </button>
              </div>

              <div className="image-lightbox-stage">
                {galleryImages.length > 1 ? (
                  <button
                    type="button"
                    className="image-lightbox-nav image-lightbox-nav-left"
                    onClick={() =>
                      setCurrentIndex((current) => (current === 0 ? galleryImages.length - 1 : current - 1))
                    }
                    aria-label="Imagen anterior"
                  >
                    ‹
                  </button>
                ) : null}

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={activeImage} alt={`${productName} ${currentIndex + 1}`} className="image-lightbox-image" />

                {galleryImages.length > 1 ? (
                  <button
                    type="button"
                    className="image-lightbox-nav image-lightbox-nav-right"
                    onClick={() =>
                      setCurrentIndex((current) => (current === galleryImages.length - 1 ? 0 : current + 1))
                    }
                    aria-label="Siguiente imagen"
                  >
                    ›
                  </button>
                ) : null}
              </div>

              {galleryImages.length > 1 ? (
                <div className="image-lightbox-thumbs">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`image-lightbox-thumb ${currentIndex === index ? 'active' : ''}`}
                      onClick={() => setCurrentIndex(index)}
                      aria-label={`Ver imagen ${index + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt={`${productName} miniatura ${index + 1}`} />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}

