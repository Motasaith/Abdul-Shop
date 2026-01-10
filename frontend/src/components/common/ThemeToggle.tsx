import React from 'react';
import { useTheme } from '../../context/ThemeProvider';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-full transition-all duration-300 ease-in-out
        ${theme === 'dark' 
          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 hover:text-yellow-300' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-blue-600'
        }
        hover:shadow-md focus:outline-none ring-2 ring-transparent focus:ring-blue-500
      `}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Dark Mode"
    >
      {theme === 'dark' ? (
        <SunIcon className="h-5 w-5 transform transition-transform duration-500 hover:rotate-90" />
      ) : (
        <MoonIcon className="h-5 w-5 transform transition-transform duration-500 hover:-rotate-12" />
      )}
    </button>
  );
};

export default ThemeToggle;
