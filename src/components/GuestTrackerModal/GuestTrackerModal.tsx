import './GuestTrackerModal.css';
import React, { useEffect, useRef, useState } from 'react';
import type { GuestStatus, Language, StoredGuest } from '../../types';
import {
  computeTrackerStats,
  isTrackerUnlocked,
  loadGuestsWithRsvps,
  saveGuests,
  setTrackerUnlocked,
} from '../../services/guestTrackerStore';
import { generateLocalInviteToken } from '../../utils/inviteLinks';
import { Modal } from '../shared/Modal/Modal';
import { TrackerLogin } from './TrackerLogin';
import { TrackerStats } from './TrackerStats';
import { AddGuestForm } from './AddGuestForm';
import { GuestRow } from './GuestRow';
import { QuickLinkGenerator } from './QuickLinkGenerator';
import { ResponsesPanel } from './ResponsesPanel';

interface GuestTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TrackerTab = 'tracker' | 'responses' | 'quick';

/**
 * Host controls (opened with ?tracker=1 or ?links=1): a local guest tracker
 * and a quick personalised-link generator. Stays mounted while closed so the
 * form/tab state survives reopening.
 */
export const GuestTrackerModal: React.FC<GuestTrackerModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TrackerTab>('tracker');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(isTrackerUnlocked);
  const [guests, setGuests] = useState<StoredGuest[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<GuestStatus | ''>('');
  const [actionStatus, setActionStatus] = useState<string>('');
  const statusTimerRef = useRef<number>();

  useEffect(() => {
    if (isOpen) setGuests(loadGuestsWithRsvps());
  }, [isOpen]);

  useEffect(() => () => window.clearTimeout(statusTimerRef.current), []);

  const updateGuests = (next: StoredGuest[]) => {
    setGuests(next);
    saveGuests(next);
  };

  const handleUnlock = () => {
    setIsAuthenticated(true);
    setTrackerUnlocked();
    setGuests(loadGuestsWithRsvps());
  };

  const handleAddGuest = ({ name, language, phone }: { name: string; language: Language; phone: string }) => {
    const newGuest: StoredGuest = {
      id: `g_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      language,
      phone: phone || undefined,
      status: 'created',
      invitationToken: generateLocalInviteToken(),
    };
    updateGuests([newGuest, ...guests]);
    setActionStatus(`Added ${name}! Invitation link is ready below.`);
    window.clearTimeout(statusTimerRef.current);
    statusTimerRef.current = window.setTimeout(() => setActionStatus(''), 4000);
  };

  const filteredGuests = guests.filter((g) => {
    const matchSearch = !searchTerm || g.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (!isOpen) return null;

  return (
    <Modal className="gt-overlay" ariaLabel="Guest Tracker and Link Maker" onClose={onClose}>
      <div className="gt-modal">
        <button type="button" className="gt-close" onClick={onClose} aria-label="Close Tracker">
          ×
        </button>

        <div className="eyebrow gt-eyebrow">Host Controls · Lalith &amp; Anjana</div>
        <h2 className="gt-title">Guest Tracker &amp; Link Maker</h2>

        <div className="gt-tabs" role="tablist">
          {(
            [
              ['tracker', 'Guest Tracker'],
              ['responses', 'RSVPs & Wishes'],
              ['quick', 'Quick Link Generator'],
            ] as const
          ).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              className={`btn gt-tab ${activeTab === tab ? 'is-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'quick' ? (
          <QuickLinkGenerator />
        ) : activeTab === 'responses' ? (
          <ResponsesPanel />
        ) : !isAuthenticated ? (
          <TrackerLogin onUnlock={handleUnlock} />
        ) : (
          <div>
            <TrackerStats stats={computeTrackerStats(guests)} />
            <AddGuestForm onAdd={handleAddGuest} statusMessage={actionStatus} />

            <div className="gt-row gt-filters">
              <input
                type="search"
                placeholder="Search by name…"
                className="gt-input gt-field--wide"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="gt-input gt-field--status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as GuestStatus | '')}
              >
                <option value="">All statuses</option>
                <option value="created">Created</option>
                <option value="sent">Sent</option>
                <option value="rsvp_received">RSVP received</option>
              </select>
            </div>

            <div className="gt-list">
              {filteredGuests.length === 0 ? (
                <p className="gt-empty">No guests match your criteria. Add your first guest above!</p>
              ) : (
                filteredGuests.map((g) => (
                  <GuestRow key={g.id} guest={g} onDelete={(id) => updateGuests(guests.filter((x) => x.id !== id))} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
