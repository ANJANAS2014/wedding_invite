import React from 'react';
import type { WishRecord } from '../../types';
import { LikeButton } from './LikeButton';
import { WishPhoto } from './WishPhoto';
import { WishStamp } from './WishStamp';

interface WishPostcardProps {
  wish: WishRecord;
  cardWidth: number;
  liked: boolean;
  photoFailed: boolean;
  onPhotoError: () => void;
  onOpen: () => void;
  onToggleLike: () => void;
}

/** One keepsake postcard on the wall; click / Enter / Space opens the modal. */
export const WishPostcard: React.FC<WishPostcardProps> = ({
  wish,
  cardWidth,
  liked,
  photoFailed,
  onPhotoError,
  onOpen,
  onToggleLike,
}) => (
  <article
    className="postcard-card"
    style={{ width: `${cardWidth}px`, maxWidth: `${cardWidth}px` }}
    onClick={onOpen}
    tabIndex={0}
    role="button"
    aria-label={`View wish from ${wish.displayName}`}
    onKeyDown={(e) => {
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
      <WishStamp weddingAttending={wish.weddingAttending} receptionAttending={wish.receptionAttending} />
    </div>

    <div className="postcard-content">
      <p className="postcard-message">“{wish.wish}”</p>
      <div className="postcard-footer">
        <span className="postcard-author">{wish.displayName}</span>
        <LikeButton authorName={wish.displayName} likesCount={wish.likesCount} liked={liked} onToggle={onToggleLike} />
      </div>
    </div>
  </article>
);
