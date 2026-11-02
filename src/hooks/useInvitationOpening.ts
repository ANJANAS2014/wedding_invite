import { useCallback, useEffect, useRef, useState } from 'react';
import type { DoorStatus } from '../types';
import { hapticOpen, hapticSoft, hapticTap } from '../utils/haptics';
import { playTempleChime } from '../utils/chime';
import { announceInvitationOpen } from '../utils/inviteEvents';
import { prefersReducedMotion } from './usePrefersReducedMotion';
import { showerPetals } from '../components/FallingPetals/FallingPetals';

// Timeline (ms after the tap). Keep in sync with TempleDoors.css transitions.
const T_PART = 450; // doors start swinging inward, revealing the portrait inside
const T_SHOW = 600; // page 2 made visible behind the (still opaque) door scene
const T_ARRIVE = 1450; // gentle haptic as the doorway clears
const T_FADE = 1500; // scene eases through the doorway and dissolves (0.8s, see CSS)
const T_REVEAL = 1650; // page-2 text rises in as the scene dissolves
const T_DONE_FALLBACK = 2600; // unmount even if transitionend never fires

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
  const petalsShownRef = useRef<boolean>(false);

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

  /** Unmounts the doors, then lets the welcome petals fall on page 2. */
  const completeOpening = useCallback(() => {
    clearTimers();
    setIsOpened(true);
    setIsRevealed(true);
    setDoorStatus('done');
    if (!petalsShownRef.current) {
      petalsShownRef.current = true;
      window.setTimeout(() => showerPetals(44), 150);
    }
  }, []);

  const openInvitation = useCallback(() => {
    if (doorStatus !== 'closed') return;
    hapticTap();
    announceInvitationOpen(); // starts the music on this same tap
    playTempleChime(0);

    if (prefersReducedMotion()) {
      hapticOpen();
      window.scrollTo(0, 0);
      finish();
      window.setTimeout(() => showerPetals(44), 300);
      return;
    }

    hapticSoft();
    setDoorStatus('unlocking');
    const at = (ms: number, fn: () => void) => timersRef.current.push(window.setTimeout(fn, ms));
    window.scrollTo(0, 0);
    at(T_PART, () => setDoorStatus('parting'));
    at(T_SHOW, () => setIsOpened(true));
    at(T_ARRIVE, hapticOpen);
    at(T_FADE, () => setDoorStatus('fading'));
    at(T_REVEAL, () => setIsRevealed(true));
    at(T_DONE_FALLBACK, completeOpening);
  }, [doorStatus, finish, completeOpening]);

  /** Called when the door scene's fade-out transition ends. */
  const onFadeEnd = useCallback(() => {
    if (doorStatus === 'fading') completeOpening();
  }, [doorStatus, completeOpening]);

  /** A tap on the doors while they are animating jumps straight to page 2. */
  const skipOpening = useCallback(() => {
    if (doorStatus === 'closed' || doorStatus === 'done') return;
    window.scrollTo(0, 0);
    completeOpening();
  }, [doorStatus, completeOpening]);

  return { isOpened, doorStatus, openInvitation, skipOpening, onFadeEnd };
}
