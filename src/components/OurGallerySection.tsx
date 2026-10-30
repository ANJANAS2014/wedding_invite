import React from 'react';
import { WEDDING_GALLERY, WEDDING_IMAGES, GALLERY_DIMENSIONS } from '../data/weddingData';

interface OurGallerySectionProps {
  onOpenLightbox: (index: number) => void;
}

export const OurGallerySection: React.FC<OurGallerySectionProps> = ({ onOpenLightbox }) => {
  return (
    <section className="our-gallery-section" id="gallery-section" aria-labelledby="gallery-heading">
      <div className="gallery-header">
        <span className="eyebrow gallery-prompt">Cherished Memories</span>
        <h2 id="gallery-heading" className="gallery-title">Our Gallery</h2>
        <div className="div gallery-div">
          <svg viewBox="-50 -50 100 100" className="man">
            {Array.from({ length: 8 }, (_, i) => (
              <ellipse key={i} rx="4" ry="22" cy="-26" transform={`rotate(${(i * 360) / 8})`} />
            ))}
            <circle r="2" style={{ fill: 'var(--gold)' }} />
          </svg>
        </div>
      </div>

      {/* Editorial Scrapbook Masonry Grid */}
      <div className="scrapbook-grid">
        {WEDDING_GALLERY.map((photo, index) => {
          const dims = GALLERY_DIMENSIONS[photo.src] || [1200, 1000];
          const isLandscape = photo.ratio === '3/2';

          return (
            <figure
              key={index}
              className={`scrapbook-item ${isLandscape ? 'item-landscape' : 'item-portrait'} item-idx-${index}`}
              onClick={() => onOpenLightbox(index)}
              tabIndex={0}
              role="button"
              aria-label={`View ${photo.alt} in photo viewer`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpenLightbox(index);
                }
              }}
            >
              <div className="scrapbook-frame">
                <img
                  src={WEDDING_IMAGES[photo.src] || photo.src}
                  alt={photo.alt}
                  width={dims[0]}
                  height={dims[1]}
                  loading="lazy"
                  className="scrapbook-image"
                />
                <div className="scrapbook-hover-sheen" />
                <span className="scrapbook-corner corner-tl" aria-hidden="true" />
                <span className="scrapbook-corner corner-tr" aria-hidden="true" />
                <span className="scrapbook-corner corner-bl" aria-hidden="true" />
                <span className="scrapbook-corner corner-br" aria-hidden="true" />
              </div>
              <figcaption className="scrapbook-caption">
                <span>{photo.alt}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
};
