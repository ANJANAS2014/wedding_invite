import { useEffect, useState } from 'react';
import { isLanguage, type Language } from '../types';
import { INVITE_TOKEN_PATTERN, sanitizeGuestName } from '../utils/text';
import { removeKey, STORAGE_KEYS } from '../services/storage';

export interface InvitationParams {
  /** `?to=` — personalised greeting / RSVP prefill. */
  guestName: string;
  /** `?i=` or `/i/<token>` — personal invitation token forwarded with the RSVP. */
  inviteToken: string;
  /** `?lang=ta|ml` (defaults to English). */
  language: Language;
  /** `?tracker=1` or `?links=1` opens the host Guest Tracker. */
  openTracker: boolean;
}

const DEFAULTS: InvitationParams = { guestName: '', inviteToken: '', language: 'en', openTracker: false };

const validToken = (value: unknown): string =>
  typeof value === 'string' && INVITE_TOKEN_PATTERN.test(value) ? value : '';

export function parseInvitationParams(search: string, pathname = ''): InvitationParams {
  try {
    const params = new URLSearchParams(search);
    const to = params.get('to');
    const pathToken = pathname.match(/^\/i\/([A-Za-z0-9_-]{16,64})\/?$/)?.[1] || '';
    const lang = params.get('lang');
    return {
      guestName: to ? sanitizeGuestName(to) : '',
      inviteToken: validToken(params.get('i')) || pathToken,
      language: isLanguage(lang) ? lang : 'en',
      openTracker: params.get('tracker') === '1' || params.get('links') === '1',
    };
  } catch {
    return DEFAULTS;
  }
}

/**
 * Invitation details, read once after mount — ONLY from the current URL.
 * - The plain site link (no `?to` / `?i` / `/i/<token>`) always shows the
 *   generic greeting. Nothing about a guest is ever remembered on the device,
 *   so the general link shared in group chats can never show someone's name.
 * - A token-only link (`/i/<token>`) asks /api/invite whose invitation it is.
 */
export function useInvitationParams(): InvitationParams {
  const [params, setParams] = useState<InvitationParams>(DEFAULTS);
  useEffect(() => {
    let cancelled = false;
    // Clean up the guest an older build remembered on this device.
    removeKey(STORAGE_KEYS.legacyInvitedGuest);

    const current = parseInvitationParams(window.location.search, window.location.pathname);
    const hasLang = new URLSearchParams(window.location.search).has('lang');
    setParams(current);

    if (current.inviteToken && !current.guestName) {
      fetch(`/api/invite?token=${encodeURIComponent(current.inviteToken)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { ok?: boolean; name?: string; language?: string } | null) => {
          if (cancelled || !data?.ok) return;
          const name = sanitizeGuestName(String(data.name || ''));
          const language: Language = hasLang ? current.language : isLanguage(data.language) ? data.language : current.language;
          setParams({ ...current, guestName: name, language });
        })
        .catch(() => {});
    }
    return () => { cancelled = true; };
  }, []);
  return params;
}
