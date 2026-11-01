import React from 'react';

/** Section-header ornament: gold hairlines with a small floret (styles: .hrule in global.css). */
export const HeaderRule: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`hrule ${className}`.trim()} aria-hidden="true">
    <svg viewBox="-12 -12 24 24" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M0 -10C2 -6 2 -3 0 0C-2 -3 -2 -6 0 -10Z M0 10C2 6 2 3 0 0C-2 3 -2 6 0 10Z M-10 0C-6 -2 -3 -2 0 0C-3 2 -6 2 -10 0Z M10 0C6 -2 3 -2 0 0C3 2 6 2 10 0Z" />
    </svg>
  </div>
);
