import React, { useEffect, useRef, useState } from 'react';

export const MusicPlayer: React.FC = () => {
  const [muted, setMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('inv-mute') === '1';
    } catch {
      return false;
    }
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize synth fallback if mp3 fails or audio context needed
  const initSynth = () => {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

  const startPlayback = () => {
    if (muted) return;
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setShowHint(false);
        })
        .catch(() => {
          // Autoplay blocked by browser policy
          setShowHint(true);
        });
    }
  };

  useEffect(() => {
    const audio = new Audio('/audio/background-music.mp3');
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

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    try {
      localStorage.setItem('inv-mute', nextMuted ? '1' : '0');
    } catch {}

    if (nextMuted) {
      audioRef.current?.pause();
      if (audioCtxRef.current) audioCtxRef.current.suspend();
      setIsPlaying(false);
      setShowHint(false);
    } else {
      startPlayback();
      initSynth();
    }
  };

  return (
    <>
      <button
        id="mu"
        className={muted || !isPlaying ? 'off' : ''}
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
