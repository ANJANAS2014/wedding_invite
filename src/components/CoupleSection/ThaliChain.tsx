import React from 'react';

/**
 * The gold thali chain strung between the two portraits.
 * Two halves of chain draw in from each portrait toward the middle, gold beads
 * appear outside → in, then the thali (an aalila / banyan-leaf pendant) drops
 * onto the centre of the chain and swings gently to rest under the "&".
 * Bead y-positions follow the same curve as the SVG path:
 *   M0 2 Q50 62 100 2  →  y(x) = 2 + 120·x·(1−x)   (viewBox height 40)
 */
const BEADS = Array.from({ length: 17 }, (_, i) => 0.06 + i * (0.88 / 16)).filter((x) => Math.abs(x - 0.5) > 0.05);
const curveY = (x: number) => ((2 + 120 * x * (1 - x)) / 40).toFixed(3);

export const ThaliChain: React.FC = () => (
  <div className="cp-chain" aria-hidden="true">
    {/* two halves, each revealed from its portrait toward the centre */}
    <svg className="cp-chain-line cp-chain-line--l" viewBox="0 0 50 40" preserveAspectRatio="none">
      <defs>
        <linearGradient id="cpChainGold" x1="0" x2="1">
          <stop offset="0" stopColor="#a87d2a" />
          <stop offset=".55" stopColor="#f3d98a" />
          <stop offset="1" stopColor="#b88a2e" />
        </linearGradient>
      </defs>
      <path className="cp-chain-half" d="M0 2 Q25 32 50 32" vectorEffect="non-scaling-stroke" />
    </svg>
    <svg className="cp-chain-line cp-chain-line--r" viewBox="50 0 50 40" preserveAspectRatio="none">
      <path className="cp-chain-half" d="M100 2 Q75 32 50 32" vectorEffect="non-scaling-stroke" />
    </svg>

    {BEADS.map((x, i) => (
      <i
        key={x}
        className={`cp-bead${i % 2 ? ' cp-bead--s' : ''}`}
        style={{
          left: `${x * 100}%`,
          top: `calc(var(--gh) * ${curveY(x)})`,
          ['--bd' as string]: `${(0.55 + (0.5 - Math.abs(x - 0.5)) * 2.1).toFixed(2)}s`,
        }}
      />
    ))}

    <span className="cp-thali" style={{ top: `calc(var(--gh) * ${curveY(0.5)})` }}>
      <span className="cp-thali-swing">
        <svg viewBox="0 0 40 58">
          <defs>
            <linearGradient id="cpThaliGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff2c4" />
              <stop offset=".28" stopColor="#e8c463" />
              <stop offset=".6" stopColor="#c0912e" />
              <stop offset="1" stopColor="#8a6219" />
            </linearGradient>
            <radialGradient id="cpThaliBead" cx=".35" cy=".35" r=".7">
              <stop offset="0" stopColor="#fff4cf" />
              <stop offset=".5" stopColor="#d9ac45" />
              <stop offset="1" stopColor="#8a6219" />
            </radialGradient>
          </defs>
          {/* bail: the loop the chain passes through */}
          <ellipse cx="20" cy="5" rx="3.6" ry="4" fill="none" stroke="url(#cpThaliGold)" strokeWidth="1.8" />
          <circle cx="20" cy="11.5" r="2.4" fill="url(#cpThaliBead)" />
          {/* aalila (banyan-leaf) thali */}
          <path
            d="M20 14 C31 17 37 27 34 37 C31.5 45 25 50 20 56 C15 50 8.5 45 6 37 C3 27 9 17 20 14 Z"
            fill="url(#cpThaliGold)"
            stroke="#7d5816"
            strokeWidth=".7"
          />
          <path
            d="M20 17.5 C29 20 33.5 28 31 36 C29 42.5 24 47 20 51.5 C16 47 11 42.5 9 36 C6.5 28 11 20 20 17.5 Z"
            fill="none"
            stroke="#fff3c8"
            strokeOpacity=".65"
            strokeWidth=".6"
          />
          {/* midrib and veins */}
          <path d="M20 19 V49" stroke="#8a6219" strokeWidth=".8" strokeLinecap="round" />
          <path
            d="M20 26 L14 22.5 M20 26 L26 22.5 M20 33 L12.5 29.5 M20 33 L27.5 29.5 M20 40 L14 37.5 M20 40 L26 37.5"
            stroke="#8a6219"
            strokeOpacity=".7"
            strokeWidth=".55"
            strokeLinecap="round"
          />
          {/* granulation dots along the edge */}
          {[
            [12.5, 21.5], [27.5, 21.5], [8.6, 29], [31.4, 29], [8.4, 37], [31.6, 37], [12, 45], [28, 45], [20, 53],
          ].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r=".9" fill="#fff0bd" />
          ))}
          {/* moving glint */}
          <ellipse className="cp-thali-glint" cx="14" cy="27" rx="2.2" ry="7" fill="#fffbe9" transform="rotate(-24 14 27)" />
        </svg>
      </span>
    </span>
  </div>
);
