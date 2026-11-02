import './OurStoryAndFilmstripSection.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { WEDDING_CONTENT, WEDDING_IMAGES, UNIFIED_MEMORIES, STORY_HOOK, STORY_MOMENTS } from '../../data/weddingData';
import { prefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { HeaderRule } from '../shared/HeaderRule/HeaderRule';
import { haptic } from '../../utils/haptics';

// Rendered twice back-to-back so the CSS marquee loops seamlessly.
const FILMSTRIP_FRAMES = [...UNIFIED_MEMORIES, ...UNIFIED_MEMORIES];

/** Filmstrip scroll speed. Change this one number to make it faster or slower. */
const FILM_SPEED_PX_PER_S = 95;

const PARAGRAPHS = WEDDING_CONTENT.story.split(/\n\s*\n/);
const MOMENT_MS = 5500;

/**
 * Film frames keep each photo's own orientation (3:2 landscape, 4:5 portrait)
 * at one shared height, so no photo is cropped through a face.
 */
const markFrameOrientation = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  const frame = img.closest('.film-frame');
  if (frame) frame.classList.toggle('is-portrait', img.naturalHeight > img.naturalWidth);
};

/**
 * Our Story: the story card (photo + progress bars) beside an index of the
 * six moments on desktop; on phones the caption sits in a solid panel under
 * the photo. Auto-advances only while at least half visible; tap right/left
 * for next/previous, swipe, press-and-hold to pause. Reduced motion: no
 * auto-advance and no animation.
 */
const StoryBlock: React.FC<{ more: React.ReactNode }> = ({ more }) => {
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

  const jump = (i: number) => {
    haptic(5);
    setIndex(i);
    setCycle((c) => c + 1);
  };

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

  const m = STORY_MOMENTS[index];

  return (
    <div className="story-grid">
      <div className="story-cardcol reveal">
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
          <div className="story-ph">
            {STORY_MOMENTS.map((mo, i) => (
              <figure
                key={mo.title}
                className={`story-card ${i === index ? 'on' : ''}`}
                aria-hidden={i !== index}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}: ${mo.title}`}
              >
                <img
                  src={WEDDING_IMAGES[mo.image]}
                  alt=""
                  loading={i < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                  style={{ objectPosition: mo.objectPosition, transform: mo.zoom ? `scale(${mo.zoom})` : undefined }}
                />
              </figure>
            ))}
            <div className="story-bars" aria-hidden="true">
              {STORY_MOMENTS.map((mo, i) => (
                <i key={mo.title} className={i < index ? 'done' : i === index ? 'cur' : ''}>
                  <b key={i === index ? cycle : 'x'} />
                </i>
              ))}
            </div>
            <button type="button" className="story-tap story-tap--prev" aria-label="Previous moment" onClick={() => { haptic(5); go(-1); }} />
            <button type="button" className="story-tap story-tap--next" aria-label="Next moment" onClick={() => { haptic(5); go(1); }} />
          </div>
          {/* caption panel (phones): solid, never printed over the photo */}
          <div className="story-cap" key={cycle} aria-live="polite">
            <span className="rd-label">
              {index + 1} / {count}
            </span>
            <h3>{m.title}</h3>
            <p>{m.text}</p>
          </div>
        </div>
        <p className="story-hint">Tap to continue · hold to pause</p>
      </div>

      <div className="story-side reveal">
        <p className="story-hook">{STORY_HOOK}</p>
        {/* desktop index of the six moments; the active one shows its text */}
        <ol className="story-moments" aria-label="The moments">
          {STORY_MOMENTS.map((mo, i) => (
            <li key={mo.title} className={i === index ? 'on' : undefined}>
              <button type="button" onClick={() => jump(i)} aria-current={i === index || undefined}>
                <span className="rd-label">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <b>{mo.title}</b>
                  <span className="story-moment-text">{mo.text}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
        {more}
      </div>
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
      {/* Part 1: Our Story */}
      <article className="st rd-sec rd-light" id="story">
        <div className="rd-wrap">
          <header className="rd-head reveal">
            <span className="rd-kicker">Read how it all began</span>
            <h2 id="our-story-heading">Our Story</h2>
            <HeaderRule />
          </header>

          <StoryBlock
            more={
              <button
                type="button"
                className="rd-btn rd-btn--line story-more"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
                aria-controls="story-full-text"
              >
                {isExpanded ? 'Show less' : 'Read the full story'}
              </button>
            }
          />

          {isExpanded && (
            <div className="story-full-text" id="story-full-text">
              {PARAGRAPHS.map((para, j) => (
                <p key={j}>{para}</p>
              ))}
            </div>
          )}
        </div>
      </article>

      {/* Part 2: 35mm film strip */}
      <div className="filmstrip-wrapper fs rd-light" aria-label="35mm photographic memory filmstrip">
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
                      onLoad={markFrameOrientation}
                    />
                  </div>
                  <span className="film-edge film-edge--bottom" aria-hidden="true">
                    <span>{frameNum}</span>
                    <span>▸ {frameNum}A</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="fs-bar">
          <button
            type="button"
            className="rd-btn rd-btn--line filmstrip-toggle-btn"
            onClick={() => setIsPaused(!isPaused)}
            aria-label={isPaused ? 'Resume filmstrip animation' : 'Pause filmstrip animation'}
          >
            {isPaused ? (
              <svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5v11l9-5.5z" fill="currentColor" /></svg>
            ) : (
              <svg viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="1" width="3.5" height="12" fill="currentColor" /><rect x="8.5" y="1" width="3.5" height="12" fill="currentColor" /></svg>
            )}
            {isPaused ? 'Play' : 'Pause'}
          </button>
        </div>
        <div className="rd-wrap">
        </div>
      </div>
    </section>
  );
};
