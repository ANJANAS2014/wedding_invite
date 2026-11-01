/* iOS-safe modal helpers shared by every overlay in the site.

   Root cause of the iPhone "dark blurred screen with no modal":
   1. `position: fixed` elements rendered INSIDE an ancestor that has an
      animation, filter or transform are positioned relative to that ancestor
      on WebKit, not the viewport. Fix: render overlays through a React
      portal into document.body.
   2. iOS Safari ignores `overflow: hidden` on body alone; a real scroll
      lock needs `position: fixed` + preserving the scroll offset. */

let lockCount = 0;
let savedScrollY = 0;

/** Lock background scroll (iOS-safe). Reference-counted so stacked modals work. */
export function lockBodyScroll(): void {
  if (lockCount === 0) {
    savedScrollY = window.scrollY;
    const body = document.body;
    body.style.position = 'fixed';
    body.style.top = `-${savedScrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';
  }
  lockCount += 1;
}

/** Unlock background scroll and restore the previous scroll position. */
export function unlockBodyScroll(): void {
  if (lockCount === 0) return;
  lockCount -= 1;
  if (lockCount === 0) {
    const body = document.body;
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
    body.style.width = '';
    body.style.overflow = '';
    window.scrollTo(0, savedScrollY);
  }
}
