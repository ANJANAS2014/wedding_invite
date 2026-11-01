import React from 'react';

interface RsvpEventCardProps {
  /** "wedding" / "reception" — used in the stepper aria labels. */
  eventKey: string;
  tag: string;
  dateLabel: string;
  attending: boolean;
  guestCount: number;
  maxGuests: number;
  onToggle: () => void;
  onStep: (step: number) => void;
}

/** One celebration card: "Yes, will be there" toggle + guest-count stepper. */
export const RsvpEventCard: React.FC<RsvpEventCardProps> = ({
  eventKey,
  tag,
  dateLabel,
  attending,
  guestCount,
  maxGuests,
  onToggle,
  onStep,
}) => (
  <div className={`rsvp-card ${attending ? 'is-attending' : ''}`}>
    <div className="rsvp-card-tag">{tag}</div>
    <div className="rsvp-card-date">{dateLabel}</div>
    <div className="rsvp-card-prompt">Will you be there?</div>

    <button
      type="button"
      className={`rsvp-attend-toggle ${attending ? 'active' : ''}`}
      onClick={onToggle}
      aria-pressed={attending}
    >
      <span>{attending ? '✓' : '❤️'}</span>
      <span>Yes, will be there</span>
    </button>

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
