import React from 'react';
import { getInitials } from '../../utils/text';

interface WishPhotoProps {
  name: string;
  photoUrl?: string;
  failed: boolean;
  onError: () => void;
  imgClassName: string;
  /** Monogram wrapper / ring classes for the no-photo fallback. */
  monogramClassName: string;
  ringClassName: string;
  lazy?: boolean;
  /** Hide the monogram from assistive tech (cards; the modal keeps it). */
  monogramHidden?: boolean;
}

/** Guest photo with a monogram fallback when missing or failed to load. */
export const WishPhoto: React.FC<WishPhotoProps> = ({
  name,
  photoUrl,
  failed,
  onError,
  imgClassName,
  monogramClassName,
  ringClassName,
  lazy,
  monogramHidden,
}) =>
  photoUrl && !failed ? (
    <img
      src={photoUrl}
      alt={`Photo shared by ${name}`}
      className={imgClassName}
      loading={lazy ? 'lazy' : undefined}
      onError={onError}
    />
  ) : (
    <div className={monogramClassName} aria-hidden={monogramHidden || undefined}>
      <span className={ringClassName}>{getInitials(name)}</span>
    </div>
  );
