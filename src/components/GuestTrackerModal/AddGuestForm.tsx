import React, { useState } from 'react';
import type { Language } from '../../types';
import { LanguageSelect } from './LanguageSelect';

interface AddGuestFormProps {
  onAdd: (guest: { name: string; language: Language; phone: string }) => void;
  statusMessage: string;
}

export const AddGuestForm: React.FC<AddGuestFormProps> = ({ onAdd, statusMessage }) => {
  const [name, setName] = useState<string>('');
  const [language, setLanguage] = useState<Language>('en');
  const [phone, setPhone] = useState<string>('');

  return (
    <form
      className="gt-panel"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        onAdd({ name: trimmed, language, phone: phone.trim() });
        setName('');
        setPhone('');
      }}
    >
      <h4 className="gt-panel-title">Add New Guest</h4>
      <div className="gt-row gt-row--center">
        <input
          type="text"
          placeholder="Guest or Family Name"
          className="gt-input gt-field--name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <LanguageSelect className="gt-input gt-field--lang" value={language} onChange={setLanguage} />
        <input
          type="tel"
          placeholder="WhatsApp (optional)"
          className="gt-input gt-field--phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button type="submit" className="btn gt-btn-md">
          Add Guest
        </button>
      </div>
      {statusMessage && <p className="gt-status-msg">{statusMessage}</p>}
    </form>
  );
};
