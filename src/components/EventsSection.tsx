import React, { useEffect, useState } from 'react';
import { WEDDING_CONTENT, WEDDING_IMAGES } from '../data/weddingData';

export const EventsSection: React.FC = () => {
  const [activeEventIndex, setActiveEventIndex] = useState<number>(0);
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  const events = [
    {
      id: 'wedding',
      name: 'Wedding',
      sub: 'Muhurtham',
      dateStr: 'Sunday, 29 November 2026',
      timeStr: '8:00 AM – 9:20 AM',
      targetIso: '2026-11-29T08:00:00+05:30',
      endIso: '2026-11-29T09:20:00+05:30',
      venue: WEDDING_CONTENT.weddingVenue,
      address: WEDDING_CONTENT.weddingAddr,
      mapUrl: WEDDING_CONTENT.weddingMap,
      image: WEDDING_IMAGES.w1,
      gcalDates: '20261129T080000/20261129T092000'
    },
    {
      id: 'reception',
      name: 'Reception',
      sub: 'Evening Celebration',
      dateStr: 'Sunday, 6 December 2026',
      timeStr: '6:00 PM – 10:30 PM',
      targetIso: '2026-12-06T18:00:00+05:30',
      endIso: '2026-12-06T22:30:00+05:30',
      venue: WEDDING_CONTENT.receptionVenue,
      address: WEDDING_CONTENT.receptionAddr,
      mapUrl: WEDDING_CONTENT.receptionMap,
      image: WEDDING_IMAGES.r1,
      gcalDates: '20261206T180000/20261206T223000'
    }
  ];

  // Helper to generate Google Calendar link
  const makeGCalUrl = (ev: typeof events[0]) => {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${WEDDING_CONTENT.groom} & ${WEDDING_CONTENT.bride} · ${ev.name}`,
      dates: ev.gcalDates,
      ctz: 'Asia/Kolkata',
      location: `${ev.venue}, ${ev.address}`,
      details: `${ev.name} of ${WEDDING_CONTENT.groom} & ${WEDDING_CONTENT.bride}\nVenue: ${ev.venue}\nMap: ${ev.mapUrl}`
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const weddingStart = new Date(events[0].targetIso).getTime();
      const weddingEnd = new Date(events[0].endIso).getTime();
      const receptionStart = new Date(events[1].targetIso).getTime();

      let target = weddingStart;
      let activeIndex = 0;

      if (now > weddingEnd) {
        target = receptionStart;
        activeIndex = 1;
      }

      setActiveEventIndex(activeIndex);

      const diffSecs = Math.floor((target - now) / 1000);
      if (diffSecs > 0) {
        const days = Math.floor(diffSecs / 86400);
        const hours = Math.floor((diffSecs % 86400) / 3600);
        const minutes = Math.floor((diffSecs % 3600) / 60);
        const seconds = Math.floor(diffSecs % 60);
        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown(null);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="mar" id="s2">
      <div className="sec rv in" id="date">
        <div className="eyebrow">Join us for</div>
        <h2>Our Events</h2>
        <div className="div">
          <svg viewBox="-50 -50 100 100" className="man">
            {Array.from({ length: 8 }, (_, i) => (
              <ellipse key={i} rx="4" ry="22" cy="-26" transform={`rotate(${(i * 360) / 8})`} />
            ))}
            <circle r="2" style={{ fill: 'var(--gold)' }} />
          </svg>
        </div>

        <div className="ecs">
          {events.map((ev, index) => {
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
                    href={makeGCalUrl(ev)}
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
            <p id="cdl" className="eyebrow" style={{ marginTop: '38px' }}>
              Countdown to the {events[activeEventIndex].name}
            </p>
            <div className="cd" id="cd">
              <div>
                <b>{String(countdown.days).padStart(2, '0')}</b>
                <span>Days</span>
              </div>
              <div>
                <b>{String(countdown.hours).padStart(2, '0')}</b>
                <span>Hours</span>
              </div>
              <div>
                <b>{String(countdown.minutes).padStart(2, '0')}</b>
                <span>Minutes</span>
              </div>
              <div>
                <b>{String(countdown.seconds).padStart(2, '0')}</b>
                <span>Seconds</span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
