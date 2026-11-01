import './InvitationIntroSection.css';
import React from 'react';
import { WEDDING_CONTENT, LANG_MAPPINGS } from '../../data/weddingData';
import { MandalaDivider } from '../shared/MandalaDivider/MandalaDivider';
import type { Language } from '../../types';

interface InvitationIntroSectionProps {
  language: Language;
}

export const InvitationIntroSection: React.FC<InvitationIntroSectionProps> = ({ language }) => {
  const langData = LANG_MAPPINGS[language] || LANG_MAPPINGS.en;

  return (
    <section className="alt" id="s1">
      <div className="sec" id="fam">
        <h2 className="pn2">
          {WEDDING_CONTENT.groom} &amp; {WEDDING_CONTENT.bride}
        </h2>
        <MandalaDivider />
        <p className="story">
          {langData.inv1}
        </p>
        <p className="intro-note">
          {langData.inv3}
        </p>
      </div>
    </section>
  );
};
