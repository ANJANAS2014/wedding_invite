// Team Bride / Team Groom colour themes.
// Sets <html data-team="bride|groom"> (palettes live in styles/variables.css)
// and keeps it in sync with the guest's pick.
import { loadTeamSide, TEAM_CHANGE_EVENT, type TeamChangeDetail, type TeamSide } from '../services/teamService';

const META_COLOR: Record<TeamSide | 'none', string> = { none: '#eae1d8', bride: '#f3dcd8', groom: '#dfe6df' };

type DocWithVT = Document & { startViewTransition?: (cb: () => void) => unknown };

export function applyTeamTheme(side: TeamSide | null, animate = false): void {
  const root = document.documentElement;
  if ((root.dataset.team || null) === side) return;
  const set = () => {
    if (side) root.dataset.team = side;
    else delete root.dataset.team;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[side ?? 'none']);
  };
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const d = document as DocWithVT;
  if (animate && !reduce && typeof d.startViewTransition === 'function') d.startViewTransition(set);
  else set();
}

/** Apply the saved theme immediately (before first paint) and follow later changes. */
export function initTeamTheme(): void {
  applyTeamTheme(loadTeamSide());
  window.addEventListener(TEAM_CHANGE_EVENT, (e) => {
    const d = (e as CustomEvent<TeamChangeDetail>).detail;
    if (d) applyTeamTheme(d.side, true);
  });
}
