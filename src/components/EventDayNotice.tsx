import React, { useState, useEffect } from 'react';

export const EventDayNotice: React.FC = () => {
  const [notice, setNotice] = useState<{ title: string; venue: string; times: string; directionsUrl: string } | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(false);

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const nowOverride = urlParams.get('now');
      const now = nowOverride ? new Date(nowOverride) : new Date();

      // Format in IST (en-CA gives YYYY-MM-DD)
      const istDay = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(now);

      if (istDay === '2026-11-29') {
        setNotice({
          title: 'The wedding is happening now!',
          venue: 'Central Auditorium',
          times: '8:00 AM – 9:20 AM IST',
          directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('Central Auditorium, North Paravur, Kerala, India')
        });
      } else if (istDay === '2026-12-06') {
        setNotice({
          title: 'The reception is happening now!',
          venue: 'Annalakshmi Restaurant',
          times: '6:00 PM – 10:30 PM IST',
          directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('Annalakshmi Restaurant, 6 Mayor Ramanathan Salai, Chennai, India')
        });
      } else {
        setNotice(null);
      }
    } catch {
      setNotice(null);
    }
  }, []);

  if (!notice || dismissed) return null;

  return (
    <aside className="event-notice" role="status">
      <span className="en-dot" aria-hidden="true" />
      <div className="en-copy">
        <b>{notice.title}</b>
        <span>{notice.venue} · {notice.times}</span>
      </div>
      <a
        className="en-dir"
        href={notice.directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        Directions
      </a>
      <button
        className="en-close"
        type="button"
        aria-label="Hide notice"
        onClick={() => setDismissed(true)}
      >
        ×
      </button>
    </aside>
  );
};
