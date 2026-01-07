import React, { createContext, useContext, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { getPublicSettings } from '../store/slices/settingSlice';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { settings, publicSettings } = useAppSelector((state) => state.settings);

  // Use admin settings if available (for previewing changes), otherwise public settings
  const activeSettings = settings || publicSettings;

  useEffect(() => {
    // Fetch public settings on mount if not already available
    if (!publicSettings && !settings) {
      dispatch(getPublicSettings());
    }
  }, [dispatch, publicSettings, settings]);

  useEffect(() => {
    if (activeSettings?.appearance) {
      const { primaryColor, secondaryColor, darkMode } = activeSettings.appearance;
      const root = document.documentElement;

      // Apply Colors
      root.style.setProperty('--primary-color', primaryColor || '#3B82F6');
      root.style.setProperty('--secondary-color', secondaryColor || '#1E40AF');

      // Apply Dark Mode
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [activeSettings]);

  const toggleTheme = () => {
    // This is valid only if we want allowing local override, 
    // but for now we strictly follow settings.
    // implementation for local toggle can be added here if needed.
  };

  return (
    <ThemeContext.Provider value={{ theme: activeSettings?.appearance?.darkMode ? 'dark' : 'light', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
