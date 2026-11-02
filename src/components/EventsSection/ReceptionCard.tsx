import './ReceptionCard.css';
import React from 'react';
import type { WeddingEvent } from '../../data/events';
import { RECEPTION_SCENE, RECEPTION_SCHEDULE } from '../../data/events';
import { CardBody, type CardDate } from './EventParts';

interface ReceptionCardProps {
  ev: WeddingEvent;
  isNext: boolean;
  date: CardDate;
}

// Three swags of fairy lights across the top of the scene (viewBox 0 0 600 70).
const SWAGS = [0, 200, 400].map((x) => ({ x0: x, cx: x + 100, x1: x + 200 }));
const BULBS = SWAGS.flatMap(({ x0, cx, x1 }) =>
  Array.from({ length: 9 }, (_, i) => {
    const t = (i + 1) / 10;
    const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1;
    const y = (1 - t) ** 2 * 6 + 2 * (1 - t) * t * 58 + t * t * 6 + 3;
    return { x: x.toFixed(1), y: y.toFixed(1) };
  }),
);

/** Compact reception card: the couple under fairy lights over the essentials. */
export const ReceptionCard: React.FC<ReceptionCardProps> = ({ ev, isNext, date }) => (
  <article className="vc vc--reception reveal" aria-labelledby="rc-title">
    <div className="vc-scene rc-scene">
      <svg className="rc-lights" viewBox="0 0 600 70" aria-hidden="true">
        <g className="rc-wire">
          {SWAGS.map(({ x0, cx, x1 }) => (
            <path key={x0} d={`M${x0},6 Q${cx},58 ${x1},6`} />
          ))}
        </g>
        <g className="rc-bulbs">
          {BULBS.map((b, i) => (
            <circle key={i} cx={b.x} cy={b.y} r="2.6" className={`b${i % 4}`} />
          ))}
        </g>
      </svg>
      <img className="rc-couple" src={RECEPTION_SCENE.couple} alt="" width={520} height={856} loading="lazy" decoding="async" />
      <span aria-hidden="true" className="rc-spark" style={{ left: '46%', top: '58%' }} />
      <span aria-hidden="true" className="rc-spark" style={{ left: '53%', top: '40%', animationDelay: '1.6s' }} />
      {isNext && <span className="vc-next">Next celebration</span>}
    </div>
    <CardBody ev={ev} isNext={isNext} date={date} titleId="rc-title" schedule={RECEPTION_SCHEDULE} />
  </article>
);
