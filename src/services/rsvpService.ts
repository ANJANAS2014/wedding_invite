import type { RsvpRecord } from '../types';
import { API_ROUTES, postJson } from './api';
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

const newSubmissionId = (): string =>
  crypto.randomUUID ? crypto.randomUUID() : `rsvp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export interface SubmitRsvpOptions {
  inviteToken?: string;
  photoFile?: File | null;
  photoPreview?: string;
}

/**
 * Submits an RSVP:
 *  1. uploads the optional photo (best effort),
 *  2. POSTs to /api/rsvp (best effort — the guest is never blocked by an
 *     offline/unconfigured backend; existing behaviour),
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

  try {
    const res = await postJson(API_ROUTES.rsvp, {
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
    if (res.ok) await res.json().catch(() => null);
  } catch {
    // Backend offline — the local copy below still records the response.
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
