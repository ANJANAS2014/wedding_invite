import React, { useState } from 'react';
import type { Language } from '../../types';
import { buildInviteLink, buildShareMessage, buildWhatsAppUrl } from '../../utils/inviteLinks';
import { LanguageSelect } from './LanguageSelect';

/** Personalised `?to=` links without any tracking (no token, no storage). */
export const QuickLinkGenerator: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [withFamily, setWithFamily] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>('en');
  const [phone, setPhone] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const finalName = name.trim() ? (withFamily ? `${name.trim()} & Family` : name.trim()) : '';
  const linkUrl = finalName ? buildInviteLink(finalName, language) : '';
  const message = finalName ? buildShareMessage(finalName, linkUrl, language) : '';
  const waUrl = buildWhatsAppUrl(message, phone.trim());

  return (
    <div className="gt-quick">
      <p className="gt-quick-intro">Create personalized invitation links instantly without database tracking:</p>

      <div className="gt-row">
        <input
          type="text"
          placeholder="Guest name (e.g. Priya)"
          className="gt-input gt-field--wide"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <LanguageSelect className="gt-input gt-field--lang-quick" value={language} onChange={setLanguage} />
      </div>

      <label className="gt-check">
        <input type="checkbox" checked={withFamily} onChange={(e) => setWithFamily(e.target.checked)} />
        Add “&amp; Family”
      </label>

      <input
        type="tel"
        placeholder="WhatsApp number with country code (optional, e.g. 919876543210)"
        className="gt-input"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      {linkUrl && (
        <div className="gt-link-box">
          <span className="gt-link-label">Generated Link:</span>
          <p className="gt-link-url">{linkUrl}</p>
          <div className="gt-row">
            <button
              type="button"
              className="btn gt-btn-quick"
              onClick={() => {
                navigator.clipboard?.writeText(linkUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? 'Copied ✓' : 'Copy Link'}
            </button>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="btn gt-btn-quick gt-btn-wa">
              Send on WhatsApp
            </a>
            <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="btn o gt-btn-quick">
              Preview Link
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
