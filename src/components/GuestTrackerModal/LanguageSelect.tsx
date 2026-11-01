import React from 'react';
import type { Language } from '../../types';

interface LanguageSelectProps {
  value: Language;
  onChange: (language: Language) => void;
  className: string;
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({ value, onChange, className }) => (
  <select className={className} value={value} onChange={(e) => onChange(e.target.value as Language)}>
    <option value="en">English</option>
    <option value="ta">தமிழ்</option>
    <option value="ml">മലയാളം</option>
  </select>
);
