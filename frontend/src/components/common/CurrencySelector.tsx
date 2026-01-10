import React, { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setCurrency } from '../../store/slices/preferenceSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, BanknotesIcon } from '@heroicons/react/24/outline';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'PKR', symbol: 'Rs.', name: 'Pakistani Rupee', flag: '🇵🇰' },
];

interface CurrencySelectorProps {
  variant?: 'admin' | 'header';
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ variant = 'admin' }) => {
  const dispatch = useAppDispatch();
  const { currency } = useAppSelector((state) => state.preferences);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCurrency = currencies.find(c => c.code === currency.code) || currencies[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    dispatch(setCurrency(code));
    setIsOpen(false);
  };

  // Header Variant (Minimal)
  if (variant === 'header') {
    return (
      <div className="relative z-50" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-sm font-medium text-white hover:text-white/80 transition-colors"
        >
          <span className="text-lg leading-none">{selectedCurrency.flag}</span>
          <span>{selectedCurrency.code}</span>
          <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
               <div className="py-1">
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleSelect(c.code)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 text-sm transition-colors
                      ${currency.code === c.code 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold' 
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{c.flag}</span>
                      <span>{c.name}</span>
                    </div>
                    {currency.code === c.code && (
                       <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Admin Variant (Full Card) - Default
  return (
    <div className="relative w-full z-50" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-4 py-3 rounded-xl
          bg-white dark:bg-gray-700/50 
          border border-gray-200 dark:border-gray-600
          shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500
          transition-all duration-200
          group
        `}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
             <span className="text-lg leading-none">{selectedCurrency.flag}</span>
          </div>
          <div className="text-left min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Currency</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1 truncate">
              <span className="truncate">{selectedCurrency.code}</span>
              <span className="text-xs font-normal text-gray-400 flex-shrink-0">({selectedCurrency.symbol})</span>
            </p>
          </div>
        </div>
        <div className={`p-1 rounded-md transition-colors flex-shrink-0 ${isOpen ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}`}>
          <ChevronDownIcon 
            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
            style={{ maxHeight: '250px', overflowY: 'auto' }}
          >
            <div className="p-1.5 space-y-0.5">
              {currencies.map((c) => (
                <motion.button
                  key={c.code}
                  whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                  onClick={() => handleSelect(c.code)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors
                    ${currency.code === c.code 
                      ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold' 
                      : 'text-gray-700 dark:text-gray-200 hover:text-gray-900'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{c.flag}</span>
                    <div className="flex flex-col items-start">
                      <span>{c.name}</span>
                      <span className="text-[10px] opacity-70">{c.code}</span>
                    </div>
                  </div>
                  {currency.code === c.code && (
                    <motion.div layoutId="activeCheck" className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  )}
                </motion.button>
              ))}
            </div>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 text-[10px] text-gray-400 text-center border-t border-gray-100 dark:border-gray-700">
               Prices updated automatically
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurrencySelector;
