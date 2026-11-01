import './Modal.css';
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useScrollLock } from '../../../hooks/useScrollLock';
import { useFocusTrap } from '../../../hooks/useFocusTrap';

export interface ModalProps {
  /** Called on Escape, backdrop click (unless disabled) and by close buttons. */
  onClose: () => void;
  /** Accessible name for the dialog. */
  ariaLabel: string;
  /** Overlay (backdrop) element id / classes / inline style — each modal keeps its own look. */
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  /** Extra key handling (e.g. lightbox arrow keys). Runs before Escape handling. */
  onKeyDown?: (e: KeyboardEvent) => void;
  /** Touch handlers on the overlay (e.g. swipe navigation). */
  onTouchStart?: React.TouchEventHandler<HTMLDivElement>;
  onTouchEnd?: React.TouchEventHandler<HTMLDivElement>;
  children: React.ReactNode;
}

/**
 * Shared modal/overlay foundation.
 *
 * - Rendered through a portal into <body>, so no ancestor transform, overflow
 *   or z-index context can clip or mis-position it (notably on iOS Safari).
 * - Locks background scrolling (iOS-safe, restores the scroll position).
 * - Escape closes; backdrop click closes; focus is trapped inside and
 *   restored to the opener on close.
 * - Visual styling (incl. safe-area padding) stays in the
 *   feature's own stylesheet, keyed on `id` / `className`.
 *
 * Mount it only while the modal is open (`{open && <Modal …/>}`).
 */
export const Modal: React.FC<ModalProps> = ({
  onClose,
  ariaLabel,
  id,
  className,
  style,
  closeOnBackdrop = true,
  closeOnEscape = true,
  onKeyDown,
  onTouchStart,
  onTouchEnd,
  children,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const handlersRef = useRef({ onClose, onKeyDown, closeOnEscape });
  handlersRef.current = { onClose, onKeyDown, closeOnEscape };

  useScrollLock(true);
  useFocusTrap(overlayRef, true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { onClose: close, onKeyDown: extra, closeOnEscape: escapes } = handlersRef.current;
      extra?.(e);
      if (escapes && e.key === 'Escape' && !e.defaultPrevented) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return createPortal(
    <div
      ref={overlayRef}
      id={id}
      className={className ? `modal-overlay ${className}` : 'modal-overlay'}
      style={style}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      tabIndex={-1}
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </div>,
    document.body
  );
};
