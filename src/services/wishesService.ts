import type { WishRecord } from '../types';
import { SAMPLE_WISHES } from '../data/sampleWishes';
import { buildStableWishId } from '../utils/text';
import { API_ROUTES, getJson } from './api';
import { loadLocalRsvps } from './rsvpService';
import { STORAGE_KEYS, readJson, writeJson } from './storage';

/** Raw wish as returned by /api/wishes (only approved wishes, first names). */
interface ApiWish {
  id?: string;
  displayName?: unknown;
  wish?: unknown;
  photoUrl?: string;
  submittedAt?: string;
  likesCount?: unknown;
}

export interface StoredLikes {
  userLiked: Record<string, boolean>;
  counts: Record<string, number>;
}

/** Likes made in this browser. Likes are not persisted on the server (no API). */
export function loadStoredLikes(): StoredLikes {
  const parsed = readJson<Partial<StoredLikes> | null>(STORAGE_KEYS.wishLikes, null);
  if (!parsed || typeof parsed !== 'object') return { userLiked: {}, counts: {} };
  return { userLiked: parsed.userLiked || {}, counts: parsed.counts || {} };
}

export const saveStoredLikes = (likes: StoredLikes): void => writeJson(STORAGE_KEYS.wishLikes, likes);

async function fetchApprovedWishes(): Promise<WishRecord[]> {
  const data = await getJson<{ ok?: boolean; wishes?: ApiWish[] }>(API_ROUTES.wishes);
  if (!data || !data.ok || !Array.isArray(data.wishes)) return [];
  return data.wishes
    .filter((w) => w && w.displayName && w.wish)
    .map((w, idx) => ({
      id: w.id || buildStableWishId(String(w.displayName), String(w.wish), idx),
      displayName: String(w.displayName).trim(),
      wish: String(w.wish).trim(),
      photoUrl: w.photoUrl || undefined,
      submittedAt: w.submittedAt || undefined,
      likesCount: Number(w.likesCount) || 0,
    }));
}

/** Adds wishes from RSVPs sent from this browser that the API doesn't show yet. */
function mergeLocalRsvpWishes(list: WishRecord[]): void {
  loadLocalRsvps().forEach((r, idx) => {
    if (!r || !r.name || !r.wishes || String(r.wishes).trim().length === 0) return;
    const trimmedName = String(r.name).trim();
    const trimmedWish = String(r.wishes).trim();
    const id = r.id || buildStableWishId(trimmedName, trimmedWish, idx);
    const firstName = trimmedName.split(/\s+/)[0].toLowerCase();
    const alreadyPresent = list.some(
      (item) =>
        item.id === id ||
        (item.displayName.toLowerCase() === firstName && item.wish.toLowerCase() === trimmedWish.toLowerCase()) ||
        (item.displayName.toLowerCase() === trimmedName.toLowerCase() && item.wish.toLowerCase() === trimmedWish.toLowerCase())
    );
    if (!alreadyPresent) {
      list.push({
        id,
        displayName: trimmedName,
        wish: trimmedWish,
        photoUrl: r.photoPreview || undefined,
        submittedAt: r.submittedAt || undefined,
        likesCount: 0,
        weddingAttending: Boolean(r.weddingAttending),
        receptionAttending: Boolean(r.receptionAttending),
      });
    }
  });
}

function mergeLegacyUserWishes(list: WishRecord[]): void {
  const stored = readJson<unknown>(STORAGE_KEYS.userWishes, []);
  if (!Array.isArray(stored)) return;
  stored.forEach((w: WishRecord) => {
    if (w && w.id && w.displayName && w.wish && !list.some((item) => item.id === w.id)) {
      list.push(w);
    }
  });
}

const isLocalDev = (): boolean =>
  Boolean(import.meta.env?.DEV) || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

/** Newest first for wishes with timestamps; undated ones keep API order at the end. */
function compareBySubmittedAt(a: WishRecord, b: WishRecord): number {
  const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
  const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
  if (timeA && timeB) return timeB - timeA;
  if (timeB && !timeA) return 1;
  if (timeA && !timeB) return -1;
  return 0;
}

/**
 * Builds the Wishes Wall list: approved API wishes + this browser's RSVP wishes
 * + legacy local wishes, sample postcards when local/empty, sorted, with this
 * browser's like adjustments applied.
 */
export async function loadWishes(): Promise<WishRecord[]> {
  const likes = loadStoredLikes();
  const list = await fetchApprovedWishes();
  mergeLocalRsvpWishes(list);
  mergeLegacyUserWishes(list);

  if (isLocalDev() || list.length === 0) {
    SAMPLE_WISHES.forEach((sample) => {
      if (!list.some((item) => item.id === sample.id || item.displayName.toLowerCase() === sample.displayName.toLowerCase())) {
        list.push({ ...sample });
      }
    });
  }

  list.sort(compareBySubmittedAt);
  return list.map((item) => ({
    ...item,
    likesCount: Math.max(0, (item.likesCount || 0) + (likes.counts[item.id] || 0)),
  }));
}
