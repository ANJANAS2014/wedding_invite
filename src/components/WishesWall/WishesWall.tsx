import './WishesWall.css';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { WishRecord } from '../../types';
import { useWishes } from '../../hooks/useWishes';
import { MandalaDivider } from '../shared/MandalaDivider/MandalaDivider';
import { computeCarouselLayout } from './wishesCarousel';
import { WishPostcard } from './WishPostcard';
import { WishModal } from './WishModal';
import { WishesEmptyState, WishesSkeleton } from './WishesStates';

interface WishesWallProps {
  /** Incremented after an RSVP so the wall reloads with the new wish. */
  refreshKey?: number;
}

const TOUCH_RESUME_DELAY_MS = 2000;

/**
 * window.innerWidth, updated only when the *width* changes (rAF-debounced).
 * iOS Safari / Android Chrome fire `resize` whenever the URL bar shows or
 * hides; those height-only resizes are ignored so the wall doesn't re-layout
 * mid-scroll.
 */
function useStableViewportWidth(): number {
  const [width, setWidth] = useState<number>(() => (typeof window === 'undefined' ? 1024 : window.innerWidth));
  useEffect(() => {
    let frame = 0;
    let last = window.innerWidth;
    setWidth(last);
    const handleResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = window.innerWidth;
        if (next !== last) {
          last = next;
          setWidth(next);
        }
      });
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
  return width;
}

export const WishesWall: React.FC<WishesWallProps> = ({ refreshKey = 0 }) => {
  const { wishes, isLoading, isLiked, toggleLike } = useWishes(refreshKey);
  const viewportWidth = useStableViewportWidth();
  const [userPaused, setUserPaused] = useState<boolean>(false);
  const [offscreen, setOffscreen] = useState<boolean>(false);
  const [touchPaused, setTouchPaused] = useState<boolean>(false);
  const [failedPhotos, setFailedPhotos] = useState<Record<string, boolean>>({});
  const [selectedWishId, setSelectedWishId] = useState<string | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<number | undefined>(undefined);

  const { shouldAutoScroll, displayItems, originalCount, marqueeDistance, durationSeconds } = computeCarouselLayout(
    wishes,
    viewportWidth
  );
  const selectedWish = selectedWishId ? wishes.find((w) => w.id === selectedWishId) || null : null;
  const showRail = !isLoading && wishes.length > 0 && shouldAutoScroll;
  const isPaused = userPaused || offscreen || touchPaused;

  // Pause the marquee while the wall is off-screen.
  useEffect(() => {
    if (!showRail || !railRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => setOffscreen(!entry.isIntersecting)),
      { threshold: 0.1 }
    );
    observer.observe(railRef.current);
    return () => observer.disconnect();
  }, [showRail]);

  // Loop distance = offset of the first clone, measured from the DOM so it
  // always matches the CSS card width. Re-measured when the track resizes
  // (fonts loading, rotation) instead of remounting the track.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!showRail || !track) return;
    const measure = () => {
      const first = track.children[0] as HTMLElement | undefined;
      const firstClone = track.children[originalCount] as HTMLElement | undefined;
      const distance = first && firstClone ? firstClone.offsetLeft - first.offsetLeft : marqueeDistance;
      track.style.setProperty('--marquee-distance', `${distance > 0 ? distance : marqueeDistance}px`);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [showRail, originalCount, displayItems.length, marqueeDistance]);

  useEffect(() => () => window.clearTimeout(resumeTimerRef.current), []);

  const handleTouchStart = () => {
    window.clearTimeout(resumeTimerRef.current);
    setTouchPaused(true);
  };
  const handleTouchEnd = () => {
    window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => setTouchPaused(false), TOUCH_RESUME_DELAY_MS);
  };

  const markPhotoFailed = (id: string) => setFailedPhotos((prev) => ({ ...prev, [id]: true }));

  const renderPostcard = (item: WishRecord, index: number) => (
    <WishPostcard
      key={`${item.id}_${index}`}
      wish={item}
      isClone={index >= originalCount}
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

        {showRail && (
          <div className="wishes-controls-row">
            <button
              type="button"
              className="wishes-pause-btn"
              onClick={() => setUserPaused((paused) => !paused)}
              aria-label={userPaused ? 'Resume wishes carousel' : 'Pause wishes carousel'}
              title={userPaused ? 'Resume' : 'Pause'}
            >
              {userPaused ? '▶ Play' : '⏸ Pause'}
            </button>
          </div>
        )}
      </div>

      {isLoading && <WishesSkeleton />}

      {!isLoading && wishes.length === 0 && <WishesEmptyState />}

      {showRail && (
        <div
          className="wishes-rail-viewport"
          aria-label="Wedding wishes carousel"
          ref={railRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <div
            ref={trackRef}
            className={`wishes-rail-track ${isPaused ? 'is-paused' : ''}`}
            style={{ '--wishes-duration': `${durationSeconds}s` } as React.CSSProperties}
          >
            {displayItems.map(renderPostcard)}
          </div>
        </div>
      )}

      {!isLoading && wishes.length > 0 && !shouldAutoScroll && (
        <div
          className={`wishes-static-row wishes-static-row--${Math.min(wishes.length, 3)}`}
          aria-label="Wedding wishes collection"
        >
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
