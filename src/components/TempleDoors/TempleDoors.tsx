import './TempleDoors.css';
import React from 'react';
import { LANG_MAPPINGS, WEDDING_CONTENT } from '../../data/weddingData';
import { INVITE_PORTRAIT } from '../CoverHero/CoverArt';
import { WEDDING_EVENT } from '../../data/events';
import { hapticTap } from '../../utils/haptics';
import type { DoorStatus, Language } from '../../types';

interface TempleDoorsProps {
  status: DoorStatus;
  language: Language;
  onOpen: () => void;
  /** Fired when the scene's final fade-out transition ends. */
  onFadeEnd?: () => void;
  onSkip: () => void;
}

const MANDALA_OUTER = 'M 0 -14 C 7.5 -26, 8.5 -42, 0 -54 C -8.5 -42, -7.5 -26, 0 -14 Z';
const MANDALA_INNER = 'M 0 -10 C 4.5 -19, 5 -31, 0 -40 C -5 -31, -4.5 -19, 0 -10 Z';
const PETAL = 'M0 -58C14 -38 16 -18 0 6C-16 -18 -14 -38 0 -58Z';

const Mandala: React.FC = () => (
  <svg viewBox="-60 -60 120 120" aria-hidden="true" focusable="false">
    {Array.from({ length: 12 }, (_, i) => (
      <path key={`o${i}`} d={MANDALA_OUTER} transform={`rotate(${i * 30})`} />
    ))}
    {Array.from({ length: 12 }, (_, i) => (
      <path key={`i${i}`} d={MANDALA_INNER} transform={`rotate(${i * 30 + 15})`} opacity="0.65" />
    ))}
    <circle r="14" opacity="0.45" />
  </svg>
);

/** The pink lotus from the original curtain bloom, used as the medallion crest. */
/**
 * Side-view lotus for the medallion: a tall centre petal, two layers of side
 * petals opening outward, paler back petals between them and a gilt base.
 * Pink deepening toward the tips, with fine gold edges and veins.
 */
const LOTUS_PETAL = 'M0 0C-11 -14 -10 -38 0 -56C10 -38 11 -14 0 0Z';
const LOTUS_LAYERS: readonly { a: number; s: number; back?: boolean }[] = [
  { a: -62, s: 0.62 }, { a: 62, s: 0.62 },
  { a: -40, s: 0.8, back: true }, { a: 40, s: 0.8, back: true },
  { a: -24, s: 0.86 }, { a: 24, s: 0.86 },
  { a: -10, s: 0.94, back: true }, { a: 10, s: 0.94, back: true },
  { a: 0, s: 1 },
];
const Lotus: React.FC<{ id: string }> = ({ id }) => (
  <svg className="lotus" viewBox="-60 -62 120 74" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-p`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#fff1f5" />
        <stop offset="0.45" stopColor="#f6b8cb" />
        <stop offset="0.85" stopColor="#e07597" />
        <stop offset="1" stopColor="#c44d74" />
      </linearGradient>
      <linearGradient id={`${id}-b`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#fff6f8" />
        <stop offset="1" stopColor="#f1a9bf" />
      </linearGradient>
      <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f6e3a3" />
        <stop offset="1" stopColor="#b7953a" />
      </linearGradient>
    </defs>
    {LOTUS_LAYERS.map((l, i) => (
      <g key={i} transform={`rotate(${l.a}) scale(${l.s})`}>
        <path d={LOTUS_PETAL} fill={`url(#${id}-${l.back ? 'b' : 'p'})`} stroke="#d4ad5a" strokeWidth={1.1 / l.s * 0.7} />
        {!l.back && <path d="M0 -4V-46" stroke="#fbe3ea" strokeWidth={0.9} strokeLinecap="round" opacity={0.8} />}
      </g>
    ))}
    {/* gilt base and a ripple of water */}
    <path d="M-30 1C-16 9 16 9 30 1C16 5 -16 5 -30 1Z" fill={`url(#${id}-g)`} />
    <path d="M-44 9C-24 13 24 13 44 9" fill="none" stroke="#c9a24d" strokeWidth={1} strokeLinecap="round" opacity={0.7} />
  </svg>
);

// "2026-11-29" → "29.11.2026"
const MEDALLION_DATE = WEDDING_EVENT.istDate.split('-').reverse().join('.'); // compact so it always fits the disc
const GROOM_INITIAL = WEDDING_CONTENT.groom.charAt(0).toUpperCase();
const BRIDE_INITIAL = WEDDING_CONTENT.bride.charAt(0).toUpperCase();

const KOLAM = (
  <svg viewBox="0 0 220 40" fill="none" stroke="#8a6219" strokeWidth="1.3" aria-hidden="true">
    <path d="M110 3 L134 20 L110 37 L86 20 Z" />
    <path d="M110 10 L124 20 L110 30 L96 20 Z" />
    <circle cx="110" cy="20" r="2.4" fill="#8a6219" />
    <path d="M86 20 Q66 3 46 20 Q66 37 86 20" />
    <path d="M134 20 Q154 3 174 20 Q154 37 134 20" />
    <path d="M46 20 Q30 8 14 20 Q30 32 46 20" />
    <path d="M174 20 Q190 8 206 20 Q190 32 174 20" />
    <circle cx="66" cy="20" r="1.8" fill="#8a6219" />
    <circle cx="154" cy="20" r="1.8" fill="#8a6219" />
  </svg>
);

/** Brass kuthuvilakku standing lamp with a flickering flame. */
const Lamp: React.FC<{ side: 'l' | 'r' }> = ({ side }) => (
  <div className={`tp-lamp tp-lamp--${side}`} aria-hidden="true">
    <span className="tp-flame" />
    <svg viewBox="0 0 40 96">
      <defs>
        <linearGradient id={`tp-brass-${side}`} x1="0" x2="1">
          <stop offset="0" stopColor="#8a6219" />
          <stop offset="0.45" stopColor="#f6e2a0" />
          <stop offset="0.7" stopColor="#c79a3e" />
          <stop offset="1" stopColor="#7d5717" />
        </linearGradient>
      </defs>
      <g fill={`url(#tp-brass-${side})`}>
        <path d="M14 6 Q20 0 26 6 L24 10 L16 10 Z" />
        <path d="M6 12 Q20 18 34 12 L32 16 Q20 21 8 16 Z" />
        <rect x="18" y="18" width="4" height="50" />
        <ellipse cx="20" cy="30" rx="5" ry="2.4" />
        <ellipse cx="20" cy="46" rx="4.4" ry="2.2" />
        <ellipse cx="20" cy="62" rx="6" ry="2.6" />
        <path d="M10 70 Q20 64 30 70 L33 82 Q20 78 7 82 Z" />
        <path d="M2 88 Q20 80 38 88 L38 92 Q20 96 2 92 Z" />
      </g>
    </svg>
  </div>
);

/**
 * Page 1 — a temple entrance: garland on a lime-plaster wall, carved stone
 * lintel and pillars, teak & brass doors with the couple's monogram, a stone
 * step with kolam and two lit lamps. On open the doors swing inward to reveal
 * the couple's portrait inside, then the view moves through the doorway into
 * the page-2 cover.
 */
export const TempleDoors: React.FC<TempleDoorsProps> = ({ status, language, onOpen, onSkip, onFadeEnd }) => {
  if (status === 'done') return null;
  const text = LANG_MAPPINGS[language] || LANG_MAPPINGS.en;

  const door = (side: 'l' | 'r') => (
    <div className={`tp-door tp-door--${side}`}>
      <div className="tp-panel tp-panel--top"><Mandala /></div>
      <div className="tp-ring" />
      <div className="tp-panel tp-panel--low"><Mandala /></div>
    </div>
  );

  return (
    <div className={`temple is-${status}`} onClick={status === 'closed' ? undefined : onSkip}>
      <div
        className="tp-scene"
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && e.propertyName === 'opacity') onFadeEnd?.();
        }}
      >
        <div className="tp-wall" aria-hidden="true" />
        <div className="tp-doorway" aria-hidden="true">
          <div className="tp-inside">
            <img src={INVITE_PORTRAIT} alt="" loading="eager" decoding="async" />
          </div>
          <div className="tp-glow" />
          <div className="tp-doors">
            {door('l')}
            {door('r')}
          </div>
        </div>
        <div className="tp-pillar tp-pillar--l" aria-hidden="true" />
        <div className="tp-pillar tp-pillar--r" aria-hidden="true" />
        <div className="tp-lintel" aria-hidden="true"><Mandala /></div>
        <div className="tp-step" aria-hidden="true">{KOLAM}</div>
        <Lamp side="l" />
        <Lamp side="r" />
        <div className="tp-side" aria-hidden="true">
          <div className="cover-procession-left" />
          <div className="cover-procession-elephant" />
        </div>
        <div className="tp-garland" aria-hidden="true" />

        <h1 className="td-sr">
          {WEDDING_CONTENT.groom} &amp; {WEDDING_CONTENT.bride}
        </h1>

        <div className="tp-ui">
          <div className="tp-medal" aria-hidden="true">
            {/* lotus, initials and date stacked and centred inside the ivory disc */}
            <div className="tp-medal-in">
              <Lotus id="tp-lotus" />
              <div className="tp-mono">
                {GROOM_INITIAL}
                <i>&amp;</i>
                {BRIDE_INITIAL}
              </div>
              <small>{MEDALLION_DATE}</small>
            </div>
          </div>
          <button
            type="button"
            className="btn"
            id="op"
            onClick={onOpen}
            onPointerDown={() => hapticTap()}
            disabled={status !== 'closed'}
            lang={language}
          >
            {text.open}
          </button>
        </div>
      </div>
    </div>
  );
};
