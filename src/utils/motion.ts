import { haptic } from './haptics';

/** True when the guest has asked the OS for reduced motion. */
export const reducedMotion = (): boolean =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Smooth-scroll to a section by id (instant for reduced motion). */
export const glideTo = (id: string, block: ScrollLogicalPosition = 'start'): void => {
  document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block });
};

/** A tiny haptic tick that is skipped for reduced-motion users. */
export const tick = (ms = 5): void => {
  if (!reducedMotion()) haptic(ms);
};

/** Fired by the cover's "Take the tour" button; GuidedTour listens. */
export const TOUR_START_EVENT = 'tour:start';
