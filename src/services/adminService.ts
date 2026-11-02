// Host-only calls to /api/admin-guests. Every request carries the admin
// password (ADMIN_PASSWORD on Vercel); the server checks it and talks to
// Supabase with the service key, so nothing private is exposed to guests.
import { SESSION_KEYS, readString, writeString } from './storage';

const ADMIN_ROUTE = '/api/admin-guests';

export interface AdminEventAnswer {
  attending: boolean;
  guestCount: number;
}

export interface AdminResponse {
  id: string;
  name: string;
  wishes: string;
  wishApproved: boolean;
  wedding: AdminEventAnswer | null;
  reception: AdminEventAnswer | null;
  photoUrl: string;
  submittedAt: string;
  updatedAt: string;
  revision: number;
  /** Guest-list name when the RSVP came from a personal link; null for the general link. */
  invitedAs: string | null;
}

/** Thrown with a host-facing message; `status` 401 means the password is wrong. */
export class AdminError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export const loadAdminKey = (): string => readString(SESSION_KEYS.adminKey, 'session') || '';
export const saveAdminKey = (key: string): void => writeString(SESSION_KEYS.adminKey, key, 'session');
export const clearAdminKey = (): void => writeString(SESSION_KEYS.adminKey, '', 'session');

async function adminPost<T>(key: string, body: Record<string, unknown>): Promise<T> {
  let res: Response;
  try {
    res = await fetch(ADMIN_ROUTE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'x-admin-key': key },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AdminError('Network error. Please check your connection and try again.', 0);
  }
  const data = (await res.json().catch(() => null)) as ({ ok?: boolean; message?: string } & T) | null;
  if (!res.ok || !data?.ok) {
    const fallback = res.status === 404 ? 'The admin API is only available on the deployed site.' : 'Something went wrong.';
    throw new AdminError(data?.message || fallback, res.status);
  }
  return data;
}

export const fetchResponses = (key: string) =>
  adminPost<{ responses: AdminResponse[] }>(key, { action: 'listResponses' }).then((d) => d.responses || []);

/** Deletes the whole RSVP (attendance, wish and photo). */
export const deleteResponse = (key: string, id: string) => adminPost<object>(key, { action: 'deleteResponse', id });

/** Removes only the wish text and photo; the RSVP attendance stays. */
export const clearWish = (key: string, id: string) => adminPost<object>(key, { action: 'clearWish', id });

/** Sets the wish text (used to fill in or fix an empty/short wish). Empty clears it. */
export const editWish = (key: string, id: string, wishes: string) =>
  adminPost<object>(key, { action: 'editWish', id, wishes });
