import React, { useEffect, useRef } from 'react';
import { UNIFIED_MEMORIES_WITH_EXTRAS } from '../data/weddingData';

interface LightboxModalProps {
  currentIndex: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  currentIndex,
  onClose,
  onNext,
  onPrev
}) => {
  const touchStartXRef = useRef<number>(0);

  useEffect(() => {
    if (currentIndex === null) return;

    document.body.classList.add('lightbox-open');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('lightbox-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, onClose, onNext, onPrev]);

  if (currentIndex === null) return null;

  const currentPhoto = UNIFIED_MEMORIES_WITH_EXTRAS[currentIndex];
  if (!currentPhoto) return null;

  const photoSrc = currentPhoto.src;

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) onPrev();
      else onNext();
    }
  };

  return (
    <div
      id="lb"
      role="dialog"
      aria-modal="true"
      aria-label="Wedding memories photo viewer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        className="lb-close"
        type="button"
        aria-label="Close photo viewer"
        onClick={onClose}
      >
        ×
      </button>

      <button
        className="lb-prev"
        type="button"
        aria-label="Previous photo"
        onClick={onPrev}
      >
        ‹
      </button>

      <img
        src={photoSrc}
        alt={currentPhoto.alt || `Wedding memory ${currentIndex + 1}`}
        decoding="async"
      />

      <button
        className="lb-next"
        type="button"
        aria-label="Next photo"
        onClick={onNext}
      >
        ›
      </button>
    </div>
  );
};
