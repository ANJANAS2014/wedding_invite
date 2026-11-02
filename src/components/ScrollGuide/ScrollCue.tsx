import './ScrollGuide.css';
import React, { useEffect, useState } from 'react';
import { glideTo, tick } from '../../utils/motion';

/** The page's sections in order; each one points to the next. */
const STEPS: readonly { id: string; next: string; label: string; dark?: boolean }[] = [
  { id: 'hero', next: 'couple', label: 'Next: meet the bride & groom' },
  { id: 'couple', next: 'story-filmstrip-section', label: 'Next: our story' },
  { id: 'story-filmstrip-section', next: 's2', label: 'Next: when & where' },
  { id: 's2', next: 's5', label: 'Next: RSVP', dark: true },
  { id: 's5', next: 'wishes', label: 'Next: wishes', dark: true },
];

/** Elements that already sit at the bottom of the screen; the cue steps aside for them. */
const BOTTOM_UI = '.rt-bar, .pond-card, .lb-close';

const onScreen = (el: Element | null) => {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
};

/**
 * "Next: …" text with a bouncing arrow, pinned to the bottom of the screen in
 * every section, so guests always know there's more below (wherever a section
 * ends on their phone). It names the next section, hides once that section
 * comes into view, and tapping it glides there. Light on burgundy sections.
 * Not shown on the last section (Wishes). Static under reduced motion.
 */
export const ScrollCue: React.FC = () => {
  const [revealed, setRevealed] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const body = document.body;
    const sync = () => setRevealed(body.classList.contains('revealed') && !body.classList.contains('doors-busy'));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(body, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    if (!revealed) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      // current section = the last one whose top has passed the middle of the screen
      let current = -1;
      STEPS.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= vh * 0.5) current = i;
      });
      if (current < 0) current = 0;
      const next = document.getElementById(STEPS[current].next);
      const lastSection = document.getElementById('wishes');
      const nextFar = !!next && next.getBoundingClientRect().top > vh * 0.8;
      const atEnd = !!lastSection && lastSection.getBoundingClientRect().top <= vh * 0.5;
      const blocked = [...document.querySelectorAll(BOTTOM_UI)].some((el) => {
        const r = el.getBoundingClientRect();
        return onScreen(el) && r.bottom > vh - 120;
      });
      setStep(current);
      setShow(nextFar && !atEnd && !blocked);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [revealed]);

  const visible = revealed && show;
  const s = STEPS[step];

  // lift the floating RSVP pill above the cue while both are on screen
  useEffect(() => {
    document.body.classList.toggle('has-scroll-cue', visible);
    return () => document.body.classList.remove('has-scroll-cue');
  }, [visible]);

  return (
    <button
      type="button"
      className={`scroll-cue${s.dark ? ' scroll-cue--light' : ''}${step === 0 ? ' scroll-cue--cover' : ''}${visible ? ' is-visible' : ''}`}
      aria-label={s.label}
      aria-hidden={!visible || undefined}
      tabIndex={visible ? 0 : -1}
      onClick={() => {
        tick(8);
        glideTo(s.next);
      }}
    >
      <span className="scroll-cue-label">{s.label}</span>
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 7.5l5 5 5-5" />
      </svg>
    </button>
  );
};
