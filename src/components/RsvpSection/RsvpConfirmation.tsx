import React from 'react';
import type { RsvpRecord } from '../../types';
import { pluralGuests } from '../../utils/text';

interface RsvpConfirmationProps {
  rsvp: RsvpRecord;
  onEdit: () => void;
}

const attendanceLabel = (attending: boolean, count: number) =>
  attending ? `Attending · ${pluralGuests(count)}` : 'Not attending';

/** "Thank you" panel with a summary of the submitted response. */
export const RsvpConfirmation: React.FC<RsvpConfirmationProps> = ({ rsvp, onEdit }) => (
  <div className="rsvp-confirmation-panel" role="alert">
    <span className="rsvp-conf-heart" aria-hidden="true">♥</span>
    <h3>Thank you!</h3>
    <p className="conf-sub">Your response has been received. We look forward to celebrating with you.</p>

    <ul className="rsvp-summary-list">
      <li>
        <span>Our Wedding · 29 Nov</span>
        <b>{attendanceLabel(rsvp.weddingAttending, rsvp.weddingGuestCount)}</b>
      </li>
      <li>
        <span>Our Reception · 6 Dec</span>
        <b>{attendanceLabel(rsvp.receptionAttending, rsvp.receptionGuestCount)}</b>
      </li>
      {rsvp.wishes && (
        <li>
          <span>Your Message</span>
          <b className="rsvp-summary-wish">“{rsvp.wishes}”</b>
        </li>
      )}
      {rsvp.photoPreview && (
        <li>
          <span>Shared Photo</span>
          <img src={rsvp.photoPreview} alt="Shared RSVP photo" className="rsvp-summary-photo" />
        </li>
      )}
    </ul>

    <p className="rsvp-conf-signoff">With love, Anjana &amp; Lalith</p>

    <button type="button" className="btn o rsvp-edit-btn" onClick={onEdit}>
      Change my response
    </button>
  </div>
);
