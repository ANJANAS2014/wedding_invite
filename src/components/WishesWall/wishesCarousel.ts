// Layout maths for the Wishes Wall marquee (pure functions, no React).

const GAP = 20;
const H_PADDING = 40; // 20px left + 20px right on .wishes-rail-viewport
const DESKTOP_CARD_WIDTH = 304;
const MOBILE_BREAKPOINT = 480;
const MOBILE_CARD_COUNT = 3;
const MOBILE_MIN_CARD_WIDTH = 90;
const MIN_WISHES_FOR_MARQUEE = 4;

export interface CarouselLayout<T> {
  cardWidth: number;
  shouldAutoScroll: boolean;
  /** Originals followed by enough leading clones for a seamless loop. */
  displayItems: T[];
  /** Positive px distance; the CSS negates it to move left. */
  marqueeDistance: number;
  /** Animation duration in seconds. */
  durationSeconds: number;
}

/**
 * Desktop keeps ~304px cards; mobile fits three cards across the viewport.
 * Auto-scroll only when there are 4+ wishes that overflow the viewport. Clones
 * cover a full viewport after the originals scroll off, so the loop never
 * shows a duplicate card in the same view.
 */
export function computeCarouselLayout<T>(items: T[], viewportWidth: number): CarouselLayout<T> {
  const cardWidth =
    viewportWidth > MOBILE_BREAKPOINT
      ? DESKTOP_CARD_WIDTH
      : Math.max(MOBILE_MIN_CARD_WIDTH, (viewportWidth - H_PADDING - (MOBILE_CARD_COUNT - 1) * GAP) / MOBILE_CARD_COUNT);

  const originalWidth = items.length * (cardWidth + GAP) - GAP;
  const shouldAutoScroll = items.length >= MIN_WISHES_FOR_MARQUEE && originalWidth > viewportWidth - 40;
  const cloneCount = shouldAutoScroll ? Math.ceil(viewportWidth / (cardWidth + GAP)) + 1 : 0;

  return {
    cardWidth,
    shouldAutoScroll,
    displayItems: shouldAutoScroll ? [...items, ...items.slice(0, cloneCount)] : items,
    marqueeDistance: shouldAutoScroll ? originalWidth : 0,
    durationSeconds: Math.max(28, items.length * 8),
  };
}
