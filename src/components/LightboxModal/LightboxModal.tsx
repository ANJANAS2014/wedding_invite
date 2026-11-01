import './LightboxModal.css';
import React, { useRef } from 'react';
import { UNIFIED_MEMORIES } from '../../data/weddingData';
import { Modal } from '../shared/Modal/Modal';

interface LightboxModalProps {
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const SWIPE_THRESHOLD_PX = 40;

/** Full-screen photo viewer for the filmstrip: arrows, ← → keys, swipe, Esc. */
export const LightboxModal: React.FC<LightboxModalProps> = ({ currentIndex, onClose, onNext, onPrev }) => {
  const touchStartXRef = useRef<number>(0);
  const currentPhoto = UNIFIED_MEMORIES[currentIndex];
  if (!currentPhoto) return null;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onPrev();
    }
  };

  return (
    <Modal
      id="lb"
      ariaLabel="Wedding memories photo viewer"
      onClose={onClose}
      onKeyDown={handleKeyDown}
      onTouchStart={(e) => {
        touchStartXRef.current = e.changedTouches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const diff = e.changedTouches[0].clientX - touchStartXRef.current;
        if (Math.abs(diff) > SWIPE_THRESHOLD_PX) {
          if (diff > 0) onPrev();
          else onNext();
        }
      }}
    >
      <button className="lb-close" type="button" aria-label="Close photo viewer" onClick={onClose}>
        ×
      </button>

      <button className="lb-prev" type="button" aria-label="Previous photo" onClick={onPrev}>
        ‹
      </button>

      <img src={currentPhoto.src} alt={currentPhoto.alt || `Wedding memory ${currentIndex + 1}`} decoding="async" />

      <button className="lb-next" type="button" aria-label="Next photo" onClick={onNext}>
        ›
      </button>
    </Modal>
  );
};
