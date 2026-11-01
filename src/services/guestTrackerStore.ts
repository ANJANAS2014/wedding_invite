// Local (browser-only) storage for the host Guest Tracker demo.
// NOTE: the server-side Guest Tracker API (api/admin-guests.js) exists but is
// not wired up yet — see docs/REFACTOR_AUDIT.md §6.
import type { StoredGuest } from '../types';
import { loadLocalRsvps } from './rsvpService';
import { SESSION_KEYS, STORAGE_KEYS, readJson, readString, writeJson, writeString } from './storage';

const loadStoredGuests = (): StoredGuest[] => {
  const stored = readJson<unknown>(STORAGE_KEYS.guestTracker, []);
  return Array.isArray(stored) ? (stored as StoredGuest[]) : [];
};

export const saveGuests = (guests: StoredGuest[]): void => writeJson(STORAGE_KEYS.guestTracker, guests);

/** Tracker guests merged (by name) with RSVPs received in this browser. */
export function loadGuestsWithRsvps(): StoredGuest[] {
  try {
    const guestMap = new Map<string, StoredGuest>();
    loadStoredGuests().forEach((g) => guestMap.set(g.name.toLowerCase().trim(), { ...g }));

    loadLocalRsvps().forEach((r) => {
      const key = r.name.toLowerCase().trim();
      const rsvpFields = {
        weddingAttending: r.weddingAttending,
        weddingGuestCount: r.weddingGuestCount,
        receptionAttending: r.receptionAttending,
        receptionGuestCount: r.receptionGuestCount,
        wishes: r.wishes,
      };
      const existing = guestMap.get(key);
      if (existing) {
        Object.assign(existing, { status: 'rsvp_received' as const }, rsvpFields);
      } else {
        guestMap.set(key, {
          id: r.id || `unlinked_${Date.now()}`,
          name: r.name,
          language: 'en',
          status: 'rsvp_received',
          invitationToken: r.inviteToken || '',
          ...rsvpFields,
        });
      }
    });

    return Array.from(guestMap.values());
  } catch {
    return [];
  }
}

export interface TrackerStats {
  total: number;
  sent: number;
  replied: number;
  weddingGuests: number;
  receptionGuests: number;
}

export const computeTrackerStats = (guests: StoredGuest[]): TrackerStats =>
  guests.reduce<TrackerStats>(
    (acc, g) => {
      acc.total += 1;
      if (g.status === 'sent') acc.sent += 1;
      if (g.status === 'rsvp_received') {
        acc.replied += 1;
        if (g.weddingAttending) acc.weddingGuests += Number(g.weddingGuestCount) || 0;
        if (g.receptionAttending) acc.receptionGuests += Number(g.receptionGuestCount) || 0;
      }
      return acc;
    },
    { total: 0, sent: 0, replied: 0, weddingGuests: 0, receptionGuests: 0 }
  );

export const isTrackerUnlocked = (): boolean => readString(SESSION_KEYS.trackerAuth, 'session') === 'true';

export const setTrackerUnlocked = (): void => writeString(SESSION_KEYS.trackerAuth, 'true', 'session');
