import './App.css';
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { UNIFIED_MEMORIES } from '../data/weddingData';
import { CoverHero } from '../components/CoverHero/CoverHero';
import { LotusCurtain } from '../components/LotusCurtain/LotusCurtain';
import { MusicPlayer } from '../components/MusicPlayer/MusicPlayer';
import { InvitationIntroSection } from '../components/InvitationIntroSection/InvitationIntroSection';
import { FallingPetals } from '../components/FallingPetals/FallingPetals';
import { Footer } from '../components/Footer/Footer';
import { useInvitationParams } from '../hooks/useInvitationParams';
import { useInvitationOpening } from '../hooks/useInvitationOpening';
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
 * Application composition: cover → curtain → invitation sections, plus the
 * global overlays (music control, lightbox, guest tracker).
 * Feature logic lives in the components, hooks and services it composes.
 */
export const App: React.FC = () => {
  const { guestName, inviteToken, language, openTracker } = useInvitationParams();
  const { isOpened, curtainStatus, openInvitation, handleCurtainParted } = useInvitationOpening();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);
  const [wishesRefreshKey, setWishesRefreshKey] = useState<number>(0);

  useEffect(() => prefetchSections(), []);

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

      {!isOpened && <CoverHero onOpen={openInvitation} guestName={guestName} language={language} />}

      <LotusCurtain status={curtainStatus} onParted={handleCurtainParted} />

      <main id="main">
        {/* Introduction & blessing */}
        <InvitationIntroSection language={language} />

        <Suspense fallback={null}>
          <EventsSection />
        </Suspense>

        <Suspense fallback={null}>
          <CoupleSection />
        </Suspense>

        <Suspense fallback={null}>
          <OurStoryAndFilmstripSection onOpenLightbox={setLightboxIndex} />
        </Suspense>

        <Suspense fallback={null}>
          <RsvpSection
            guestName={guestName}
            inviteToken={inviteToken}
            onSubmittedSuccess={() => setWishesRefreshKey((prev) => prev + 1)}
          />
        </Suspense>

        <Suspense fallback={null}>
          <WishesWall refreshKey={wishesRefreshKey} />
        </Suspense>

        <Footer />
      </main>

      <MusicPlayer />

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
