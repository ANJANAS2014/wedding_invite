import React from 'react';

interface LikeButtonProps {
  authorName: string;
  likesCount: number;
  liked: boolean;
  large?: boolean;
  onToggle: () => void;
}

export const LikeButton: React.FC<LikeButtonProps> = ({ authorName, likesCount, liked, large, onToggle }) => (
  <button
    type="button"
    className={`postcard-like-btn ${large ? 'large ' : ''}${liked ? 'liked' : ''}`}
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
    aria-label={`Like wish from ${authorName}${likesCount > 0 ? ` (${likesCount} likes)` : ''}`}
  >
    <span className="like-heart" aria-hidden="true">
      {liked ? '♥' : '♡'}
    </span>
    {likesCount > 0 && <span className="like-count">{likesCount}</span>}
  </button>
);
