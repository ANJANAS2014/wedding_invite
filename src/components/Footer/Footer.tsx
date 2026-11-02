import './Footer.css';
import React, { useEffect, useRef } from 'react';
import { WEDDING_CONTENT } from '../../data/weddingData';
import { showerPetals } from '../FallingPetals/FallingPetals';
import { HeaderRule } from '../shared/HeaderRule/HeaderRule';

/** Thank-you footer: script sign-off with a final soft petal fall when it comes into view. */
export const Footer: React.FC = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          showerPetals(26);
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <footer ref={ref} className="site-footer">
      <p className="footer-thanks reveal">
        With love, {WEDDING_CONTENT.groom} &amp; {WEDDING_CONTENT.bride}
      </p>
      <HeaderRule className="reveal" />
      <p className="footer-date reveal">29 · 11 · 2026</p>
    </footer>
  );
};
