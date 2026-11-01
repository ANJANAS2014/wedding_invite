import './EventsSection.css';
import React from 'react';
import { WEDDING_EVENTS } from '../../data/events';
import { useNow } from '../../hooks/useNow';
import { makeGoogleCalendarUrl } from '../../utils/calendar';
import { getCountdown, pad2 } from '../../utils/countdown';
import { MandalaDivider } from '../shared/MandalaDivider/MandalaDivider';

/** Index of the next celebration: the reception once the wedding has ended. */
const nextEventIndex = (now: number): number =>
  now > new Date(WEDDING_EVENTS[0].endIso).getTime() ? 1 : 0;

export const EventsSection: React.FC = () => {
  const now = useNow(1000);
  const activeEventIndex = nextEventIndex(now);
  const activeEvent = WEDDING_EVENTS[activeEventIndex];
  const countdown = getCountdown(new Date(activeEvent.targetIso).getTime(), now);

  return (
    <section className="mar" id="s2">
      <div className="sec" id="date">
        <div className="eyebrow">Join us for</div>
        <h2>Our Events</h2>
        <MandalaDivider />

        <div className="ecs">
          {WEDDING_EVENTS.map((ev, index) => {
            const isNext = index === activeEventIndex;
            return (
              <div key={ev.id} className={`ec ${isNext ? 'on' : ''}`}>
                <div className="vh">
                  <img
                    className="vi"
                    src={ev.image}
                    alt={ev.venue}
                    width={900}
                    height={720}
                    loading="lazy"
                  />
                </div>
                <div className="eh">
                  <h3>{ev.name}</h3>
                  <div className="eyebrow">{ev.sub}</div>
                  <div className="orn">
                    <i />
                  </div>
                </div>

                <ul className="det">
                  <li>
                    <small>Date</small>
                    <b>{ev.dateStr}</b>
                  </li>
                  <li>
                    <small>Time</small>
                    <b>{ev.timeStr}</b>
                  </li>
                  <li className="vn">
                    <small>Venue</small>
                    <b>{ev.venue}</b>
                    <span>{ev.address}</span>
                  </li>
                </ul>

                <div className="ec-actions">
                  <a
                    className="btn o"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={ev.mapUrl}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    Google Maps
                  </a>
                  <a
                    className="btn o cal-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={makeGoogleCalendarUrl(ev)}
                    aria-label={`Add the ${ev.name} to Google Calendar`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
                      <path d="M3.5 10h17M8 3v4M16 3v4M12 13.2v4.6M9.7 15.5h4.6" />
                    </svg>
                    Add to Calendar
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {countdown && (
          <>
            <p id="cdl" className="eyebrow">
              Countdown to the {activeEvent.name}
            </p>
            <div className="cd" id="cd">
              <div>
                <b>{pad2(countdown.days)}</b>
                <span>Days</span>
              </div>
              <div>
                <b>{pad2(countdown.hours)}</b>
                <span>Hours</span>
              </div>
              <div>
                <b>{pad2(countdown.minutes)}</b>
                <span>Minutes</span>
              </div>
              <div>
                <b>{pad2(countdown.seconds)}</b>
                <span>Seconds</span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
