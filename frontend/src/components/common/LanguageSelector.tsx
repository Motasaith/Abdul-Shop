import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setLanguage } from '../../store/slices/preferenceSlice';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

const LanguageSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const { language } = useAppSelector((state) => state.preferences);

  return (
    <div className="relative ml-4">
      <select
        value={language}
        onChange={(e) => dispatch(setLanguage(e.target.value))}
        className="appearance-none bg-transparent border-none text-sm font-medium text-gray-700 hover:text-blue-600 focus:ring-0 cursor-pointer pr-6"
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
