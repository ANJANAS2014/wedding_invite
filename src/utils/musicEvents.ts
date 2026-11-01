/** Ask the background music to dip (e.g. while the lightbox is open) or restore. */
export const MUSIC_DUCK_EVENT = 'music:duck';

export const duckMusic = (on: boolean): void => {
  try {
    window.dispatchEvent(new CustomEvent(MUSIC_DUCK_EVENT, { detail: on }));
  } catch {
    // ignore
  }
};
