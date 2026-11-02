import './ScrollGuide.css';
import React, { useEffect, useRef } from 'react';
import { tick } from '../../utils/motion';

const MILESTONES = [0.25, 0.5, 0.75, 1];

/**
 * Thin gold reading-progress hairline at the top of the screen (shown once the
 * invitation is open). A tiny haptic tick marks 25/50/75/100% — only after the
 * guest has interacted, since vibration needs a prior user gesture.
 */
export const ScrollProgress: React.FC = () => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let interacted = false;
    let passed = 0; // highest milestone index already ticked
    const markInteracted = () => {
      interacted = true;
    };

    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) barRef.current.style.setProperty('--p', p.toFixed(4));
      const reached = MILESTONES.filter((m) => p >= m - 0.005).length;
      if (reached > passed) {
        if (interacted) tick(5);
        passed = reached;
      } else if (reached < passed) {
        passed = reached;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('pointerdown', markInteracted, { passive: true, once: true });
    window.addEventListener('keydown', markInteracted, { once: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pointerdown', markInteracted);
      window.removeEventListener('keydown', markInteracted);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="scroll-progress" ref={barRef} aria-hidden="true">
      <span className="scroll-progress-fill" />
      <span className="scroll-progress-tip" />
    </div>
  );
};
