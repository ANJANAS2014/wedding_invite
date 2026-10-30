import React, { useState, useEffect } from 'react';
import { LANG_MAPPINGS } from '../data/weddingData';
import { RsvpRecord } from './RsvpSection';

interface GuestTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StoredGuest {
  id: string;
  name: string;
  language: 'en' | 'ta' | 'ml';
  phone?: string;
  status: 'created' | 'sent' | 'rsvp_received';
  invitationToken: string;
  weddingAttending?: boolean;
  weddingGuestCount?: number;
  receptionAttending?: boolean;
  receptionGuestCount?: number;
  wishes?: string;
}

const GUEST_STORAGE_KEY = 'wedding_guest_tracker_v2';
const RSVP_STORAGE_KEY = 'wedding_rsvps_v2';

export const GuestTrackerModal: React.FC<GuestTrackerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'tracker' | 'quick'>('tracker');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('gt_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [guests, setGuests] = useState<StoredGuest[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Add guest form
  const [newName, setNewName] = useState<string>('');
  const [newLang, setNewLang] = useState<'en' | 'ta' | 'ml'>('en');
  const [newPhone, setNewPhone] = useState<string>('');
  const [actionStatus, setActionStatus] = useState<string>('');

  // Quick link tab state
  const [quickName, setQuickName] = useState<string>('');
  const [quickFamily, setQuickFamily] = useState<boolean>(false);
  const [quickLang, setQuickLang] = useState<'en' | 'ta' | 'ml'>('en');
  const [quickPhone, setQuickPhone] = useState<string>('');
  const [quickCopied, setQuickCopied] = useState<boolean>(false);

  // Load tracker guests & combine with local RSVPs
  const loadData = () => {
    try {
      const storedGuests: StoredGuest[] = JSON.parse(localStorage.getItem(GUEST_STORAGE_KEY) || '[]');
      const storedRsvps: RsvpRecord[] = JSON.parse(localStorage.getItem(RSVP_STORAGE_KEY) || '[]');

      // Merge RSVPs with guests or add unlinked ones
      const guestMap = new Map<string, StoredGuest>();

      storedGuests.forEach((g) => {
        guestMap.set(g.name.toLowerCase().trim(), { ...g });
      });

      storedRsvps.forEach((r) => {
        const key = r.name.toLowerCase().trim();
        const existing = guestMap.get(key);
        if (existing) {
          existing.status = 'rsvp_received';
          existing.weddingAttending = r.weddingAttending;
          existing.weddingGuestCount = r.weddingGuestCount;
          existing.receptionAttending = r.receptionAttending;
          existing.receptionGuestCount = r.receptionGuestCount;
          existing.wishes = r.wishes;
        } else {
          guestMap.set(key, {
            id: r.id || `unlinked_${Date.now()}`,
            name: r.name,
            language: 'en',
            status: 'rsvp_received',
            invitationToken: r.inviteToken || '',
            weddingAttending: r.weddingAttending,
            weddingGuestCount: r.weddingGuestCount,
            receptionAttending: r.receptionAttending,
            receptionGuestCount: r.receptionGuestCount,
            wishes: r.wishes
          });
        }
      });

      setGuests(Array.from(guestMap.values()));
    } catch {
      setGuests([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default password or any entered password for client demo
    if (adminPassword.trim().length > 0) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem('gt_auth', 'true');
      } catch {}
      loadData();
    }
  };

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) return;

    const newGuest: StoredGuest = {
      id: `g_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: trimmed,
      language: newLang,
      phone: newPhone.trim() || undefined,
      status: 'created',
      invitationToken: Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    };

    const updated = [newGuest, ...guests];
    setGuests(updated);
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    setNewName('');
    setNewPhone('');
    setActionStatus(`Added ${trimmed}! Invitation link is ready below.`);
    setTimeout(() => setActionStatus(''), 4000);
  };

  const getInviteLink = (guest: StoredGuest) => {
    const origin = window.location.origin;
    if (guest.invitationToken) {
      return `${origin}/?i=${guest.invitationToken}&to=${encodeURIComponent(guest.name)}&lang=${guest.language}`;
    }
    return `${origin}/?to=${encodeURIComponent(guest.name)}&lang=${guest.language}`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
  };

  const handleDeleteGuest = (id: string) => {
    const filtered = guests.filter((g) => g.id !== id);
    setGuests(filtered);
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(filtered));
    } catch {}
  };

  // Stats calculation: Separate wedding and reception totals!
  const stats = guests.reduce(
    (acc, g) => {
      acc.total += 1;
      if (g.status === 'sent') acc.sent += 1;
      if (g.status === 'rsvp_received') {
        acc.replied += 1;
        if (g.weddingAttending) {
          acc.weddingGuests += Number(g.weddingGuestCount) || 0;
        }
        if (g.receptionAttending) {
          acc.receptionGuests += Number(g.receptionGuestCount) || 0;
        }
      }
      return acc;
    },
    { total: 0, sent: 0, replied: 0, weddingGuests: 0, receptionGuests: 0 }
  );

  const filteredGuests = guests.filter((g) => {
    const matchSearch = !searchTerm || g.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Quick link calculations
  const finalQuickName = quickName.trim() ? (quickFamily ? `${quickName.trim()} & Family` : quickName.trim()) : '';
  const quickLinkUrl = finalQuickName
    ? `${window.location.origin}/?to=${encodeURIComponent(finalQuickName)}&lang=${quickLang}`
    : '';
  const quickLangData = LANG_MAPPINGS[quickLang] || LANG_MAPPINGS.en;
  const quickMessage = finalQuickName ? quickLangData.shareMsg(finalQuickName, quickLinkUrl) : '';
  const quickWaUrl = quickPhone.trim()
    ? `https://wa.me/${quickPhone.replace(/\D/g, '')}?text=${encodeURIComponent(quickMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(quickMessage)}`;

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: 'rgba(18, 5, 8, 0.82)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '92vh',
          overflowY: 'auto',
          background: '#fffdf8',
          border: '1px solid var(--gold)',
          borderRadius: '16px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
          padding: '26px 24px',
          color: '#3a1218',
          position: 'relative'
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: 'var(--maroon)'
          }}
          aria-label="Close Tracker"
        >
          ×
        </button>

        <div className="eyebrow" style={{ color: '#8f6a22' }}>
          Host Controls · Lalith &amp; Anjana
        </div>
        <h2 style={{ color: 'var(--maroon)', fontSize: '28px', margin: '4px 0 14px' }}>
          Guest Tracker &amp; Link Maker
        </h2>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            type="button"
            className="btn"
            style={{
              padding: '8px 18px',
              fontSize: '11px',
              background: activeTab === 'tracker' ? 'var(--maroon)' : '#f5e9d5',
              color: activeTab === 'tracker' ? '#fff4db' : 'var(--maroon)',
              borderColor: 'var(--gold)'
            }}
            onClick={() => setActiveTab('tracker')}
          >
            Guest Tracker
          </button>
          <button
            type="button"
            className="btn"
            style={{
              padding: '8px 18px',
              fontSize: '11px',
              background: activeTab === 'quick' ? 'var(--maroon)' : '#f5e9d5',
              color: activeTab === 'quick' ? '#fff4db' : 'var(--maroon)',
              borderColor: 'var(--gold)'
            }}
            onClick={() => setActiveTab('quick')}
          >
            Quick Link Generator
          </button>
        </div>

        {activeTab === 'tracker' ? (
          <div>
            {!isAuthenticated ? (
              <form onSubmit={handleLogin} style={{ padding: '20px', background: '#fdf9f2', borderRadius: '10px' }}>
                <p style={{ margin: '0 0 12px', fontSize: '14px' }}>
                  Please enter your host admin password to view private RSVPs and manage guests:
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="password"
                    placeholder="Enter admin password (e.g. 1234)"
                    className="rsvp-input"
                    style={{ background: '#fff', color: '#222', borderColor: '#cdb98a', flex: '1 1 200px' }}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn">
                    Unlock Tracker
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {/* Stats Dashboard: Separate wedding & reception counts! */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                    gap: '10px',
                    margin: '0 0 20px'
                  }}
                >
                  <div style={{ background: '#fdf8ee', padding: '12px', borderRadius: '10px', border: '1px solid #e5d2b0', textAlign: 'center' }}>
                    <b style={{ display: 'block', fontSize: '26px', color: 'var(--maroon)' }}>{stats.total}</b>
                    <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#7a6650', letterSpacing: '.1em' }}>Invited</span>
                  </div>
                  <div style={{ background: '#fdf8ee', padding: '12px', borderRadius: '10px', border: '1px solid #e5d2b0', textAlign: 'center' }}>
                    <b style={{ display: 'block', fontSize: '26px', color: '#8a5a12' }}>{stats.sent}</b>
                    <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#7a6650', letterSpacing: '.1em' }}>Sent</span>
                  </div>
                  <div style={{ background: '#fdf8ee', padding: '12px', borderRadius: '10px', border: '1px solid #e5d2b0', textAlign: 'center' }}>
                    <b style={{ display: 'block', fontSize: '26px', color: '#1f6b3a' }}>{stats.replied}</b>
                    <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#7a6650', letterSpacing: '.1em' }}>Replied</span>
                  </div>
                  <div style={{ background: '#fdf8ee', padding: '12px', borderRadius: '10px', border: '1px solid #e5d2b0', textAlign: 'center' }}>
                    <b style={{ display: 'block', fontSize: '26px', color: 'var(--maroon)' }}>{stats.weddingGuests}</b>
                    <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#7a6650', letterSpacing: '.1em' }}>Wedding Guests</span>
                  </div>
                  <div style={{ background: '#fdf8ee', padding: '12px', borderRadius: '10px', border: '1px solid #e5d2b0', textAlign: 'center' }}>
                    <b style={{ display: 'block', fontSize: '26px', color: 'var(--maroon)' }}>{stats.receptionGuests}</b>
                    <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#7a6650', letterSpacing: '.1em' }}>Reception Guests</span>
                  </div>
                </div>

                {/* Add Guest Form */}
                <form
                  onSubmit={handleAddGuest}
                  style={{
                    background: '#fdf9f2',
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid #e5d2b0',
                    marginBottom: '20px'
                  }}
                >
                  <h4 style={{ margin: '0 0 10px', color: 'var(--maroon)' }}>Add New Guest</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Guest or Family Name"
                      className="rsvp-input"
                      style={{ background: '#fff', color: '#222', borderColor: '#cdb98a', flex: '1 1 180px' }}
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    />
                    <select
                      className="rsvp-input"
                      style={{ background: '#fff', color: '#222', borderColor: '#cdb98a', flex: '0 1 130px' }}
                      value={newLang}
                      onChange={(e) => setNewLang(e.target.value as 'en' | 'ta' | 'ml')}
                    >
                      <option value="en">English</option>
                      <option value="ta">தமிழ்</option>
                      <option value="ml">മലയാളം</option>
                    </select>
                    <input
                      type="tel"
                      placeholder="WhatsApp (optional)"
                      className="rsvp-input"
                      style={{ background: '#fff', color: '#222', borderColor: '#cdb98a', flex: '1 1 150px' }}
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                    />
                    <button type="submit" className="btn" style={{ padding: '10px 18px', fontSize: '11px' }}>
                      Add Guest
                    </button>
                  </div>
                  {actionStatus && <p style={{ margin: '8px 0 0', color: '#1f6b3a', fontSize: '13px' }}>{actionStatus}</p>}
                </form>

                {/* Search & Filter */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <input
                    type="search"
                    placeholder="Search by name…"
                    className="rsvp-input"
                    style={{ background: '#fff', color: '#222', borderColor: '#cdb98a', flex: '1 1 200px' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <select
                    className="rsvp-input"
                    style={{ background: '#fff', color: '#222', borderColor: '#cdb98a', flex: '0 1 160px' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All statuses</option>
                    <option value="created">Created</option>
                    <option value="sent">Sent</option>
                    <option value="rsvp_received">RSVP received</option>
                  </select>
                </div>

                {/* Guest List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filteredGuests.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#7a6650', padding: '20px' }}>
                      No guests match your criteria. Add your first guest above!
                    </p>
                  ) : (
                    filteredGuests.map((g) => {
                      const link = getInviteLink(g);
                      return (
                        <div
                          key={g.id}
                          style={{
                            background: '#fff',
                            border: '1px solid #e0cfae',
                            borderRadius: '10px',
                            padding: '12px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <strong style={{ fontSize: '18px', color: 'var(--maroon)' }}>{g.name}</strong>
                              <span style={{ fontSize: '12px', color: '#7a6650', marginLeft: '8px' }}>
                                ({g.language.toUpperCase()}) {g.phone && `· ${g.phone}`}
                              </span>
                            </div>

                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: '999px',
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                fontWeight: 500,
                                background:
                                  g.status === 'rsvp_received'
                                    ? '#e6f5ea'
                                    : g.status === 'sent'
                                    ? '#fbf0d2'
                                    : '#f6efe2',
                                color:
                                  g.status === 'rsvp_received'
                                    ? '#1f6b3a'
                                    : g.status === 'sent'
                                    ? '#8a5a12'
                                    : '#7a6650'
                              }}
                            >
                              {g.status.replace('_', ' ')}
                            </span>
                          </div>

                          {/* RSVP details if received */}
                          {g.status === 'rsvp_received' && (
                            <div style={{ fontSize: '13px', background: '#faf5ec', padding: '8px 12px', borderRadius: '6px' }}>
                              <div>
                                <b>Wedding:</b> {g.weddingAttending ? `Attending (${g.weddingGuestCount} guests)` : 'Not attending'}
                                {' · '}
                                <b>Reception:</b> {g.receptionAttending ? `Attending (${g.receptionGuestCount} guests)` : 'Not attending'}
                              </div>
                              {g.wishes && (
                                <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#553311' }}>
                                  “{g.wishes}”
                                </div>
                              )}
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <button
                              type="button"
                              className="btn"
                              style={{ padding: '6px 12px', fontSize: '10px' }}
                              onClick={() => {
                                handleCopy(link);
                                alert('Personal invitation link copied!');
                              }}
                            >
                              Copy Link
                            </button>

                            {g.phone && (
                              <a
                                href={`https://wa.me/${g.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                  LANG_MAPPINGS[g.language].shareMsg(g.name, link)
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn"
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '10px',
                                  background: '#25D366',
                                  color: '#fff',
                                  borderColor: '#128C7E'
                                }}
                              >
                                WhatsApp
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteGuest(g.id)}
                              style={{
                                marginLeft: 'auto',
                                background: 'none',
                                border: 'none',
                                color: '#a03030',
                                cursor: 'pointer',
                                fontSize: '14px'
                              }}
                              title="Delete guest"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Quick Link Generator */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#6e5234' }}>
              Create personalized invitation links instantly without database tracking:
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Guest name (e.g. Priya)"
                className="rsvp-input"
                style={{ background: '#fff', color: '#222', borderColor: '#cdb98a', flex: '1 1 200px' }}
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
              />
              <select
                className="rsvp-input"
                style={{ background: '#fff', color: '#222', borderColor: '#cdb98a', flex: '0 1 140px' }}
                value={quickLang}
                onChange={(e) => setQuickLang(e.target.value as 'en' | 'ta' | 'ml')}
              >
                <option value="en">English</option>
                <option value="ta">தமிழ்</option>
                <option value="ml">മലയാളം</option>
              </select>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={quickFamily}
                onChange={(e) => setQuickFamily(e.target.checked)}
              />
              Add “&amp; Family”
            </label>

            <input
              type="tel"
              placeholder="WhatsApp number with country code (optional, e.g. 919876543210)"
              className="rsvp-input"
              style={{ background: '#fff', color: '#222', borderColor: '#cdb98a' }}
              value={quickPhone}
              onChange={(e) => setQuickPhone(e.target.value)}
            />

            {quickLinkUrl && (
              <div style={{ background: '#fdf8ee', padding: '12px', borderRadius: '8px', border: '1px dashed #d5be94' }}>
                <span style={{ fontSize: '11px', color: '#7a6650', textTransform: 'uppercase' }}>Generated Link:</span>
                <p style={{ margin: '4px 0 8px', wordBreak: 'break-all', fontSize: '13px', color: 'var(--maroon)' }}>
                  {quickLinkUrl}
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn"
                    style={{ padding: '8px 16px', fontSize: '11px' }}
                    onClick={() => {
                      handleCopy(quickLinkUrl);
                      setQuickCopied(true);
                      setTimeout(() => setQuickCopied(false), 2000);
                    }}
                  >
                    {quickCopied ? 'Copied ✓' : 'Copy Link'}
                  </button>

                  <a
                    href={quickWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{
                      padding: '8px 16px',
                      fontSize: '11px',
                      background: '#25D366',
                      color: '#fff',
                      borderColor: '#128C7E'
                    }}
                  >
                    Send on WhatsApp
                  </a>

                  <a
                    href={quickLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn o"
                    style={{ padding: '8px 16px', fontSize: '11px' }}
                  >
                    Preview Link
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
