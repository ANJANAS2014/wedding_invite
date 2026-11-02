import './WeddingCard.css';
import React from 'react';
import type { WeddingEvent, ScheduleItem } from '../../data/events';
import { WEDDING_SCENE, WEDDING_SCHEDULE } from '../../data/events';
import { useNow } from '../../hooks/useNow';
import { makeGoogleCalendarUrl } from '../../utils/calendar';

interface WeddingCardProps {
  ev: WeddingEvent;
  isNext: boolean;
  date: { day: string; monthYear: string; weekday: string };
}

const pad = (n: number) => String(n).padStart(2, '0');

const ScheduleIcon: React.FC<{ icon: ScheduleItem['icon'] }> = ({ icon }) => {
  if (icon === 'breakfast') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path className="wc-steam" d="M20 14c-3-4 3-6 0-10M27 14c-3-4 3-6 0-10" fill="none" stroke="#f0d68e" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M15 17h18l-2 19H17z" fill="#d9b25a" stroke="#6b4a14" strokeWidth="1.2" />
        <path d="M8 36h32c-2 6-30 6-32 0z" fill="#c99f45" stroke="#6b4a14" strokeWidth="1.2" />
      </svg>
    );
  }
  if (icon === 'agni') {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <g className="wc-flame">
          <path d="M24 8c-6 8-9 15-8 22 1 6 15 6 16 0 1-7-2-14-8-22z" fill="#ee7d22" />
          <path d="M24 20c-3 4-5 8-4 12 1 3 7 3 8 0 1-4-1-8-4-12z" fill="#ffcf4a" />
        </g>
        <path d="M12 42h24" style={{ stroke: 'var(--gold)' }} strokeWidth="1.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M4 24C10 12 24 8 44 9c2 10 2 20 0 30-20 1-34-3-40-15z" fill="#5d9135" stroke="#f0d68e" strokeWidth="1.2" />
      <path d="M4 24h41" stroke="#bfe08a" strokeWidth="1.2" />
      <circle cx="28" cy="31" r="5" fill="#fbf8ef" />
      <circle cx="34" cy="17" r="4" fill="#f1dca6" />
    </svg>
  );
};

/** Wedding (Thalikettu) card: mandapam scene, details, countdown, venue photo, order of the day. */
export const WeddingCard: React.FC<WeddingCardProps> = ({ ev, isNext, date }) => {
  const now = useNow(1000);
  const secs = Math.max(0, Math.floor((new Date(ev.targetIso).getTime() - now) / 1000));

  return (
    <article className="wc reveal" aria-labelledby="wc-title">
      <p className="wc-chap">Chapter I · Keralam</p>

      <div className="wc-scene">
        <div className="wc-stage">
          <div className="wc-mandapam">
            <img className="wc-mm" src={WEDDING_SCENE.mandapam} alt="Golden mandapam decorated with jasmine and marigold" width={721} height={560} loading="lazy" decoding="async" />
            <img className="wc-couple" src={WEDDING_SCENE.couple} alt="The groom ties the thali for the bride" width={440} height={377} loading="lazy" decoding="async" />
            <img className="wc-agni" src={WEDDING_SCENE.homaKundam} alt="Homa kundam with the sacred fire" width={360} height={283} loading="lazy" decoding="async" />
          </div>
          <div className="wc-band">
            <div className="wc-pl">
              <img src={WEDDING_SCENE.nadaswaram} alt="Nadaswaram player" width={280} height={338} loading="lazy" decoding="async" />
              <span className="wc-nt">♪</span>
              <span className="wc-nt wc-nt2">♫</span>
            </div>
            <div className="wc-pl">
              <img src={WEDDING_SCENE.drummer} alt="Drummer" width={280} height={305} loading="lazy" decoding="async" />
              <span className="wc-nt wc-nt3">♪</span>
            </div>
          </div>
        </div>
        <p className="wc-cap">Thalikettu · Muhurtham</p>
      </div>

      <div className="wc-body">
        <div className="wc-info">
          {isNext && <span className="ev-next">Next celebration</span>}
          <div className="ev-date">
            <b>{date.day}</b>
            <span>
              {date.monthYear}
              <br />
              {date.weekday}
            </span>
          </div>
          <h3 id="wc-title">{ev.name}</h3>
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
                <g className="wc-bell">
                  <path d="M12 2v2M7 16v-5a5 5 0 0 1 10 0v5l2 2H5l2-2z" />
                  <circle cx="12" cy="20.5" r="1.4" fill="currentColor" />
                </g>
              </svg>
              Add to calendar
            </a>
          </div>

          {secs > 0 && (
            <div className="wc-cd" role="timer" aria-label="Countdown to the Muhurtham">
              <div><b>{Math.floor(secs / 86400)}</b><span>Days</span></div>
              <div><b>{pad(Math.floor((secs % 86400) / 3600))}</b><span>Hours</span></div>
              <div><b>{pad(Math.floor((secs % 3600) / 60))}</b><span>Min</span></div>
              <div><b>{pad(secs % 60)}</b><span>Sec</span></div>
            </div>
          )}

          <figure className="wc-venue">
            <div className="wc-frame">
              <img src={ev.image} alt={ev.venue} width={900} height={720} loading="lazy" decoding="async" />
            </div>
            <span className="wc-stamp" aria-hidden="true">North<br />Paravur<br />· Kerala ·</span>
            <figcaption>{ev.venue}<span>The venue</span></figcaption>
          </figure>
        </div>

        <div className="wc-order">
          <p className="eyebrow">{date.weekday}, {Number(date.day)} {date.monthYear.split(' ')[0]}</p>
          <h4 className="wc-order-title">Order of the day</h4>
          <ol className="wc-tl">
            {WEDDING_SCHEDULE.map((item) => (
              <li key={item.title} className={item.badge ? 'wc-now' : undefined}>
                <span className="wc-ico"><ScheduleIcon icon={item.icon} /></span>
                <div>
                  <p className="wc-t">
                    {item.time}
                    {item.badge && <em>{item.badge}</em>}
                  </p>
                  <h5>{item.title}</h5>
                  <p className="wc-note">{item.note}</p>
                  {item.icon === 'sadya' && (
                    <img className="wc-sadya" src={WEDDING_SCENE.sadya} alt="Kerala sadya served on a banana leaf" width={660} height={563} loading="lazy" decoding="async" />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </article>
  );
};
