import React from 'react';

/**
 * Decorative ring drawn around a round portrait.
 *  - bride → Kerala kasavu: ivory with a gold zari band and a row of tiny gold dots
 *  - groom → Kanjeevaram temple border: a maroon band with gold "temple" triangles
 * The thin lines draw themselves in when the pair scrolls into view (.cp-pair.in).
 */
const C = 100;
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export const PortraitRing: React.FC<{ kind: 'kasavu' | 'temple' }> = ({ kind }) => (
  <svg className={`cp-ring cp-ring--${kind}`} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
    {kind === 'kasavu' ? (
      <>
        <circle className="cp-ring-draw" cx={C} cy={C} r={98} pathLength={1} fill="none" style={{ stroke: 'var(--gold)' }} strokeWidth={0.7} />
        <circle className="cp-ring-band" cx={C} cy={C} r={95.3} fill="none" style={{ stroke: 'var(--gold)' }} strokeWidth={3.2} />
        <circle className="cp-ring-draw" cx={C} cy={C} r={92.4} pathLength={1} fill="none" style={{ stroke: 'var(--gold)' }} strokeWidth={0.6} />
        <g className="cp-ring-motif" style={{ fill: 'var(--gold)' }}>
          {range(60).map((i) => (
            <circle key={i} cx={C} cy={C - 89.6} r={0.75} transform={`rotate(${i * 6} ${C} ${C})`} />
          ))}
        </g>
      </>
    ) : (
      <>
        <circle className="cp-ring-band" cx={C} cy={C} r={93.8} fill="none" style={{ stroke: 'var(--burg)' }} strokeWidth={8} />
        <circle className="cp-ring-draw" cx={C} cy={C} r={98.6} pathLength={1} fill="none" style={{ stroke: 'var(--gold)' }} strokeWidth={0.8} />
        <circle className="cp-ring-draw" cx={C} cy={C} r={89} pathLength={1} fill="none" style={{ stroke: 'var(--gold)' }} strokeWidth={0.8} />
        <g className="cp-ring-motif" style={{ fill: 'var(--gold-l)' }}>
          {range(40).map((i) => (
            // temple-tower triangle: base on the outer edge, point toward the photo
            <path key={i} d={`M${C - 3.4} ${C - 97.2} L${C + 3.4} ${C - 97.2} L${C} ${C - 90.6} Z`} transform={`rotate(${i * 9} ${C} ${C})`} />
          ))}
        </g>
      </>
    )}
  </svg>
);
