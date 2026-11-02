import './App.css';
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { UNIFIED_MEMORIES } from '../data/weddingData';
import { CoverHero } from '../components/CoverHero/CoverHero';
import { TempleDoors } from '../components/TempleDoors/TempleDoors';
import { MusicPlayer } from '../components/MusicPlayer/MusicPlayer';
import { RsvpShortcut } from '../components/RsvpShortcut/RsvpShortcut';
import { FallingPetals } from '../components/FallingPetals/FallingPetals';
import { Footer } from '../components/Footer/Footer';
import { useInvitationParams } from '../hooks/useInvitationParams';
import type { RsvpRecord, WishRecord } from '../types';

/** The wall entry for an RSVP this guest just sent (shown before the server refresh). */
const wishFromRsvp = (rsvp: RsvpRecord): WishRecord => ({
  id: rsvp.id || `pending-${rsvp.submittedAt}`,
  displayName: rsvp.name.trim().split(/\s+/)[0],
  wish: rsvp.wishes.trim(),
  photoUrl: rsvp.photoPreview || undefined,
  submittedAt: rsvp.submittedAt,
  likesCount: 0,
  weddingAttending: rsvp.weddingAttending,
  receptionAttending: rsvp.receptionAttending,
});
import { useInvitationOpening } from '../hooks/useInvitationOpening';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useScrollMoments } from '../hooks/useScrollMoments';
import { ScrollProgress } from '../components/ScrollGuide/ScrollProgress';
import { GuidedTour } from '../components/ScrollGuide/GuidedTour';
import { duckMusic } from '../utils/musicEvents';
import {
  CoupleSection,
  EventDayNotice,
  EventsSection,
  GuestTrackerModal,
  LightboxModal,
  OurStoryAndFilmstripSection,
  RsvpSection,
  WishesWall,
  prefetchSections,
} from './lazySections';

/**
 * Application composition: temple doors (page 1) → cover (page 2) →
 * invitation sections (page 3+), plus the
 * global overlays (music control, lightbox, guest tracker).
 * Feature logic lives in the components, hooks and services it composes.
 */
export const App: React.FC = () => {
  const { guestName, inviteToken, language, openTracker } = useInvitationParams();
  const { doorStatus, openInvitation, skipOpening, onFadeEnd } = useInvitationOpening();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);
  const [wishesRefreshKey, setWishesRefreshKey] = useState<number>(0);
  const [pendingWish, setPendingWish] = useState<WishRecord | null>(null);

  useEffect(() => prefetchSections(), []);
  useScrollReveal('#main');
  // a small petal puff the first time each major section comes into view
  useScrollMoments(['couple', 'story-filmstrip-section', 's2', 'wishes']);

  // Music dips while a photo is open in the lightbox
  useEffect(() => duckMusic(lightboxIndex !== null), [lightboxIndex]);

  useEffect(() => {
    if (openTracker) setIsTrackerOpen(true);
  }, [openTracker]);

  const photoCount = UNIFIED_MEMORIES.length;
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showNextPhoto = useCallback(
    () => setLightboxIndex((i) => (i === null ? i : (i + 1) % photoCount)),
    [photoCount]
  );
  const showPrevPhoto = useCallback(
    () => setLightboxIndex((i) => (i === null ? i : (i - 1 + photoCount) % photoCount)),
    [photoCount]
  );

  return (
    <>
      <Suspense fallback={null}>
        <EventDayNotice />
      </Suspense>
      <FallingPetals />

      {/* Page 1: closed temple doors with the monogram and "Open Invitation" */}
      <TempleDoors status={doorStatus} language={language} onOpen={openInvitation} onSkip={skipOpening} onFadeEnd={onFadeEnd} />

      <main id="main">
        {/* Page 2: cover — greeting, names and the invitation words */}
        <CoverHero guestName={guestName} language={language} />

        <div className="kasavu" aria-hidden="true" />

        <Suspense fallback={null}>
          <CoupleSection guestName={guestName} inviteToken={inviteToken} />
        </Suspense>

        <Suspense fallback={null}>
          <OurStoryAndFilmstripSection onOpenLightbox={setLightboxIndex} />
        </Suspense>

        <div className="kasavu" aria-hidden="true" />

        <Suspense fallback={null}>
          <EventsSection />
        </Suspense>

        <Suspense fallback={null}>
          <RsvpSection
            guestName={guestName}
            inviteToken={inviteToken}
            onSubmittedSuccess={(rsvp) => {
              if (rsvp.wishes) setPendingWish(wishFromRsvp(rsvp));
              setWishesRefreshKey((prev) => prev + 1);
            }}
          />
        </Suspense>

        <div className="kasavu" aria-hidden="true" />

        <Suspense fallback={null}>
          <WishesWall refreshKey={wishesRefreshKey} pendingWish={pendingWish} />
        </Suspense>

        <Footer />
      </main>

      <ScrollProgress />
      <GuidedTour />
      <MusicPlayer />
      <RsvpShortcut />

      <Suspense fallback={null}>
        {lightboxIndex !== null && (
          <LightboxModal
            currentIndex={lightboxIndex}
            onClose={closeLightbox}
            onNext={showNextPhoto}
            onPrev={showPrevPhoto}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        <GuestTrackerModal isOpen={isTrackerOpen} onClose={() => setIsTrackerOpen(false)} />
      </Suspense>
    </>
  );
};
