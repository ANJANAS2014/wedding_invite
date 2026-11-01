// Browser storage access for the whole app.
// All keys live here so features never repeat string literals, and every
// read/write is wrapped because storage can throw (private mode, quotas).

export const STORAGE_KEYS = {
  /** RSVPs submitted from this browser (fallback copy + wishes wall source). */
  rsvps: 'wedding_rsvps_v2',
  /** Locally added wishes (legacy; read-only today). */
  userWishes: 'wedding_user_wishes_v1',
  /** `{ userLiked, counts }` for wish likes made in this browser. */
  wishLikes: 'wedding_wish_likes_v1',
  /** Host Guest Tracker list (local demo tracker). */
  guestTracker: 'wedding_guest_tracker_v2',
  /** '1' when background music (and the chime) is muted. */
  musicMuted: 'inv-mute',
} as const;

export const SESSION_KEYS = {
  /** Guest Tracker unlocked for this tab. */
  trackerAuth: 'gt_auth',
} as const;

type StorageArea = 'local' | 'session';

// Resolved lazily: merely touching window.localStorage can throw in some browsers.
const area = (which: StorageArea): Storage => (which === 'session' ? window.sessionStorage : window.localStorage);

export function readJson<T>(key: string, fallback: T, which: StorageArea = 'local'): T {
  try {
    const raw = area(which).getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown, which: StorageArea = 'local'): void {
  try {
    area(which).setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
}

export function readString(key: string, which: StorageArea = 'local'): string | null {
  try {
    return area(which).getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string, which: StorageArea = 'local'): void {
  try {
    area(which).setItem(key, value);
  } catch {
    // ignore storage errors
  }
}

export const isMusicMuted = (): boolean => readString(STORAGE_KEYS.musicMuted) === '1';

export const setMusicMuted = (muted: boolean): void =>
  writeString(STORAGE_KEYS.musicMuted, muted ? '1' : '0');
