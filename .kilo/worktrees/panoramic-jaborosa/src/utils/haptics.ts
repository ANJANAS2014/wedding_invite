// Delicate haptic feedback for mobile devices.
// navigator.vibrate is supported on Android Chrome / Firefox; iOS Safari
// does not expose it, in which case these are silent no-ops.
type VibrateCapableNavigator = Navigator & { vibrate?: (pattern: number | number[]) => boolean };

const canVibrate = (): boolean => {
  try {
    return typeof navigator !== 'undefined' && typeof (navigator as VibrateCapableNavigator).vibrate === 'function';
  } catch {
    return false;
  }
};

export const haptic = (pattern: number | number[]): void => {
  if (!canVibrate()) return;
  try {
    (navigator as VibrateCapableNavigator).vibrate!(pattern);
  } catch {
    // ignore
  }
};

/** Feather-light touch confirmation (single 12ms pulse). */
export const hapticTap = (): void => haptic(12);

/** Two-soft-pulse "something is happening" cue, e.g. curtain closing. */
export const hapticSoft = (): void => haptic([10, 60, 14]);

/** Unmistakable but still gentle arrival cue, e.g. invitation fully open. */
export const hapticOpen = (): void => haptic([8, 45, 12, 45, 18]);
