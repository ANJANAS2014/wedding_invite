import React, { useEffect, useId, useRef, useState } from 'react';

interface LotusCurtainProps {
  status: 'closing' | 'parting' | 'idle';
  onParted?: () => void;
}

export const LotusCurtain: React.FC<LotusCurtainProps> = ({ status, onParted }) => {
  const bloomRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, '');
  const gradId = 'lcg-' + id;
  const goldId = 'lcg-gold-' + id;
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const partedCalledRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(mq.matches);
    update();
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    } else {
      mq.addListener(update);
      return () => mq.removeListener(update);
    }
  }, []);

  useEffect(() => {
    if (status !== 'parting') {
      partedCalledRef.current = false;
      return;
    }

    if (prefersReducedMotion) {
      if (!partedCalledRef.current) {
        partedCalledRef.current = true;
        onParted?.();
      }
      return;
    }

    let done = 0;
    const panels = [leftRef.current, rightRef.current].filter(Boolean) as HTMLElement[];
    const bloom = bloomRef.current;

    const handleEnd = (e: TransitionEvent) => {
      done += 1;
      if (done >= 2) {
        if (!partedCalledRef.current) {
          partedCalledRef.current = true;
          requestAnimationFrame(() => {
            onParted?.();
          });
        }
      }
    };

    panels.forEach((p) => p.addEventListener('transitionend', handleEnd));
    if (bloom) bloom.addEventListener('transitionend', handleEnd);

    const fallback = window.setTimeout(() => {
      if (!partedCalledRef.current) {
        partedCalledRef.current = true;
        onParted?.();
      }
    }, 2200);

    return () => {
      panels.forEach((p) => p.removeEventListener('transitionend', handleEnd));
      if (bloom) bloom.removeEventListener('transitionend', handleEnd);
      window.clearTimeout(fallback);
    };
  }, [status, onParted, prefersReducedMotion]);

  if (status === 'idle') return null;

  return (
    <div
      className={'lotus-curtain ' + (status === 'closing' ? 'is-closing' : '') + ' ' + (status === 'parting' ? 'is-parting' : '')}
      aria-hidden="true"
    >
      <div className="lc-panel lc-panel--left" ref={leftRef}>
        <span className="lc-edge" />
      </div>
      <div className="lc-panel lc-panel--right" ref={rightRef}>
        <span className="lc-edge" />
      </div>
      <div className="lc-bloom" ref={bloomRef}>
        <svg viewBox="-70 -70 140 140" focusable="false" aria-hidden="true">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffe6ee" />
              <stop offset="0.4" stopColor="#f3a7be" />
              <stop offset="0.8" stopColor="#d86b8c" />
              <stop offset="1" stopColor="#a93f5f" />
            </linearGradient>
            <linearGradient id={goldId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f6e3a3" />
              <stop offset="0.6" stopColor="#d9b45f" />
              <stop offset="1" stopColor="#b7953a" />
            </linearGradient>
            <radialGradient id={'lcg-center-' + id} cx="0" cy="0" r="1">
              <stop offset="0" stopColor="#fff3c4" />
              <stop offset="0.6" stopColor="#f0d88a" />
              <stop offset="1" stopColor="#d9b45f" />
            </radialGradient>
          </defs>
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
            <path
              key={angle}
              transform={'rotate(' + angle + ') translate(0 -10)'}
              d="M0 -58C14 -38 16 -18 0 6C-16 -18 -14 -38 0 -58Z"
              fill={'url(#' + gradId + ')'}
              stroke="#e6c477"
              strokeWidth="0.8"
              opacity={0.95}
            />
          ))}
          {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((angle) => (
            <path
              key={'inner-' + angle}
              transform={'rotate(' + angle + ') translate(0 -6) scale(0.7)'}
              d="M0 -58C14 -38 16 -18 0 6C-16 -18 -14 -38 0 -58Z"
              fill={'url(#' + gradId + ')'}
              stroke="#f0d88a"
              strokeWidth="0.6"
              opacity={0.9}
            />
          ))}
          <ellipse cx="0" cy="8" rx="34" ry="9" fill={'url(#' + goldId + ')'} opacity={0.95} />
          <ellipse cx="0" cy="6" rx="22" ry="5" fill="#f3dc8e" opacity={0.98} />
          <circle cx="0" cy="4" r="9" fill={'url(#lcg-center-' + id + ')'} stroke="#b7953a" strokeWidth="0.8" />
          <circle cx="0" cy="4" r="4" fill="#fff3c4" opacity={0.9} />
        </svg>
      </div>
    </div>
  );
};
