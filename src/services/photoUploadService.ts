import { API_ROUTES, postJson } from './api';

export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB (also enforced by the API and bucket)

export interface UploadedPhoto {
  path: string;
  size: number;
}

interface PresignResponse {
  ok?: boolean;
  path?: string;
  uploadUrl?: string;
}

/** Client-side validation; returns a guest-facing error message or null. */
export function validatePhoto(file: File): string | null {
  if (!(ALLOWED_PHOTO_TYPES as readonly string[]).includes(file.type)) {
    return 'Please choose a valid JPG, PNG or WebP photo.';
  }
  if (file.size > MAX_PHOTO_SIZE) {
    return 'Please choose a photo smaller than 5 MB.';
  }
  return null;
}

/**
 * Uploads an RSVP photo: asks /api/rsvp-photo for a one-time signed URL for
 * the private Supabase bucket, then PUTs the file there.
 * Best effort — resolves to null on any failure so the RSVP can still be sent.
 */
export async function uploadRsvpPhoto(file: File, submissionId: string): Promise<UploadedPhoto | null> {
  try {
    const presignRes = await postJson(API_ROUTES.rsvpPhoto, {
      submissionId,
      contentType: file.type,
      size: file.size,
    });
    if (!presignRes.ok) return null;
    const presign = (await presignRes.json()) as PresignResponse;
    if (!presign?.ok || !presign.uploadUrl || !presign.path) return null;

    const uploadRes = await fetch(presign.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    return uploadRes.ok ? { path: presign.path, size: file.size } : null;
  } catch {
    return null;
  }
}

/** Reads a file as a data: URL for the local preview. */
export const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve((event.target?.result as string) || '');
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
