/** Up to two initials for a monogram; falls back to a heart. */
export const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase() || '♥';

/** Deterministic id for wishes that arrive without one (API / local storage). */
export function buildStableWishId(name: string, wish: string, fallbackIndex: number): string {
  const raw = `${name.trim().toLowerCase()}|${wish.trim().toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) | 0;
  }
  return `wish_${Math.abs(hash).toString(36)}_${fallbackIndex}`;
}

/** Sanitises the `?to=` guest name: letters in any script (incl. Tamil/Malayalam) plus & . , ' -, max 60 chars. */
export const sanitizeGuestName = (value: string): string =>
  value.replace(/[^\p{L}\p{M}\s&.,'-]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 60);

/** `?i=` personal invitation token format accepted by the frontend. */
export const INVITE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;

/** "1 guest" / "3 guests" */
export const pluralGuests = (count: number): string => `${count} ${count === 1 ? 'guest' : 'guests'}`;
