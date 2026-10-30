import React, { useEffect, useRef, useState } from 'react';
import { WEDDING_CONTENT, WEDDING_GALLERY, WEDDING_IMAGES, GALLERY_DIMENSIONS } from '../data/weddingData';

interface CoupleSectionProps {
  onOpenLightbox: (index: number) => void;
}

export const CoupleSection: React.FC<CoupleSectionProps> = ({ onOpenLightbox }) => {
  const [storyExpanded, setStoryExpanded] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number>(0);
  const autoTimerRef = useRef<number | null>(null);

  const totalPhotos = WEDDING_GALLERY.length;

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPhotos);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  };

  useEffect(() => {
    if (isPaused) {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
      return;
    }

    autoTimerRef.current = window.setInterval(() => {
      nextPhoto();
    }, 4200);

    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [isPaused, totalPhotos]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) prevPhoto();
      else nextPhoto();
    }
  };

  // Split story into excerpt and rest
  const storyParagraphs = WEDDING_CONTENT.story.split(/\n\s*\n/);
  const excerpt = storyParagraphs.slice(0, 2);
  const rest = storyParagraphs.slice(2);

  return (
    <section className="sec rv in" id="couple">
      <div className="eyebrow">The couple</div>
      <h2>Bride &amp; Groom</h2>
      <div className="div">
        <svg viewBox="-50 -50 100 100" className="man">
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse key={i} rx="4" ry="22" cy="-26" transform={`rotate(${(i * 360) / 8})`} />
          ))}
          <circle r="2" style={{ fill: 'var(--gold)' }} />
        </svg>
      </div>

      <div className="cards">
        <div className="card">
          <div className="portrait-frame portrait-frame--groom">
            <img
              src={WEDDING_IMAGES.p12}
              alt={`${WEDDING_CONTENT.groom} portrait`}
              width={700}
              height={764}
              loading="lazy"
            />
          </div>
          <h3>{WEDDING_CONTENT.groom}</h3>
          <p>{WEDDING_CONTENT.groomStory}</p>
          <div className="vow">
            <span className="vow-label">
              HIS Vow <b aria-hidden="true">♥</b>
            </span>
            <p>{WEDDING_CONTENT.groomVow}</p>
          </div>
        </div>

        <div className="card">
          <div className="portrait-frame portrait-frame--bride">
            <img
              src={WEDDING_IMAGES.p10}
              alt={`${WEDDING_CONTENT.bride} portrait`}
              width={933}
              height={1400}
              loading="lazy"
            />
          </div>
          <h3>{WEDDING_CONTENT.bride}</h3>
          <p>{WEDDING_CONTENT.brideStory}</p>
          <div className="vow">
            <span className="vow-label">
              HER Vow <b aria-hidden="true">♥</b>
            </span>
            <p>{WEDDING_CONTENT.brideVow}</p>
          </div>
        </div>
      </div>

      <section className="story-reel" id="our-story" aria-label="Our story and memories">
        <article className="story-copy">
          <h2>Our Story</h2>
          <div className="story-excerpt">
            {excerpt.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {storyExpanded && (
            <div className="story-rest">
              {rest.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          )}

          <button
            className="story-toggle"
            type="button"
            onClick={() => setStoryExpanded(!storyExpanded)}
            aria-expanded={storyExpanded}
          >
            {storyExpanded ? (
              <>Show less <span aria-hidden="true">↙</span></>
            ) : (
              <>Read our story <span aria-hidden="true">↗</span></>
            )}
          </button>
        </article>

        <div className="memory-copy">
          <div
            className="memory-reel"
            id="memory-reel"
            role="region"
            aria-label="Moving reel of wedding photographs"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="reel-stage" ref={stageRef}>
              {WEDDING_GALLERY.map((photo, index) => {
                let offset = (index - currentIndex + totalPhotos) % totalPhotos;
                if (offset > totalPhotos / 2) offset -= totalPhotos;

                const isVisible = Math.abs(offset) <= 2;
                const stageWidth = 340; // baseline estimation for responsive 3d positioning
                const x = offset * 76;
                const y = offset === 0 ? 0 : Math.abs(offset) * 6;
                const scale = offset === 0 ? 1 : Math.max(0.7, 1 - Math.abs(offset) * 0.12);
                const opacity = offset === 0 ? 1 : Math.max(0.25, 1 - Math.abs(offset) * 0.32);
                const dims = GALLERY_DIMENSIONS[photo.src] || [1200, 1000];

                return (
                  <button
                    key={index}
                    className="reel-photo"
                    type="button"
                    onClick={() => onOpenLightbox(index)}
                    aria-label={`View ${photo.alt}`}
                    style={{
                      transform: `translate3d(${stageWidth / 2 + x}px, ${160 + y}px, 0) translate(-50%, -50%) rotate(${offset * 2}deg) scale(${scale})`,
                      zIndex: 30 - Math.abs(offset),
                      opacity: isVisible ? opacity : 0,
                      visibility: isVisible ? 'visible' : 'hidden',
                      pointerEvents: isVisible ? 'auto' : 'none',
                      ['--photo-ratio' as string]: photo.ratio,
                    }}
                  >
                    <img
                      src={WEDDING_IMAGES[photo.src] || photo.src}
                      alt={photo.alt}
                      width={dims[0]}
                      height={dims[1]}
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="reel-controls">
            <button
              className="reel-control"
              type="button"
              onClick={prevPhoto}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              className="reel-control reel-pause"
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              aria-label={isPaused ? 'Resume photo reel' : 'Pause photo reel'}
            >
              {isPaused ? '▶' : 'Ⅱ'}
            </button>
            <button
              className="reel-control"
              type="button"
              onClick={nextPhoto}
              aria-label="Next photo"
            >
              ›
            </button>
            <button
              className="reel-view"
              type="button"
              onClick={() => onOpenLightbox(currentIndex)}
            >
              View photo
            </button>
          </div>
        </div>
      </section>
    </section>
  );
};
