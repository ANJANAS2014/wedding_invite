import './WishesWall.css';
import React, { useEffect, useRef, useState } from 'react';
import type { WishRecord } from '../../types';
import { useWishes } from '../../hooks/useWishes';
import { useViewportWidth } from '../../hooks/useViewportWidth';
import { MandalaDivider } from '../shared/MandalaDivider/MandalaDivider';
import { computeCarouselLayout } from './wishesCarousel';
import { WishPostcard } from './WishPostcard';
import { WishModal } from './WishModal';
import { WishesEmptyState, WishesSkeleton } from './WishesStates';

interface WishesWallProps {
  /** Incremented after an RSVP so the wall reloads with the new wish. */
  refreshKey?: number;
}

export const WishesWall: React.FC<WishesWallProps> = ({ refreshKey = 0 }) => {
  const { wishes, isLoading, isLiked, toggleLike } = useWishes(refreshKey);
  const viewportWidth = useViewportWidth();
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [failedPhotos, setFailedPhotos] = useState<Record<string, boolean>>({});
  const [selectedWishId, setSelectedWishId] = useState<string | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  const { cardWidth, shouldAutoScroll, displayItems, marqueeDistance, durationSeconds } = computeCarouselLayout(
    wishes,
    viewportWidth
  );
  const selectedWish = selectedWishId ? wishes.find((w) => w.id === selectedWishId) || null : null;
  const showRail = !isLoading && wishes.length > 0 && shouldAutoScroll;

  // Pause the marquee while the wall is off-screen.
  useEffect(() => {
    if (!showRail || !railRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setIsPaused(!entry.isIntersecting)),
      { threshold: 0.1 }
    );
    observer.observe(railRef.current);
    return () => observer.disconnect();
  }, [showRail]);

  const markPhotoFailed = (id: string) => setFailedPhotos((prev) => ({ ...prev, [id]: true }));

  const renderPostcard = (item: WishRecord, index: number) => (
    <WishPostcard
      key={`${item.id}_${index}`}
      wish={item}
      cardWidth={cardWidth}
      liked={isLiked(item.id)}
      photoFailed={!!failedPhotos[item.id]}
      onPhotoError={() => markPhotoFailed(item.id)}
      onOpen={() => setSelectedWishId(item.id)}
      onToggleLike={() => toggleLike(item.id)}
    />
  );

  return (
    <section className="sec wishes-wall-section" id="wishes" aria-labelledby="wishes-title">
      <div className="wishes-section-header">
        <div className="wishes-heart-crest" aria-hidden="true">
          ♥
        </div>
        <h2 id="wishes-title">With love, from our people</h2>
        <p className="wishes-subtitle">A little love from everyone celebrating with us</p>
        <MandalaDivider className="wishes-divider" />

        {shouldAutoScroll && !isLoading && (
          <div className="wishes-controls-row">
            <button
              type="button"
              className="wishes-pause-btn"
              onClick={() => setIsPaused(!isPaused)}
              aria-label={isPaused ? 'Resume wishes carousel' : 'Pause wishes carousel'}
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? '▶ Play' : '⏸ Pause'}
            </button>
          </div>
        )}
      </div>

      {isLoading && <WishesSkeleton />}

      {!isLoading && wishes.length === 0 && <WishesEmptyState />}

      {showRail && (
        <div className="wishes-rail-viewport" aria-label="Wedding wishes carousel" ref={railRef}>
          <div
            key={`wishes-track-${viewportWidth}`}
            className={`wishes-rail-track ${isPaused ? 'is-paused' : ''}`}
            style={
              {
                '--wishes-duration': `${durationSeconds}s`,
                '--marquee-distance': `${marqueeDistance}px`,
                '--card-width': `${cardWidth}px`,
              } as React.CSSProperties
            }
          >
            {displayItems.map(renderPostcard)}
          </div>
        </div>
      )}

      {!isLoading && wishes.length > 0 && !shouldAutoScroll && (
        <div className="wishes-static-row" aria-label="Wedding wishes collection">
          {wishes.map(renderPostcard)}
        </div>
      )}

      {selectedWish && (
        <WishModal
          wish={selectedWish}
          liked={isLiked(selectedWish.id)}
          photoFailed={!!failedPhotos[selectedWish.id]}
          onPhotoError={() => markPhotoFailed(selectedWish.id)}
          onToggleLike={() => toggleLike(selectedWish.id)}
          onClose={() => setSelectedWishId(null)}
        />
      )}
    </section>
  );
};
