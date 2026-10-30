import React from 'react';

export const FallingPetals: React.FC = () => {
  const petals = Array.from({ length: 16 }, (_, i) => {
    const tones = ['blush', 'rose', 'gold', 'pink'];
    const tone = tones[i % tones.length];
    const left = ((i * 6.2 + 3) % 96);
    const dur = 24 + (i * 2.8) % 14;
    const delay = -(i * 2.5) % dur;
    return (
      <div
        key={i}
        className={`pt pt--${tone}`}
        style={{
          left: `${left}vw`,
          animationDuration: `${dur}s`,
          animationDelay: `${delay}s`,
          ['--sw' as string]: `${6 + (i * 3) % 12}px`,
          ['--r' as string]: `${(i * 37) % 360}deg`,
          ['--s' as string]: `${0.32 + (i * 0.04) % 0.28}`,
        }}
      >
        <svg viewBox="0 0 16 22" className="petal-svg" aria-hidden="true">
          <path
            d="M8 1C11.5 4.5 14 9 14 13.5C14 18 10.5 21 8 21C5.5 21 2 18 2 13.5C2 9 4.5 4.5 8 1Z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  });

  return (
    <div className="petals" aria-hidden="true">
      {petals}
    </div>
  );
};
