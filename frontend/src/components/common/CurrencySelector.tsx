import React from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setCurrency } from '../../store/slices/preferenceSlice';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'PKR', symbol: 'Rs.', name: 'Pakistani Rupee' },
];

const CurrencySelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currency } = useAppSelector((state) => state.preferences);

  return (
    <div className="relative">
      <select
        value={currency.code}
        onChange={(e) => dispatch(setCurrency(e.target.value))}
        className="appearance-none bg-transparent border-none text-sm font-medium text-gray-700 hover:text-blue-600 focus:ring-0 cursor-pointer pr-6"
      >
        {currencies.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} {c.symbol}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelector;
