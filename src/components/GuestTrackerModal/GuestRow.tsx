import React from 'react';
import type { StoredGuest } from '../../types';
import { buildInviteLink, buildShareMessage, buildWhatsAppUrl } from '../../utils/inviteLinks';

interface GuestRowProps {
  guest: StoredGuest;
  onDelete: (id: string) => void;
}

const attendance = (attending?: boolean, count?: number) =>
  attending ? `Attending (${count} guests)` : 'Not attending';

export const GuestRow: React.FC<GuestRowProps> = ({ guest: g, onDelete }) => {
  const link = buildInviteLink(g.name, g.language, g.invitationToken);
  return (
    <div className="gt-guest">
      <div className="gt-guest-head">
        <div>
          <strong className="gt-guest-name">{g.name}</strong>
          <span className="gt-guest-meta">
            ({g.language.toUpperCase()}) {g.phone && `· ${g.phone}`}
          </span>
        </div>
        <span className={`gt-badge gt-badge--${g.status}`}>{g.status.replace('_', ' ')}</span>
      </div>

      {g.status === 'rsvp_received' && (
        <div className="gt-guest-rsvp">
          <div>
            <b>Wedding:</b> {attendance(g.weddingAttending, g.weddingGuestCount)}
            {' · '}
            <b>Reception:</b> {attendance(g.receptionAttending, g.receptionGuestCount)}
          </div>
          {g.wishes && <div className="gt-guest-wish">“{g.wishes}”</div>}
        </div>
      )}

      <div className="gt-guest-actions">
        <button
          type="button"
          className="btn gt-btn-sm"
          onClick={() => {
            navigator.clipboard?.writeText(link);
            alert('Personal invitation link copied!');
          }}
        >
          Copy Link
        </button>

        {g.phone && (
          <a
            href={buildWhatsAppUrl(buildShareMessage(g.name, link, g.language), g.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn gt-btn-sm gt-btn-wa"
          >
            WhatsApp
          </a>
        )}

        <button type="button" className="gt-delete" onClick={() => onDelete(g.id)} title="Delete guest">
          ✕
        </button>
      </div>
    </div>
  );
};
