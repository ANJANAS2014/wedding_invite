import { WEDDING_CONTENT, WEDDING_IMAGES } from './weddingData';
import type { EventId } from '../types';

/** Single source of truth for the two celebrations (cards, countdowns, notices). */
export interface WeddingEvent {
  id: EventId;
  name: string;
  sub: string;
  dateStr: string;
  timeStr: string;
  /** Start / end as ISO strings with the IST offset. */
  targetIso: string;
  endIso: string;
  /** Calendar date in IST (YYYY-MM-DD) — drives the day-of notice. */
  istDate: string;
  venue: string;
  address: string;
  mapUrl: string;
  image: string;
  /** Google Calendar `dates` parameter (local IST times). */
  gcalDates: string;
  /** Headline shown by the day-of notice banner. */
  dayOfTitle: string;
}

export const WEDDING_EVENTS: readonly WeddingEvent[] = [
  {
    id: 'wedding',
    name: 'Wedding',
    sub: 'Muhurtham',
    dateStr: 'Sunday, 29 November 2026',
    timeStr: '8:00 AM – 9:20 AM',
    targetIso: '2026-11-29T08:00:00+05:30',
    endIso: '2026-11-29T09:20:00+05:30',
    istDate: '2026-11-29',
    venue: WEDDING_CONTENT.weddingVenue,
    address: WEDDING_CONTENT.weddingAddr,
    mapUrl: WEDDING_CONTENT.weddingMap,
    image: WEDDING_IMAGES.w1,
    gcalDates: '20261129T080000/20261129T092000',
    dayOfTitle: 'The wedding is happening now!',
  },
  {
    id: 'reception',
    name: 'Reception',
    sub: 'Evening Celebration',
    dateStr: 'Sunday, 6 December 2026',
    timeStr: '6:00 PM – 10:30 PM',
    targetIso: '2026-12-06T18:00:00+05:30',
    endIso: '2026-12-06T22:30:00+05:30',
    istDate: '2026-12-06',
    venue: WEDDING_CONTENT.receptionVenue,
    address: WEDDING_CONTENT.receptionAddr,
    mapUrl: WEDDING_CONTENT.receptionMap,
    image: WEDDING_IMAGES.r1,
    gcalDates: '20261206T180000/20261206T223000',
    dayOfTitle: 'The reception is happening now!',
  },
];

export const [WEDDING_EVENT, RECEPTION_EVENT] = WEDDING_EVENTS;

/** Muhurtham start — target of the cover countdown. */
export const WEDDING_START_MS = new Date(WEDDING_EVENT.targetIso).getTime();
