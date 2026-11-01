import { useEffect } from 'react';

/**
 * Adds `.in` to every `.reveal` / `.bu` element as it scrolls into view
 * (slow fade-up / blur-up). Watches the container for lazily mounted
 * sections, and staggers siblings slightly via the `--rd` custom property.
 */
export function useScrollReveal(selector = '#main'): void {
  useEffect(() => {
    const root = document.querySelector(selector);
    if (!root) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const seen = new WeakSet<Element>();

    const io =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            (entries) =>
              entries.forEach((e) => {
                if (!e.isIntersecting) return;
                e.target.classList.add('in');
                io?.unobserve(e.target);
              }),
            { threshold: 0.12 }
          )
        : null;

    const scan = () => {
      root.querySelectorAll('.reveal, .bu').forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (reduce || !io) {
          el.classList.add('in');
          return;
        }
        const index = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        (el as HTMLElement).style.setProperty('--rd', `${Math.min(index, 4) * 0.12}s`);
        io.observe(el);
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io?.disconnect();
    };
  }, [selector]);
}
