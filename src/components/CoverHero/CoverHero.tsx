import './CoverHero.css';
import React from 'react';
import { LANG_MAPPINGS, WEDDING_CONTENT, WEDDING_IMAGES } from '../../data/weddingData';
import { WEDDING_START_MS } from '../../data/events';
import { useNow } from '../../hooks/useNow';
import { getCountdown, pad2 } from '../../utils/countdown';
import type { Language } from '../../types';
import { TOUR_START_EVENT } from '../../utils/motion';
import '../ScrollGuide/ScrollGuide.css';
import { CoverGarland, CoverProcession } from './CoverArt';

interface CoverHeroProps {
  guestName: string;
  language: Language;
}

/**
 * Page 2 — the first scrolling section, revealed when the temple doors open.
 * Couple portrait, personal greeting, names, the invitation words, date and
 * countdown. Text fades up in sequence once `body.revealed` is set.
 */
export const CoverHero: React.FC<CoverHeroProps> = ({ guestName, language }) => {
  // Live IST countdown to the wedding Muhurtham; hidden once it starts.
  const countdown = getCountdown(WEDDING_START_MS, useNow(10000));
  const text = LANG_MAPPINGS[language] || LANG_MAPPINGS.en;

  return (
    <>
    <section id="hero">
      <div className="cover-scene" aria-hidden="true">
        <div className="cover-light" />
        <CoverGarland />
        <CoverProcession />

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
            {text.greetPrefix}<b>{guestName}</b>,
          </p>
        )}

        <h1 className="names foil">
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

        <p className="cover-invite" lang={language}>{text.inv1}</p>
        <p className="cover-invite-note" lang={language}>{text.inv3}</p>

        <p className="cover-std">Save the date</p>
        <p className="cover-date">November 29, 2026</p>

        {countdown && (
          <div
            className="cover-countdown"
            role="timer"
            aria-live="off"
            aria-label={`${countdown.days} days, ${countdown.hours} hours and ${countdown.minutes} minutes to the wedding`}
          >
            <span className="ccd-unit">
              <b>{pad2(countdown.days)}</b>
              <small>Days</small>
            </span>
            <span className="ccd-sep" aria-hidden="true" />
            <span className="ccd-unit">
              <b>{pad2(countdown.hours)}</b>
              <small>Hours</small>
            </span>
            <span className="ccd-sep" aria-hidden="true" />
            <span className="ccd-unit">
              <b>{pad2(countdown.minutes)}</b>
              <small>Minutes</small>
            </span>
          </div>
        )}

        <a className="cover-scroll" href="#couple" aria-label="Scroll to the invitation">
          <span>Scroll</span>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <path d="M3 6l5 5 5-5" />
          </svg>
        </a>
        <button type="button" className="tour-start" onClick={() => window.dispatchEvent(new Event(TOUR_START_EVENT))}>
          ▶ Take the tour
        </button>
      </div>
    </section>
    </>
  );
};
