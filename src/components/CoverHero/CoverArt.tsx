import React from 'react';

/** The couple's lotus close-up (Sreenath Photography): inside the temple doors and the page-2 photo band. */
export const INVITE_PORTRAIT = '/images/backgrounds/invitation-floral-background.jpg';

/**
 * Cover artwork shared by the temple-door landing page (drawn over the doors)
 * and the page-2 cover, so both pages show the identical garland, lamps and
 * procession in the same positions. Styles live in CoverHero.css.
 */

// Exact wick coordinates (% of 2160x760 desktop garland and 1080x760 mobile garland)
const LAMP_FLAMES = {
  desktop: [
    [10.6, 30.6],
    [35.3, 21.8],
    [2.1, 76.6],
    [7.0, 76.4],
    [89.3, 30.9],
    [64.6, 22.1],
    [97.9, 75.9],
    [92.9, 77.0]
  ],
  mobile: [
    [21.2, 30.0],
    [70.6, 21.4],
    [4.3, 75.7],
    [14.1, 76.3],
    [88.7, 74.7],
    [98.3, 75.1]
  ]
};

const renderLampFlames = (coords: number[][], keyPrefix: string) =>
  coords.map(([x, y], i) => {
    const duration = (2.4 + ((i * 0.43) % 1.5)).toFixed(2);
    const glowDuration = (3.4 + ((i * 0.57) % 1.8)).toFixed(2);
    const delay = (-((i * 0.73) % 2.6)).toFixed(2);
    return (
      <span
        key={`${keyPrefix}_${i}`}
        className="cover-lamp"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          ['--fd' as string]: `${duration}s`,
          ['--fgd' as string]: `${glowDuration}s`,
          ['--fdl' as string]: `${delay}s`
        }}
      >
        <span className="cover-lamp-glow" />
        <span className="cover-lamp-flame" />
      </span>
    );
  });

/** Upper floral & jasmine canopy + floating brass lamps with independent flame flicker. */
export const CoverGarland: React.FC = () => (
  <div className="cover-garland-stage">
    <div className="cover-garland" />
    <div className="cover-lamps cover-lamps--desktop">{renderLampFlames(LAMP_FLAMES.desktop, 'd')}</div>
    <div className="cover-lamps cover-lamps--mobile">{renderLampFlames(LAMP_FLAMES.mobile, 'm')}</div>
  </div>
);

/** Lower ceremonial aisle: musicians & umbrellas (left), elephant and lotus corner (right). */
export const CoverProcession: React.FC = () => (
  <>
    <div className="cover-procession-left" />
    <div className="cover-procession-elephant" />
    <div className="cover-decor-right" />
  </>
);
