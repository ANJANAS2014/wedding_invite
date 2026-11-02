import { useEffect } from 'react';
import { showerPetals } from '../components/FallingPetals/FallingPetals';
import { reducedMotion } from '../utils/motion';

/**
 * A very small petal puff the first time each of a few major sections scrolls
 * into view. Sections mount lazily, so ids are looked up until they exist.
 */
export function useScrollMoments(ids: string[], count = 7): void {
  useEffect(() => {
    if (reducedMotion() || !('IntersectionObserver' in window)) return;
    const pending = new Set(ids);
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting || !document.body.classList.contains('opened')) return;
          showerPetals(count);
          io.unobserve(e.target);
        }),
      { threshold: 0.35 }
    );
    const attach = () => {
      pending.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          io.observe(el);
          pending.delete(id);
        }
      });
      if (!pending.size) window.clearInterval(poll);
    };
    const poll = window.setInterval(attach, 1000);
    attach();
    return () => {
      window.clearInterval(poll);
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join('|'), count]);
}
