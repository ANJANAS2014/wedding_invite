import React from 'react';
import type { WeddingEvent } from '../../data/events';

interface RsvpEventCardProps {
  ev: WeddingEvent;
  /** null until the guest chooses */
  answer: 'yes' | 'no' | null;
  guestCount: number;
  maxGuests: number;
  onAnswer: (answer: 'yes' | 'no') => void;
  onStep: (step: number) => void;
}

/** "Sun 29 Nov" in IST, from the event's start time. */
export const shortEventDate = (ev: WeddingEvent): string =>
  new Date(ev.targetIso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });

/**
 * One celebration as a ticket with a tear-off stub: an explicit Yes / Sorry
 * choice, then the stub shows "Admit n" with a guest counter (or a
 * "With love from afar" stamp after Sorry).
 */
export const RsvpEventCard: React.FC<RsvpEventCardProps> = ({ ev, answer, guestCount, maxGuests, onAnswer, onStep }) => {
  const attending = answer === 'yes';
  const declined = answer === 'no';
  const labelId = `rsvp-${ev.id}-label`;
  // town only ("North Paravur", "Chennai"), not the street
  const town = ev.address.split(',').map((x) => x.trim()).find((x) => !/\d/.test(x)) || '';
  return (
    <div className={`rt-ticket${attending ? ' is-yes' : ''}${declined ? ' is-no' : ''}`}>
      <div className="rt-main">
        <div className="rt-top">
          <span>{ev.sub}</span>
          <span>{shortEventDate(ev)}</span>
        </div>
        <h3 className="rt-title" id={labelId}>{ev.name}</h3>
        <dl className="rt-meta">
          <div>
            <dt>Time</dt>
            <dd>{ev.timeStr.replace(/\s?(AM|PM)(?=\s*–)/, '')}</dd>
          </div>
          <div>
            <dt>Venue</dt>
            <dd>{ev.venue}, {town}</dd>
          </div>
        </dl>
        <div className="rt-pick" role="radiogroup" aria-labelledby={labelId}>
          <button type="button" role="radio" className={`rt-pill${attending ? ' is-on' : ''}`} aria-checked={attending} onClick={() => onAnswer('yes')}>
            {attending && <span aria-hidden="true">✓</span>} I’ll be there
          </button>
          <button type="button" role="radio" className={`rt-pill rt-pill--no${declined ? ' is-on' : ''}`} aria-checked={declined} onClick={() => onAnswer('no')}>
            {declined && <span aria-hidden="true">✓</span>} Can’t make it
          </button>
        </div>
      </div>
      <div className="rt-stub">
        {attending ? (
          <>
            <div className="rt-admit" aria-live="polite">
              Admit<b>{guestCount}</b>
              <span className="rt-sr">{guestCount === 1 ? 'guest' : 'guests'}, including you</span>
            </div>
            <div className="rt-step">
              <button type="button" onClick={() => onStep(-1)} disabled={guestCount <= 1} aria-label={`Decrease ${ev.id} guests`}>−</button>
              <button type="button" onClick={() => onStep(1)} disabled={guestCount >= maxGuests} aria-label={`Increase ${ev.id} guests`}>+</button>
            </div>
          </>
        ) : declined ? (
          <>
            <span className="rt-admit rt-admit--muted">Sending</span>
            <span className="rt-stamp">With love<br />from afar</span>
          </>
        ) : (
          <span className="rt-admit rt-admit--muted">Choose above</span>
        )}
      </div>
    </div>
  );
};
