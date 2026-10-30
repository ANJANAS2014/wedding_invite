import React, { useEffect, useState } from 'react';

export interface WishRecord {
  id: string;
  displayName: string;
  wish: string;
  photoUrl?: string;
  submittedAt: string;
  likesCount: number;
}

const LOCAL_STORAGE_LIKES_KEY = 'wedding_wish_likes_v1';
const LOCAL_STORAGE_WISHES_KEY = 'wedding_user_wishes_v1';

export const WishesWall: React.FC = () => {
  const [wishes, setWishes] = useState<WishRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [userLikedMap, setUserLikedMap] = useState<Record<string, boolean>>({});
  const [selectedWish, setSelectedWish] = useState<WishRecord | null>(null);

  useEffect(() => {
    try {
      const storedLikes = localStorage.getItem(LOCAL_STORAGE_LIKES_KEY);
      if (storedLikes) {
        const parsed = JSON.parse(storedLikes);
        if (parsed && typeof parsed === 'object') {
          setUserLikedMap(parsed.userLiked || {});
          setLikesMap(parsed.counts || {});
        }
      }
    } catch {
      // ignore
    }

    fetchWishes();
  }, []);

  const fetchWishes = async () => {
    setIsLoading(true);
    try {
      let fetched: WishRecord[] = [];

      try {
        const res = await fetch('/.netlify/functions/wishes');
        if (res.ok) {
          const data = await res.json();
          if (data && data.ok && Array.isArray(data.wishes)) {
            fetched = data.wishes.map((w: any, idx: number) => ({
              id: w.id || `api_wish_${idx}`,
              displayName: w.displayName,
              wish: w.wish,
              photoUrl: w.photoUrl,
              submittedAt: w.submittedAt || new Date().toISOString(),
              likesCount: Number(w.likesCount) || 0
            }));
          }
        }
      } catch {
        // ignore
      }

      try {
        const rsvpStored = localStorage.getItem('wedding_rsvps_v2');
        if (rsvpStored) {
          const parsed = JSON.parse(rsvpStored);
          if (Array.isArray(parsed)) {
            parsed.forEach((r, idx) => {
              if (r.wishes && r.wishes.trim().length > 0) {
                const id = r.id || `rsvp_wish_${idx}`;
                if (!fetched.some((item) => item.id === id || item.displayName.toLowerCase() === r.name.toLowerCase())) {
                  fetched.push({
                    id,
                    displayName: r.name,
                    wish: r.wishes,
                    photoUrl: r.photoPreview || r.photoUrl,
                    submittedAt: r.submittedAt || new Date().toISOString(),
                    likesCount: 0
                  });
                }
              }
            });
          }
        }

        const userWishesStored = localStorage.getItem(LOCAL_STORAGE_WISHES_KEY);
        if (userWishesStored) {
          const parsed = JSON.parse(userWishesStored);
          if (Array.isArray(parsed)) {
            parsed.forEach((w) => {
              if (!fetched.some((item) => item.id === w.id)) {
                fetched.push(w);
              }
            });
          }
        }
      } catch {
        // ignore
      }

      // Sort newest first
      fetched.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

      // Merge likes count
      const updated = fetched.map((item) => {
        const extraLikes = likesMap[item.id] || 0;
        return {
          ...item,
          likesCount: (item.likesCount || 0) + extraLikes
        };
      });

      setWishes(updated);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLike = (e: React.MouseEvent, wishId: string) => {
    e.stopPropagation();
    const isCurrentlyLiked = !!userLikedMap[wishId];
    const newLikedMap = { ...userLikedMap, [wishId]: !isCurrentlyLiked };
    const diff = isCurrentlyLiked ? -1 : 1;
    const newCountsMap = { ...likesMap, [wishId]: (likesMap[wishId] || 0) + diff };

    setUserLikedMap(newLikedMap);
    setLikesMap(newCountsMap);

    try {
      localStorage.setItem(
        LOCAL_STORAGE_LIKES_KEY,
        JSON.stringify({ userLiked: newLikedMap, counts: newCountsMap })
      );
    } catch {
      // ignore
    }

    setWishes((prev) =>
      prev.map((w) =>
        w.id === wishId ? { ...w, likesCount: Math.max(0, w.likesCount + diff) } : w
      )
    );

    if (selectedWish && selectedWish.id === wishId) {
      setSelectedWish((prev) =>
        prev ? { ...prev, likesCount: Math.max(0, prev.likesCount + diff) } : null
      );
    }
  };

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0] || '')
      .join('')
      .toUpperCase() || '♥';
  };

  return (
    <section className="sec rv in wishes-wall-section" id="wishes" aria-labelledby="wishes-title">
      <div className="filmstrip-header-bar" style={{ borderBottom: 'none', padding: '0 0 12px' }}>
        <h2 id="wishes-title">With love, from our people</h2>
        <div className="filmstrip-controls">
          <button
            type="button"
            className="filmstrip-toggle-btn"
            onClick={() => setIsPaused(!isPaused)}
            aria-label={isPaused ? 'Resume wishes carousel' : 'Pause wishes carousel'}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? '▶ Play' : '⏸ Pause'}
          </button>
        </div>
      </div>
      <div className="div" style={{ margin: '4px auto 20px' }}>
        <svg viewBox="-50 -50 100 100" className="man">
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse key={i} rx="4" ry="22" cy="-26" transform={`rotate(${(i * 360) / 8})`} />
          ))}
          <circle r="2" style={{ fill: 'var(--gold)' }} />
        </svg>
      </div>

      {isLoading && (
        <div className="filmstrip-viewport">
          <div className="filmstrip-track">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton-postcard" style={{ width: '260px', flex: '0 0 auto' }}>
                <div className="skeleton-photo" />
                <div className="skeleton-lines">
                  <div className="skeleton-line w-80" />
                  <div className="skeleton-line w-60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && wishes.length === 0 && (
        <div className="empty-wishes-state" role="region" aria-label="No wishes yet">
          <div className="empty-envelope-icon" aria-hidden="true">💌</div>
          <h3>No wishes received yet.</h3>
          <p>Be the first to share your wishes with us ❤️</p>
        </div>
      )}

      {!isLoading && wishes.length > 0 && (
        <div className="filmstrip-viewport" aria-label="Wedding wishes carousel">
          <div
            className={`filmstrip-track ${isPaused ? 'is-paused' : ''}`}
            style={{ '--total-items': wishes.length } as React.CSSProperties}
          >
            {[...wishes, ...wishes].map((item, index) => {
              const isLiked = !!userLikedMap[item.id];
              return (
                <article
                  key={`${item.id}_${index}`}
                  className="postcard-card carousel-card"
                  onClick={() => setSelectedWish(item)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View wish from ${item.displayName}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedWish(item);
                    }
                  }}
                >
                  <div className="postcard-stamp" aria-hidden="true">
                    <span>29 NOV</span>
                    <span className="stamp-seal">♥</span>
                  </div>

                  <div className="postcard-photo-frame">
                    {item.photoUrl ? (
                      <img
                        src={item.photoUrl}
                        alt={`Photo shared by ${item.displayName}`}
                        className="postcard-photo"
                        loading="lazy"
                      />
                    ) : (
                      <div className="postcard-monogram" aria-hidden="true">
                        {getInitials(item.displayName)}
                      </div>
                    )}
                    <div className="postcard-photo-sheen" aria-hidden="true" />
                  </div>

                  <div className="postcard-content">
                    <p className="postcard-message">“{item.wish}”</p>
                    
                    <div className="postcard-footer">
                      <span className="postcard-author">{item.displayName}</span>
                      <button
                        type="button"
                        className={`postcard-like-btn ${isLiked ? 'liked' : ''}`}
                        onClick={(e) => handleToggleLike(e, item.id)}
                        aria-label={`Like wish from ${item.displayName} (${item.likesCount} likes)`}
                      >
                        <span className="like-heart" aria-hidden="true">{isLiked ? '♥' : '♡'}</span>
                        {item.likesCount > 0 && <span className="like-count">{item.likesCount}</span>}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Enlarged Postcard Modal */}
      {selectedWish && (
        <div
          className="postcard-modal-overlay"
          onClick={() => setSelectedWish(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Enlarged wish from ${selectedWish.displayName}`}
        >
          <div
            className="postcard-modal-card"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSelectedWish(null);
            }}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedWish(null)}
              aria-label="Close enlarged view"
            >
              ✕
            </button>

            <div className="modal-photo-container">
              {selectedWish.photoUrl ? (
                <img
                  src={selectedWish.photoUrl}
                  alt={`Photo shared by ${selectedWish.displayName}`}
                  className="modal-photo"
                />
              ) : (
                <div className="modal-monogram">
                  {getInitials(selectedWish.displayName)}
                </div>
              )}
            </div>

            <div className="modal-body-content">
              <p className="modal-wish-text">“{selectedWish.wish}”</p>
              
              <div className="modal-author-row">
                <div>
                  <h4 className="modal-author-name">{selectedWish.displayName}</h4>
                  <span className="modal-date-tag">
                    {new Date(selectedWish.submittedAt).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <button
                  type="button"
                  className={`postcard-like-btn large ${!!userLikedMap[selectedWish.id] ? 'liked' : ''}`}
                  onClick={(e) => handleToggleLike(e, selectedWish.id)}
                  aria-label={`Like wish from ${selectedWish.displayName} (${selectedWish.likesCount} likes)`}
                >
                  <span className="like-heart" aria-hidden="true">
                    {!!userLikedMap[selectedWish.id] ? '♥' : '♡'}
                  </span>
                  {selectedWish.likesCount > 0 && <span className="like-count">{selectedWish.likesCount}</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
