import './TeamPicker.css';
import React, { useEffect, useRef, useState } from 'react';
import { WEDDING_CONTENT } from '../../data/weddingData';
import { HeaderRule } from '../shared/HeaderRule/HeaderRule';
import { burstPetals } from '../FallingPetals/FallingPetals';
import { hapticSoft } from '../../utils/haptics';
import {
  fetchTeamTotals,
  loadTeamSide,
  saveTeamPick,
  type TeamSide,
  type TeamTotals,
} from '../../services/teamService';

interface TeamPickerProps {
  guestName?: string;
  inviteToken?: string;
}

const LABEL: Record<TeamSide, string> = { bride: 'Team Bride', groom: 'Team Groom' };

/**
 * "Are you Team Bride or Team Groom?" — two arched choice cards. The pick is
 * remembered on this device, saved to /api/team (linked to the personal
 * invitation when there is one), and shown as a small pinned badge.
 */
export const TeamPicker: React.FC<TeamPickerProps> = ({ guestName = '', inviteToken = '' }) => {
  const [side, setSide] = useState<TeamSide | null>(() => loadTeamSide());
  const [totals, setTotals] = useState<TeamTotals | null>(null);
  const [toast, setToast] = useState('');
  const [pinVisible, setPinVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const toastTimer = useRef<number>();

  useEffect(() => {
    let alive = true;
    fetchTeamTotals().then((t) => alive && t && setTotals(t));
    return () => {
      alive = false;
      window.clearTimeout(toastTimer.current);
    };
  }, []);

  // The pinned badge appears once the guest has scrolled past the picker.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setPinVisible(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const choose = (next: TeamSide, button: HTMLButtonElement) => {
    if (next === side) return;
    const previous = side;
    setSide(next);
    hapticSoft();
    burstPetals(button, 30);
    setToast(`Welcome to ${LABEL[next]}!`);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 2400);

    // Optimistic tally; replaced by the server's numbers when they arrive.
    setTotals((t) => {
      if (!t) return t;
      const n = { ...t, [next]: t[next] + 1 };
      if (previous) n[previous] = Math.max(0, n[previous] - 1);
      return n;
    });
    saveTeamPick(next, { inviteToken, guestName }).then((t) => t && setTotals(t));
  };

  const firstName = guestName.trim().split(/\s+/)[0] || '';
  const total = totals ? totals.bride + totals.groom : 0;
  const bridePct = total ? Math.round((totals!.bride / total) * 100) : 50;

  return (
    <section className="tp" id="team" ref={sectionRef} aria-labelledby="team-title">
      <header className="tp-head reveal">
        <div className="eyebrow">{firstName ? `${firstName}, before you scroll on` : 'Before you scroll on'}</div>
        <h2 id="team-title">Are you Team Bride or Team Groom?</h2>
        <HeaderRule />
      </header>

      <div className="tp-sides reveal" role="group" aria-label="Choose your side">
        {(['bride', 'groom'] as TeamSide[]).map((s) => (
          <button
            key={s}
            type="button"
            className={`tp-side${side === s ? ' is-on' : ''}`}
            aria-pressed={side === s}
            onClick={(e) => choose(s, e.currentTarget)}
          >
            <span className="tp-tick" aria-hidden="true">✓</span>
            <span className="tp-mono" aria-hidden="true">
              {(s === 'bride' ? WEDDING_CONTENT.bride : WEDDING_CONTENT.groom).charAt(0)}
            </span>
            <b>{LABEL[s]}</b>
            <small>
              {s === 'bride' ? `${WEDDING_CONTENT.bride}'s side · Keralam` : `${WEDDING_CONTENT.groom}'s side · Chennai`}
            </small>
          </button>
        ))}
      </div>

      {totals && total > 0 && (
        <div className="tp-tug reveal" aria-label={`Team Bride ${totals.bride}, Team Groom ${totals.groom}`}>
          <div className="tp-bar">
            <i className="tp-bar-b" style={{ width: `${bridePct}%` }} />
            <i className="tp-bar-g" style={{ width: `${100 - bridePct}%` }} />
          </div>
          <div className="tp-lbls" aria-hidden="true">
            <span>Bride · {totals.bride}</span>
            <span>{totals.groom} · Groom</span>
          </div>
        </div>
      )}

      {side && (
        <p className="tp-note">
          You're on <em>{LABEL[side]}</em>. Changed your mind? Just tap the other side.
        </p>
      )}

      <div className={`tp-toast${toast ? ' is-on' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>

      {side && (
        <a href="#team" className={`tp-pin${pinVisible ? ' is-on' : ''}`} aria-label={`${LABEL[side]} — change your side`}>
          ★ {LABEL[side]}
        </a>
      )}
    </section>
  );
};
