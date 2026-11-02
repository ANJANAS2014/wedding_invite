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
export async function uploadRsvpPhoto(original: File, submissionId: string): Promise<UploadedPhoto | null> {
  try {
    const file = await shrinkPhoto(original);
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

const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;

/**
 * Shrinks a phone photo (often 3-5 MB) to at most 1600px on the long edge as a
 * JPEG (~200-400 KB) so the upload is quick. Falls back to the original file
 * if the browser can't decode or encode it, or if the result isn't smaller.
 */
async function shrinkPhoto(file: File): Promise<File> {
  try {
    if (typeof createImageBitmap !== 'function') return file;
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file;
  }
}
