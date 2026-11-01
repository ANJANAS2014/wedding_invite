import React from 'react';

interface RsvpEventCardProps {
  /** "wedding" / "reception" — used in the aria labels. */
  eventKey: string;
  tag: string;
  dateLabel: string;
  /** null until the guest chooses */
  answer: 'yes' | 'no' | null;
  guestCount: number;
  maxGuests: number;
  onAnswer: (answer: 'yes' | 'no') => void;
  onStep: (step: number) => void;
}

/** One celebration: an explicit "Yes / Sorry" choice, then a guest-count stepper after "Yes". */
export const RsvpEventCard: React.FC<RsvpEventCardProps> = ({
  eventKey,
  tag,
  dateLabel,
  answer,
  guestCount,
  maxGuests,
  onAnswer,
  onStep,
}) => {
  const attending = answer === 'yes';
  const labelId = `rsvp-${eventKey}-label`;
  return (
    <div className={`rsvp-card ${attending ? 'is-attending' : ''} ${answer === 'no' ? 'is-declined' : ''}`}>
      <div className="rsvp-card-tag" id={labelId}>
        {tag}
      </div>
      <div className="rsvp-card-date">{dateLabel}</div>
      <div className="rsvp-card-prompt">Will you be there?</div>
      <div className="rsvp-choice" role="radiogroup" aria-labelledby={labelId}>
        <button
          type="button"
          role="radio"
          className={`rsvp-attend-toggle rsvp-opt ${attending ? 'active' : ''}`}
          aria-checked={attending}
          onClick={() => onAnswer('yes')}
        >
          ✓&nbsp; Yes, I’ll be there
        </button>
        <button
          type="button"
          role="radio"
          className={`rsvp-decline-toggle rsvp-opt ${answer === 'no' ? 'active' : ''}`}
          aria-checked={answer === 'no'}
          onClick={() => onAnswer('no')}
        >
          Sorry, can’t make it
        </button>
      </div>
      {attending && (
        <div className="rsvp-stepper-box">
          <span className="rsvp-stepper-label">Guests (including you)</span>
          <div className="rsvp-stepper">
            <button
              type="button"
              className="rsvp-step-btn"
              onClick={() => onStep(-1)}
              disabled={guestCount <= 1}
              aria-label={`Decrease ${eventKey} guests`}
            >
              −
            </button>
            <span className="rsvp-count-display">{guestCount}</span>
            <button
              type="button"
              className="rsvp-step-btn"
              onClick={() => onStep(1)}
              disabled={guestCount >= maxGuests}
              aria-label={`Increase ${eventKey} guests`}
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
