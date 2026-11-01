import './MusicPlayer.css';
import React, { useEffect, useRef, useState } from 'react';
import { isMusicMuted, setMusicMuted } from '../../services/storage';
import { INVITE_OPEN_EVENT } from '../../utils/inviteEvents';

const MUSIC_SRC = '/audio/background-music.mp3';
type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

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

  const startPlayback = () => {
    if (mutedRef.current) return;
    if (useSynthRef.current) {
      startSynth();
      return;
    }
    audioRef.current?.play().catch(() => {
      // Blocked by autoplay policy — the guest can still use the toggle.
    });
  };

  useEffect(() => {
    const audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.preload = 'auto';
    audioRef.current = audio;
    audio.onerror = () => {
      useSynthRef.current = true;
    };

    window.addEventListener(INVITE_OPEN_EVENT, startPlayback);

    return () => {
      window.removeEventListener(INVITE_OPEN_EVENT, startPlayback);
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
