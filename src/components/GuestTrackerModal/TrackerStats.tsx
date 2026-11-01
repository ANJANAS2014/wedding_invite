import React from 'react';
import type { TrackerStats as Stats } from '../../services/guestTrackerStore';

const STAT_ITEMS: { key: keyof Stats; label: string; modifier?: string }[] = [
  { key: 'total', label: 'Invited' },
  { key: 'sent', label: 'Sent', modifier: 'sent' },
  { key: 'replied', label: 'Replied', modifier: 'replied' },
  { key: 'weddingGuests', label: 'Wedding Guests' },
  { key: 'receptionGuests', label: 'Reception Guests' },
];

/** Headline counters, with separate wedding and reception guest totals. */
export const TrackerStats: React.FC<{ stats: Stats }> = ({ stats }) => (
  <div className="gt-stats">
    {STAT_ITEMS.map(({ key, label, modifier }) => (
      <div key={key} className="gt-stat">
        <b className={modifier ? `gt-stat-value gt-stat-value--${modifier}` : 'gt-stat-value'}>{stats[key]}</b>
        <span className="gt-stat-label">{label}</span>
      </div>
    ))}
  </div>
);
