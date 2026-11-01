import { isMusicMuted } from '../services/storage';

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

/**
 * Web Audio synthesised temple-bell chime (two strikes) played when the
 * invitation opens. Uses its own AudioContext, separate from the music player.
 * Silently does nothing when muted or when Web Audio is unavailable.
 */
export function playTempleChime(delay = 0): void {
  try {
    if (isMusicMuted()) return;
    const AC = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
    if (!AC) return;
    const chimeCtx = new AC();
    if (chimeCtx.state === 'suspended') void chimeCtx.resume();

    const out = chimeCtx.createGain();
    out.gain.value = 0.16;
    out.connect(chimeCtx.destination);

    // [frequency ratio, relative volume, decay seconds]
    const overtones: [number, number, number][] = [
      [0.5, 0.32, 4.2], [1, 1, 3.4], [1.003, 0.5, 3.6], [1.19, 0.34, 2.4],
      [1.5, 0.24, 1.9], [2, 0.2, 1.5], [2.66, 0.1, 1.1], [3.98, 0.05, 0.7],
    ];

    const strike = (t0: number, f: number, vol: number) => {
      overtones.forEach(([r, v, d]) => {
        const o = chimeCtx.createOscillator();
        const g = chimeCtx.createGain();
        o.type = 'sine';
        o.frequency.value = f * r;
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(v * vol, t0 + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
        o.connect(g);
        g.connect(out);
        o.start(t0);
        o.stop(t0 + d + 0.05);
      });
    };

    const t = chimeCtx.currentTime + delay;
    strike(t, 622, 1);
    strike(t + 0.95, 622, 0.42);
  } catch {
    // AudioContext unavailable
  }
}
