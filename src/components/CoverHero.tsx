import React, { useEffect, useState } from 'react';
import { WEDDING_CONTENT, WEDDING_IMAGES } from '../data/weddingData';
import { hapticTap } from '../utils/haptics';

interface CoverHeroProps {
  onOpen: () => void;
  guestName: string;
  language: 'en' | 'ta' | 'ml';
}

// Exact wick coordinates (% of 2160x760 desktop garland and 1080x760 mobile garland)
const LAMP_FLAMES = {
  desktop: [
    [10.6, 30.6],
    [35.3, 21.8],
    [2.1, 76.6],
    [7.0, 76.4],
    [89.3, 30.9],
    [64.6, 22.1],
    [97.9, 75.9],
    [92.9, 77.0]
  ],
  mobile: [
    [21.2, 30.0],
    [70.6, 21.4],
    [4.3, 75.7],
    [14.1, 76.3],
    [88.7, 74.7],
    [98.3, 75.1]
  ]
};

export const CoverHero: React.FC<CoverHeroProps> = ({ onOpen, guestName, language }) => {
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number } | null>(null);

  // Live IST countdown calculation to wedding Muhurtham (2026-11-29T08:00+05:30)
  useEffect(() => {
    const updateCountdown = () => {
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

  const renderLampFlames = (coords: number[][], keyPrefix: string) =>
    coords.map(([x, y], i) => {
      const duration = (2.4 + ((i * 0.43) % 1.5)).toFixed(2);
      const glowDuration = (3.4 + ((i * 0.57) % 1.8)).toFixed(2);
      const delay = (-((i * 0.73) % 2.6)).toFixed(2);
      return (
        <span
          key={`${keyPrefix}_${i}`}
          className="cover-lamp"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            ['--fd' as string]: `${duration}s`,
            ['--fgd' as string]: `${glowDuration}s`,
            ['--fdl' as string]: `${delay}s`
          }}
        >
          <span className="cover-lamp-glow" />
          <span className="cover-lamp-flame" />
        </span>
      );
    });

  return (
    <section id="hero" className="cover-intro-complete">
      <div className="cover-scene" aria-hidden="true">
        <div className="cover-light" />

        {/* Upper floral & jasmine canopy + floating brass lamps with independent flame flicker */}
        <div className="cover-garland-stage">
          <div className="cover-garland" />
          <div className="cover-lamps cover-lamps--desktop">
            {renderLampFlames(LAMP_FLAMES.desktop, 'd')}
          </div>
          <div className="cover-lamps cover-lamps--mobile">
            {renderLampFlames(LAMP_FLAMES.mobile, 'm')}
          </div>
        </div>

        {/* Lower-left flanking group: ceremonial muthukkuda umbrellas & panchavadyam musicians */}
        <div className="cover-procession-left" />

        {/* Lower-right flanking group: caparisoned ceremonial elephant facing inward */}
        <div className="cover-procession-elephant" />

        {/* Lower-right outer corner: blooming pink lotuses, scattered petals & floral sprays */}
        <div className="cover-decor-right" />

        {/* Warm sandy-parchment ground wash unifying the lower ceremonial stage */}
        <div className="cover-floor" />

        {/* Warm champagne unifier & subtle handmade paper grain */}
        <div className="cover-tint" />
        <div className="cover-paper-grain" />

        {/* Delicate rising golden motes */}
        {Array.from({ length: 10 }, (_, i) => (
          <i
            key={i}
            className="cover-sparkle"
            style={{
              left: `${((i * 37 + 13) % 88) + 6}%`,
              ['--d' as string]: `${10 + ((i * 7) % 8)}s`,
              ['--dl' as string]: `-${(i * 5) % 13}s`,
              ['--s' as string]: `${2.5 + ((i * 2) % 3)}px`
            }}
          />
        ))}
      </div>

      <div className="cv">
        <figure className="cover-couple">
          <span className="cover-halo" aria-hidden="true">
            <svg viewBox="-60 -60 120 120" className="man cover-lotus-mandala">
              {Array.from({ length: 12 }, (_, i) => (
                <path
                  key={`outer_${i}`}
                  d="M 0 -14 C 7.5 -26, 8.5 -42, 0 -54 C -8.5 -42, -7.5 -26, 0 -14 Z"
                  transform={`rotate(${i * 30})`}
                />
              ))}
              {Array.from({ length: 12 }, (_, i) => (
                <path
                  key={`inner_${i}`}
                  d="M 0 -10 C 4.5 -19, 5 -31, 0 -40 C -5 -31, -4.5 -19, 0 -10 Z"
                  transform={`rotate(${i * 30 + 15})`}
                  opacity="0.65"
                />
              ))}
              <circle r="14" opacity="0.45" />
            </svg>
          </span>
          <img
            src={WEDDING_IMAGES.hero_cover}
            alt={`${WEDDING_CONTENT.groom} and ${WEDDING_CONTENT.bride} together`}
            width="1600"
            height="1612"
            loading="eager"
            referrerPolicy="no-referrer"
          />
        </figure>

        {guestName && (
          <p className="cover-greeting" id="cover-greeting" lang={language}>
            {getGreeting()}
          </p>
        )}

        <h1 className="names">
          <span className="n1">{WEDDING_CONTENT.groom}</span>
          <i aria-hidden="true">&amp;</i>
          <span className="sr-and"> and </span>
          <span className="n2">{WEDDING_CONTENT.bride}</span>
        </h1>

        <div className="cover-ornament" aria-hidden="true">
          <span className="cover-ornament-line" />
          <svg viewBox="-12 -12 24 24" className="cover-ornament-floret">
            {Array.from({ length: 8 }, (_, i) => (
              <path
                key={i}
                d="M 0 -2 C 1.8 -5, 1.8 -8.5, 0 -10.5 C -1.8 -8.5, -1.8 -5, 0 -2 Z"
                transform={`rotate(${i * 45})`}
              />
            ))}
            <circle r="1.6" />
          </svg>
          <span className="cover-ornament-line" />
        </div>

        <p className="cover-date">November 29, 2026</p>

        {countdown && (
          <div
            className="cover-countdown"
            role="timer"
            aria-live="off"
            aria-label={`${countdown.days} days, ${countdown.hours} hours and ${countdown.minutes} minutes to the wedding`}
          >
            <span className="ccd-unit">
              <b>{String(countdown.days).padStart(2, '0')}</b>
              <small>Days</small>
            </span>
            <span className="ccd-sep" aria-hidden="true" />
            <span className="ccd-unit">
              <b>{String(countdown.hours).padStart(2, '0')}</b>
              <small>Hours</small>
            </span>
            <span className="ccd-sep" aria-hidden="true" />
            <span className="ccd-unit">
              <b>{String(countdown.minutes).padStart(2, '0')}</b>
              <small>Minutes</small>
            </span>
          </div>
        )}

        <div className="ob">
          <button type="button" className="btn" id="op" onClick={onOpen} onPointerDown={() => hapticTap()} lang={language}>
            {getOpenBtnText()}
          </button>
        </div>
      </div>
    </section>
  );
};
