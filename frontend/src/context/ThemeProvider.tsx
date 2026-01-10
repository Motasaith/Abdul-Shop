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
  
  // Local state for theme, initialized from localStorage or default
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
  });

  // Use admin settings if available (for previewing changes), otherwise public settings
  const activeSettings = settings || publicSettings;

  useEffect(() => {
    // Fetch public settings on mount if not already available
    if (!publicSettings && !settings) {
      dispatch(getPublicSettings());
    }
  }, [dispatch, publicSettings, settings]);

  // Sync with settings ONLY if no local override exists (optional strategy)
  // Or: Use settings to initialize colors, but let local state control dark mode.
  useEffect(() => {
    if (activeSettings?.appearance) {
      const { primaryColor, secondaryColor } = activeSettings.appearance;
      const root = document.documentElement;

      // Apply Colors
      root.style.setProperty('--primary-color', primaryColor || '#3B82F6');
      root.style.setProperty('--secondary-color', secondaryColor || '#1E40AF');
      
      // Note: We are explicitly NOT syncing dark mode from settings here if we want user override.
      // If we wanted to sync initial state from settings when no local storage:
      if (!localStorage.getItem('theme') && activeSettings.appearance.darkMode) {
         setTheme('dark');
      }
    }
  }, [activeSettings]);

  // Effect to apply the theme class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
