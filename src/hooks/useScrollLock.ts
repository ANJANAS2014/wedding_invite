import { useEffect } from 'react';

// Shared, reference-counted body scroll lock for modals and overlays.
// Uses the position:fixed technique so iOS Safari can't scroll the page
// behind an overlay, and restores the exact scroll position on unlock.
let lockCount = 0;
let savedScrollY = 0;
let savedStyles: Partial<CSSStyleDeclaration> = {};

function lock() {
  if (lockCount++ > 0) return;
  const { body } = document;
  savedScrollY = window.scrollY;
  savedStyles = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    overflow: body.style.overflow,
  };
  body.style.position = 'fixed';
  body.style.top = `-${savedScrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  body.style.overflow = 'hidden';
}

function unlock() {
  if (lockCount === 0 || --lockCount > 0) return;
  const { body, documentElement } = document;
  Object.assign(body.style, savedStyles);
  // html has `scroll-behavior: smooth`; restore instantly, not animated.
  const previousBehavior = documentElement.style.scrollBehavior;
  documentElement.style.scrollBehavior = 'auto';
  window.scrollTo(0, savedScrollY);
  documentElement.style.scrollBehavior = previousBehavior;
}

/** Locks background scrolling while `active` is true. */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active]);
}
