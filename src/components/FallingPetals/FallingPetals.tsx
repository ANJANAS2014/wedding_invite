import './FallingPetals.css';
import React, { useEffect, useRef } from 'react';
import { createPetalShower, type PetalShowerApi } from './petalEngine';

let engine: PetalShowerApi | null = null;

/** Soft flurry from the top (used when the invitation opens). */
export const showerPetals = (count = 44): void => engine?.shower(count);

/** Burst upward from an element (e.g. the RSVP / wishes submit button). */
export const burstPetals = (from?: Element | null, count = 46): void => {
  if (!engine) return;
  const r = from?.getBoundingClientRect();
  if (r && r.bottom > 0 && r.top < window.innerHeight) engine.burst(r.left + r.width / 2, r.top + 4, count);
  else engine.burst(window.innerWidth / 2, window.innerHeight * 0.85, count);
};

export const FallingPetals: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current || engine) return;
    engine = createPetalShower(ref.current);
    engine.start();
  }, []);
  return <canvas ref={ref} className="petal-canvas" aria-hidden="true" />;
};
