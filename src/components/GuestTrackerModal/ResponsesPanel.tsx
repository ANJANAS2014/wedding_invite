import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AdminError,
  type AdminResponse,
  clearAdminKey,
  clearWish,
  deleteResponse,
  fetchResponses,
  loadAdminKey,
  saveAdminKey,
} from '../../services/adminService';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
};

const answer = (a: AdminResponse['wedding']) => (a ? (a.attending ? `Yes · ${a.guestCount}` : 'No') : '—');

type Filter = 'all' | 'wishes' | 'attending' | 'declined';

/**
 * Admin view of the Supabase RSVP table: every response (personal and general
 * links), with totals, search, and delete actions. Protected by the real admin
 * password, which the server checks on every request.
 */
export const ResponsesPanel: React.FC = () => {
  const [adminKey, setAdminKey] = useState<string>(loadAdminKey);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [responses, setResponses] = useState<AdminResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [busyId, setBusyId] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [filter, setFilter] = useState<Filter>('all');

  const handleError = useCallback((error: unknown) => {
    if (error instanceof AdminError && error.status === 401) {
      clearAdminKey();
      setAdminKey('');
      setMessage('Incorrect admin password. Please try again.');
      return;
    }
    setMessage(error instanceof Error ? error.message : 'Something went wrong.');
  }, []);

  const load = useCallback(
    async (key: string) => {
      setIsLoading(true);
      setMessage('');
      try {
        setResponses(await fetchResponses(key));
        saveAdminKey(key);
        setAdminKey(key);
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [handleError]
  );

  useEffect(() => {
    if (adminKey) load(adminKey);
    // only on mount: later loads are explicit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runAction = async (r: AdminResponse, kind: 'delete' | 'clearWish') => {
    const prompt =
      kind === 'delete'
        ? `Delete ${r.name}'s whole RSVP (attendance, wish and photo)? This can't be undone.`
        : `Remove ${r.name}'s wish and photo from the wishes wall? Their RSVP attendance stays.`;
    if (!window.confirm(prompt)) return;
    setBusyId(r.id);
    setMessage('');
    try {
      if (kind === 'delete') {
        await deleteResponse(adminKey, r.id);
        setResponses((prev) => prev.filter((x) => x.id !== r.id));
        setMessage(`Deleted ${r.name}'s RSVP.`);
      } else {
        await clearWish(adminKey, r.id);
        setResponses((prev) => prev.map((x) => (x.id === r.id ? { ...x, wishes: '', photoUrl: '' } : x)));
        setMessage(`Removed ${r.name}'s wish from the wall.`);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setBusyId('');
    }
  };

  const totals = useMemo(
    () =>
      responses.reduce(
        (acc, r) => {
          acc.replies += 1;
          if (r.wedding?.attending) acc.wedding += r.wedding.guestCount;
          if (r.reception?.attending) acc.reception += r.reception.guestCount;
          if (r.wishes) acc.wishes += 1;
          return acc;
        },
        { replies: 0, wedding: 0, reception: 0, wishes: 0 }
      ),
    [responses]
  );

  const visible = responses.filter((r) => {
    const q = search.trim().toLowerCase();
    if (q && !`${r.name} ${r.invitedAs || ''} ${r.wishes}`.toLowerCase().includes(q)) return false;
    const attendingAny = !!(r.wedding?.attending || r.reception?.attending);
    if (filter === 'wishes') return !!r.wishes;
    if (filter === 'attending') return attendingAny;
    if (filter === 'declined') return !attendingAny;
    return true;
  });

  if (!adminKey) {
    return (
      <form
        className="gt-login"
        onSubmit={(e) => {
          e.preventDefault();
          if (passwordInput.trim()) load(passwordInput.trim());
        }}
      >
        <p className="gt-login-text">Enter the admin password to see and manage RSVPs and wishes saved in Supabase:</p>
        <div className="gt-row">
          <input
            type="password"
            placeholder="Admin password"
            className="gt-input gt-field--wide"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button type="submit" className="btn" disabled={isLoading}>
            {isLoading ? 'Checking…' : 'Unlock'}
          </button>
        </div>
        {message && <p className="gt-status-msg" role="alert">{message}</p>}
      </form>
    );
  }

  return (
    <div className="gt-responses">
      <div className="gt-stats">
        {(
          [
            ['Replies', totals.replies],
            ['Wedding guests', totals.wedding],
            ['Reception guests', totals.reception],
            ['Wishes', totals.wishes],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="gt-stat">
            <div className="gt-stat-value">{value}</div>
            <div className="gt-stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="gt-row gt-filters">
        <input
          type="search"
          placeholder="Search name or wish…"
          className="gt-input gt-field--wide"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="gt-input gt-field--status" value={filter} onChange={(e) => setFilter(e.target.value as Filter)}>
          <option value="all">All replies</option>
          <option value="wishes">With a wish</option>
          <option value="attending">Attending</option>
          <option value="declined">Not attending</option>
        </select>
        <button type="button" className="btn gt-btn-sm" onClick={() => load(adminKey)} disabled={isLoading}>
          {isLoading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {message && <p className="gt-status-msg" role="status">{message}</p>}

      <div className="gt-list">
        {!isLoading && visible.length === 0 ? (
          <p className="gt-empty">No replies match.</p>
        ) : (
          visible.map((r) => (
            <div key={r.id} className={`gt-guest gt-resp ${busyId === r.id ? 'is-busy' : ''}`}>
              <div className="gt-guest-head">
                <div>
                  <strong className="gt-guest-name">{r.name}</strong>
                  <span className="gt-guest-meta">
                    {r.invitedAs ? ` · personal link (${r.invitedAs})` : ' · general link'} · {formatDate(r.submittedAt)}
                    {r.revision > 1 ? ` · edited ${r.revision - 1}×` : ''}
                  </span>
                </div>
              </div>
              <div className="gt-guest-rsvp">
                <div>
                  <b>Wedding:</b> {answer(r.wedding)} · <b>Reception:</b> {answer(r.reception)}
                </div>
                {(r.wishes || r.photoUrl) && (
                  <div className="gt-resp-wish">
                    {r.photoUrl && (
                      <a href={r.photoUrl} target="_blank" rel="noopener noreferrer">
                        <img src={r.photoUrl} alt={`Photo from ${r.name}`} className="gt-resp-photo" loading="lazy" />
                      </a>
                    )}
                    {r.wishes && <div className="gt-guest-wish">“{r.wishes}”</div>}
                  </div>
                )}
              </div>
              <div className="gt-guest-actions">
                {(r.wishes || r.photoUrl) && (
                  <button
                    type="button"
                    className="btn gt-btn-sm"
                    onClick={() => runAction(r, 'clearWish')}
                    disabled={!!busyId}
                  >
                    Remove wish
                  </button>
                )}
                <button
                  type="button"
                  className="btn gt-btn-sm gt-btn-danger"
                  onClick={() => runAction(r, 'delete')}
                  disabled={!!busyId}
                >
                  {busyId === r.id ? 'Deleting…' : 'Delete RSVP'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
