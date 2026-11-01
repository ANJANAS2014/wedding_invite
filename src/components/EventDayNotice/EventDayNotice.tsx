import './EventDayNotice.css';
import React, { useState } from 'react';
import { WEDDING_EVENTS, type WeddingEvent } from '../../data/events';
import { makeDirectionsUrl } from '../../utils/calendar';
import { istDateKey } from '../../utils/countdown';

/**
 * The event happening today in IST, if any.
 * `?now=<ISO date>` overrides the clock for testing (e.g. ?now=2026-11-29T10:00).
 */
function findTodaysEvent(): WeddingEvent | null {
  try {
    const nowOverride = new URLSearchParams(window.location.search).get('now');
    const today = istDateKey(nowOverride ? new Date(nowOverride) : new Date());
    return WEDDING_EVENTS.find((ev) => ev.istDate === today) || null;
  } catch {
    return null;
  }
}

/** Fixed "happening now" banner with directions, shown only on event days. */
export const EventDayNotice: React.FC = () => {
  const [event] = useState<WeddingEvent | null>(findTodaysEvent);
  const [dismissed, setDismissed] = useState<boolean>(false);

  if (!event || dismissed) return null;

  return (
    <aside className="event-notice" role="status">
      <span className="en-dot" aria-hidden="true" />
      <div className="en-copy">
        <b>{event.dayOfTitle}</b>
        <span>{event.venue} · {event.timeStr} IST</span>
      </div>
      <a
        className="en-dir"
        href={makeDirectionsUrl(`${event.venue}, ${event.address}`)}
        target="_blank"
        rel="noopener noreferrer"
      >
        Directions
      </a>
      <button className="en-close" type="button" aria-label="Hide notice" onClick={() => setDismissed(true)}>
        ×
      </button>
    </aside>
  );
};
