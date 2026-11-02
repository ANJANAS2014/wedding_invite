import React, { useLayoutEffect, useRef } from 'react';
import { getInitials } from '../../utils/text';

interface WishPhotoProps {
  name: string;
  photoUrl?: string;
  failed: boolean;
  onError: () => void;
  imgClassName: string;
  /** Monogram wrapper / ring classes for the no-photo fallback. */
  monogramClassName: string;
  ringClassName: string;
  lazy?: boolean;
  /** Hide the monogram from assistive tech (cards; the modal keeps it). */
  monogramHidden?: boolean;
}

// Width / height of every wish photo seen so far, so the enlarged modal (and
// the marquee clones) know the shape before the image paints — no layout jump.
const ratioCache = new Map<string, number>();
const SHAPES = ['is-portrait', 'is-landscape', 'is-square'] as const;

const shapeFor = (ratio: number): (typeof SHAPES)[number] =>
  ratio < 0.95 ? 'is-portrait' : ratio > 1.05 ? 'is-landscape' : 'is-square';

/** Tags the photo's frame (parent element) with its shape, like the filmstrip's `.is-portrait`. */
const tagFrame = (frame: HTMLElement | null, ratio: number) => {
  if (!frame) return;
  frame.classList.remove(...SHAPES);
  frame.classList.add(shapeFor(ratio));
  frame.style.setProperty('--photo-ar', ratio.toFixed(3));
};

/**
 * Guest photo with a monogram fallback when missing or failed to load.
 * Portrait and square photos are shown whole on a soft blurred copy of
 * themselves; landscape photos fill the frame (see WishesWall.css).
 */
export const WishPhoto: React.FC<WishPhotoProps> = ({
  name,
  photoUrl,
  failed,
  onError,
  imgClassName,
  monogramClassName,
  ringClassName,
  lazy,
  monogramHidden,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);

  // Known shape (seen on another card) → apply before the first paint.
  useLayoutEffect(() => {
    const known = photoUrl ? ratioCache.get(photoUrl) : undefined;
    if (known) tagFrame(imgRef.current?.parentElement ?? null, known);
  }, [photoUrl]);

  if (!photoUrl || failed) {
    return (
      <div className={monogramClassName} aria-hidden={monogramHidden || undefined}>
        <span className={ringClassName}>{getInitials(name)}</span>
      </div>
    );
  }

  return (
    <>
      <span className="wish-photo-backdrop" aria-hidden="true" style={{ backgroundImage: `url(${JSON.stringify(photoUrl)})` }} />
      <img
        ref={imgRef}
        src={photoUrl}
        alt={`Photo shared by ${name}`}
        className={imgClassName}
        loading={lazy ? 'lazy' : undefined}
        onError={onError}
        onLoad={(e) => {
          const img = e.currentTarget;
          if (!img.naturalWidth || !img.naturalHeight) return;
          const ratio = img.naturalWidth / img.naturalHeight;
          ratioCache.set(photoUrl, ratio);
          tagFrame(img.parentElement, ratio);
        }}
      />
    </>
  );
};
