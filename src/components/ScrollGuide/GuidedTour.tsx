import './ScrollGuide.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { haptic, hapticSoft } from '../../utils/haptics';
import { glideTo, reducedMotion, tick, TOUR_START_EVENT } from '../../utils/motion';

// Section ids visited in order; the tour ends at the RSVP.
const STOPS = ['couple', 'story-filmstrip-section', 's2', 's5'];
const PAUSE_MS = 6000;
const GLIDE_MS = 1100;

/**
 * Optional guided tour, started from the cover's "Take the tour" button.
 * Glides section by section, pausing on each; ANY touch, wheel, key or click
 * stops it straight away.
 */
export const GuidedTour: React.FC = () => {
  const [running, setRunning] = useState(false);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const stop = useCallback((withHaptic = true) => {
    clear();
    setRunning((was) => {
      if (was && withHaptic) haptic(6);
      return false;
    });
  }, []);

  useEffect(() => {
    const start = () => {
      if (reducedMotion()) return;
      clear();
      hapticSoft();
      setRunning(true);
      const stops = STOPS.filter((id) => document.getElementById(id));
      stops.forEach((id, i) => {
        const at = i * (PAUSE_MS + GLIDE_MS);
        timers.current.push(window.setTimeout(() => glideTo(id), at));
        timers.current.push(window.setTimeout(() => tick(6), at + GLIDE_MS));
      });
      timers.current.push(
        window.setTimeout(() => stop(false), (stops.length - 1) * (PAUSE_MS + GLIDE_MS) + GLIDE_MS + 400)
      );
    };
    window.addEventListener(TOUR_START_EVENT, start);
    return () => {
      window.removeEventListener(TOUR_START_EVENT, start);
      clear();
    };
  }, [stop]);

  // Any guest input ends the tour (listeners attach after the start click has finished)
  useEffect(() => {
    if (!running) return;
    const end = () => stop(true);
    const id = window.setTimeout(() => {
      window.addEventListener('pointerdown', end, { capture: true, passive: true });
      window.addEventListener('wheel', end, { capture: true, passive: true });
      window.addEventListener('touchstart', end, { capture: true, passive: true });
      window.addEventListener('keydown', end, { capture: true });
    }, 50);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('pointerdown', end, { capture: true });
      window.removeEventListener('wheel', end, { capture: true });
      window.removeEventListener('touchstart', end, { capture: true });
      window.removeEventListener('keydown', end, { capture: true });
    };
  }, [running, stop]);

  useEffect(() => {
    document.body.classList.toggle('touring', running);
  }, [running]);

  if (!running) return null;
  return (
    <button type="button" className="tour-pill" onClick={() => stop(true)}>
      <span className="tour-dot" aria-hidden="true" />
      Touring · tap to stop
    </button>
  );
};
