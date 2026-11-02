import './TrainJourney.css';
import React from 'react';
import { WEDDING_SCENE } from '../../data/events';

/** A small train running from Aluva (wedding) to MGR Chennai Central (reception). */
export const TrainJourney: React.FC = () => (
  <div className="tr reveal" role="img" aria-label="A train runs from Aluva, near the wedding venue, to MGR Chennai Central for the reception">
    <figure className="tr-board tr-from" aria-hidden="true">
      <div className="tr-plate">
        <span lang="ml">ആലുവ</span>
        <b>ALUVA</b>
      </div>
      <figcaption>29 Nov</figcaption>
    </figure>

    <div className="tr-line" aria-hidden="true">
      <div className="tr-train">
        <img src={WEDDING_SCENE.train} alt="" width={532} height={165} loading="lazy" decoding="async" />
      </div>
    </div>

    <figure className="tr-board tr-to" aria-hidden="true">
      <div className="tr-plate">
        <span lang="ta">சென்னை சென்ட்ரல்</span>
        <b>MGR CENTRAL</b>
      </div>
      <figcaption>6 Dec</figcaption>
    </figure>
  </div>
);
