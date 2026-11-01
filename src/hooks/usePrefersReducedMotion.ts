import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/** One-off check (e.g. inside an event handler). */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia(QUERY).matches;

/** Live `prefers-reduced-motion` preference. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(QUERY);
    const update = () => setReduced(mq.matches);
    update();
    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }
    // Safari < 14
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);
  return reduced;
}
