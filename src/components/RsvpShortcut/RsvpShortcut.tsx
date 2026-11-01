import './RsvpShortcut.css';
import React, { useEffect, useState } from 'react';

const onScreen = (el: Element | null) => {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
};

/**
 * Floating gold "RSVP" button. Appears once the cover has scrolled away and
 * hides while the RSVP section, the story cards or the "Write your own wish"
 * link are on screen.
 */
export const RsvpShortcut: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      if (!document.body.classList.contains('opened')) return setVisible(false);
      const hero = document.getElementById('hero');
      const pastCover = hero ? hero.getBoundingClientRect().bottom < 0 : window.scrollY > window.innerHeight;
      const blocked =
        onScreen(document.getElementById('s5')) ||
        onScreen(document.querySelector('.story-cards')) ||
        onScreen(document.querySelector('.wishes-write'));
      setVisible(pastCover && !blocked);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <a
      className={`rsvp-shortcut ${visible ? 'is-visible' : ''}`}
      href="#s5"
      aria-hidden={!visible || undefined}
      tabIndex={visible ? 0 : -1}
    >
      RSVP
    </a>
  );
};
