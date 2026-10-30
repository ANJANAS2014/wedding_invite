import React, { useEffect, useState, useCallback } from 'react';

export interface WishRecord {
  id: string;
  displayName: string;
  wish: string;
  photoUrl?: string;
  submittedAt?: string;
  likesCount: number;
}

interface WishesWallProps {
  refreshKey?: number;
}

const LOCAL_STORAGE_LIKES_KEY = 'wedding_wish_likes_v1';
const LOCAL_STORAGE_WISHES_KEY = 'wedding_user_wishes_v1';

function buildStableWishId(name: string, wish: string, fallbackIndex: number): string {
  const raw = `${name.trim().toLowerCase()}|${wish.trim().toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) | 0;
  }
  return `wish_${Math.abs(hash).toString(36)}_${fallbackIndex}`;
}

export const WishesWall: React.FC<WishesWallProps> = ({ refreshKey = 0 }) => {
  const [wishes, setWishes] = useState<WishRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [likesMap, setLikesMap] = useState<Record<string, number>>({});
  const [userLikedMap, setUserLikedMap] = useState<Record<string, boolean>>({});
  const [failedPhotos, setFailedPhotos] = useState<Record<string, boolean>>({});
  const [selectedWish, setSelectedWish] = useState<WishRecord | null>(null);

  const fetchWishes = useCallback(async () => {
    setIsLoading(true);
    try {
      let storedCounts: Record<string, number> = {};
      let storedLiked: Record<string, boolean> = {};

      try {
        const storedLikes = localStorage.getItem(LOCAL_STORAGE_LIKES_KEY);
        if (storedLikes) {
          const parsed = JSON.parse(storedLikes);
          if (parsed && typeof parsed === 'object') {
            storedLiked = parsed.userLiked || {};
            storedCounts = parsed.counts || {};
            setUserLikedMap(storedLiked);
            setLikesMap(storedCounts);
          }
        }
      } catch {
        // ignore storage errors
      }

      let fetched: WishRecord[] = [];

      try {
        const res = await fetch('/.netlify/functions/wishes');
        if (res.ok) {
          const data = await res.json();
          if (data && data.ok && Array.isArray(data.wishes)) {
            fetched = data.wishes
              .filter((w: any) => w && w.displayName && w.wish)
              .map((w: any, idx: number) => ({
                id: w.id || buildStableWishId(String(w.displayName), String(w.wish), idx),
                displayName: String(w.displayName).trim(),
                wish: String(w.wish).trim(),
                photoUrl: w.photoUrl || undefined,
                submittedAt: w.submittedAt || undefined,
                likesCount: Number(w.likesCount) || 0
              }));
          }
        }
      } catch {
        // ignore offline / local dev without Netlify Functions
      }

      try {
        const rsvpStored = localStorage.getItem('wedding_rsvps_v2');
        if (rsvpStored) {
          const parsed = JSON.parse(rsvpStored);
          if (Array.isArray(parsed)) {
            parsed.forEach((r, idx) => {
              if (r && r.name && r.wishes && String(r.wishes).trim().length > 0) {
                const trimmedName = String(r.name).trim();
                const trimmedWish = String(r.wishes).trim();
                const id = r.id || buildStableWishId(trimmedName, trimmedWish, idx);
                const firstName = trimmedName.split(/\s+/)[0].toLowerCase();
                const alreadyPresent = fetched.some(
                  (item) =>
                    item.id === id ||
                    (item.displayName.toLowerCase() === firstName &&
                      item.wish.toLowerCase() === trimmedWish.toLowerCase()) ||
                    (item.displayName.toLowerCase() === trimmedName.toLowerCase() &&
                      item.wish.toLowerCase() === trimmedWish.toLowerCase())
                );
                if (!alreadyPresent) {
                  fetched.push({
                    id,
                    displayName: trimmedName,
                    wish: trimmedWish,
                    photoUrl: r.photoPreview || r.photoUrl || undefined,
                    submittedAt: r.submittedAt || undefined,
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
              if (w && w.id && w.displayName && w.wish && !fetched.some((item) => item.id === w.id)) {
                fetched.push(w);
              }
            });
          }
        }
      } catch {
        // ignore storage errors
      }

      // If running locally or if no wishes exist yet, include exquisite dummy sample postcards for local inspection
      const isLocalDev = Boolean((import.meta as any).env?.DEV) || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const userWishesCount = fetched.length;
      if (isLocalDev || userWishesCount === 0) {
        const dummyPostcards: WishRecord[] = [
          {
            id: 'dummy_vm',
            displayName: 'Vikram & Meera',
            wish: 'Wishing you both a lifetime of boundless happiness, shared laughter, and beautiful adventures together! So thrilled for you both.',
            submittedAt: '2026-10-15T10:00:00.000Z',
            likesCount: 12
          },
          {
            id: 'dummy_kd',
            displayName: 'Karthik & Divya',
            wish: 'May your journey together be as harmonious as your favorite songs! Congratulations Lalith and Anjana!',
            submittedAt: '2026-10-18T12:00:00.000Z',
            likesCount: 8
          },
          {
            id: 'dummy_pn',
            displayName: 'Pooja Narayanan',
            wish: 'Sending you so much love from Bangalore! Can’t wait to celebrate the big day with you both.',
            submittedAt: '2026-10-20T14:30:00.000Z',
            likesCount: 15
          },
          {
            id: 'dummy_sr',
            displayName: 'Sneha & Rahul',
            wish: 'Here is to a wonderful beginning of a forever love story. God bless you both!',
            submittedAt: '2026-10-22T09:15:00.000Z',
            likesCount: 6
          }
        ];

        dummyPostcards.forEach((dummy) => {
          if (!fetched.some((item) => item.id === dummy.id || item.displayName.toLowerCase() === dummy.displayName.toLowerCase())) {
            fetched.push(dummy);
          }
        });
      }

      // Sort wishes with explicit timestamps newest-first while preserving API order
      fetched.sort((a, b) => {
        const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        if (timeA && timeB) return timeB - timeA;
        if (timeB && !timeA) return 1;
        if (timeA && !timeB) return -1;
        return 0;
      });

      const updated = fetched.map((item) => {
        const extraLikes = storedCounts[item.id] || 0;
        return {
          ...item,
          likesCount: Math.max(0, (item.likesCount || 0) + extraLikes)
        };
      });

      setWishes(updated);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishes();
  }, [fetchWishes, refreshKey]);

  // Close modal on Escape key
  useEffect(() => {
    if (!selectedWish) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedWish(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedWish]);

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

    setSelectedWish((prev) =>
      prev && prev.id === wishId
        ? { ...prev, likesCount: Math.max(0, prev.likesCount + diff) }
        : prev
    );
  };

  const getInitials = (name: string) => {
    return (
      name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0] || '')
        .join('')
        .toUpperCase() || '♥'
    );
  };

  const shouldAutoScroll = wishes.length >= 3;
  const displayItems = shouldAutoScroll ? [...wishes, ...wishes] : wishes;

  const renderPostcard = (item: WishRecord, index: number) => {
    const isLiked = !!userLikedMap[item.id];
    const showPhoto = Boolean(item.photoUrl && !failedPhotos[item.id]);

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
        <div className="postcard-photo-frame">
          {showPhoto ? (
            <img
              src={item.photoUrl}
              alt={`Photo shared by ${item.displayName}`}
              className="postcard-photo"
              loading="lazy"
              onError={() =>
                setFailedPhotos((prev) => ({ ...prev, [item.id]: true }))
              }
            />
          ) : (
            <div className="postcard-monogram" aria-hidden="true">
              <span className="postcard-monogram-ring">
                {getInitials(item.displayName)}
              </span>
            </div>
          )}
          <div className="postcard-photo-sheen" aria-hidden="true" />
          <div className="postcard-stamp" aria-hidden="true">
            <span>29 NOV</span>
            <span className="stamp-seal">♥</span>
          </div>
        </div>

        <div className="postcard-content">
          <p className="postcard-message">“{item.wish}”</p>

          <div className="postcard-footer">
            <span className="postcard-author">{item.displayName}</span>
            <button
              type="button"
              className={`postcard-like-btn ${isLiked ? 'liked' : ''}`}
              onClick={(e) => handleToggleLike(e, item.id)}
              aria-label={`Like wish from ${item.displayName}${item.likesCount > 0 ? ` (${item.likesCount} likes)` : ''}`}
            >
              <span className="like-heart" aria-hidden="true">
                {isLiked ? '♥' : '♡'}
              </span>
              {item.likesCount > 0 && (
                <span className="like-count">{item.likesCount}</span>
              )}
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <section
      className="sec rv in wishes-wall-section"
      id="wishes"
      aria-labelledby="wishes-title"
    >
      <div className="wishes-section-header">
        <div className="wishes-heart-crest" aria-hidden="true">
          ♥
        </div>
        <h2 id="wishes-title">With love, from our people</h2>
        <p className="wishes-subtitle">
          A little love from everyone celebrating with us
        </p>
        <div className="div wishes-divider">
          <svg viewBox="-50 -50 100 100" className="man">
            {Array.from({ length: 8 }, (_, i) => (
              <ellipse
                key={i}
                rx="4"
                ry="22"
                cy="-26"
                transform={`rotate(${(i * 360) / 8})`}
              />
            ))}
            <circle r="2" style={{ fill: 'var(--gold)' }} />
          </svg>
        </div>

        {shouldAutoScroll && !isLoading && (
          <div className="wishes-controls-row">
            <button
              type="button"
              className="wishes-pause-btn"
              onClick={() => setIsPaused(!isPaused)}
              aria-label={
                isPaused ? 'Resume wishes carousel' : 'Pause wishes carousel'
              }
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? '▶ Play' : '⏸ Pause'}
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="wishes-static-row" aria-label="Loading wishes">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton-postcard">
              <div className="skeleton-photo" />
              <div className="skeleton-lines">
                <div className="skeleton-line w-80" />
                <div className="skeleton-line w-60" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && wishes.length === 0 && (
        <div
          className="empty-wishes-state"
          role="region"
          aria-label="No wishes yet"
        >
          <div className="empty-envelope-icon" aria-hidden="true">
            <svg
              width="44"
              height="36"
              viewBox="0 0 44 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="1.5"
                y="4.5"
                width="41"
                height="29"
                rx="4"
                fill="#FBF5EA"
                stroke="#C19A3D"
                strokeWidth="1.3"
              />
              <path
                d="M2.5 6.5L22 21L41.5 6.5"
                stroke="#C19A3D"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 22.8C22 22.8 17 19.3 17 16.5C17 15 18.2 13.9 19.6 13.9C20.6 13.9 21.5 14.5 22 15.3C22.5 14.5 23.4 13.9 24.4 13.9C25.8 13.9 27 15 27 16.5C27 19.3 22 22.8 22 22.8Z"
                fill="#8B2233"
              />
            </svg>
          </div>
          <h3>No wishes received yet.</h3>
          <p>Be the first to share your wishes with us ❤️</p>
        </div>
      )}

      {!isLoading && wishes.length > 0 && shouldAutoScroll && (
        <div
          className="wishes-rail-viewport"
          aria-label="Wedding wishes carousel"
        >
          <div
            className={`wishes-rail-track ${isPaused ? 'is-paused' : ''}`}
            style={
              {
                '--wishes-duration': `${Math.max(28, wishes.length * 8)}s`
              } as React.CSSProperties
            }
          >
            {displayItems.map((item, index) => renderPostcard(item, index))}
          </div>
        </div>
      )}

      {!isLoading && wishes.length > 0 && !shouldAutoScroll && (
        <div
          className="wishes-static-row"
          aria-label="Wedding wishes collection"
        >
          {wishes.map((item, index) => renderPostcard(item, index))}
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
              {selectedWish.photoUrl && !failedPhotos[selectedWish.id] ? (
                <img
                  src={selectedWish.photoUrl}
                  alt={`Photo shared by ${selectedWish.displayName}`}
                  className="modal-photo"
                  onError={() =>
                    setFailedPhotos((prev) => ({
                      ...prev,
                      [selectedWish.id]: true
                    }))
                  }
                />
              ) : (
                <div className="modal-monogram">
                  <span className="postcard-monogram-ring modal-monogram-ring">
                    {getInitials(selectedWish.displayName)}
                  </span>
                </div>
              )}
            </div>

            <div className="modal-body-content">
              <p className="modal-wish-text">“{selectedWish.wish}”</p>

              <div className="modal-author-row">
                <div className="modal-author-meta">
                  <h4 className="modal-author-name">
                    {selectedWish.displayName}
                  </h4>
                  {selectedWish.submittedAt && (
                    <span className="modal-date-tag">
                      {new Date(selectedWish.submittedAt).toLocaleDateString(
                        undefined,
                        {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        }
                      )}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  className={`postcard-like-btn large ${
                    userLikedMap[selectedWish.id] ? 'liked' : ''
                  }`}
                  onClick={(e) => handleToggleLike(e, selectedWish.id)}
                  aria-label={`Like wish from ${selectedWish.displayName}${
                    selectedWish.likesCount > 0
                      ? ` (${selectedWish.likesCount} likes)`
                      : ''
                  }`}
                >
                  <span className="like-heart" aria-hidden="true">
                    {userLikedMap[selectedWish.id] ? '♥' : '♡'}
                  </span>
                  {selectedWish.likesCount > 0 && (
                    <span className="like-count">{selectedWish.likesCount}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
