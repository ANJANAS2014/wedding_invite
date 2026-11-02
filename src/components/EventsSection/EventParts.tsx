import React from 'react';
import type { WeddingEvent, ScheduleItem } from '../../data/events';
import { makeGoogleCalendarUrl } from '../../utils/calendar';

/** Shared body of the compact wedding / reception cards (styles: WeddingCard.css). */

export interface CardDate {
  day: string;
  monthYear: string;
  weekday: string;
}

interface CardBodyProps {
  ev: WeddingEvent;
  isNext: boolean;
  date: CardDate;
  titleId: string;
  schedule: readonly ScheduleItem[];
}

export const CardBody: React.FC<CardBodyProps> = ({ ev, date, titleId, schedule }) => (
  <div className="vc-body">
    <div className="vc-head">
      <b className="vc-day">{date.day}</b>
      <div>
        <h3 id={titleId}>{ev.name}</h3>
        <span className="vc-meta">
          {date.weekday} · {date.monthYear}
        </span>
      </div>
    </div>

    <p className="vc-time">
      <span>{ev.sub}</span>
      <b>{ev.timeStr}</b>
    </p>

    <div className="vc-venue">
      <img src={ev.image} alt="" width={900} height={720} loading="lazy" decoding="async" />
      <p>
        {ev.venue}
        <small>{ev.address.replace(/, India$/, '')}</small>
      </p>
    </div>

    <ol className="vc-tl" aria-label={`Order of the ${ev.id === 'wedding' ? 'day' : 'evening'}`}>
      {schedule.map((item) => (
        <li key={item.title} className={item.badge ? 'vc-key' : undefined}>
          <span className="vc-t">{item.time}</span>
          <span className="vc-what">
            {item.title}
            {item.badge && <em className="vc-badge">{item.badge}</em>}
            {item.image && <img className="vc-thumb" src={item.image.src} alt={item.image.alt} width={660} height={563} loading="lazy" decoding="async" />}
          </span>
        </li>
      ))}
    </ol>

    <div className="vc-acts">
      <a className="rd-btn rd-btn--line" target="_blank" rel="noopener noreferrer" href={ev.mapUrl}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
        Directions
      </a>
      <a
        className="rd-btn rd-btn--solid cal-btn"
        target="_blank"
        rel="noopener noreferrer"
        href={makeGoogleCalendarUrl(ev)}
        aria-label={`Add the ${ev.name} to Google Calendar`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <g className="vc-bell">
            <path d="M12 2v2M7 16v-5a5 5 0 0 1 10 0v5l2 2H5l2-2z" />
            <circle cx="12" cy="20.5" r="1.4" fill="currentColor" />
          </g>
        </svg>
        Add to calendar
      </a>
    </div>
  </div>
);
