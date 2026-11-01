import React, { useState } from 'react';

interface TrackerLoginProps {
  onUnlock: () => void;
}

/**
 * Demo-only gate: any non-empty password unlocks the local tracker.
 * (Real admin auth lives in api/admin-guests.js, which isn't wired up yet.)
 */
export const TrackerLogin: React.FC<TrackerLoginProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState<string>('');
  return (
    <form
      className="gt-login"
      onSubmit={(e) => {
        e.preventDefault();
        if (password.trim().length > 0) onUnlock();
      }}
    >
      <p className="gt-login-text">Please enter your host admin password to view private RSVPs and manage guests:</p>
      <div className="gt-row">
        <input
          type="password"
          placeholder="Enter admin password (e.g. 1234)"
          className="gt-input gt-field--wide"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn">
          Unlock Tracker
        </button>
      </div>
    </form>
  );
};
