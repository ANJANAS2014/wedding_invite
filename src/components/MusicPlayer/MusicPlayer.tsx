import './MusicPlayer.css';
import React, { useEffect, useRef, useState } from 'react';
import { isMusicMuted, setMusicMuted } from '../../services/storage';

const MUSIC_SRC = '/audio/background-music.mp3';
type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

/**
 * Background music toggle (#mu) and "tap for music" hint (#mh).
 * Plays the MP3 when allowed by autoplay policy (otherwise on first tap);
 * falls back to a synthesised tanpura drone if the MP3 fails to load.
 * Mute preference persists in localStorage (also honoured by the chime).
 */
export const MusicPlayer: React.FC = () => {
  const [muted, setMuted] = useState<boolean>(isMusicMuted);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize synth fallback if mp3 fails or audio context needed
  const initSynth = () => {
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
        audioCtxRef.current.resume();
      }
    } catch {
      // AudioContext unavailable
    }
  };

  const startPlayback = async (forceUnmuted = false) => {
    if (muted && !forceUnmuted) return;
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setShowHint(false);
      } catch {
        // Autoplay blocked by browser policy (common on mobile Safari)
        setShowHint(true);
        setIsPlaying(false);
      }
    }
  };

  useEffect(() => {
    const audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.preload = 'auto';
    audioRef.current = audio;

    audio.onerror = () => {
      initSynth();
      setIsPlaying(true);
    };

    if (!muted) {
      startPlayback();
    }

    const handleFirstUserInteraction = () => {
      if (!muted) {
        startPlayback();
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
      }
      window.removeEventListener('click', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };

    window.addEventListener('click', handleFirstUserInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstUserInteraction, { once: true });

    return () => {
      audio.pause();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const toggleMute = async () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    setMusicMuted(nextMuted);

    if (nextMuted) {
      audioRef.current?.pause();
      if (audioCtxRef.current) audioCtxRef.current.suspend();
      setIsPlaying(false);
      setShowHint(false);
    } else {
      // Resume audio context on mobile (Safari requires this after suspend)
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }
      await startPlayback(true);
      initSynth();
    }
  };

  return (
    <>
      <button
        id="mu"
        className={muted ? 'off' : ''}
        onClick={toggleMute}
        aria-label={muted ? 'Unmute music' : 'Mute music'}
        type="button"
      >
        <i />
        <i />
        <i />
        <i />
      </button>

      <div id="mh" className={showHint && !muted ? 'on' : ''} role="status">
        ♪ Tap anywhere for music
      </div>
    </>
  );
};
