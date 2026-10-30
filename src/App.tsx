import React, { useEffect, useState } from 'react';
import { WEDDING_CONTENT, UNIFIED_MEMORIES } from './data/weddingData';
import { CoverHero } from './components/CoverHero';
import { LotusCurtain } from './components/LotusCurtain';
import { MusicPlayer } from './components/MusicPlayer';
import { InvitationIntroSection } from './components/InvitationIntroSection';
import { CoupleSection } from './components/CoupleSection';
import { OurStoryAndFilmstripSection } from './components/OurStoryAndFilmstripSection';
import { EventsSection } from './components/EventsSection';
import { RsvpSection } from './components/RsvpSection';
import { WishesWall } from './components/WishesWall';
import { LightboxModal } from './components/LightboxModal';
import { EventDayNotice } from './components/EventDayNotice';
import { GuestTrackerModal } from './components/GuestTrackerModal';
import { FallingPetals } from './components/FallingPetals';

export const App: React.FC = () => {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [curtainStatus, setCurtainStatus] = useState<'idle' | 'closing' | 'parting'>('idle');
  const [guestName, setGuestName] = useState<string>('');
  const [inviteToken, setInviteToken] = useState<string>('');
  const [language, setLanguage] = useState<'en' | 'ta' | 'ml'>('en');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);
  const [wishesRefreshKey, setWishesRefreshKey] = useState<number>(0);

  // Play Web Audio synthesized temple bell chime
  const playChime = (delay = 0) => {
    try {
      if (localStorage.getItem('inv-mute') === '1') return;
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      const chimeCtx = new AC();
      if (chimeCtx.state === 'suspended') chimeCtx.resume();

      const out = chimeCtx.createGain();
      out.gain.value = 0.16;
      out.connect(chimeCtx.destination);

      const strike = (t0: number, f: number, vol: number) => {
        const overtones: [number, number, number][] = [
          [0.5, 0.32, 4.2], [1, 1, 3.4], [1.003, 0.5, 3.6], [1.19, 0.34, 2.4],
          [1.5, 0.24, 1.9], [2, 0.2, 1.5], [2.66, 0.1, 1.1], [3.98, 0.05, 0.7]
        ];
        overtones.forEach(([r, v, d]) => {
          const o = chimeCtx.createOscillator();
          const g = chimeCtx.createGain();
          o.type = 'sine';
          o.frequency.value = f * r;
          g.gain.setValueAtTime(0, t0);
          g.gain.linearRampToValueAtTime(v * vol, t0 + 0.006);
          g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
          o.connect(g);
          g.connect(out);
          o.start(t0);
          o.stop(t0 + d + 0.05);
        });
      };

      const t = chimeCtx.currentTime + delay;
      strike(t, 622, 1);
      strike(t + 0.95, 622, 0.42);
    } catch {
      // AudioContext unavailable
    }
  };

  // Parse URL query params
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const to = params.get('to');
      if (to) {
        setGuestName(to.replace(/[^\w\s&.,'-]/gi, '').trim().slice(0, 60));
      }

      const token = params.get('i');
      if (token && /^[A-Za-z0-9_-]{16,64}$/.test(token)) {
        setInviteToken(token);
      }

      const lang = params.get('lang');
      if (lang === 'ta' || lang === 'ml') {
        setLanguage(lang);
      }

      if (params.get('tracker') === '1' || params.get('links') === '1') {
        setIsTrackerOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Update body class when opened
  useEffect(() => {
    if (isOpened) {
      document.body.classList.add('opened');
    } else {
      document.body.classList.remove('opened');
    }
  }, [isOpened]);

  // Handle Open Invitation with lotus curtain animation & chime
  const handleOpenInvitation = () => {
    if (isOpened || curtainStatus !== 'idle') return;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      playChime(0);
      setIsOpened(true);
      window.scrollTo(0, 0);
      return;
    }

    setCurtainStatus('closing');
    playChime(0.56);

    setTimeout(() => {
      setIsOpened(true);
      setCurtainStatus('parting');
      window.scrollTo(0, 0);
    }, 560);

    setTimeout(() => {
      setCurtainStatus('idle');
    }, 1700);
  };

  return (
    <>
      <EventDayNotice />
      <FallingPetals />

      {!isOpened && (
        <CoverHero
          onOpen={handleOpenInvitation}
          guestName={guestName}
          language={language}
        />
      )}

      <LotusCurtain status={curtainStatus} />

      <main id="main">
        {/* Section 1: Introduction & Blessing */}
        <InvitationIntroSection language={language} />

        {/* Section 2: Events (Muhurtham & Reception) */}
        <EventsSection />

        {/* Section 3: Couple Profiles (Bride & Groom) */}
        <CoupleSection />

        {/* Section 4 & 5 Combined: Expandable Our Story & Moving 35mm Photographic Filmstrip */}
        <OurStoryAndFilmstripSection onOpenLightbox={(index) => setLightboxIndex(index)} />

        {/* Section 6: Upgraded RSVP */}
        <RsvpSection
          guestName={guestName}
          inviteToken={inviteToken}
          onSubmittedSuccess={() => setWishesRefreshKey((prev) => prev + 1)}
        />

        {/* Section 7: Wishes Wall */}
        <WishesWall refreshKey={wishesRefreshKey} />

        {/* Footer */}
        <footer>
          <div className="div" style={{ margin: '0 auto 14px' }}>
            <svg viewBox="-50 -50 100 100" className="man">
              {Array.from({ length: 8 }, (_, i) => (
                <ellipse key={i} rx="4" ry="22" cy="-26" transform={`rotate(${(i * 360) / 8})`} />
              ))}
              <circle r="2" style={{ fill: 'var(--gold)' }} />
            </svg>
          </div>
          <div className="shl" style={{ marginTop: '8px' }}>
            {WEDDING_CONTENT.groom} &amp; {WEDDING_CONTENT.bride}
          </div>
          <p style={{ marginTop: '6px', color: '#c5a882' }}>With love &amp; gratitude</p>
        </footer>
      </main>

      <MusicPlayer />

      <LightboxModal
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNext={() => {
          if (lightboxIndex !== null) {
            setLightboxIndex((lightboxIndex + 1) % UNIFIED_MEMORIES.length);
          }
        }}
        onPrev={() => {
          if (lightboxIndex !== null) {
            setLightboxIndex((lightboxIndex - 1 + UNIFIED_MEMORIES.length) % UNIFIED_MEMORIES.length);
          }
        }}
      />

      <GuestTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
      />
    </>
  );
};
