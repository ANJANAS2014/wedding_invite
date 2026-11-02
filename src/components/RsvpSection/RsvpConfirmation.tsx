import React from 'react';
import type { RsvpRecord } from '../../types';
import { WEDDING_EVENTS } from '../../data/events';
import { pluralGuests } from '../../utils/text';
import { shortEventDate } from './RsvpEventCard';

interface RsvpConfirmationProps {
  rsvp: RsvpRecord;
  onEdit: () => void;
}

/** "See you there!" with the guest's two tickets stamped, plus their wish. */
export const RsvpConfirmation: React.FC<RsvpConfirmationProps> = ({ rsvp, onEdit }) => {
  const replies = {
    wedding: { attending: rsvp.weddingAttending, count: rsvp.weddingGuestCount },
    reception: { attending: rsvp.receptionAttending, count: rsvp.receptionGuestCount },
  };
  const anyYes = rsvp.weddingAttending || rsvp.receptionAttending;
  return (
    <div className="rt-conf" role="alert">
      <h3>{anyYes ? 'See you there!' : 'Thank you!'}</h3>
      <p className="conf-sub">{anyYes ? 'We can’t wait to celebrate with you.' : 'We’ll miss you. Thank you for your blessings.'}</p>

      <div className="rt-conf-list">
        {WEDDING_EVENTS.map((ev) => {
          const r = replies[ev.id];
          return (
            <div key={ev.id} className={`rt-ticket rt-ticket--done${r.attending ? ' is-yes' : ' is-no'}`}>
              <div className="rt-main">
                <div className="rt-top">
                  <span>{ev.sub}</span>
                  <span>{shortEventDate(ev)}</span>
                </div>
                <h4 className="rt-title">{ev.name}</h4>
                <p className="rt-conf-line">{r.attending ? pluralGuests(r.count) : 'Sorry, can’t make it'}</p>
              </div>
              <span className={`rt-stamp${r.attending ? ' rt-stamp--ok' : ''}`}>
                {r.attending ? 'Confirmed' : <>With love<br />from afar</>}
              </span>
            </div>
          );
        })}
      </div>

      {(rsvp.wishes || rsvp.photoPreview) && (
        <div className="rt-conf-wish">
          {rsvp.photoPreview && <img src={rsvp.photoPreview} alt="Your shared photo" />}
          {rsvp.wishes && <p>“{rsvp.wishes}”</p>}
        </div>
      )}

      <p className="rsvp-conf-signoff">With love, Anjana &amp; Lalith</p>
      <button type="button" className="rd-btn rd-btn--line rsvp-edit-btn" onClick={onEdit}>
        Change my reply
      </button>
    </div>
  );
};
