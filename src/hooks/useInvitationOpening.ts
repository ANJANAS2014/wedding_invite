import { useCallback, useEffect, useRef, useState } from 'react';
import type { CurtainStatus } from '../types';
import { hapticOpen, hapticSoft, hapticTap } from '../utils/haptics';
import { playTempleChime } from '../utils/chime';
import { prefersReducedMotion } from './usePrefersReducedMotion';

/**
 * "Open Invitation" flow: closes the lotus curtain over the cover, plays the
 * chime, reveals the invitation underneath and lets the curtain part.
 * Also toggles `body.opened`, which the global CSS uses to swap cover ↔ main.
 */
export function useInvitationOpening() {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [curtainStatus, setCurtainStatus] = useState<CurtainStatus>('idle');
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    document.body.classList.toggle('opened', isOpened);
  }, [isOpened]);

  useEffect(() => () => timersRef.current.forEach((t) => window.clearTimeout(t)), []);

  const openInvitation = useCallback(() => {
    if (isOpened || curtainStatus !== 'idle') return;
    hapticTap();

    if (prefersReducedMotion()) {
      hapticOpen();
      playTempleChime(0);
      setIsOpened(true);
      window.scrollTo(0, 0);
      return;
    }

    hapticSoft();
    // Mount the curtain closed first; the chime lands as it starts to part.
    setCurtainStatus('closing');
    playTempleChime(0.56);

    // Let the browser paint the closed state, then part on the next frame.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsOpened(true);
        setCurtainStatus('parting');
        window.scrollTo(0, 0);
      });
    });

    // Gentle arrival pulse as the invitation lands under the parting curtain.
    timersRef.current.push(window.setTimeout(hapticOpen, 720));
  }, [isOpened, curtainStatus]);

  const handleCurtainParted = useCallback(() => {
    setCurtainStatus((status) => (status === 'parting' ? 'idle' : status));
  }, []);

  return { isOpened, curtainStatus, openInvitation, handleCurtainParted };
}
