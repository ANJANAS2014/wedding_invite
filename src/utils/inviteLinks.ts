import { LANG_MAPPINGS } from '../data/weddingData';
import type { Language } from '../types';

/** Personal invitation URL (`?i=token&to=name&lang=xx`, token optional). */
export function buildInviteLink(name: string, language: Language, token?: string): string {
  const origin = window.location.origin;
  if (token) {
    return `${origin}/?i=${token}&to=${encodeURIComponent(name)}&lang=${language}`;
  }
  return `${origin}/?to=${encodeURIComponent(name)}&lang=${language}`;
}

/** Localised WhatsApp share message for an invitation link. */
export const buildShareMessage = (name: string, link: string, language: Language): string =>
  (LANG_MAPPINGS[language] || LANG_MAPPINGS.en).shareMsg(name, link);

/** wa.me link; without a phone number WhatsApp lets the user pick a chat. */
export function buildWhatsAppUrl(message: string, phone?: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  return digits
    ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/** 32 hex chars (128-bit) token for locally created guests. */
export const generateLocalInviteToken = (): string =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
