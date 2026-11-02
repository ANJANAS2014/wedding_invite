import './CoupleSection.css';
import React from 'react';
import { WEDDING_CONTENT, WEDDING_IMAGES } from '../../data/weddingData';
import { HeaderRule } from '../shared/HeaderRule/HeaderRule';
import { NextTeaser } from '../ScrollGuide/NextTeaser';

/** Bride & Groom — two round portraits side by side, both vows together underneath. */
export const CoupleSection: React.FC = () => (
  <section className="cp grain" id="couple" aria-labelledby="couple-title">
    <header className="cp-head reveal">
      <div className="eyebrow">The couple</div>
      <h2 id="couple-title">Bride &amp; Groom</h2>
      <HeaderRule />
    </header>

    <div className="cp-pair reveal">
      <article className="cp-person">
        <div className="cp-pic">
          <div className="cp-img bu">
            <img
              src={WEDDING_IMAGES.p12}
              alt={`${WEDDING_CONTENT.groom} portrait`}
              width={700}
              height={764}
              loading="lazy"
              decoding="async"
              style={{ objectPosition: '50% 25%' }}
            />
          </div>
        </div>
        <span className="cp-role">The Groom</span>
        <h3>{WEDDING_CONTENT.groom}</h3>
        <p className="cp-story">{WEDDING_CONTENT.groomStory}</p>
      </article>

      <div className="cp-amp" aria-hidden="true">&amp;</div>

      <article className="cp-person">
        <div className="cp-pic">
          <div className="cp-img bu">
            <img
              src={WEDDING_IMAGES.p10}
              alt={`${WEDDING_CONTENT.bride} portrait`}
              width={933}
              height={1400}
              loading="lazy"
              decoding="async"
              className="cp-img--bride"
            />
          </div>
        </div>
        <span className="cp-role">The Bride</span>
        <h3>{WEDDING_CONTENT.bride}</h3>
        <p className="cp-story">{WEDDING_CONTENT.brideStory}</p>
      </article>
    </div>

    <div className="cp-vows reveal">
      <blockquote className="vow">
        <span className="vow-label">His vow</span>
        <p>{WEDDING_CONTENT.groomVow}</p>
      </blockquote>
      <blockquote className="vow">
        <span className="vow-label">Her vow</span>
        <p>{WEDDING_CONTENT.brideVow}</p>
      </blockquote>
    </div>
    <NextTeaser label="Next: how a Malayali girl beat the language barrier" targetId="story-filmstrip-section" />
  </section>
);
