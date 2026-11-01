// Team Bride / Team Groom: the guest's playful "whose side are you on?" pick.
// Saved on this device and sent to /api/team (stored in Supabase `team_picks`,
// linked to the personal invitation when the guest opened one).
import { API_ROUTES, getJson, postJson } from './api';
import { STORAGE_KEYS, readString, writeString } from './storage';

export type TeamSide = 'bride' | 'groom';

export interface TeamTotals {
  bride: number;
  groom: number;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isTeamSide = (value: unknown): value is TeamSide => value === 'bride' || value === 'groom';

/** v4 UUID; falls back to getRandomValues on older iPhones (iOS < 15.4). */
function newUuid(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function visitorId(): string {
  const existing = readString(STORAGE_KEYS.visitorId);
  if (existing && UUID_RE.test(existing)) return existing;
  const id = newUuid();
  writeString(STORAGE_KEYS.visitorId, id);
  return id;
}

export const loadTeamSide = (): TeamSide | null => {
  const value = readString(STORAGE_KEYS.teamSide);
  return isTeamSide(value) ? value : null;
};

const toTotals = (data: unknown): TeamTotals | null => {
  const d = data as { ok?: boolean; bride?: unknown; groom?: unknown } | null;
  if (!d || d.ok !== true) return null;
  return { bride: Number(d.bride) || 0, groom: Number(d.groom) || 0 };
};

/** Current tally, or null when the API isn't available (e.g. local dev). */
export async function fetchTeamTotals(): Promise<TeamTotals | null> {
  return toTotals(await getJson<unknown>(API_ROUTES.team));
}

/**
 * Saves the pick locally, then on the server (best effort — never throws).
 * Resolves to the server's new tally, or null if it couldn't be saved there.
 */
export async function saveTeamPick(
  side: TeamSide,
  options: { inviteToken?: string; guestName?: string } = {}
): Promise<TeamTotals | null> {
  writeString(STORAGE_KEYS.teamSide, side);
  try {
    const res = await postJson(API_ROUTES.team, {
      side,
      visitorId: visitorId(),
      invite: options.inviteToken || undefined,
      name: options.guestName || undefined,
    });
    if (!res.ok) return null;
    return toTotals(await res.json().catch(() => null));
  } catch {
    return null;
  }
}
