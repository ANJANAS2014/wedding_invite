import React from 'react';

export const FallingPetals: React.FC = () => {
  const petals = Array.from({ length: 18 }, (_, i) => {
    const tones = ['blush', 'rose', 'gold', 'pink'];
    const tone = tones[i % tones.length];
    const left = ((i * 5.5 + 2) % 96);
    const dur = 12 + (i * 1.5) % 8;
    const delay = -(i * 2.3) % dur;
    return (
      <div
        key={i}
        className={`pt pt--${tone}`}
        style={{
          left: `${left}vw`,
          animationDuration: `${dur}s`,
          animationDelay: `${delay}s`,
          ['--sw' as string]: `${16 + (i * 5) % 24}px`,
          ['--r' as string]: `${(i * 47) % 360}deg`,
          ['--s' as string]: `${0.7 + (i * 0.12) % 0.5}`,
        }}
      >
        <i />
      </div>
    );
  });

  return (
    <div className="petals" aria-hidden="true">
      {petals}
    </div>
  );
};
