import React from 'react';
import { WEDDING_CONTENT, LANG_MAPPINGS } from '../data/weddingData';

interface InvitationIntroSectionProps {
  language: 'en' | 'ta' | 'ml';
}

export const InvitationIntroSection: React.FC<InvitationIntroSectionProps> = ({ language }) => {
  const langData = LANG_MAPPINGS[language] || LANG_MAPPINGS.en;

  return (
    <section className="alt" id="s1">
      <div className="sec rv in" id="fam">
        <h2 className="pn2" style={{ fontSize: 'clamp(44px, 8vw, 76px)' }}>
          {WEDDING_CONTENT.groom} &amp; {WEDDING_CONTENT.bride}
        </h2>
        <div className="div">
          <svg viewBox="-50 -50 100 100" className="man">
            {Array.from({ length: 8 }, (_, i) => (
              <ellipse key={i} rx="4" ry="22" cy="-26" transform={`rotate(${(i * 360) / 8})`} />
            ))}
            <circle r="2" style={{ fill: 'var(--gold)' }} />
          </svg>
        </div>
        <p className="story" style={{ marginTop: 0 }}>
          {langData.inv1}
        </p>
        <p style={{ margin: '16px auto 0', fontSize: '15.5px' }}>
          {langData.inv3}
        </p>
      </div>
    </section>
  );
};
