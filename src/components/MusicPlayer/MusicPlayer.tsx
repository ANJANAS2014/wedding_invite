import './MusicPlayer.css';
import React, { useEffect, useRef, useState } from 'react';
import { isMusicMuted, setMusicMuted } from '../../services/storage';
import { INVITE_OPEN_EVENT } from '../../utils/inviteEvents';
import { MUSIC_DUCK_EVENT } from '../../utils/musicEvents';

const FULL_VOLUME = 0.6;
const DUCK_VOLUME = 0.12;
const FADE_IN_S = 2.6;

const MUSIC_SRC = '/audio/background-music.mp3';
type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

/**
 * iPhone / iPad (incl. iPadOS that reports as a Mac). On iOS, Web Audio output is
 * silenced by the ring/silent switch while a plain <audio> element is not — so the
 * MP3 must NOT be routed through a GainNode there, or guests in silent mode hear nothing.
 */
const IS_IOS =
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

/**
 * Background music toggle (#mu).
 * Music starts when the guest taps "Open Invitation" on the temple doors
 * (INVITE_OPEN_EVENT) — that tap is the user gesture mobile browsers require,
 * so no "tap anywhere for music" prompt is needed. Falls back to a
 * synthesised tanpura drone if the MP3 fails to load. The mute preference
 * persists in localStorage (also honoured by the temple chime).
 */
export const MusicPlayer: React.FC = () => {
  const [muted, setMuted] = useState<boolean>(isMusicMuted);
  const mutedRef = useRef<boolean>(muted);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const useSynthRef = useRef<boolean>(false);
  // Gain stage for soft fades. iOS ignores HTMLMediaElement.volume, so the MP3
  // is routed through a Web Audio GainNode where available.
  const fadeCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  /** True once the guest has asked for music (opened the invitation / unmuted). */
  const wantPlayRef = useRef<boolean>(false);
  const retryArmedRef = useRef<boolean>(false);

  const ensureGain = () => {
    if (IS_IOS || gainRef.current || !audioRef.current) return;
    try {
      const AC = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      ctx.createMediaElementSource(audioRef.current).connect(gain);
      gain.connect(ctx.destination);
      // Resume inside the tap itself; a context left suspended would play the MP3 silently.
      if (ctx.state === 'suspended') void ctx.resume();
      fadeCtxRef.current = ctx;
      gainRef.current = gain;
    } catch {
      // fall back to element volume
    }
  };

  /** Ramp the music to `level` over `seconds` (never an abrupt start). */
  const fadeTo = (level: number, seconds: number) => {
    const gain = gainRef.current;
    const ctx = fadeCtxRef.current;
    if (gain && ctx) {
      if (ctx.state === 'suspended') void ctx.resume();
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(level, now + seconds);
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    const start = audio.volume;
    const t0 = performance.now();
    const step = () => {
      const k = Math.min(1, (performance.now() - t0) / (seconds * 1000));
      audio.volume = Math.max(0, Math.min(1, start + (level - start) * k));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Synth fallback (only used when the MP3 cannot be loaded)
  const startSynth = () => {
    try {
      const AC = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
      if (!AC) return;
      if (!audioCtxRef.current) {
        const ac = new AC();
        audioCtxRef.current = ac;
        const mg = ac.createGain();
        mg.gain.value = 0.55;
        const lp = ac.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 2400;
        mg.connect(lp);
        lp.connect(ac.destination);

        // Tanpura drone
        const root = 130.8; // C3
        [root * 0.75, root, root * 1.5].forEach((freq) => {
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.type = 'triangle';
          osc.frequency.value = freq;
          gain.gain.value = 0.04;
          osc.connect(gain);
          gain.connect(mg);
          osc.start();
        });
      }
      if (audioCtxRef.current.state === 'suspended') {
        void audioCtxRef.current.resume();
      }
    } catch {
      // AudioContext unavailable
    }
  };

  /** If the browser blocked playback, start on the guest's next tap / key press instead. */
  const armRetry = () => {
    if (retryArmedRef.current) return;
    retryArmedRef.current = true;
    const retry = () => {
      window.removeEventListener('pointerdown', retry, true);
      window.removeEventListener('keydown', retry, true);
      retryArmedRef.current = false;
      if (!mutedRef.current && audioRef.current?.paused) startPlayback();
    };
    window.addEventListener('pointerdown', retry, true);
    window.addEventListener('keydown', retry, true);
  };

  const startPlayback = () => {
    if (mutedRef.current) return;
    wantPlayRef.current = true;
    if (useSynthRef.current) {
      startSynth();
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    ensureGain();
    if (!gainRef.current) audio.volume = 0;
    let started: Promise<void> | undefined;
    try {
      started = audio.play();
    } catch {
      armRetry();
      return;
    }
    // Old browsers return undefined from play(); treat that as started.
    Promise.resolve(started)
      .then(() => fadeTo(FULL_VOLUME, FADE_IN_S))
      .catch(() => {
        // Blocked (autoplay policy, or the file was still loading) — try again on the next tap.
        armRetry();
      });
  };

  useEffect(() => {
    const audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.preload = 'auto';
    audioRef.current = audio;
    audio.onerror = () => {
      useSynthRef.current = true;
      // If the guest already opened the invitation, fall back to the drone right away.
      if (wantPlayRef.current && !mutedRef.current) startSynth();
    };

    // Phones pause/suspend audio when the guest switches apps (Directions, Calendar,
    // WhatsApp) or locks the screen — pick the music back up when they return.
    const onVisible = () => {
      if (document.visibilityState !== 'visible' || !wantPlayRef.current || mutedRef.current) return;
      const ctx = fadeCtxRef.current;
      if (ctx && ctx.state !== 'running') void ctx.resume().catch(() => {});
      if (!useSynthRef.current && audio.paused) {
        audio.play().catch(() => armRetry());
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    // Dip under the lightbox / videos, then come back up softly
    const onDuck = (e: Event) => {
      if (mutedRef.current || audio.paused) return;
      fadeTo((e as CustomEvent<boolean>).detail ? DUCK_VOLUME : FULL_VOLUME, 0.9);
    };

    window.addEventListener(INVITE_OPEN_EVENT, startPlayback);
    window.addEventListener(MUSIC_DUCK_EVENT, onDuck);

    return () => {
      window.removeEventListener(INVITE_OPEN_EVENT, startPlayback);
      window.removeEventListener(MUSIC_DUCK_EVENT, onDuck);
      document.removeEventListener('visibilitychange', onVisible);
      fadeCtxRef.current?.close().catch(() => {});
      audio.pause();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const toggleMute = () => {
    const nextMuted = !muted;
    mutedRef.current = nextMuted;
    setMuted(nextMuted);
    setMusicMuted(nextMuted);

    if (nextMuted) {
      wantPlayRef.current = false;
      audioRef.current?.pause();
      if (audioCtxRef.current) void audioCtxRef.current.suspend();
    } else {
      // Unmuting is itself a tap, so playback is allowed to start here.
      startPlayback();
    }
  };

  return (
    <button
      id="mu"
      className={muted ? 'off' : ''}
      onClick={toggleMute}
      aria-label={muted ? 'Unmute music' : 'Mute music'}
      aria-pressed={!muted}
      type="button"
    >
      <i />
      <i />
      <i />
      <i />
    </button>
  );
};
