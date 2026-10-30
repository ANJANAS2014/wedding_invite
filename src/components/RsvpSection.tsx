import React, { useState, useRef, useEffect } from 'react';

interface RsvpSectionProps {
  guestName: string;
  inviteToken: string;
  maxGuests?: number;
  onSubmittedSuccess?: (rsvp: RsvpRecord) => void;
}

export interface RsvpRecord {
  id?: string;
  name: string;
  weddingAttending: boolean;
  weddingGuestCount: number;
  receptionAttending: boolean;
  receptionGuestCount: number;
  wishes: string;
  inviteToken?: string;
  photoPath?: string;
  photoPreview?: string;
  submittedAt: string;
}

const LOCAL_STORAGE_KEY = 'wedding_rsvps_v2';
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_WISH_CHARS = 200;

const WIDE_EMOJIS = [
  '❤️', '💍', '🥂', '✨', '🌸', '🕊️', '🎉', '💖',
  '💐', '🍾', '🥳', '🌟', '💌', '🌿', '🥰', '🙏',
  '😍', '🤗', '🍀', '🎊', '💞', '🌷', '🤩', '🎂'
];

export const RsvpSection: React.FC<RsvpSectionProps> = ({
  guestName: initialGuestName,
  inviteToken,
  maxGuests = 10,
  onSubmittedSuccess
}) => {
  const [name, setName] = useState<string>(initialGuestName || '');
  const [weddingAttending, setWeddingAttending] = useState<boolean>(false);
  const [weddingGuestCount, setWeddingGuestCount] = useState<number>(1);
  const [receptionAttending, setReceptionAttending] = useState<boolean>(false);
  const [receptionGuestCount, setReceptionGuestCount] = useState<number>(1);
  const [wishes, setWishes] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [submittedData, setSubmittedData] = useState<RsvpRecord | null>(null);

  // Emoji picker dropdown state
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Close emoji picker on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle wedding selection
  const handleToggleWedding = () => {
    setErrorMessage('');
    if (!weddingAttending) {
      setWeddingAttending(true);
      setWeddingGuestCount(1);
    } else {
      setWeddingAttending(false);
      setWeddingGuestCount(0);
    }
  };

  // Toggle reception selection
  const handleToggleReception = () => {
    setErrorMessage('');
    if (!receptionAttending) {
      setReceptionAttending(true);
      setReceptionGuestCount(1);
    } else {
      setReceptionAttending(false);
      setReceptionGuestCount(0);
    }
  };

  // Stepper handlers
  const handleStepWedding = (step: number) => {
    setWeddingGuestCount((prev) => Math.max(1, Math.min(maxGuests, prev + step)));
  };

  const handleStepReception = (step: number) => {
    setReceptionGuestCount((prev) => Math.max(1, Math.min(maxGuests, prev + step)));
  };

  // Handle Photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Please choose a valid JPG, PNG or WebP photo.');
      return;
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setErrorMessage('Please choose a photo smaller than 5 MB.');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string || '');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectEmoji = (emoji: string) => {
    if ((wishes + emoji).length <= MAX_WISH_CHARS) {
      setWishes((prev) => prev + emoji);
    }
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setErrorMessage('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Please enter your name.');
      return;
    }

    if (!weddingAttending && !receptionAttending) {
      setErrorMessage('Please select at least one celebration to attend, or let us know if you cannot make it.');
      return;
    }

    const trimmedWishes = wishes.trim();
    if (trimmedWishes.length > MAX_WISH_CHARS) {
      setErrorMessage(`Wish message cannot exceed ${MAX_WISH_CHARS} characters.`);
      return;
    }

    setIsSubmitting(true);

    const submissionId = crypto.randomUUID ? crypto.randomUUID() : `rsvp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    let photoPath = '';
    let photoSize = 0;

    try {
      if (photoFile) {
        try {
          const presignRes = await fetch('/.netlify/functions/rsvp-photo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              submissionId,
              contentType: photoFile.type,
              size: photoFile.size
            })
          });

          if (presignRes.ok) {
            const presignData = await presignRes.json();
            if (presignData && presignData.ok && presignData.uploadUrl && presignData.path) {
              const uploadRes = await fetch(presignData.uploadUrl, {
                method: 'PUT',
                headers: { 'Content-Type': photoFile.type },
                body: photoFile
              });

              if (uploadRes.ok) {
                photoPath = presignData.path;
                photoSize = photoFile.size;
              }
            }
          }
        } catch {
          // Photo upload fallback
        }
      }

      const submissionPayload: RsvpRecord = {
        id: submissionId,
        name: trimmedName,
        weddingAttending,
        weddingGuestCount: weddingAttending ? weddingGuestCount : 0,
        receptionAttending,
        receptionGuestCount: receptionAttending ? receptionGuestCount : 0,
        wishes: trimmedWishes,
        inviteToken: inviteToken || undefined,
        photoPath: photoPath || undefined,
        photoPreview: photoPreview || undefined,
        submittedAt: new Date().toISOString()
      };

      try {
        const res = await fetch('/.netlify/functions/rsvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name: submissionPayload.name,
            weddingAttendance: weddingAttending ? 'attending' : 'declined',
            weddingGuestCount: submissionPayload.weddingGuestCount,
            receptionAttendance: receptionAttending ? 'attending' : 'declined',
            receptionGuestCount: submissionPayload.receptionGuestCount,
            wishes: submissionPayload.wishes,
            invite: inviteToken || undefined,
            submissionId: submissionPayload.id,
            photoPath: photoPath || undefined,
            photoSize: photoSize || undefined
          })
        });

        if (res.ok) {
          await res.json().catch(() => null);
        }
      } catch {
        // Backend offline
      }

      try {
        const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
        const updated = Array.isArray(stored) ? stored.filter((item: RsvpRecord) => item.name !== trimmedName) : [];
        updated.push(submissionPayload);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }

      setSubmittedData(submissionPayload);
      if (onSubmittedSuccess) {
        onSubmittedSuccess(submissionPayload);
      }
    } catch {
      setErrorMessage("We couldn't send your response just yet. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditResponse = () => {
    setSubmittedData(null);
  };

  return (
    <section className="mar" id="s5">
      <div className="sec rv in" id="rsvp">
        <div className="eyebrow">RSVP</div>
        <h2>Will you be celebrating with us?</h2>
        <div className="div">
          <svg viewBox="-50 -50 100 100" className="man">
            {Array.from({ length: 8 }, (_, i) => (
              <ellipse key={i} rx="4" ry="22" cy="-26" transform={`rotate(${(i * 360) / 8})`} />
            ))}
            <circle r="2" style={{ fill: 'var(--gold)' }} />
          </svg>
        </div>

        {submittedData ? (
          <div className="rsvp-confirmation-panel" role="alert">
            <span className="rsvp-conf-heart" aria-hidden="true">♥</span>
            <h3>Thank you!</h3>
            <p className="conf-sub">
              Your response has been received. We look forward to celebrating with you.
            </p>

            <ul className="rsvp-summary-list">
              <li>
                <span>Our Wedding · 29 Nov</span>
                <b>
                  {submittedData.weddingAttending
                    ? `Attending · ${submittedData.weddingGuestCount} ${submittedData.weddingGuestCount === 1 ? 'guest' : 'guests'}`
                    : 'Not attending'}
                </b>
              </li>
              <li>
                <span>Our Reception · 6 Dec</span>
                <b>
                  {submittedData.receptionAttending
                    ? `Attending · ${submittedData.receptionGuestCount} ${submittedData.receptionGuestCount === 1 ? 'guest' : 'guests'}`
                    : 'Not attending'}
                </b>
              </li>
              {submittedData.wishes && (
                <li>
                  <span>Your Message</span>
                  <b style={{ fontStyle: 'italic', maxWidth: '200px', textAlign: 'right' }}>
                    “{submittedData.wishes}”
                  </b>
                </li>
              )}
              {submittedData.photoPreview && (
                <li>
                  <span>Shared Photo</span>
                  <img
                    src={submittedData.photoPreview}
                    alt="Shared RSVP photo"
                    style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--gold)' }}
                  />
                </li>
              )}
            </ul>

            <p className="rsvp-conf-signoff">
              With love, Anjana &amp; Lalith
            </p>

            <button
              type="button"
              className="btn o"
              onClick={handleEditResponse}
              style={{ marginTop: '8px' }}
            >
              Change my response
            </button>
          </div>
        ) : (
          <form className="rsvp-upgrade-form" onSubmit={handleSubmit} noValidate>
            {/* Guest Name & Chip */}
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

            {/* Event Cards Grid */}
            <div className="rsvp-events-grid">
              {/* Wedding Event Card */}
              <div className={`rsvp-card ${weddingAttending ? 'is-attending' : ''}`}>
                <div className="rsvp-card-tag">OUR WEDDING</div>
                <div className="rsvp-card-date">29 November 2026</div>
                <div className="rsvp-card-prompt">Will you be there?</div>

                <button
                  type="button"
                  className={`rsvp-attend-toggle ${weddingAttending ? 'active' : ''}`}
                  onClick={handleToggleWedding}
                  aria-pressed={weddingAttending}
                >
                  <span>{weddingAttending ? '✓' : '❤️'}</span>
                  <span>Yes, will be there</span>
                </button>

                {weddingAttending && (
                  <div className="rsvp-stepper-box">
                    <span className="rsvp-stepper-label">Guests (including you)</span>
                    <div className="rsvp-stepper">
                      <button
                        type="button"
                        className="rsvp-step-btn"
                        onClick={() => handleStepWedding(-1)}
                        disabled={weddingGuestCount <= 1}
                        aria-label="Decrease wedding guests"
                      >
                        −
                      </button>
                      <span className="rsvp-count-display">{weddingGuestCount}</span>
                      <button
                        type="button"
                        className="rsvp-step-btn"
                        onClick={() => handleStepWedding(1)}
                        disabled={weddingGuestCount >= maxGuests}
                        aria-label="Increase wedding guests"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Reception Event Card */}
              <div className={`rsvp-card ${receptionAttending ? 'is-attending' : ''}`}>
                <div className="rsvp-card-tag">OUR RECEPTION</div>
                <div className="rsvp-card-date">6 December 2026</div>
                <div className="rsvp-card-prompt">Will you be there?</div>

                <button
                  type="button"
                  className={`rsvp-attend-toggle ${receptionAttending ? 'active' : ''}`}
                  onClick={handleToggleReception}
                  aria-pressed={receptionAttending}
                >
                  <span>{receptionAttending ? '✓' : '❤️'}</span>
                  <span>Yes, will be there</span>
                </button>

                {receptionAttending && (
                  <div className="rsvp-stepper-box">
                    <span className="rsvp-stepper-label">Guests (including you)</span>
                    <div className="rsvp-stepper">
                      <button
                        type="button"
                        className="rsvp-step-btn"
                        onClick={() => handleStepReception(-1)}
                        disabled={receptionGuestCount <= 1}
                        aria-label="Decrease reception guests"
                      >
                        −
                      </button>
                      <span className="rsvp-count-display">{receptionGuestCount}</span>
                      <button
                        type="button"
                        className="rsvp-step-btn"
                        onClick={() => handleStepReception(1)}
                        disabled={receptionGuestCount >= maxGuests}
                        aria-label="Increase reception guests"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Wishes and personal message with modern Add Photo button & emoji selector */}
            <div className="rsvp-wishes-section">
              <div className="rsvp-wishes-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label htmlFor="rsvp-wishes" className="rsvp-wishes-heading" style={{ margin: 0 }}>
                  A little wish for us ❤️
                </label>
                
                <div className="rsvp-camera-upload-container">
                  <input
                    id="rsvp-photo-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoSelect}
                    style={{ display: 'none' }}
                  />
                  {photoPreview ? (
                    <div className="rsvp-inline-preview" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <img src={photoPreview} alt="Attached photo" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--gold)' }} />
                      <button
                        type="button"
                        onClick={() => { setPhotoFile(null); setPhotoPreview(''); }}
                        style={{ background: 'none', border: 'none', color: '#ff9e9e', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}
                      >
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

              <div style={{ position: 'relative' }}>
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

              <div className="rsvp-toolbar-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', position: 'relative' }} ref={emojiPickerRef}>
                <div className="emoji-picker-wrapper">
                  <button
                    type="button"
                    className="emoji-trigger-btn"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    aria-expanded={showEmojiPicker}
                    aria-label="Add emoji"
                  >
                    <span style={{ fontSize: '15px' }}>😊</span>
                    <span>Add Emoji</span>
                  </button>

                  {showEmojiPicker && (
                    <div className="emoji-dropdown-panel" role="region" aria-label="Emoji selection grid">
                      <div className="emoji-grid-header">Choose an emoji</div>
                      <div className="emoji-grid">
                        {WIDE_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            className="emoji-grid-item"
                            onClick={() => handleSelectEmoji(emoji)}
                            aria-label={`Insert emoji ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <span className={`char-counter ${wishes.length > MAX_WISH_CHARS ? 'error' : ''}`} style={{ color: wishes.length > MAX_WISH_CHARS ? '#ff8080' : '#d6b25a', fontSize: '11px', letterSpacing: '.05em' }}>
                  {wishes.length}/{MAX_WISH_CHARS}
                </span>
              </div>
            </div>

            {/* Subtle instruction & Single submission button */}
            <div className="rsvp-submit-block">
              <p className="rsvp-submit-hint">
                Your responses for both celebrations will be submitted together.
              </p>

              <button
                type="submit"
                className="btn rsvp-submit-btn"
                disabled={isSubmitting}
              >
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
