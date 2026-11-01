import type { RsvpRecord } from '../types';
import { API_ROUTES, isLocalDev, postJson } from './api';
import { uploadRsvpPhoto } from './photoUploadService';
import { STORAGE_KEYS, readJson, writeJson } from './storage';

export const MAX_GUESTS_PER_EVENT = 10;
export const MAX_WISH_CHARS = 200;

export interface RsvpFormValues {
  name: string;
  weddingAttending: boolean;
  weddingGuestCount: number;
  receptionAttending: boolean;
  receptionGuestCount: number;
  wishes: string;
}

/** Client-side validation; returns a guest-facing error message or null. */
export function validateRsvp(values: RsvpFormValues): string | null {
  if (!values.name.trim()) return 'Please enter your name.';
  if (!values.weddingAttending && !values.receptionAttending) {
    return 'Please select at least one celebration to attend, or let us know if you cannot make it.';
  }
  if (values.wishes.trim().length > MAX_WISH_CHARS) {
    return `Wish message cannot exceed ${MAX_WISH_CHARS} characters.`;
  }
  return null;
}

/**
 * A v4 UUID (the API rejects anything else). `crypto.randomUUID` is missing on
 * older iPhones (iOS < 15.4), so build one from `getRandomValues` there.
 */
function newSubmissionId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Thrown when the RSVP could not be saved; `message` is safe to show to guests. */
export class RsvpSubmitError extends Error {}

const SEND_FAILED_MESSAGE = "We couldn't send your response just yet. Please check your connection and try again.";

export interface SubmitRsvpOptions {
  inviteToken?: string;
  photoFile?: File | null;
  photoPreview?: string;
}

/**
 * Submits an RSVP:
 *  1. uploads the optional photo (best effort),
 *  2. POSTs to /api/rsvp and requires the server to confirm the save; on
 *     failure throws RsvpSubmitError so the guest can retry (on localhost,
 *     where /api doesn't exist, it falls back to the local copy only),
 *  3. keeps a local copy in localStorage (one entry per guest name).
 * Resolves to the record shown in the confirmation panel.
 */
export async function submitRsvp(values: RsvpFormValues, options: SubmitRsvpOptions = {}): Promise<RsvpRecord> {
  const { inviteToken, photoFile, photoPreview } = options;
  const submissionId = newSubmissionId();
  const name = values.name.trim();

  const photo = photoFile ? await uploadRsvpPhoto(photoFile, submissionId) : null;

  const record: RsvpRecord = {
    id: submissionId,
    name,
    weddingAttending: values.weddingAttending,
    weddingGuestCount: values.weddingAttending ? values.weddingGuestCount : 0,
    receptionAttending: values.receptionAttending,
    receptionGuestCount: values.receptionAttending ? values.receptionGuestCount : 0,
    wishes: values.wishes.trim(),
    inviteToken: inviteToken || undefined,
    photoPath: photo?.path || undefined,
    photoPreview: photoPreview || undefined,
    submittedAt: new Date().toISOString(),
  };

  let res: Response | null = null;
  try {
    res = await postJson(API_ROUTES.rsvp, {
      name: record.name,
      weddingAttendance: record.weddingAttending ? 'attending' : 'declined',
      weddingGuestCount: record.weddingGuestCount,
      receptionAttendance: record.receptionAttending ? 'attending' : 'declined',
      receptionGuestCount: record.receptionGuestCount,
      wishes: record.wishes,
      invite: inviteToken || undefined,
      submissionId: record.id,
      photoPath: photo?.path || undefined,
      photoSize: photo?.size || undefined,
    });
  } catch {
    res = null; // network error
  }
  const data = res ? ((await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null) : null;
  const saved = Boolean(res && res.ok && data && data.ok === true);
  if (!saved && !isLocalDev()) {
    throw new RsvpSubmitError(typeof data?.message === 'string' && data.message ? data.message : SEND_FAILED_MESSAGE);
  }

  saveLocalRsvp(record);
  return record;
}

export const loadLocalRsvps = (): RsvpRecord[] => {
  const stored = readJson<unknown>(STORAGE_KEYS.rsvps, []);
  return Array.isArray(stored) ? (stored as RsvpRecord[]) : [];
};

/** Replaces any earlier local RSVP with the same name. */
export function saveLocalRsvp(record: RsvpRecord): void {
  const updated = loadLocalRsvps().filter((item) => item.name !== record.name);
  updated.push(record);
  writeJson(STORAGE_KEYS.rsvps, updated);
}
