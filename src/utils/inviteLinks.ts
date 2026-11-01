import { LANG_MAPPINGS } from '../data/weddingData';
import type { Language } from '../types';

/**
 * Personal invitation URL: `/i?to=name&lang=xx[&i=token]`.
 * `/i` is served by api/share.js, which gives each link a personalised
 * WhatsApp preview ("Dear <name>, you're invited") before loading the site.
 */
export function buildInviteLink(name: string, language: Language, token?: string): string {
  const base = `${window.location.origin}/i?to=${encodeURIComponent(name)}&lang=${language}`;
  return token ? `${base}&i=${token}` : base;
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
