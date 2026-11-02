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

/** Illustrations for the wedding card scene (public/images/events/). */
export const WEDDING_SCENE = {
  mandapam: '/images/events/wedding-mandapam.webp',
  couple: '/images/events/wedding-thalikettu-couple.webp',
  homaKundam: '/images/events/wedding-homa-kundam.webp',
  nadaswaram: '/images/events/wedding-nadaswaram-player.webp',
  drummer: '/images/events/wedding-drummer.webp',
  sadya: '/images/events/wedding-sadya.webp',
  /** Aluva → MGR Chennai Central journey band between the two cards. */
  train: '/images/events/journey-train.webp',
} as const;

export interface ScheduleItem {
  icon: 'breakfast' | 'agni' | 'sadya' | 'cake' | 'photos' | 'dinner';
  time: string;
  title: string;
  note: string;
  /** Badge next to the time (the Muhurtham). */
  badge?: string;
  /** Optional small picture shown beside the title (the sadya leaf). */
  image?: { src: string; alt: string };
}

/** Order of the day at Central Auditorium, North Paravur. */
export const WEDDING_SCHEDULE: readonly ScheduleItem[] = [
  { icon: 'breakfast', time: '7:00 AM', title: 'Breakfast', note: 'Served at the auditorium as guests arrive.' },
  {
    icon: 'agni',
    time: '8:00 – 9:20 AM',
    badge: 'Muhurtham',
    title: 'Thalikettu',
    note: 'Under the mandapam, with Agni as witness, as the panchavadyam plays.',
  },
  {
    icon: 'sadya',
    time: 'From 11:30 AM',
    title: 'Sadya',
    note: 'A traditional feast, served on banana leaf.',
    image: { src: WEDDING_SCENE.sadya, alt: 'Sadya on a banana leaf' },
  },
];

/** Illustration for the reception card scene. */
export const RECEPTION_SCENE = {
  couple: '/images/events/reception-couple.webp',
} as const;

/** Order of the evening at Annalakshmi, Chennai. */
export const RECEPTION_SCHEDULE: readonly ScheduleItem[] = [
  { icon: 'photos', time: '7:00 PM', title: 'Photographs with everyone', note: 'Photos with the couple, with everyone. Come up to the stage.' },
  { icon: 'dinner', time: '7:30 PM', title: 'Buffet dinner', note: 'Dinner is served at Annalakshmi.' },
];
