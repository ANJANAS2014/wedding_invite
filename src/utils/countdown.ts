import type { Countdown } from '../types';

/**
 * Whole days/hours/minutes/seconds remaining until `targetMs`.
 * Returns `null` once the target time has been reached.
 */
export function getCountdown(targetMs: number, nowMs: number = Date.now()): Countdown | null {
  const diffSecs = Math.floor((targetMs - nowMs) / 1000);
  if (diffSecs <= 0) return null;
  return {
    days: Math.floor(diffSecs / 86400),
    hours: Math.floor((diffSecs % 86400) / 3600),
    minutes: Math.floor((diffSecs % 3600) / 60),
    seconds: Math.floor(diffSecs % 60),
  };
}

/** Two-digit display used by every countdown ("07"). */
export const pad2 = (value: number): string => String(value).padStart(2, '0');

/** Calendar date (YYYY-MM-DD) of `date` in India Standard Time. */
export const istDateKey = (date: Date): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
