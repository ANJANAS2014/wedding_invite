import React from 'react';

/**
 * Original line drawing: two hands linking little fingers (a pinky promise),
 * with a small heart above. Gold strokes draw themselves in when the promise
 * cards scroll into view (.cp-vows.in).
 */
const STROKES = [
  // left arm and fist
  'M6 118C28 102 44 90 54 82', 'M30 118C46 106 60 98 70 90',
  'M54 82C47 72 47 58 54 50C58 45 64 43 70 44', 'M70 44C76 41 82 43 84 48', 'M60 47C61 43 65 41 69 43',
  'M84 48C88 52 88 58 84 61C80 63 76 61 75 58', 'M84 61C88 65 87 71 83 73C79 75 75 73 74 70',
  'M83 73C85 79 80 86 70 90', 'M75 58C73 56 70 57 69 60',
  // left little finger, hooked over
  'M82 46C88 38 99 36 104 42C107 46 106 51 102 53', 'M85 51C90 46 97 44 100 47C101 49 101 51 102 53',
  // right arm and fist
  'M194 118C172 102 156 90 146 82', 'M170 118C154 106 140 98 130 90',
  'M146 82C153 72 153 58 146 50C142 45 136 43 130 44', 'M130 44C124 41 118 43 116 48', 'M140 47C139 43 135 41 131 43',
  'M116 48C112 52 112 58 116 61C120 63 124 61 125 58', 'M116 61C112 65 113 71 117 73C121 75 125 73 126 70',
  'M117 73C115 79 120 86 130 90', 'M125 58C127 56 130 57 131 60',
  // right little finger, hooked under
  'M118 58C112 66 101 68 96 62C93 58 94 53 98 51', 'M115 54C110 59 103 60 100 57C99 55 99 53 98 51',
];

export const PinkyPromise: React.FC = () => (
  <svg className="cp-pinky" viewBox="0 10 200 108" aria-hidden="true" focusable="false">
    <g className="cp-pinky-lines" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {STROKES.map((d, i) => (
        <path key={i} d={d} pathLength={1} />
      ))}
    </g>
    <path className="cp-pinky-heart" d="M100 22C96 16 88 18 89 24C90 29 100 34 100 34C100 34 110 29 111 24C112 18 104 16 100 22Z" />
  </svg>
);
