import React, { useLayoutEffect, useRef, useState } from 'react';
import type { WishRecord } from '../../types';
import { LikeButton } from './LikeButton';
import { WishPhoto } from './WishPhoto';
import { WishStamp } from './WishStamp';

interface WishPostcardProps {
  wish: WishRecord;
  liked: boolean;
  photoFailed: boolean;
  /** Marquee duplicate: hidden from assistive tech and the tab order. */
  isClone?: boolean;
  onPhotoError: () => void;
  onOpen: () => void;
  onToggleLike: () => void;
}

const MAX_FULL_NAME_LENGTH = 18;

/** "Firstname L." for names longer than 18 characters; otherwise the full name. */
export const shortenAuthorName = (name: string): string => {
  const trimmed = name.trim();
  if (trimmed.length <= MAX_FULL_NAME_LENGTH) return trimmed;
  const parts = trimmed.split(/\s+/);
  if (parts.length < 2) return trimmed;
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
};

/** True while the element's text is cut off by its line clamp. */
function useIsClamped<T extends HTMLElement>(ref: React.RefObject<T>, text: string): boolean {
  const [clamped, setClamped] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setClamped(el.scrollHeight - el.clientHeight > 1);
    check();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, text]);
  return clamped;
}

/** One keepsake postcard on the wall; click / Enter / Space opens the modal. */
export const WishPostcard: React.FC<WishPostcardProps> = ({
  wish,
  liked,
  photoFailed,
  isClone = false,
  onPhotoError,
  onOpen,
  onToggleLike,
}) => {
  const cardRef = useRef<HTMLElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const isClamped = useIsClamped(messageRef, wish.wish);
  const authorName = shortenAuthorName(wish.displayName);

  // Clones are decorative copies for the seamless marquee loop: keep their
  // inner like button out of the tab order as well.
  useLayoutEffect(() => {
    if (!isClone || !cardRef.current) return;
    cardRef.current.querySelectorAll<HTMLElement>('button, a, [tabindex]').forEach((el) => {
      if (el !== cardRef.current) el.tabIndex = -1;
    });
  }, [isClone]);

  return (
    <article
      ref={cardRef}
      className="postcard-card"
      onClick={onOpen}
      tabIndex={isClone ? -1 : 0}
      role="button"
      aria-hidden={isClone || undefined}
      aria-label={`View wish from ${wish.displayName}`}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="postcard-photo-frame">
        <WishPhoto
          name={wish.displayName}
          photoUrl={wish.photoUrl}
          failed={photoFailed}
          onError={onPhotoError}
          imgClassName="postcard-photo"
          monogramClassName="postcard-monogram"
          ringClassName="postcard-monogram-ring"
          lazy
          monogramHidden
        />
        <div className="postcard-photo-sheen" aria-hidden="true" />
      </div>

      <div className="postcard-content">
        <WishStamp weddingAttending={wish.weddingAttending} receptionAttending={wish.receptionAttending} />
        <p className="postcard-message" ref={messageRef}>
          “{wish.wish}”
        </p>
        {isClamped && (
          <span className="postcard-read-more" aria-hidden="true">
            Read more
          </span>
        )}
        <div className="postcard-footer">
          <span className="postcard-author" title={wish.displayName}>
            {authorName}
          </span>
          <LikeButton authorName={wish.displayName} likesCount={wish.likesCount} liked={liked} onToggle={onToggleLike} />
        </div>
      </div>
    </article>
  );
};
