import React from 'react';
import type { WishRecord } from '../../types';
import { Modal } from '../shared/Modal/Modal';
import { LikeButton } from './LikeButton';
import { WishPhoto } from './WishPhoto';

interface WishModalProps {
  wish: WishRecord;
  liked: boolean;
  photoFailed: boolean;
  onPhotoError: () => void;
  onToggleLike: () => void;
  onClose: () => void;
}

const formatWishDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });

/** Enlarged postcard view (shared Modal: portal, scroll lock, Esc, focus). */
export const WishModal: React.FC<WishModalProps> = ({ wish, liked, photoFailed, onPhotoError, onToggleLike, onClose }) => (
  <Modal className="postcard-modal-overlay" ariaLabel={`Enlarged wish from ${wish.displayName}`} onClose={onClose}>
    <div className="postcard-modal-card">
      <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close enlarged view">
        ✕
      </button>

      <div className="modal-photo-container">
        <WishPhoto
          name={wish.displayName}
          photoUrl={wish.photoUrl}
          failed={photoFailed}
          onError={onPhotoError}
          imgClassName="modal-photo"
          monogramClassName="modal-monogram"
          ringClassName="postcard-monogram-ring modal-monogram-ring"
        />
      </div>

      <div className="modal-body-content">
        <p className="modal-wish-text">{wish.wish.trim() ? `“${wish.wish}”` : '❤'}</p>
        <div className="modal-author-row">
          <div className="modal-author-meta">
            <h4 className="modal-author-name">{wish.displayName}</h4>
            {wish.submittedAt && <span className="modal-date-tag">{formatWishDate(wish.submittedAt)}</span>}
          </div>
          <LikeButton authorName={wish.displayName} likesCount={wish.likesCount} liked={liked} large onToggle={onToggleLike} />
        </div>
      </div>
    </div>
  </Modal>
);
