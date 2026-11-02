import './FallingPetals.css';
import React, { useEffect, useRef } from 'react';
import { createPetalShower, type PetalShowerApi } from './petalEngine';
import { loadTeamSide, TEAM_CHANGE_EVENT, type TeamChangeDetail, type TeamSide } from '../../services/teamService';

/** Petal mix per team: blush roses for the bride, jasmine & marigold for the groom. */
const paletteFor = (side: TeamSide | null) => (side === 'bride' ? 'blush' : side === 'groom' ? 'temple' : 'rose');

let engine: PetalShowerApi | null = null;

/** Soft flurry from the top (used when the invitation opens). */
export const showerPetals = (count = 44): void => engine?.shower(count);

/** Burst upward from an element (e.g. the RSVP / wishes submit button). */
export const burstPetals = (from?: Element | null, count = 46): void => {
  if (!engine) return;
  const r = from?.getBoundingClientRect();
  if (r && r.bottom > 0 && r.top < window.innerHeight) engine.burst(r.left + r.width / 2, r.top + 4, count);
  else engine.burst(window.innerWidth / 2, window.innerHeight * 0.85, count);
};

export const FallingPetals: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!ref.current || engine) return;
    engine = createPetalShower(ref.current);
    engine.setPalette(paletteFor(loadTeamSide()));
    engine.start();
  }, []);
  // Switch the petal mix when the guest picks or changes their side.
  useEffect(() => {
    const onTeam = (e: Event) => {
      const d = (e as CustomEvent<TeamChangeDetail>).detail;
      if (d) engine?.setPalette(paletteFor(d.side));
    };
    window.addEventListener(TEAM_CHANGE_EVENT, onTeam);
    return () => window.removeEventListener(TEAM_CHANGE_EVENT, onTeam);
  }, []);
  return <canvas ref={ref} className="petal-canvas" aria-hidden="true" />;
};
