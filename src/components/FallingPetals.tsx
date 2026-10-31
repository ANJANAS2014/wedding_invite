import React from 'react';

// Varied natural botanical petal shapes
const PETAL_SHAPES = [
  {
    // Shape 0: Classic rose / lotus petal with tapered tip and rounded body
    silhouette: 'M10 1.5 C15 5.5 18.5 11 18.5 17 C18.5 22.5 14.5 25 10 25 C5.5 25 1.5 22.5 1.5 17 C1.5 11 5 5.5 10 1.5 Z',
    highlight: 'M10 2.5 C13.5 6 16.5 11 16.5 16.5 C16.5 19.5 14.5 22 11 23.5 C13 21 14.5 18 14.5 15 C14.5 10.5 12 6.5 10 2.5 Z'
  },
  {
    // Shape 1: Gentle wind-curved petal with subtle natural asymmetry
    silhouette: 'M10 1.5 C15.5 4.5 19 10 17.5 17 C16.2 22.5 11.5 25 9.5 25 C6 25 2.5 21 2 15.5 C1.5 9.5 5.5 4 10 1.5 Z',
    highlight: 'M10 2.5 C14 5 16.5 9.5 15.5 15.5 C14.5 19.5 11.5 22 10 23.5 C12 21 14 17.5 14 14 C14 9.5 12 5.5 10 2.5 Z'
  },
  {
    // Shape 2: Soft rounded flutter petal with delicate curve
    silhouette: 'M10 1.8 C16 4.5 19 10 19 16 C19 22.5 15 25 10 25 C5 25 1 22.5 1 16 C1 10 4 4.5 10 1.8 Z',
    highlight: 'M10 3 C14.5 5.5 17 10 17 15 C17 19 14.5 22 11.5 23.5 C13.5 21 15 17.5 15 14 C15 9.5 12.5 6 10 3 Z'
  }
];

export const FallingPetals: React.FC = () => {
  // 24 petals distributed across the viewport width with varied sizes, timings, and shapes
  const petals = Array.from({ length: 24 }, (_, i) => {
    const tones = ['blush', 'rose', 'pink'];
    const tone = tones[i % tones.length];
    const shape = PETAL_SHAPES[i % PETAL_SHAPES.length];
    // Distribute across 2vw to 95vw
    const left = Number(((i * 4.15 + 2) % 94).toFixed(1));
    // Falling duration between 17s and 27s (gentle, relaxed pace)
    const dur = Number((17 + (i * 2.1) % 10).toFixed(1));
    // Negative delay ensures petals are scattered at various vertical positions on initial render
    const delay = Number((-(i * 1.85) % dur).toFixed(1));
    // Sway amplitude between 12px and 26px
    const sway = Number((12 + (i * 2.5) % 15).toFixed(1));
    // Initial rotation
    const rot = (i * 47) % 360;
    // Natural scale variation between 0.85 and 1.35
    const scale = Number((0.85 + (i * 0.07) % 0.52).toFixed(2));

    return (
      <div
        key={i}
        className={`pt pt--${tone}`}
        style={{
          left: `${left}vw`,
          animationDuration: `${dur}s`,
          animationDelay: `${delay}s`,
          ['--sw' as string]: `${sway}px`,
          ['--r' as string]: `${rot}deg`,
          ['--s' as string]: `${scale}`,
        }}
      >
        <svg viewBox="0 0 20 26" className="petal-svg" aria-hidden="true">
          <path d={shape.silhouette} fill="currentColor" />
          <path d={shape.highlight} fill="rgba(255, 255, 255, 0.32)" />
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
