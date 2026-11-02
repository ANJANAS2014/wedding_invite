import './WeddingCard.css';
import React from 'react';
import type { WeddingEvent } from '../../data/events';
import { WEDDING_SCENE, WEDDING_SCHEDULE } from '../../data/events';
import { CardBody, type CardDate } from './EventParts';

interface WeddingCardProps {
  ev: WeddingEvent;
  isNext: boolean;
  date: CardDate;
}

/** Compact wedding card: a small mandapam scene over the essentials. */
export const WeddingCard: React.FC<WeddingCardProps> = ({ ev, isNext, date }) => (
  <article className="vc vc--wedding reveal" aria-labelledby="wc-title">
    <div className="vc-scene wc-scene">
      <div className="wc-stage">
      <div className="wc-player">
        <img src={WEDDING_SCENE.nadaswaram} alt="" width={280} height={338} loading="lazy" decoding="async" />
        <span className="wc-nt" aria-hidden="true">♪</span>
        <span className="wc-nt wc-nt2" aria-hidden="true">♫</span>
      </div>
      <div className="wc-mandapam">
        <img className="wc-mm" src={WEDDING_SCENE.mandapam} alt="" width={721} height={560} loading="lazy" decoding="async" />
        <img className="wc-couple" src={WEDDING_SCENE.couple} alt="" width={440} height={377} loading="lazy" decoding="async" />
        <img className="wc-agni" src={WEDDING_SCENE.homaKundam} alt="" width={360} height={283} loading="lazy" decoding="async" />
      </div>
      <div className="wc-player">
        <img src={WEDDING_SCENE.drummer} alt="" width={280} height={305} loading="lazy" decoding="async" />
      </div>
      </div>
      {isNext && <span className="vc-next">Next celebration</span>}
    </div>
    <CardBody ev={ev} isNext={isNext} date={date} titleId="wc-title" schedule={WEDDING_SCHEDULE} />
  </article>
);
