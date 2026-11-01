import React from 'react';

interface MandalaDividerProps {
  /** Extra classes added after the shared `.div` divider class. */
  className?: string;
  style?: React.CSSProperties;
}

const PETALS = Array.from({ length: 8 }, (_, i) => (i * 360) / 8);

/**
 * Gold line–mandala–line ornament used under section headings.
 * Styled by `.div` and `.man` in src/styles/global.css.
 */
export const MandalaDivider: React.FC<MandalaDividerProps> = ({ className, style }) => (
  <div className={className ? `div ${className}` : 'div'} style={style}>
    <svg viewBox="-50 -50 100 100" className="man">
      {PETALS.map((angle) => (
        <ellipse key={angle} rx="4" ry="22" cy="-26" transform={`rotate(${angle})`} />
      ))}
      <circle r="2" style={{ fill: 'var(--gold)' }} />
    </svg>
  </div>
);
