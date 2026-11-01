import React from 'react';

interface WishStampProps {
  weddingAttending?: boolean;
  receptionAttending?: boolean;
}

/** Postage-stamp badge showing which celebration(s) the guest is attending. */
export const WishStamp: React.FC<WishStampProps> = ({ weddingAttending, receptionAttending }) => {
  const showBoth = !weddingAttending && !receptionAttending;
  return (
    <div className="postcard-stamp" aria-hidden="true">
      {(weddingAttending || showBoth) && <span>29 NOV</span>}
      {((weddingAttending && receptionAttending) || showBoth) && <span className="stamp-seal">♥</span>}
      {(receptionAttending || showBoth) && <span>06 DEC</span>}
    </div>
  );
};
