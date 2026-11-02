import './RsvpSection.css';
import React, { useEffect, useRef, useState } from 'react';
import type { RsvpRecord } from '../../types';
import { MAX_GUESTS_PER_EVENT, MAX_WISH_CHARS, submitRsvp, validateRsvp } from '../../services/rsvpService';
import { readFileAsDataUrl, validatePhoto } from '../../services/photoUploadService';
import { HeaderRule } from '../shared/HeaderRule/HeaderRule';
import { NextTeaser } from '../ScrollGuide/NextTeaser';
import { haptic } from '../../utils/haptics';
import { prefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { RsvpEventCard } from './RsvpEventCard';
import { EmojiPicker } from './EmojiPicker';
import { RsvpConfirmation } from './RsvpConfirmation';
import { burstPetals } from '../FallingPetals/FallingPetals';

interface RsvpSectionProps {
  guestName: string;
  inviteToken: string;
  maxGuests?: number;
  onSubmittedSuccess?: (rsvp: RsvpRecord) => void;
}

/** `answer` stays null until the guest picks "Yes" or "Sorry" for that celebration. */
interface EventAnswer {
  answer: 'yes' | 'no' | null;
  count: number;
}

const UNANSWERED: EventAnswer = { answer: null, count: 1 };
const BOTH_REQUIRED_MESSAGE = 'Please choose Yes or Sorry for both celebrations.';

export const RsvpSection: React.FC<RsvpSectionProps> = ({
  guestName: initialGuestName,
  inviteToken,
  maxGuests = MAX_GUESTS_PER_EVENT,
  onSubmittedSuccess,
}) => {
  const [name, setName] = useState<string>(initialGuestName || '');
  const [wedding, setWedding] = useState<EventAnswer>(UNANSWERED);
  const [reception, setReception] = useState<EventAnswer>(UNANSWERED);
  const bothAnswered = wedding.answer !== null && reception.answer !== null;
  const [wishes, setWishes] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [submittedData, setSubmittedData] = useState<RsvpRecord | null>(null);
  // Wax-seal sequence after a successful submit: 0 idle · 1 form folds · 2 envelope in
  // · 3 flap closes · 4 seal stamps · 5 envelope flies off (then the summary shows)
  const [sealStage, setSealStage] = useState<number>(0);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const sealTimers = useRef<number[]>([]);
  useEffect(() => () => sealTimers.current.forEach((t) => window.clearTimeout(t)), []);
  // keep the envelope in view once it replaces the (taller) form
  useEffect(() => {
    if (sealStage === 2) envelopeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [sealStage]);

  // The fold / envelope / flap stages play while the RSVP is still saving, so the
  // guest sees progress immediately; the seal only stamps once the save succeeds.
  const sealStartedAt = useRef<number>(0);
  const at = (ms: number, fn: () => void) => sealTimers.current.push(window.setTimeout(fn, ms));
  const clearSealTimers = () => {
    sealTimers.current.forEach((t) => window.clearTimeout(t));
    sealTimers.current = [];
  };

  const startSealSequence = () => {
    if (prefersReducedMotion()) return;
    clearSealTimers();
    sealStartedAt.current = Date.now();
    setSealStage(1);
    at(700, () => setSealStage(2));
    at(1350, () => setSealStage(3));
  };

  const finishSealSequence = (record: RsvpRecord) => {
    if (prefersReducedMotion()) {
      setSubmittedData(record);
      burstPetals(null, 30);
      return;
    }
    const wait = Math.max(0, 2000 - (Date.now() - sealStartedAt.current));
    at(wait, () => {
      setSealStage(4);
      haptic(10);
    });
    at(wait + 700, () => {
      burstPetals(envelopeRef.current, 46);
      setSealStage(5);
    });
    at(wait + 1700, () => {
      setSealStage(0);
      setSubmittedData(record);
      document.getElementById('rsvp')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  };

  /** Save failed: unfold back to the form so the guest can retry. */
  const cancelSealSequence = () => {
    clearSealTimers();
    setSealStage(0);
  };

  // "Yes" starts at 1 guest (or keeps the chosen count); "Sorry" clears it.
  const answerEvent = (setter: React.Dispatch<React.SetStateAction<EventAnswer>>) => (answer: 'yes' | 'no') => {
    haptic(8);
    setErrorMessage('');
    setter((prev) => ({ answer, count: answer === 'yes' ? Math.max(1, prev.count) : 1 }));
  };

  const stepEvent = (setter: React.Dispatch<React.SetStateAction<EventAnswer>>) => (step: number) => {
    haptic(5);
    setter((prev) => ({ ...prev, count: Math.max(1, Math.min(maxGuests, prev.count + step)) }));
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    const file = e.target.files?.[0];
    if (!file) return;
    const error = validatePhoto(file);
    if (error) {
      setErrorMessage(error);
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(await readFileAsDataUrl(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
  };

  const handleSelectEmoji = (emoji: string) => {
    if ((wishes + emoji).length <= MAX_WISH_CHARS) setWishes((prev) => prev + emoji);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage('');

    const values = {
      name,
      weddingAttending: wedding.answer === 'yes',
      weddingGuestCount: wedding.count,
      receptionAttending: reception.answer === 'yes',
      receptionGuestCount: reception.count,
      wishes,
    };
    const validationError = validateRsvp(values) ?? (bothAnswered ? null : BOTH_REQUIRED_MESSAGE);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    haptic(15);
    setIsSubmitting(true);
    startSealSequence();
    try {
      const record = await submitRsvp(values, { inviteToken, photoFile, photoPreview });
      onSubmittedSuccess?.(record);
      finishSealSequence(record);
    } catch (error) {
      cancelSealSequence();
      setErrorMessage(
        error instanceof Error && error.message ? error.message : "We couldn't send your response just yet. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rs rd-sec rd-dark" id="s5">
      <div className="rd-wrap" id="rsvp">
        <header className="rd-head reveal">
          <span className="rd-kicker">RSVP</span>
          <h2>Will you be celebrating with us?</h2>
          <HeaderRule />
        </header>

        {sealStage >= 2 && (
          <div className={`rs-envst s${sealStage}`} aria-hidden="true">
            <div className="rs-fly">
            <div className="rs-env" ref={envelopeRef}>
              <div className="rs-env-back" />
              <div className="rs-env-letter" />
              <div className="rs-env-pocket" />
              <div className="rs-env-flap" />
              <div className="rs-env-seal">
                <span>L&amp;A</span>
              </div>
            </div>
            </div>
          </div>
        )}

        {submittedData ? (
          <RsvpConfirmation rsvp={submittedData} onEdit={() => setSubmittedData(null)} />
        ) : (
          <form
            className={`rs-reply rsvp-upgrade-form ${sealStage === 1 ? 'is-folding' : ''}`}
            onSubmit={handleSubmit}
            noValidate
            hidden={sealStage >= 2}
          >
            {initialGuestName && (
              <p className="rsvp-seat">
                <b>{initialGuestName}</b>, we’ve saved a seat for you.
              </p>
            )}

            {/* Step 1 — guest name (pre-filled from a personal link) */}
            <div className="rs-block">
              <p className="rs-step" id="rsvp-step-1">
                <span className="rs-n" aria-hidden="true">1</span>
                <label htmlFor="rsvp-name"><b>Your name *</b></label>
              </p>
              <input
                id="rsvp-name"
                name="name"
                type="text"
                className="rs-field"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMessage('');
                }}
                maxLength={120}
                required
                aria-invalid={errorMessage === 'Please enter your name.' || undefined}
              />
            </div>

            {/* Step 2 — Yes / Sorry for each celebration */}
            <div className="rs-block">
              <p className="rs-step">
                <span className="rs-n" aria-hidden="true">2</span>
                <b>Will you be joining us?</b>
                <em>Choose for each celebration</em>
              </p>
              <div className="rsvp-events-grid">
                <RsvpEventCard
                  eventKey="wedding"
                  tag="OUR WEDDING"
                  dateLabel="29 November 2026"
                  answer={wedding.answer}
                  guestCount={wedding.count}
                  maxGuests={maxGuests}
                  onAnswer={answerEvent(setWedding)}
                  onStep={stepEvent(setWedding)}
                />
                <RsvpEventCard
                  eventKey="reception"
                  tag="OUR RECEPTION"
                  dateLabel="6 December 2026"
                  answer={reception.answer}
                  guestCount={reception.count}
                  maxGuests={maxGuests}
                  onAnswer={answerEvent(setReception)}
                  onStep={stepEvent(setReception)}
                />
              </div>
            </div>

            {/* Step 3 — optional wish, photo and emoji */}
            <div className="rs-block rsvp-wishes-section">
              <p className="rs-step">
                <span className="rs-n" aria-hidden="true">3</span>
                <label htmlFor="rsvp-wishes"><b>A little wish for us</b></label>
                <em>Optional · it will appear on our Wishes Wall</em>
              </p>
              <textarea
                id="rsvp-wishes"
                name="wishes"
                className="rs-field rs-textarea"
                rows={3}
                placeholder="Leave us a little message or your blessings..."
                value={wishes}
                onChange={(e) => setWishes(e.target.value)}
                maxLength={MAX_WISH_CHARS}
              />
              <input
                id="rsvp-photo-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                hidden
              />
              {photoPreview && (
                <div className="rsvp-inline-preview">
                  <img src={photoPreview} alt="Attached photo" className="rsvp-inline-preview-img" />
                  <button type="button" className="rd-btn rd-btn--line rsvp-remove-photo-btn" onClick={removePhoto}>
                    Remove photo
                  </button>
                </div>
              )}
              <EmojiPicker onSelect={handleSelectEmoji}>
                {!photoPreview && (
                  <label htmlFor="rsvp-photo-input" className="rd-btn rd-btn--line modern-photo-btn" title="Attach a photo with your wish">
                    <span className="photo-btn-icon" aria-hidden="true">📷</span>
                    <span>Add Photo</span>
                  </label>
                )}
                <span className={`char-counter ${wishes.length > MAX_WISH_CHARS ? 'error' : ''}`}>
                  {wishes.length}/{MAX_WISH_CHARS}
                </span>
              </EmojiPicker>
            </div>

            <div className="rsvp-submit-block">
              <p className={`rsvp-submit-hint ${bothAnswered ? '' : 'is-waiting'}`} id="rsvp-submit-hint">
                {bothAnswered ? 'You can change your answer any time.' : 'Answer both celebrations above to send your RSVP.'}
              </p>

              <button
                type="submit"
                className="rd-btn rd-btn--solid rsvp-submit-btn"
                disabled={isSubmitting}
                data-waiting={!bothAnswered || undefined}
                aria-describedby="rsvp-submit-hint"
              >
                {isSubmitting && <span className="rs-spin" aria-hidden="true" />}
                {isSubmitting ? 'Sending with love…' : 'Send my RSVP ❤️'}
              </button>

              {errorMessage && (
                <div className="rsvp-error-alert" role="alert">
                  {errorMessage}
                </div>
              )}
            </div>
          </form>
        )}
        <NextTeaser label="Next: blessings from our people" targetId="wishes" tone="light" />
      </div>
    </section>
  );
};
