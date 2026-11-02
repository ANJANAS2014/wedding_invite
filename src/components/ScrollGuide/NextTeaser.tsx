import './ScrollGuide.css';
import React from 'react';
import { haptic } from '../../utils/haptics';
import { glideTo } from '../../utils/motion';

interface NextTeaserProps {
  label: string;
  targetId: string;
  /** "light" on burgundy sections, "dark" on ivory ones */
  tone?: 'light' | 'dark';
}

/** "What's next" line at the end of a section; tapping glides to the next section. */
export const NextTeaser: React.FC<NextTeaserProps> = ({ label, targetId, tone = 'dark' }) => (
  <button
    type="button"
    className={`next-teaser next-teaser--${tone} reveal`}
    onClick={() => {
      haptic(8);
      glideTo(targetId);
    }}
  >
    <span>{label}</span>
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M3 6l5 5 5-5" />
    </svg>
  </button>
);
