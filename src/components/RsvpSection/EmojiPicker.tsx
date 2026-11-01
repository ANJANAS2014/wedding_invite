import React, { useEffect, useRef, useState } from 'react';

const EMOJIS = [
  '❤️', '💍', '🥂', '✨', '🌸', '🕊️', '🎉', '💖',
  '💐', '🍾', '🥳', '🌟', '💌', '🌿', '🥰', '🙏',
  '😍', '🤗', '🍀', '🎊', '💞', '🌷', '🤩', '🎂',
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  /** Rendered beside the trigger inside the same toolbar row (e.g. char counter). */
  children?: React.ReactNode;
}

/** "Add Emoji" dropdown in the RSVP wish toolbar; closes on outside click. */
export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, children }) => {
  const [open, setOpen] = useState<boolean>(false);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="rsvp-toolbar-row" ref={rowRef}>
      <div className="emoji-picker-wrapper">
        <button
          type="button"
          className="emoji-trigger-btn"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Add emoji"
        >
          <span className="emoji-trigger-icon">😊</span>
          <span>Add Emoji</span>
        </button>

        {open && (
          <div className="emoji-dropdown-panel" role="region" aria-label="Emoji selection grid">
            <div className="emoji-grid-header">Choose an emoji</div>
            <div className="emoji-grid">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="emoji-grid-item"
                  onClick={() => {
                    onSelect(emoji);
                    setOpen(false);
                  }}
                  aria-label={`Insert emoji ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {children}
    </div>
  );
};
