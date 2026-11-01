import React from 'react';

/** Three shimmering placeholder cards while wishes load. */
export const WishesSkeleton: React.FC = () => (
  <div className="wishes-static-row" aria-label="Loading wishes">
    {[0, 1, 2].map((i) => (
      <div key={i} className="skeleton-postcard">
        <div className="skeleton-photo" />
        <div className="skeleton-lines">
          <div className="skeleton-line w-80" />
          <div className="skeleton-line w-60" />
        </div>
      </div>
    ))}
  </div>
);

export const WishesEmptyState: React.FC = () => (
  <div className="empty-wishes-state" role="region" aria-label="No wishes yet">
    <div className="empty-envelope-icon" aria-hidden="true">
      <svg width="44" height="36" viewBox="0 0 44 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1.5" y="4.5" width="41" height="29" rx="4" fill="#FBF5EA" stroke="#C19A3D" strokeWidth="1.3" />
        <path d="M2.5 6.5L22 21L41.5 6.5" stroke="#C19A3D" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M22 22.8C22 22.8 17 19.3 17 16.5C17 15 18.2 13.9 19.6 13.9C20.6 13.9 21.5 14.5 22 15.3C22.5 14.5 23.4 13.9 24.4 13.9C25.8 13.9 27 15 27 16.5C27 19.3 22 22.8 22 22.8Z"
          fill="#8B2233"
        />
      </svg>
    </div>
    <h3>No wishes received yet.</h3>
    <p>Be the first to share your wishes with us ❤️</p>
  </div>
);
