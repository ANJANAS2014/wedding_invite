import React, { useEffect, useState, useRef } from 'react';

interface WishItem {
  id: string;
  displayName: string;
  wish: string;
  photoUrl?: string;
}

const DEFAULT_WISHES: WishItem[] = [
  {
    id: 'w1',
    displayName: 'Aravind & Meera',
    wish: 'Wishing you both a lifetime of happiness, shared laughter, and beautiful adventures together! So thrilled for you both.'
  },
  {
    id: 'w2',
    displayName: 'Karthik & Divya',
    wish: 'May your journey together be as harmonious as your favorite songs! Congratulations Lalith and Anjana!'
  },
  {
    id: 'w3',
    displayName: 'Pooja Narayanan',
    wish: 'Sending you so much love from Bangalore! Can’t wait to celebrate the big day with you both.'
  },
  {
    id: 'w4',
    displayName: 'Suresh Uncle & Shanti Aunty',
    wish: 'Heartiest congratulations to the wonderful couple. May God bless you both with love, joy, and prosperity.'
  },
  {
    id: 'w5',
    displayName: 'Naveen & Shalini',
    wish: 'From Wayanad drives to this sacred milestone, so happy to see you both unite! Hearty congratulations!'
  }
];

export const WishesWall: React.FC = () => {
  const [wishes, setWishes] = useState<WishItem[]>(DEFAULT_WISHES);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Fetch approved wishes from Netlify function (Supabase)
    fetch('/.netlify/functions/wishes')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.ok && Array.isArray(data.wishes) && data.wishes.length > 0) {
          const apiWishes: WishItem[] = data.wishes.map((w: any, idx: number) => ({
            id: `api_wish_${idx}`,
            displayName: w.displayName,
            wish: w.wish,
            photoUrl: w.photoUrl
          }));
          setWishes([...apiWishes, ...DEFAULT_WISHES]);
        }
      })
      .catch(() => {
        // ignore network error, fallback to local storage
      });

    // 2. Check local storage for recent guest submissions & uploaded photos
    try {
      const stored = localStorage.getItem('wedding_rsvps_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const userWishes: WishItem[] = parsed
            .filter((r) => r.wishes && r.wishes.trim().length > 0)
            .map((r, idx) => ({
              id: `user_wish_${idx}`,
              displayName: r.name,
              wish: r.wishes,
              photoUrl: r.photoPreview || r.photoUrl
            }));
          if (userWishes.length > 0) {
            setWishes((prev) => [...userWishes, ...prev]);
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const scrollRail = (direction: 'left' | 'right') => {
    if (railRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      railRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
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
    <section className="sec rv in wishes-wall" id="wishes-wall" aria-labelledby="wishes-title">
      <div className="eyebrow">A little love from our people</div>
      <h2 id="wishes-title">With love, from our people</h2>
      <div className="div">
        <svg viewBox="-50 -50 100 100" className="man">
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse key={i} rx="4" ry="22" cy="-26" transform={`rotate(${(i * 360) / 8})`} />
          ))}
          <circle r="2" style={{ fill: 'var(--gold)' }} />
        </svg>
      </div>

      {/* Manual Scroll Controls */}
      <div className="wishes-nav-bar">
        <span className="wishes-nav-hint">Scroll or swipe to explore wishes</span>
        <div className="wishes-nav-buttons">
          <button
            type="button"
            className="wishes-nav-btn"
            onClick={() => scrollRail('left')}
            aria-label="Scroll wishes left"
          >
            ‹
          </button>
          <button
            type="button"
            className="wishes-nav-btn"
            onClick={() => scrollRail('right')}
            aria-label="Scroll wishes right"
          >
            ›
          </button>
        </div>
      </div>

      <div className="wishes-rail" ref={railRef} tabIndex={0} aria-label="Wedding wishes cards">
        <div className="wishes-track-run">
          <div className="wishes-track">
            {wishes.map((item) => (
              <article key={item.id} className="wish-card">
                {item.photoUrl ? (
                  <img
                    className="wish-card-photo"
                    src={item.photoUrl}
                    alt={`Photo shared by ${item.displayName}`}
                    loading="lazy"
                  />
                ) : (
                  <div className="wish-card-monogram" aria-hidden="true">
                    {getInitials(item.displayName)}
                  </div>
                )}
                <div className="wish-card-copy">
                  <h3>{item.displayName}</h3>
                  <p>{item.wish}</p>
                </div>
              </article>
            ))}
          </div>

          {/* Duplicate track for seamless infinite marquee scroll */}
          <div className="wishes-track" aria-hidden="true">
            {wishes.map((item) => (
              <article key={`dup_${item.id}`} className="wish-card">
                {item.photoUrl ? (
                  <img
                    className="wish-card-photo"
                    src={item.photoUrl}
                    alt=""
                    loading="lazy"
                  />
                ) : (
                  <div className="wish-card-monogram" aria-hidden="true">
                    {getInitials(item.displayName)}
                  </div>
                )}
                <div className="wish-card-copy">
                  <h3>{item.displayName}</h3>
                  <p>{item.wish}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
