import React, { useState } from 'react';
import { WEDDING_CONTENT, UNIFIED_MEMORIES } from '../data/weddingData';

interface OurStoryAndFilmstripSectionProps {
  onOpenLightbox: (index: number) => void;
}

export const OurStoryAndFilmstripSection: React.FC<OurStoryAndFilmstripSectionProps> = ({ onOpenLightbox }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const paragraphs = WEDDING_CONTENT.story.split(/\n\s*\n/);

  return (
    <section className="our-story-filmstrip-section" id="story-filmstrip-section" aria-labelledby="our-story-heading">
      <div className="story-filmstrip-container">
        
        {/* Part 1: Our Story Editorial Card */}
        <article className="our-story-editorial" aria-labelledby="our-story-heading">
          <div className="story-header">
            <span className="eyebrow story-prompt">Read how it all began</span>
            <h2 id="our-story-heading" className="story-title">Our Story</h2>
            <div className="div story-div">
              <svg viewBox="-50 -50 100 100" className="man">
                {Array.from({ length: 8 }, (_, i) => (
                  <ellipse key={i} rx="4" ry="22" cy="-26" transform={`rotate(${(i * 360) / 8})`} />
                ))}
                <circle r="2" style={{ fill: 'var(--gold)' }} />
              </svg>
            </div>
          </div>

          <div className={`story-body-container ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}>
            <div className="story-body">
              {paragraphs.map((para, index) => (
                <p key={index} className={index === 0 ? 'story-lead-p' : ''}>
                  {para}
                </p>
              ))}
            </div>
          </div>

          <div className="story-toggle-wrapper">
            <button
              type="button"
              className="story-toggle-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
            >
              {isExpanded ? 'Show less ↑' : 'Show more ↓'}
            </button>
          </div>
        </article>

        {/* Part 2: Moving 35mm Photographic Filmstrip */}
        <div className="filmstrip-wrapper" aria-label="35mm photographic memory filmstrip">
          <div className="filmstrip-header-bar">
            <span className="eyebrow">Archival Memories</span>
            <div className="filmstrip-controls">
              <button
                type="button"
                className="filmstrip-toggle-btn"
                onClick={() => setIsPaused(!isPaused)}
                aria-label={isPaused ? 'Resume filmstrip animation' : 'Pause filmstrip animation'}
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? '▶ Play' : '⏸ Pause'}
              </button>
            </div>
          </div>

          <div className="filmstrip-viewport">
            <div
              className={`filmstrip-track ${isPaused ? 'is-paused' : ''}`}
              style={{ '--total-items': UNIFIED_MEMORIES.length } as React.CSSProperties}
            >
              {/* Render track twice for seamless infinite looping */}
              {[...UNIFIED_MEMORIES, ...UNIFIED_MEMORIES].map((photo, index) => {
                const actualIndex = index % UNIFIED_MEMORIES.length;
                const frameNum = (actualIndex + 20).toString();
                return (
                  <div
                    key={index}
                    className="film-frame"
                    onClick={() => onOpenLightbox(actualIndex)}
                    tabIndex={0}
                    role="button"
                    aria-label={`View photo ${actualIndex + 1}: ${photo.alt}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onOpenLightbox(actualIndex);
                      }
                    }}
                  >
                    {/* Top Sprocket Holes */}
                    <div className="film-sprockets top-sprockets">
                      {Array.from({ length: 4 }, (_, s) => (
                        <span key={s} className="sprocket-hole" />
                      ))}
                    </div>

                    {/* Image Picture Box */}
                    <div className="film-picture-box">
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        loading={actualIndex <= 2 ? 'eager' : 'lazy'}
                        className="film-picture-img"
                      />
                      <div className="film-frame-sheen" />
                    </div>

                    {/* Bottom Sprocket Holes & Film Numbering */}
                    <div className="film-sprockets bottom-sprockets">
                      {Array.from({ length: 4 }, (_, s) => (
                        <span key={s} className="sprocket-hole" />
                      ))}
                      <span className="film-edge-code">{frameNum}</span>
                      <span className="film-edge-brand">SCRL E100</span>
                      <span className="film-edge-code">{frameNum}A</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
