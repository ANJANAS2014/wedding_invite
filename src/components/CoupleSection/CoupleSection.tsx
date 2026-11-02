import './CoupleSection.css';
import React, { useEffect, useRef, useState } from 'react';
import { COUPLE_HOMETOWNS, WEDDING_CONTENT, WEDDING_IMAGES } from '../../data/weddingData';
import { HeaderRule } from '../shared/HeaderRule/HeaderRule';
import { NextTeaser } from '../ScrollGuide/NextTeaser';
import { burstPetals } from '../FallingPetals/FallingPetals';
import { hapticSoft } from '../../utils/haptics';
import {
  announceTeamSide,
  fetchTeamTotals,
  loadTeamSide,
  saveTeamPick,
  TEAM_CHANGE_EVENT,
  type TeamChangeDetail,
  type TeamSide,
  type TeamTotals,
} from '../../services/teamService';
import { PortraitRing } from './PortraitRing';
import { CoupleQuiz } from './CoupleQuiz';
import { ThaliChain } from './ThaliChain';

interface CoupleSectionProps {
  guestName?: string;
  inviteToken?: string;
}

const TEAM_LABEL: Record<TeamSide, string> = { groom: 'Team Groom', bride: 'Team Bride' };


const PERSON = {
  groom: {
    name: WEDDING_CONTENT.groom,
    role: 'The Groom',
    story: WEDDING_CONTENT.groomStory,
    img: WEDDING_IMAGES.p12,
    w: 700,
    h: 764,
    pos: '50% 25%',
    ring: 'temple' as const,
    home: COUPLE_HOMETOWNS.groom,
  },
  bride: {
    name: WEDDING_CONTENT.bride,
    role: 'The Bride',
    story: WEDDING_CONTENT.brideStory,
    img: WEDDING_IMAGES.bride_portrait,
    w: 600,
    h: 600,
    pos: '50% 50%',
    ring: 'kasavu' as const,
    home: COUPLE_HOMETOWNS.bride,
  },
};

/**
 * Bride & Groom — round portraits framed in their own heritage borders
 * (Kanjeevaram for Chennai, kasavu for Keralam), joined by a gold thali chain
 * and a hand-drawn "&". The portraits are also the Team Groom / Team Bride
 * picker: tap a photo to pick a side (saved to /api/team), with the tug-of-war
 * tally underneath. Then the "Who's more likely to…?" game and the vows.
 */
export const CoupleSection: React.FC<CoupleSectionProps> = ({ guestName = '', inviteToken = '' }) => {
  const [side, setSide] = useState<TeamSide | null>(() => loadTeamSide());
  const [totals, setTotals] = useState<TeamTotals | null>(null);
  const [toast, setToast] = useState('');
  const [pinVisible, setPinVisible] = useState(false);
  const pairRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number>();
  const picRefs = useRef<Record<TeamSide, HTMLButtonElement | null>>({ groom: null, bride: null });

  useEffect(() => {
    let alive = true;
    fetchTeamTotals().then((t) => alive && t && setTotals(t));
    const onChange = (e: Event) => {
      const d = (e as CustomEvent<TeamChangeDetail>).detail;
      if (!d) return;
      setSide(d.side);
      if (d.totals) setTotals(d.totals);
    };
    window.addEventListener(TEAM_CHANGE_EVENT, onChange);
    return () => {
      alive = false;
      window.clearTimeout(toastTimer.current);
      window.removeEventListener(TEAM_CHANGE_EVENT, onChange);
    };
  }, []);

  // Pinned "★ Team …" badge once the guest has scrolled past the portraits.
  useEffect(() => {
    const el = pairRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setPinVisible(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const choose = (next: TeamSide) => {
    if (next === side) return;
    const previous = side;
    setSide(next);
    hapticSoft();
    burstPetals(picRefs.current[next], 30);
    setToast(`Welcome to ${TEAM_LABEL[next]}!`);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2400);
    // Optimistic tally; replaced by the server's numbers when they arrive.
    setTotals((t) => {
      if (!t) return t;
      const n = { ...t, [next]: t[next] + 1 };
      if (previous) n[previous] = Math.max(0, n[previous] - 1);
      return n;
    });
    announceTeamSide({ side: next, totals: null, source: 'couple' });
    saveTeamPick(next, { inviteToken, guestName }).then(
      (t) => t && (setTotals(t), announceTeamSide({ side: next, totals: t, source: 'couple' }))
    );
  };

  const firstName = guestName.trim().split(/\s+/)[0] || '';
  const total = totals ? totals.bride + totals.groom : 0;
  const bridePct = total ? Math.round((totals!.bride / total) * 100) : 50;

  const renderPerson = (key: TeamSide) => {
    const p = PERSON[key];
    const mine = side === key;
    return (
      <article className={`cp-person cp-person--${key}${mine ? ' is-team' : ''}`}>
        <button
          type="button"
          className="cp-pic"
          ref={(el) => (picRefs.current[key] = el)}
          onClick={() => choose(key)}
          aria-pressed={mine}
          aria-label={`${TEAM_LABEL[key]}: ${p.name}’s side`}
        >
          <PortraitRing kind={p.ring} />
          <div className="cp-img bu">
            <img
              src={p.img}
              alt={`${p.name} portrait`}
              width={p.w}
              height={p.h}
              loading="lazy"
              decoding="async"
              style={{ objectPosition: p.pos }}
            />
          </div>
          <span className="cp-badge" aria-hidden="true">
            {mine ? `★ ${TEAM_LABEL[key]}` : TEAM_LABEL[key]}
          </span>
        </button>
        <span className="cp-role">{p.role}</span>
        <h3>{p.name}</h3>
        <span className="cp-home">
          <svg viewBox="0 0 12 16" aria-hidden="true" focusable="false">
            <path d="M6 15.2S1 9.6 1 6a5 5 0 0 1 10 0c0 3.6-5 9.2-5 9.2Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="6" cy="6" r="1.7" fill="currentColor" />
          </svg>
          {p.home.town}
          <span className="cp-home-r"> · {p.home.region}</span>
        </span>
        <p className="cp-story">{p.story}</p>
      </article>
    );
  };

  return (
    <section className={`cp grain${side ? ` cp--team-${side}` : ''}`} id="couple" aria-labelledby="couple-title">
      <header className="cp-head reveal">
        <div className="eyebrow">The couple</div>
        <h2 id="couple-title">Bride &amp; Groom</h2>
        <HeaderRule />
        <p className="cp-ask">
          {firstName ? `${firstName}, are` : 'Are'} you <em>Team Groom</em> or <em>Team Bride</em>?
          <span>Tap a photo to pick your side.</span>
        </p>
      </header>

      <div className="cp-pair reveal" ref={pairRef}>
        {/* the gold thali chain joining the two portraits */}
        <ThaliChain />

        {renderPerson('groom')}

        <div className="cp-amp" aria-hidden="true">
          <svg viewBox="0 0 80 90">
            <text x="40" y="70" textAnchor="middle">&amp;</text>
          </svg>
        </div>

        {renderPerson('bride')}
      </div>

      {totals && total > 0 && (
        <div className="cp-tug reveal" aria-label={`Team Groom ${totals.groom}, Team Bride ${totals.bride}`}>
          <div className="cp-bar">
            <i className="cp-bar-g" style={{ width: `${100 - bridePct}%` }} />
            <i className="cp-bar-b" style={{ width: `${bridePct}%` }} />
          </div>
          <div className="cp-lbls" aria-hidden="true">
            <span>Groom · {totals.groom}</span>
            <span>{totals.bride} · Bride</span>
          </div>
        </div>
      )}
      {side && (
        <p className="cp-note" aria-live="polite">
          You’re on <em>{TEAM_LABEL[side]}</em>. Changed your mind? Just tap the other photo.
        </p>
      )}

      <div className={`cp-toast${toast ? ' is-on' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
      {side && (
        <a href="#couple" className={`cp-pin${pinVisible ? ' is-on' : ''}`} aria-label={`${TEAM_LABEL[side]} — change your side`}>
          ★ {TEAM_LABEL[side]}
        </a>
      )}

      <CoupleQuiz />

      <div className="cp-vows reveal">
        <blockquote className="vow">
          <span className="vow-label">His vow</span>
          <p>{WEDDING_CONTENT.groomVow}</p>
        </blockquote>
        <blockquote className="vow">
          <span className="vow-label">Her vow</span>
          <p>{WEDDING_CONTENT.brideVow}</p>
        </blockquote>
      </div>
      <NextTeaser label="Next: how a Malayali girl beat the language barrier" targetId="story-filmstrip-section" />
    </section>
  );
};
