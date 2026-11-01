// Layout maths for the Wishes Wall marquee (pure functions, no React).
//
// Card widths themselves come from CSS (`--card-width` in WishesWall.css).
// `wishCardWidth` mirrors that CSS so the marquee maths stays in sync:
//   phones (≤480px): clamp(240px, 78vw, 300px)
//   larger screens:  304px

const GAP = 20; // .wishes-rail-track gap
const DESKTOP_CARD_WIDTH = 304;
const MOBILE_BREAKPOINT = 480;
const MOBILE_MIN_CARD_WIDTH = 240;
const MOBILE_MAX_CARD_WIDTH = 300;
const MOBILE_CARD_VW = 0.78;
const MIN_WISHES_FOR_MARQUEE = 3;

export interface CarouselLayout<T> {
  cardWidth: number;
  shouldAutoScroll: boolean;
  /** Originals followed by enough trailing clones for a seamless loop. */
  displayItems: T[];
  /** Number of original (non-clone) items at the start of displayItems. */
  originalCount: number;
  /** Estimated px distance of one loop; the component re-measures it from the DOM. */
  marqueeDistance: number;
  /** Animation duration in seconds. */
  durationSeconds: number;
}

/** Same formula as the CSS `--card-width`. */
export function wishCardWidth(viewportWidth: number): number {
  return viewportWidth > MOBILE_BREAKPOINT
    ? DESKTOP_CARD_WIDTH
    : Math.min(MOBILE_MAX_CARD_WIDTH, Math.max(MOBILE_MIN_CARD_WIDTH, viewportWidth * MOBILE_CARD_VW));
}

/**
 * 1–2 wishes (or 3+ that fit on screen) render as a static row.
 * 3+ wishes that overflow the viewport auto-scroll as a marquee. Clones cover
 * a full viewport after the originals scroll off, so the loop is seamless.
 */
export function computeCarouselLayout<T>(items: T[], viewportWidth: number): CarouselLayout<T> {
  const cardWidth = wishCardWidth(viewportWidth);
  const originalWidth = items.length * (cardWidth + GAP) - GAP;
  const shouldAutoScroll = items.length >= MIN_WISHES_FOR_MARQUEE && originalWidth > viewportWidth - 40;
  const cloneCount = shouldAutoScroll ? Math.ceil(viewportWidth / (cardWidth + GAP)) + 1 : 0;

  return {
    cardWidth,
    shouldAutoScroll,
    displayItems: shouldAutoScroll ? [...items, ...items.slice(0, cloneCount)] : items,
    originalCount: items.length,
    marqueeDistance: shouldAutoScroll ? originalWidth + GAP : 0,
    durationSeconds: Math.max(28, items.length * 8),
  };
}
