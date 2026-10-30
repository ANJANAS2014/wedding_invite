import React, { useState, useEffect, useRef } from 'react';
import { REELS_PHOTOS } from '../data/weddingData';

export const OurReelsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const touchStartXRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  const total = REELS_PHOTOS.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  // Manage autoplay
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      nextSlide();
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentIndex, total]);

  // Handle manual navigation without breaking autoplay
  const handleManualNext = () => {
    nextSlide();
    if (isPlaying && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = window.setInterval(nextSlide, 4500);
    }
  };

  const handleManualPrev = () => {
    prevSlide();
    if (isPlaying && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = window.setInterval(nextSlide, 4500);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleManualPrev();
      else handleManualNext();
    }
  };

  const currentPhoto = REELS_PHOTOS[currentIndex];

  return (
    <div className="our-reels-container" aria-labelledby="our-reels-heading">
      <div className="reels-header">
        <span className="eyebrow reels-prompt">Moments in Motion</span>
        <h2 id="our-reels-heading" className="reels-title">Our Reels</h2>
        <div className="div reels-div">
          <svg viewBox="-50 -50 100 100" className="man">
            {Array.from({ length: 8 }, (_, i) => (
              <ellipse key={i} rx="4" ry="22" cy="-26" transform={`rotate(${(i * 360) / 8})`} />
            ))}
            <circle r="2" style={{ fill: 'var(--gold)' }} />
          </svg>
        </div>
      </div>

      <div
        className="reel-stage-viewport"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="reel-frame">
          {REELS_PHOTOS.map((photo, index) => {
            const isActive = index === currentIndex;
            return (
              <div
                key={index}
                className={`reel-slide ${isActive ? 'is-active' : ''}`}
                aria-hidden={!isActive}
              >
                <img
                  src={photo.src}
                  alt={photo.caption}
                  className="reel-image"
                  loading={index <= 1 ? 'eager' : 'lazy'}
                />
              </div>
            );
          })}

          {/* Vignette & Soft Gradient Overlay */}
          <div className="reel-overlay" />

          {/* Floating Caption Badge */}
          <div className="reel-caption-card">
            <h3 className="reel-caption-title">{currentPhoto.caption}</h3>
            {currentPhoto.subcaption && (
              <p className="reel-caption-sub">{currentPhoto.subcaption}</p>
            )}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="reel-action-bar">
          <button
            type="button"
            className="reel-btn reel-btn-nav"
            onClick={handleManualPrev}
            aria-label="Previous reel moment"
          >
            ‹
          </button>

          <button
            type="button"
            className="reel-btn reel-btn-play"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause reel playback' : 'Play reel'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <button
            type="button"
            className="reel-btn reel-btn-nav"
            onClick={handleManualNext}
            aria-label="Next reel moment"
          >
            ›
          </button>

          <div className="reel-progress-pills" role="tablist" aria-label="Reel slide selectors">
            {REELS_PHOTOS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`reel-pill ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                role="tab"
                aria-selected={idx === currentIndex}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
