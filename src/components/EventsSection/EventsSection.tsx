import './EventsSection.css';
import React from 'react';
import { WEDDING_EVENTS } from '../../data/events';
import { useNow } from '../../hooks/useNow';
import { makeGoogleCalendarUrl } from '../../utils/calendar';
import { HeaderRule } from '../shared/HeaderRule/HeaderRule';
import { NextTeaser } from '../ScrollGuide/NextTeaser';

/** Index of the next celebration: the reception once the wedding has ended. */
const nextEventIndex = (now: number): number =>
  now > new Date(WEDDING_EVENTS[0].endIso).getTime() ? 1 : 0;

// "Sunday, 29 November 2026" → { day: "29", rest: "November 2026", weekday: "Sunday" }
const splitDate = (dateStr: string) => {
  const [weekday, rest = ''] = dateStr.split(', ');
  const [day, ...monthYear] = rest.split(' ');
  return { weekday, day: day.padStart(2, '0'), monthYear: monthYear.join(' ') };
};

export const EventsSection: React.FC = () => {
  const now = useNow(60000);
  const activeEventIndex = nextEventIndex(now);

  return (
    <section className="mar ev" id="s2" aria-labelledby="events-title">
      <div id="date">
        <header className="ev-head reveal">
          <div className="ev-bless">Shubha Muhurtham</div>
          <div className="eyebrow">Join us for</div>
          <h2 id="events-title">Our Events</h2>
          <HeaderRule />
        </header>

        <div className="ev-chs">
        {WEDDING_EVENTS.map((ev, index) => {
          const isNext = index === activeEventIndex;
          const d = splitDate(ev.dateStr);
          return (
            <article key={ev.id} className={`ev-ch ec reveal ${isNext ? 'on' : ''}`}>
              <figure className={`ev-ph bu ${ev.id === 'wedding' ? 'ev-ph--grade' : ''}`}>
                <img className="vi" src={ev.image} alt={ev.venue} width={900} height={720} loading="lazy" decoding="async" />
              </figure>
              <div className="ev-tx">
                {isNext && <span className="ev-next">Next celebration</span>}
                <div className="ev-date">
                  <b>{d.day}</b>
                  <span>
                    {d.monthYear}
                    <br />
                    {d.weekday}
                  </span>
                </div>
                <h3>{ev.name}</h3>
                <div className="ev-sub">{ev.sub}</div>
                <ul className="ev-det">
                  <li>
                    <small>Time</small>
                    <b>{ev.timeStr}</b>
                  </li>
                  <li>
                    <small>Venue</small>
                    <b>
                      {ev.venue}
                      <em>{ev.address}</em>
                    </b>
                  </li>
                </ul>
                <div className="ev-acts">
                  <a target="_blank" rel="noopener noreferrer" href={ev.mapUrl}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    Directions
                  </a>
                  <a
                    className="cal-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={makeGoogleCalendarUrl(ev)}
                    aria-label={`Add the ${ev.name} to Google Calendar`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
                      <path d="M3.5 10h17M8 3v4M16 3v4" />
                    </svg>
                    Add to calendar
                  </a>
                </div>
              </div>
            </article>
          );
        })}

        </div>
        <NextTeaser label="Next: tell us you're coming" targetId="s5" tone="light" />
      </div>
    </section>
  );
};
