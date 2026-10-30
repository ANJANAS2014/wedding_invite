import React from 'react';

interface LotusCurtainProps {
  status: 'closing' | 'parting' | 'idle';
}

export const LotusCurtain: React.FC<LotusCurtainProps> = ({ status }) => {
  if (status === 'idle') return null;

  return (
    <div
      className={`lotus-curtain ${status === 'closing' ? 'is-closing' : ''} ${status === 'parting' ? 'is-parting' : ''}`}
      aria-hidden="true"
    >
      <div className="lc-panel lc-panel--left">
        <span className="lc-edge" />
      </div>
      <div className="lc-panel lc-panel--right">
        <span className="lc-edge" />
      </div>
      <div className="lc-bloom">
        <svg viewBox="-60 -60 120 120" focusable="false">
          <defs>
            <linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fde6ec" />
              <stop offset=".6" stopColor="#ec9db2" />
              <stop offset="1" stopColor="#c45a7b" />
            </linearGradient>
          </defs>
          {[-72, -48, -24, 0, 24, 48, 72].map((angle) => (
            <path
              key={angle}
              transform={`rotate(${angle}) translate(0 -6)`}
              d="M0 -50C12 -34 14 -16 0 4C-14 -16 -12 -34 0 -50Z"
              fill="url(#lcg)"
              stroke="#e6c477"
              strokeWidth=".9"
            />
          ))}
          <ellipse cx="0" cy="4" rx="30" ry="7" fill="#d9b45f" />
          <ellipse cx="0" cy="2" rx="20" ry="4" fill="#f3dc8e" />
        </svg>
      </div>
    </div>
  );
};
