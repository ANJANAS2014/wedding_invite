import './RsvpSection.css';
import React, { useState } from 'react';
import type { RsvpRecord } from '../../types';
import { MAX_GUESTS_PER_EVENT, MAX_WISH_CHARS, submitRsvp, validateRsvp } from '../../services/rsvpService';
import { readFileAsDataUrl, validatePhoto } from '../../services/photoUploadService';
import { MandalaDivider } from '../shared/MandalaDivider/MandalaDivider';
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

interface EventAnswer {
  attending: boolean;
  count: number;
}

const NOT_ATTENDING: EventAnswer = { attending: false, count: 1 };

export const RsvpSection: React.FC<RsvpSectionProps> = ({
  guestName: initialGuestName,
  inviteToken,
  maxGuests = MAX_GUESTS_PER_EVENT,
  onSubmittedSuccess,
}) => {
  const [name, setName] = useState<string>(initialGuestName || '');
  const [wedding, setWedding] = useState<EventAnswer>(NOT_ATTENDING);
  const [reception, setReception] = useState<EventAnswer>(NOT_ATTENDING);
  const [wishes, setWishes] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [submittedData, setSubmittedData] = useState<RsvpRecord | null>(null);

  // Selecting an event starts at 1 guest; deselecting clears the count.
  const toggleEvent = (setter: React.Dispatch<React.SetStateAction<EventAnswer>>) => () => {
    setErrorMessage('');
    setter((prev) => (prev.attending ? { attending: false, count: 0 } : { attending: true, count: 1 }));
  };

  const stepEvent = (setter: React.Dispatch<React.SetStateAction<EventAnswer>>) => (step: number) =>
    setter((prev) => ({ ...prev, count: Math.max(1, Math.min(maxGuests, prev.count + step)) }));

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
      weddingAttending: wedding.attending,
      weddingGuestCount: wedding.count,
      receptionAttending: reception.attending,
      receptionGuestCount: reception.count,
      wishes,
    };
    const validationError = validateRsvp(values);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const submitBtn = document.activeElement;
    setIsSubmitting(true);
    try {
      const record = await submitRsvp(values, { inviteToken, photoFile, photoPreview });
      setSubmittedData(record);
      onSubmittedSuccess?.(record);
      burstPetals(submitBtn);
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message ? error.message : "We couldn't send your response just yet. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mar" id="s5">
      <div className="sec" id="rsvp">
        <div className="eyebrow">RSVP</div>
        <h2>Will you be celebrating with us?</h2>
        <MandalaDivider />

        {submittedData ? (
          <RsvpConfirmation rsvp={submittedData} onEdit={() => setSubmittedData(null)} />
        ) : (
          <form className="rsvp-upgrade-form" onSubmit={handleSubmit} noValidate>
            {/* Guest name (pre-filled from a personal link) */}
            <div className="rsvp-name-block">
              {inviteToken && initialGuestName && (
                <div className="rsvp-guest-chip">
                  Replying to the invitation for <b>{initialGuestName}</b>
                </div>
              )}
              <input
                id="rsvp-name"
                name="name"
                type="text"
                className="rsvp-input"
                placeholder="Your name *"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMessage('');
                }}
                maxLength={120}
                required
              />
            </div>

            <div className="rsvp-events-grid">
              <RsvpEventCard
                eventKey="wedding"
                tag="OUR WEDDING"
                dateLabel="29 November 2026"
                attending={wedding.attending}
                guestCount={wedding.count}
                maxGuests={maxGuests}
                onToggle={toggleEvent(setWedding)}
                onStep={stepEvent(setWedding)}
              />
              <RsvpEventCard
                eventKey="reception"
                tag="OUR RECEPTION"
                dateLabel="6 December 2026"
                attending={reception.attending}
                guestCount={reception.count}
                maxGuests={maxGuests}
                onToggle={toggleEvent(setReception)}
                onStep={stepEvent(setReception)}
              />
            </div>

            {/* Optional wish, photo and emoji */}
            <div className="rsvp-wishes-section">
              <div className="rsvp-wishes-header-row">
                <label htmlFor="rsvp-wishes" className="rsvp-wishes-heading">
                  A little wish for us ❤️
                </label>

                <div className="rsvp-camera-upload-container">
                  <input
                    id="rsvp-photo-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoSelect}
                    hidden
                  />
                  {photoPreview ? (
                    <div className="rsvp-inline-preview">
                      <img src={photoPreview} alt="Attached photo" className="rsvp-inline-preview-img" />
                      <button type="button" className="rsvp-remove-photo-btn" onClick={removePhoto}>
                        Remove photo
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="rsvp-photo-input" className="modern-photo-btn" title="Attach a photo with your wish">
                      <span className="photo-btn-icon">📷</span>
                      <span>Add Photo</span>
                    </label>
                  )}
                </div>
              </div>

              <div className="rsvp-textarea-wrap">
                <textarea
                  id="rsvp-wishes"
                  name="wishes"
                  className="rsvp-textarea"
                  rows={3}
                  placeholder="Leave us a little message or your blessings..."
                  value={wishes}
                  onChange={(e) => setWishes(e.target.value)}
                  maxLength={MAX_WISH_CHARS}
                />
              </div>

              <EmojiPicker onSelect={handleSelectEmoji}>
                <span className={`char-counter ${wishes.length > MAX_WISH_CHARS ? 'error' : ''}`}>
                  {wishes.length}/{MAX_WISH_CHARS}
                </span>
              </EmojiPicker>
            </div>

            <div className="rsvp-submit-block">
              <p className="rsvp-submit-hint">Your responses for both celebrations will be submitted together.</p>

              <button type="submit" className="btn rsvp-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Sending with love…' : 'Send with Love ❤️'}
              </button>

              {errorMessage && (
                <div className="rsvp-error-alert" role="alert">
                  {errorMessage}
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
