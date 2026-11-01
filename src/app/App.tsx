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
import { useInvitationOpening } from '../hooks/useInvitationOpening';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { duckMusic } from '../utils/musicEvents';
import {
  CoupleSection,
  EventDayNotice,
  EventsSection,
  GuestTrackerModal,
  LightboxModal,
  OurStoryAndFilmstripSection,
  RsvpSection,
  TeamPicker,
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
  const { doorStatus, openInvitation, skipOpening } = useInvitationOpening();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);
  const [wishesRefreshKey, setWishesRefreshKey] = useState<number>(0);

  useEffect(() => prefetchSections(), []);
  useScrollReveal('#main');

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
      <TempleDoors status={doorStatus} language={language} onOpen={openInvitation} onSkip={skipOpening} />

      <main id="main">
        {/* Page 2: cover — greeting, names and the invitation words */}
        <CoverHero guestName={guestName} language={language} />

        <div className="kasavu" aria-hidden="true" />

        <Suspense fallback={null}>
          <TeamPicker guestName={guestName} inviteToken={inviteToken} />
        </Suspense>

        <div className="kasavu" aria-hidden="true" />

        <Suspense fallback={null}>
          <CoupleSection />
        </Suspense>

        <div className="kasavu" aria-hidden="true" />

        <Suspense fallback={null}>
          <OurStoryAndFilmstripSection onOpenLightbox={setLightboxIndex} />
        </Suspense>

        <div className="kasavu" aria-hidden="true" />

        <Suspense fallback={null}>
          <EventsSection />
        </Suspense>

        <div className="kasavu" aria-hidden="true" />

        <Suspense fallback={null}>
          <RsvpSection
            guestName={guestName}
            inviteToken={inviteToken}
            onSubmittedSuccess={() => setWishesRefreshKey((prev) => prev + 1)}
          />
        </Suspense>

        <div className="kasavu" aria-hidden="true" />

        <Suspense fallback={null}>
          <WishesWall refreshKey={wishesRefreshKey} />
        </Suspense>

        <Footer />
      </main>

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
