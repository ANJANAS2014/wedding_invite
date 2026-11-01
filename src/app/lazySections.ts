import { lazy, type ComponentType } from 'react';

// Below-the-fold sections and modals are code-split so the cover loads fast
// and the curtain animation runs on a light main thread. Each loader is used
// both by React.lazy and by `prefetchSections()` (warmed while idle, so
// "Open Invitation" feels instant).
const loaders = {
  EventDayNotice: () => import('../components/EventDayNotice/EventDayNotice').then((m) => ({ default: m.EventDayNotice })),
  TeamPicker: () => import('../components/TeamPicker/TeamPicker').then((m) => ({ default: m.TeamPicker })),
  CoupleSection: () => import('../components/CoupleSection/CoupleSection').then((m) => ({ default: m.CoupleSection })),
  EventsSection: () => import('../components/EventsSection/EventsSection').then((m) => ({ default: m.EventsSection })),
  OurStoryAndFilmstripSection: () =>
    import('../components/OurStoryAndFilmstripSection/OurStoryAndFilmstripSection').then((m) => ({ default: m.OurStoryAndFilmstripSection })),
  RsvpSection: () => import('../components/RsvpSection/RsvpSection').then((m) => ({ default: m.RsvpSection })),
  WishesWall: () => import('../components/WishesWall/WishesWall').then((m) => ({ default: m.WishesWall })),
  LightboxModal: () => import('../components/LightboxModal/LightboxModal').then((m) => ({ default: m.LightboxModal })),
  GuestTrackerModal: () => import('../components/GuestTrackerModal/GuestTrackerModal').then((m) => ({ default: m.GuestTrackerModal })),
};

const lazyNamed = <P,>(loader: () => Promise<{ default: ComponentType<P> }>) => lazy(loader);

export const EventDayNotice = lazyNamed(loaders.EventDayNotice);
export const TeamPicker = lazyNamed(loaders.TeamPicker);
export const CoupleSection = lazyNamed(loaders.CoupleSection);
export const EventsSection = lazyNamed(loaders.EventsSection);
export const OurStoryAndFilmstripSection = lazyNamed(loaders.OurStoryAndFilmstripSection);
export const RsvpSection = lazyNamed(loaders.RsvpSection);
export const WishesWall = lazyNamed(loaders.WishesWall);
export const LightboxModal = lazyNamed(loaders.LightboxModal);
export const GuestTrackerModal = lazyNamed(loaders.GuestTrackerModal);

type IdleWindow = Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };

/** Fetches every section chunk once the browser is idle. Returns a cancel function. */
export function prefetchSections(): () => void {
  let cancelled = false;
  const run = () => {
    if (cancelled) return;
    Object.values(loaders).forEach((load) => void load());
  };
  const idleWindow = window as IdleWindow;
  if (idleWindow.requestIdleCallback) idleWindow.requestIdleCallback(run, { timeout: 2500 });
  else window.setTimeout(run, 1200);
  return () => {
    cancelled = true;
  };
}
