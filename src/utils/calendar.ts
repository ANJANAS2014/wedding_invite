import { WEDDING_CONTENT } from '../data/weddingData';
import type { WeddingEvent } from '../data/events';

/** Google Calendar "add event" template link for a wedding event (IST). */
export function makeGoogleCalendarUrl(ev: WeddingEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${WEDDING_CONTENT.groom} & ${WEDDING_CONTENT.bride} · ${ev.name}`,
    dates: ev.gcalDates,
    ctz: 'Asia/Kolkata',
    location: `${ev.venue}, ${ev.address}`,
    details: `${ev.name} of ${WEDDING_CONTENT.groom} & ${WEDDING_CONTENT.bride}\nVenue: ${ev.venue}\nMap: ${ev.mapUrl}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Google Maps directions link to a free-text destination. */
export const makeDirectionsUrl = (destination: string): string =>
  'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(destination);
