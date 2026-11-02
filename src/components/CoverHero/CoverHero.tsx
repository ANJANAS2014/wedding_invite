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
import { HeaderRule } from '../shared/HeaderRule/HeaderRule';

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
        <CoverGarland />
        <CoverProcession />
      </div>

      <div className="cv">
        <figure className="cover-couple">
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

        <h1 className="names">
          <span className="n1">{WEDDING_CONTENT.groom}</span>
          <i aria-hidden="true">&amp;</i>
          <span className="n2">{WEDDING_CONTENT.bride}</span>
        </h1>

        <HeaderRule />
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

        <div className="cover-acts">
          <button type="button" className="rd-btn rd-btn--line tour-start" onClick={() => window.dispatchEvent(new Event(TOUR_START_EVENT))}>
            ▶ Take the tour
          </button>
          <a className="rd-btn rd-btn--line cover-scroll" href="#couple" aria-label="Scroll to the invitation">
            Scroll
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <path d="M3 6l5 5 5-5" />
            </svg>
          </a>
        </div>
        <div className="cover-procrow" aria-hidden="true">
          <CoverProcession />
        </div>
      </div>
    </section>
    </>
  );
};
