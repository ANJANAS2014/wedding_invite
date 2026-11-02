import './OurStoryAndFilmstripSection.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { WEDDING_CONTENT, WEDDING_IMAGES, UNIFIED_MEMORIES, STORY_HOOK, STORY_MOMENTS } from '../../data/weddingData';
import { prefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { HeaderRule } from '../shared/HeaderRule/HeaderRule';
import { NextTeaser } from '../ScrollGuide/NextTeaser';
import { haptic } from '../../utils/haptics';

// Rendered twice back-to-back so the CSS marquee loops seamlessly.
const FILMSTRIP_FRAMES = [...UNIFIED_MEMORIES, ...UNIFIED_MEMORIES];

/** Filmstrip scroll speed. Change this one number to make it faster or slower. */
const FILM_SPEED_PX_PER_S = 95;

const PARAGRAPHS = WEDDING_CONTENT.story.split(/\n\s*\n/);
const MOMENT_MS = 5500;

// Crop guidance for the uniform 3:2 film frames
/** Landscape photos crop centred; portraits crop a little higher to keep faces in frame. */
const setFramePosition = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  img.style.objectPosition = img.naturalWidth > img.naturalHeight ? '50% 50%' : '50% 28%';
};

/**
 * Instagram-style story cards: progress bars, auto-advance only while at
 * least half visible, tap right/left for next/previous, swipe, press-and-hold
 * to pause. Reduced motion: no auto-advance and no animation.
 */
const StoryCards: React.FC = () => {
  const [index, setIndex] = useState<number>(0);
  const [inView, setInView] = useState<boolean>(false);
  const [held, setHeld] = useState<boolean>(false);
  const [cycle, setCycle] = useState<number>(0); // restarts the progress-bar animation
  const boxRef = useRef<HTMLDivElement>(null);
  const holdTimer = useRef<number | undefined>(undefined);
  const touchX = useRef<number | null>(null);
  const count = STORY_MOMENTS.length;

  const go = useCallback(
    (step: number) => {
      setIndex((i) => (i + step + count) % count);
      setCycle((c) => c + 1);
    },
    [count]
  );

  useEffect(() => {
    const el = boxRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => setInView(entries[0].isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || held || prefersReducedMotion()) return;
    const t = window.setTimeout(() => go(1), MOMENT_MS);
    return () => window.clearTimeout(t);
  }, [inView, held, index, cycle, go]);

  useEffect(() => () => window.clearTimeout(holdTimer.current), []);

  const startHold = () => {
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(() => setHeld(true), 250);
  };
  const endHold = () => {
    window.clearTimeout(holdTimer.current);
    if (held) {
      setHeld(false);
      setCycle((c) => c + 1);
    }
  };

  return (
    <div
      ref={boxRef}
      className={`story-cards ${held ? 'is-held' : ''} ${inView ? 'is-playing' : ''}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={`Our story in ${count} moments`}
      style={{ '--moment': `${MOMENT_MS}ms` } as React.CSSProperties}
      onPointerDown={startHold}
      onPointerUp={endHold}
      onPointerLeave={endHold}
      onPointerCancel={endHold}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 40) {
          haptic(5);
          go(dx < 0 ? 1 : -1);
        }
      }}
    >
      <div className="story-bars" aria-hidden="true">
        {STORY_MOMENTS.map((m, i) => (
          <i key={m.title} className={i < index ? 'done' : i === index ? 'cur' : ''}>
            <b key={i === index ? cycle : 'x'} />
          </i>
        ))}
      </div>

      {STORY_MOMENTS.map((m, i) => (
        <figure
          key={m.title}
          className={`story-card ${i === index ? 'on' : ''}`}
          aria-hidden={i !== index}
          aria-roledescription="slide"
          aria-label={`${i + 1} of ${count}: ${m.title}`}
        >
          <img
            src={WEDDING_IMAGES[m.image]}
            alt=""
            loading={i < 2 ? 'eager' : 'lazy'}
            decoding="async"
            style={{ objectPosition: m.objectPosition, transform: m.zoom ? `scale(${m.zoom})` : undefined }}
          />
          <figcaption key={i === index ? cycle : 'idle'}>
            <span>
              {i + 1} / {count}
            </span>
            <h3>{m.title}</h3>
            <p>{m.text}</p>
          </figcaption>
        </figure>
      ))}

      <button type="button" className="story-tap story-tap--prev" aria-label="Previous moment" onClick={() => { haptic(5); go(-1); }} />
      <button type="button" className="story-tap story-tap--next" aria-label="Next moment" onClick={() => { haptic(5); go(1); }} />
    </div>
  );
};

interface OurStoryAndFilmstripSectionProps {
  onOpenLightbox: (index: number) => void;
}

export const OurStoryAndFilmstripSection: React.FC<OurStoryAndFilmstripSectionProps> = ({ onOpenLightbox }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isTouchHeld, setIsTouchHeld] = useState<boolean>(false);
  const trackRef = useRef<HTMLDivElement>(null);

  // Duration = one loop's width / speed, so the pace stays the same on every
  // screen size and when photos are added or removed.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      const loopWidth = track.scrollWidth / 2;
      if (loopWidth > 0) track.style.setProperty('--film-dur', `${(loopWidth / FILM_SPEED_PX_PER_S).toFixed(2)}s`);
    };
    update();
    if (!('ResizeObserver' in window)) return;
    const ro = new ResizeObserver(update);
    ro.observe(track);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="our-story-filmstrip-section" id="story-filmstrip-section" aria-labelledby="our-story-heading">
      {/* Part 1: Our Story — chapters */}
      <article className="st grain" id="story">
        <header className="st-head reveal">
          <span className="eyebrow">Read how it all began</span>
          <h2 id="our-story-heading">Our Story</h2>
          <HeaderRule />
        </header>

        <p className="story-hook reveal">{STORY_HOOK}</p>

        <div className="reveal">
          <StoryCards />
        </div>
        <p className="story-hint reveal">Tap to continue · hold to pause</p>

        <div className="story-full">
          <button
            type="button"
            className="st-more story-toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
          >
            {isExpanded ? 'Show less' : 'Read the full story'}
          </button>
          {isExpanded && (
            <div className="story-full-text">
              {PARAGRAPHS.map((para, j) => (
                <p key={j} className={j === 0 ? 'st-lead' : undefined}>
                  {para}
                </p>
              ))}
            </div>
          )}
        </div>
      </article>

      {/* Part 2: 35mm film strip */}
      <div className="filmstrip-wrapper fs grain" aria-label="35mm photographic memory filmstrip">
        <div className="fs-bar">
          <button
            type="button"
            className="filmstrip-toggle-btn"
            onClick={() => setIsPaused(!isPaused)}
            aria-label={isPaused ? 'Resume filmstrip animation' : 'Pause filmstrip animation'}
          >
            {isPaused ? 'Play' : 'Pause'}
          </button>
        </div>
        <div
          className="filmstrip-viewport"
          onTouchStart={() => setIsTouchHeld(true)}
          onTouchEnd={() => setIsTouchHeld(false)}
          onTouchCancel={() => setIsTouchHeld(false)}
        >
          <div ref={trackRef} className={`filmstrip-track ${isPaused || isTouchHeld ? 'is-paused' : ''}`}>
            {FILMSTRIP_FRAMES.map((photo, index) => {
              const actualIndex = index % UNIFIED_MEMORIES.length;
              const isClone = index >= UNIFIED_MEMORIES.length;
              const frameNum = actualIndex + 20;
              return (
                <div
                  key={index}
                  className="film-frame"
                  onClick={() => onOpenLightbox(actualIndex)}
                  tabIndex={isClone ? -1 : 0}
                  aria-hidden={isClone || undefined}
                  role="button"
                  aria-label={`View photo ${actualIndex + 1}: ${photo.alt}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenLightbox(actualIndex);
                    }
                  }}
                >
                  <span className="film-edge film-edge--top" aria-hidden="true">
                    <span>SCRL E100</span>
                    <span>▸ {frameNum}</span>
                  </span>
                  <div className="film-picture-box">
                    <img
                      src={photo.src}
                      alt={isClone ? '' : photo.alt}
                      loading={actualIndex <= 2 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="film-picture-img"
                      onLoad={setFramePosition}
                    />
                  </div>
                  <span className="film-edge" aria-hidden="true">
                    <span>{frameNum}</span>
                    <span>▸ {frameNum}A</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <NextTeaser label="Next: where & when to celebrate" targetId="s2" />
      </div>
    </section>
  );
};
