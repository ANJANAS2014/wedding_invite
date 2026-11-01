import './CoupleSection.css';
import React from 'react';
import { WEDDING_CONTENT, WEDDING_IMAGES } from '../../data/weddingData';
import { MandalaDivider } from '../shared/MandalaDivider/MandalaDivider';

export const CoupleSection: React.FC = () => {
  return (
    <section className="sec" id="couple">
      <div className="eyebrow">The couple</div>
      <h2>Bride &amp; Groom</h2>
      <MandalaDivider />

      <div className="cards">
        <div className="card">
          <div className="portrait-frame portrait-frame--groom">
            <img
              src={WEDDING_IMAGES.p12}
              alt={`${WEDDING_CONTENT.groom} portrait`}
              width={700}
              height={764}
              loading="lazy"
            />
          </div>
          <h3>{WEDDING_CONTENT.groom}</h3>
          <p>{WEDDING_CONTENT.groomStory}</p>
          <div className="vow">
            <span className="vow-label">
              HIS Vow <b aria-hidden="true">♥</b>
            </span>
            <p>{WEDDING_CONTENT.groomVow}</p>
          </div>
        </div>

        <div className="card">
          <div className="portrait-frame portrait-frame--bride">
            <img
              src={WEDDING_IMAGES.p10}
              alt={`${WEDDING_CONTENT.bride} portrait`}
              width={933}
              height={1400}
              loading="lazy"
            />
          </div>
          <h3>{WEDDING_CONTENT.bride}</h3>
          <p>{WEDDING_CONTENT.brideStory}</p>
          <div className="vow">
            <span className="vow-label">
              HER Vow <b aria-hidden="true">♥</b>
            </span>
            <p>{WEDDING_CONTENT.brideVow}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
