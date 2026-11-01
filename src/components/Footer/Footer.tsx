import './Footer.css';
import React from 'react';
import { WEDDING_CONTENT } from '../../data/weddingData';
import { MandalaDivider } from '../shared/MandalaDivider/MandalaDivider';

export const Footer: React.FC = () => (
  <footer>
    <MandalaDivider style={{ margin: '0 auto 14px' }} />
    <div className="shl footer-names">
      {WEDDING_CONTENT.groom} &amp; {WEDDING_CONTENT.bride}
    </div>
    <p className="footer-signoff">With love &amp; gratitude</p>
  </footer>
);
