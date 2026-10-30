import React, { useEffect, useState } from 'react';
import { WEDDING_CONTENT, WEDDING_IMAGES } from '../data/weddingData';

interface CoverHeroProps {
  onOpen: () => void;
  guestName: string;
  language: 'en' | 'ta' | 'ml';
}

const LAMP_FLAMES = {
  desktop: [
    [10.6, 30.6], [35.3, 21.8], [2.1, 76.6], [7, 76.4],
    [89.3, 30.9], [64.6, 22.1], [97.9, 75.9], [92.9, 77]
  ],
  mobile: [
    [21.2, 30], [70.6, 21.4], [4.3, 75.7], [14.1, 76.3],
    [88.7, 74.7], [98.3, 75.1]
  ]
};

export const CoverHero: React.FC<CoverHeroProps> = ({ onOpen, guestName, language }) => {
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number } | null>(null);

  // IST countdown calculation
  useEffect(() => {
    const updateCountdown = () => {
      // Wedding date: 2026-11-29T08:00+05:30
      const targetTime = new Date('2026-11-29T08:00:00+05:30').getTime();
      const now = Date.now();
      const diffSecs = Math.floor((targetTime - now) / 1000);

      if (diffSecs > 0) {
        const days = Math.floor(diffSecs / 86400);
        const hours = Math.floor((diffSecs % 86400) / 3600);
        const minutes = Math.floor((diffSecs % 3600) / 60);
        setCountdown({ days, hours, minutes });
      } else {
        setCountdown(null);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 10000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    if (!guestName) return null;
    if (language === 'ta') {
      return <>அன்புள்ள <b>{guestName}</b>, அன்புடன் உங்களை அழைக்கிறோம்</>;
    }
    if (language === 'ml') {
      return <>പ്രിയപ്പെട്ട <b>{guestName}</b>, സ്നേഹത്തോടെ ഞങ്ങൾ നിങ്ങളെ ക്ഷണിക്കുന്നു</>;
    }
    return <>Dear <b>{guestName}</b>, with love we invite you</>;
  };

  const getOpenBtnText = () => {
    if (language === 'ta') return 'அழைப்பிதழைத் திறக்கவும்';
    if (language === 'ml') return 'ക്ഷണക്കത്ത് തുറക്കുക';
    return 'Open Invitation';
  };

  const petals = Array.from({ length: 18 }, (_, i) => {
    const tones = ['blush', 'rose', 'gold', 'pink'];
    const tone = tones[i % tones.length];
    const left = ((i * 5.5 + 2) % 96);
    const dur = 12 + (i * 1.5) % 8;
    const delay = -(i * 2.3) % dur;
    return (
      <div
        key={i}
        className={`pt pt--${tone}`}
        style={{
          left: `${left}vw`,
          animationDuration: `${dur}s`,
          animationDelay: `${delay}s`,
          ['--sw' as string]: `${16 + (i * 5) % 24}px`,
          ['--r' as string]: `${(i * 47) % 360}deg`,
          ['--s' as string]: `${0.7 + (i * 0.12) % 0.5}`,
        }}
      >
        <i />
      </div>
    );
  });

  return (
    <>
      <div className="petals" aria-hidden="true">
        {petals}
      </div>

      <section id="hero" className="cover-intro-complete">
        <div className="cover-scene" aria-hidden="true">
          <div className="cover-landscape" />
          <div className="cover-light" />
          <div className="cover-garland">
            <div className="cover-lamps cover-lamps--desktop">
              {LAMP_FLAMES.desktop.map(([x, y], i) => (
                <i
                  key={i}
                  className="cover-lamp"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    ['--fd' as string]: `${(2.3 + (i * 0.37) % 1.4).toFixed(2)}s`,
                    ['--fdl' as string]: `-${((i * 0.61) % 2).toFixed(2)}s`
                  }}
                />
              ))}
            </div>
            <div className="cover-lamps cover-lamps--mobile">
              {LAMP_FLAMES.mobile.map(([x, y], i) => (
                <i
                  key={i}
                  className="cover-lamp"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    ['--fd' as string]: `${(2.3 + (i * 0.37) % 1.4).toFixed(2)}s`,
                    ['--fdl' as string]: `-${((i * 0.61) % 2).toFixed(2)}s`
                  }}
                />
              ))}
            </div>
          </div>
          <div className="cover-altar cover-altar--left" />
          <div className="cover-altar cover-altar--right" />
          <div className="cover-floor" />
          <div className="cover-tint" />
          <div className="cover-paper-grain" />

          {/* Thali frame ornament */}
          <svg className="cover-thali-frame cover-thali-frame--desktop" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path className="thali-string" d="M 14 58 C 21 64 23 73 33 79 C 39 84 44 89 48.4 90.3" />
            <path className="thali-string" d="M 86 58 C 79 64 77 73 67 79 C 61 84 56 89 51.6 90.3" />
            <g transform="translate(32.5 4.5) scale(.35 1)">
              <path className="thali-locket-heart" d="M50 92 C47 89.5 45.5 88 45.5 86.5 C45.5 84.2 48.4 84.1 50 86 C51.6 84.1 54.5 84.2 54.5 86.5 C54.5 88 53 89.5 50 92 Z" />
              <path className="thali-locket-inlay" d="M50 89.7 C48.7 88.5 47.4 87.4 47.4 86 C47.4 84.9 49 84.8 50 86.1 C51 84.8 52.6 84.9 52.6 86 C52.6 87.4 51.3 88.5 50 89.7 Z" />
              <circle className="thali-locket-pin" cx="50" cy="85.9" r=".55" />
            </g>
          </svg>

          <svg className="cover-thali-frame cover-thali-frame--mobile" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path className="thali-string" d="M 3 54 C 11 63 17 73 28 79 C 34 83 40 85 46.4 86.85" />
            <path className="thali-string" d="M 97 54 C 89 63 83 73 72 79 C 66 83 60 85 53.6 86.85" />
            <g transform="translate(10 49) scale(.8 .45)">
              <path className="thali-locket-heart" d="M50 92 C47 89.5 45.5 88 45.5 86.5 C45.5 84.2 48.4 84.1 50 86 C51.6 84.1 54.5 84.2 54.5 86.5 C54.5 88 53 89.5 50 92 Z" />
              <path className="thali-locket-inlay" d="M50 89.7 C48.7 88.5 47.4 87.4 47.4 86 C47.4 84.9 49 84.8 50 86.1 C51 84.8 52.6 84.9 52.6 86 C52.6 87.4 51.3 88.5 50 89.7 Z" />
              <circle className="thali-locket-pin" cx="50" cy="85.9" r=".55" />
            </g>
          </svg>

          {/* Sparkles */}
          {Array.from({ length: 14 }, (_, i) => (
            <i
              key={i}
              className="cover-sparkle"
              style={{
                left: `${((i * 37 + 11) % 92) + 4}%`,
                ['--d' as string]: `${9 + (i * 7) % 8}s`,
                ['--dl' as string]: `-${(i * 5) % 13}s`,
                ['--s' as string]: `${3 + (i * 3) % 4}px`
              }}
            />
          ))}
        </div>

        <div className="cv">
          <figure className="cover-couple">
            <span className="cover-halo" aria-hidden="true">
              <svg viewBox="-50 -50 100 100" className="man">
                {Array.from({ length: 16 }, (_, i) => (
                  <ellipse key={i} rx="4" ry="22" cy="-26" transform={`rotate(${(i * 360) / 16})`} />
                ))}
                <circle r="2" style={{ fill: 'var(--gold)' }} />
              </svg>
            </span>
            <img
              src={WEDDING_IMAGES.hero_cover}
              alt={`${WEDDING_CONTENT.groom} and ${WEDDING_CONTENT.bride} together`}
              width="1600"
              height="1612"
              loading="eager"
            />
          </figure>

          {guestName && (
            <p className="cover-greeting" id="cover-greeting">
              {getGreeting()}
            </p>
          )}

          <h1 className="names">
            <span className="n1">{WEDDING_CONTENT.groom}</span>
            <i aria-hidden="true">&amp;</i>
            <span className="n2">{WEDDING_CONTENT.bride}</span>
          </h1>

          <p className="cover-date">November 29, 2026</p>

          {countdown && (
            <div className="cover-countdown" role="timer" aria-live="off">
              <span className="ccd-unit">
                <b>{String(countdown.days).padStart(2, '0')}</b>
                <small>Days</small>
              </span>
              <i aria-hidden="true">·</i>
              <span className="ccd-unit">
                <b>{String(countdown.hours).padStart(2, '0')}</b>
                <small>Hours</small>
              </span>
              <i aria-hidden="true">·</i>
              <span className="ccd-unit">
                <b>{String(countdown.minutes).padStart(2, '0')}</b>
                <small>Minutes</small>
              </span>
            </div>
          )}

          <div className="ob">
            <button className="btn" id="op" onClick={onOpen}>
              {getOpenBtnText()}
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
