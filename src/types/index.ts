// Shared TypeScript types used across features, services and hooks.
// Feature-private types stay next to their component.

/** Supported invitation languages (`?lang=` URL parameter). */
export type Language = 'en' | 'ta' | 'ml';

export const LANGUAGES: readonly Language[] = ['en', 'ta', 'ml'];

export const isLanguage = (value: unknown): value is Language =>
  typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);

/**
 * Temple-door opening state (page 1 → page 2).
 * closed → unlocking (button fades, knockers swing) → parting (doors swing
 * inward, invitation behind) → fading (overlay dissolves) → done (unmounted).
 */
export type DoorStatus = 'closed' | 'unlocking' | 'parting' | 'fading' | 'done';

/** Event identifiers shared by the events section, RSVP and day-of notice. */
export type EventId = 'wedding' | 'reception';

/** An RSVP as stored locally (and shown in the confirmation panel). */
export interface RsvpRecord {
  id?: string;
  name: string;
  weddingAttending: boolean;
  weddingGuestCount: number;
  receptionAttending: boolean;
  receptionGuestCount: number;
  wishes: string;
  inviteToken?: string;
  photoPath?: string;
  photoPreview?: string;
  submittedAt: string;
}

/** A wish/postcard rendered on the Wishes Wall. */
export interface WishRecord {
  id: string;
  displayName: string;
  wish: string;
  photoUrl?: string;
  submittedAt?: string;
  likesCount: number;
  weddingAttending?: boolean;
  receptionAttending?: boolean;
}

export type GuestStatus = 'created' | 'sent' | 'rsvp_received';

/** A guest row in the (local) host Guest Tracker. */
export interface StoredGuest {
  id: string;
  name: string;
  language: Language;
  phone?: string;
  status: GuestStatus;
  invitationToken: string;
  weddingAttending?: boolean;
  weddingGuestCount?: number;
  receptionAttending?: boolean;
  receptionGuestCount?: number;
  wishes?: string;
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
