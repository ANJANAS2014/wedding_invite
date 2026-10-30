import React from 'react';
import { WEDDING_CONTENT } from '../data/weddingData';

export const OurStorySection: React.FC = () => {
  const paragraphs = WEDDING_CONTENT.story.split(/\n\s*\n/);

  return (
    <article className="our-story-editorial" aria-labelledby="our-story-heading">
      <div className="story-header">
        <span className="eyebrow story-prompt">Read how it all began</span>
        <h2 id="our-story-heading" className="story-title">Our Story</h2>
        <div className="div story-div">
          <svg viewBox="-50 -50 100 100" className="man">
            {Array.from({ length: 8 }, (_, i) => (
              <ellipse key={i} rx="4" ry="22" cy="-26" transform={`rotate(${(i * 360) / 8})`} />
            ))}
            <circle r="2" style={{ fill: 'var(--gold)' }} />
          </svg>
        </div>
      </div>

      <div className="story-body">
        {paragraphs.map((para, index) => (
          <p key={index} className={index === 0 ? 'story-lead-p' : ''}>
            {para}
          </p>
        ))}
      </div>
    </article>
  );
};
