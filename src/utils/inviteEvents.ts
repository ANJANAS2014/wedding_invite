/**
 * Window event fired the moment the guest taps "Open Invitation".
 * MusicPlayer listens for it so background music starts on that same tap
 * (a user gesture, which iOS/Android require before audio can play).
 */
export const INVITE_OPEN_EVENT = 'invite:open';

export const announceInvitationOpen = (): void => {
  try {
    window.dispatchEvent(new Event(INVITE_OPEN_EVENT));
  } catch {
    // ignore (very old browsers)
  }
};
