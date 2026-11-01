import React, { useCallback, useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import type { WishRecord } from '../../types';
import { haptic } from '../../utils/haptics';

const MAX_LAMPS = 25;
const CYCLE_MS = 6000; // a new lamp lights up and shows its wish
const USER_PAUSE_MS = 12000; // after a tap, wait before cycling again

interface WishesPondProps {
  wishes: readonly WishRecord[];
  onOpen: (id: string) => void;
}

// Stable pseudo-random number in [0, 1) from a string (keeps lamps in place across re-renders)
const hash01 = (s: string, salt: number) => {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
};

/** Spread lamps over the water in loose staggered rows. */
const lampPosition = (index: number, total: number, id: string) => {
  const cols = total <= 4 ? Math.max(total, 1) : total <= 9 ? 3 : total <= 16 ? 4 : 5;
  const rows = Math.ceil(total / cols);
  const row = Math.floor(index / cols);
  const col = index % cols;
  const x = ((col + 0.5) / cols) * 100 + (row % 2 ? 5 : -5) + (hash01(id, 1) * 8 - 4);
  // keep lamps above the reading card in the lower part of the pond
  const y = 26 + (rows > 1 ? (row / (rows - 1)) * 30 : 14) + (hash01(id, 2) * 6 - 3);
  return { left: Math.max(9, Math.min(91, x)), top: Math.max(22, Math.min(58, y)) };
};

/**
 * Wishes as flickering oil lamps on night water. The wishes come to the guest:
 * while the pond is in view a lamp lights up every few seconds and its wish
 * shows in the reading card (‹ Prev / Next ›; "Read full wish" opens the
 * existing modal). Tapping a lamp shows its wish and pauses the cycle briefly.
 * Wishes that arrive after the first render float in from the bottom.
 * Shows at most 25 lamps (newest first).
 */
export const WishesPond: React.FC<WishesPondProps> = ({ wishes, onOpen }) => {
  const lamps = wishes.slice(0, MAX_LAMPS);
  const seenRef = useRef<Set<string> | null>(null);
  const [arriving, setArriving] = useState<Record<string, boolean>>({});
  const [current, setCurrent] = useState<number>(0);
  const [inView, setInView] = useState<boolean>(false);
  const [pausedUntil, setPausedUntil] = useState<number>(0);
  const pondRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useRef<boolean>(prefersReducedMotion());

  // Only cycle while at least 40% of the pond is visible
  useEffect(() => {
    const el = pondRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => setInView(entries[0].isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || reduceMotion.current || lamps.length < 2) return;
    const wait = Math.max(CYCLE_MS, pausedUntil - Date.now());
    const t = window.setTimeout(() => setCurrent((c) => (c + 1) % lamps.length), wait);
    return () => window.clearTimeout(t);
  }, [inView, current, pausedUntil, lamps.length]);

  const pick = useCallback(
    (index: number) => {
      if (!lamps.length) return;
      setCurrent(((index % lamps.length) + lamps.length) % lamps.length);
      setPausedUntil(Date.now() + USER_PAUSE_MS);
    },
    [lamps.length]
  );
  const active = lamps[Math.min(current, Math.max(lamps.length - 1, 0))];
  const idsKey = lamps.map((w) => w.id).join('|');

  useEffect(() => {
    if (!seenRef.current) {
      seenRef.current = new Set(lamps.map((w) => w.id));
      return;
    }
    const fresh = lamps.filter((w) => !seenRef.current!.has(w.id)).map((w) => w.id);
    if (!fresh.length) return;
    fresh.forEach((id) => seenRef.current!.add(id));
    setArriving((prev) => ({ ...prev, ...Object.fromEntries(fresh.map((id) => [id, true])) }));
    // show the newest arrival in the reading card once it has floated up
    const newestIndex = lamps.findIndex((w) => w.id === fresh[0]);
    if (newestIndex >= 0) window.setTimeout(() => pick(newestIndex), 3300);
    // let the lamp render below the water line, then float it up
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        setArriving((prev) => {
          const next = { ...prev };
          fresh.forEach((id) => delete next[id]);
          return next;
        })
      )
    );
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  return (
    <div className="pond" ref={pondRef} aria-label="Wishes as floating lamps. Tap a lamp to read a wish.">
      <div className="pond-moon" aria-hidden="true" />
      {lamps.map((w, i) => {
        const pos = lampPosition(i, lamps.length, w.id);
        return (
          <button
            key={w.id}
            type="button"
            className={`diya ${active?.id === w.id ? 'is-lit' : ''}`}
            aria-label={`Read the wish from ${w.displayName}`}
            aria-pressed={active?.id === w.id}
            onClick={() => {
              haptic(8);
              pick(i);
            }}
            style={
              {
                left: `${pos.left}%`,
                top: arriving[w.id] ? '112%' : `${pos.top}%`,
                '--bd': `${(6 + hash01(w.id, 3) * 4).toFixed(1)}s`,
                '--dl': `-${(hash01(w.id, 4) * 7).toFixed(1)}s`,
              } as React.CSSProperties
            }
          >
            <span className="diya-flame" />
            <span className="diya-bowl" />
            <span className="diya-glow" />
          </button>
        );
      })}
      {active && (
        <div className="pond-card" role="status" aria-live="polite">
          <p className="pond-card-wish">“{active.wish}”</p>
          <b className="pond-card-name">— {active.displayName}</b>
          <div className="pond-card-nav">
            <button type="button" onClick={() => pick(current - 1)} aria-label="Previous wish">
              ‹ Prev
            </button>
            <button type="button" onClick={() => onOpen(active.id)}>
              Read full wish
            </button>
            <button type="button" onClick={() => pick(current + 1)} aria-label="Next wish">
              Next ›
            </button>
          </div>
        </div>
      )}
      {/* text alternative for screen readers */}
      <ul className="pond-sr">
        {lamps.map((w) => (
          <li key={w.id}>
            {w.wish} — {w.displayName}
          </li>
        ))}
      </ul>
    </div>
  );
};
