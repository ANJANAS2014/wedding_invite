// Thin wrapper around fetch for the same-origin serverless API (/api/*).
// The browser only ever talks to these endpoints; Supabase credentials stay
// server-side in api/_shared/supabase.js.

export const API_ROUTES = {
  rsvp: '/api/rsvp',
  rsvpPhoto: '/api/rsvp-photo',
  wishes: '/api/wishes',
} as const;

const JSON_HEADERS = { 'Content-Type': 'application/json', Accept: 'application/json' };

/** POST JSON and return the raw Response (callers decide how to treat failures). */
export const postJson = (url: string, body: unknown): Promise<Response> =>
  fetch(url, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });

/** GET JSON; resolves to `null` on network errors, non-2xx or invalid JSON. */
export async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
