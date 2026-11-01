import { useCallback, useEffect, useRef, useState } from 'react';
import type { DoorStatus } from '../types';
import { hapticOpen, hapticSoft, hapticTap } from '../utils/haptics';
import { playTempleChime } from '../utils/chime';
import { announceInvitationOpen } from '../utils/inviteEvents';
import { prefersReducedMotion } from './usePrefersReducedMotion';
import { showerPetals } from '../components/FallingPetals/FallingPetals';

// Timeline (ms after the tap). Keep in sync with TempleDoors.css transitions.
const T_PART = 450; // doors start swinging inward, revealing the portrait inside
const T_REVEAL = 1950; // page-2 text rises in
const T_ARRIVE = 1700; // gentle haptic as the doorway clears
const T_FADE = 1650; // scene zooms through the doorway; page 2 shown behind
const T_DONE = 2800; // overlay unmounted

/**
 * "Open Invitation" flow for the temple-door landing page.
 * - `body.opened`   shows #main (page 2 cover + the rest of the invitation)
 * - `body.revealed` triggers the staggered fade-up of the page-2 cover text
 * - `body.doors-busy` locks scrolling while the doors are animating
 */
export function useInvitationOpening() {
  const [doorStatus, setDoorStatus] = useState<DoorStatus>('closed');
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    document.body.classList.toggle('opened', isOpened);
  }, [isOpened]);

  useEffect(() => {
    document.body.classList.toggle('revealed', isRevealed);
  }, [isRevealed]);

  useEffect(() => {
    const busy = doorStatus === 'unlocking' || doorStatus === 'parting' || doorStatus === 'fading';
    document.body.classList.toggle('doors-busy', busy);
  }, [doorStatus]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => clearTimers, []);

  const finish = useCallback(() => {
    clearTimers();
    setIsOpened(true);
    setIsRevealed(true);
    setDoorStatus('done');
  }, []);

  const openInvitation = useCallback(() => {
    if (doorStatus !== 'closed') return;
    hapticTap();
    announceInvitationOpen(); // starts the music on this same tap
    playTempleChime(0);
    window.setTimeout(() => showerPetals(44), 900); // welcome shower as the doors part

    if (prefersReducedMotion()) {
      hapticOpen();
      window.scrollTo(0, 0);
      finish();
      return;
    }

    hapticSoft();
    setDoorStatus('unlocking');
    const at = (ms: number, fn: () => void) => timersRef.current.push(window.setTimeout(fn, ms));
    at(T_PART, () => {
      setDoorStatus('parting');
      window.scrollTo(0, 0);
    });
    at(T_REVEAL, () => setIsRevealed(true));
    at(T_ARRIVE, hapticOpen);
    at(T_FADE, () => {
      setIsOpened(true);
      setDoorStatus('fading');
      window.scrollTo(0, 0);
    });
    at(T_DONE, () => setDoorStatus('done'));
  }, [doorStatus, finish]);

  /** A tap on the doors while they are animating jumps straight to page 2. */
  const skipOpening = useCallback(() => {
    if (doorStatus === 'closed' || doorStatus === 'done') return;
    window.scrollTo(0, 0);
    finish();
  }, [doorStatus, finish]);

  return { isOpened, doorStatus, openInvitation, skipOpening };
}
