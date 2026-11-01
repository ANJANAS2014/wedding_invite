import { useEffect, useState } from 'react';
import { isLanguage, type Language } from '../types';
import { INVITE_TOKEN_PATTERN, sanitizeGuestName } from '../utils/text';

export interface InvitationParams {
  /** `?to=` — personalised greeting / RSVP prefill. */
  guestName: string;
  /** `?i=` — personal invitation token forwarded with the RSVP. */
  inviteToken: string;
  /** `?lang=ta|ml` (defaults to English). */
  language: Language;
  /** `?tracker=1` or `?links=1` opens the host Guest Tracker. */
  openTracker: boolean;
}

const DEFAULTS: InvitationParams = { guestName: '', inviteToken: '', language: 'en', openTracker: false };

export function parseInvitationParams(search: string): InvitationParams {
  try {
    const params = new URLSearchParams(search);
    const to = params.get('to');
    const token = params.get('i');
    const lang = params.get('lang');
    return {
      guestName: to ? sanitizeGuestName(to) : '',
      inviteToken: token && INVITE_TOKEN_PATTERN.test(token) ? token : '',
      language: isLanguage(lang) ? lang : 'en',
      openTracker: params.get('tracker') === '1' || params.get('links') === '1',
    };
  } catch {
    return DEFAULTS;
  }
}

/** Invitation URL parameters, read once after mount. */
export function useInvitationParams(): InvitationParams {
  const [params, setParams] = useState<InvitationParams>(DEFAULTS);
  useEffect(() => {
    setParams(parseInvitationParams(window.location.search));
  }, []);
  return params;
}
