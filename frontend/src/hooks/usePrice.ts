import { useCallback } from 'react';
import { useAppSelector } from './redux';

export const usePrice = () => {
  const { currency } = useAppSelector((state) => state.preferences);

  const formatPrice = useCallback((price: number) => {
    const convertedPrice = price * currency.rate;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedPrice)
      .replace('PKR', 'Rs.') // Keep custom formatting for PKR if needed
      .replace('Rs.', currency.symbol === 'Rs.' ? 'Rs. ' : currency.symbol); // Ensure symbol is used
  }, [currency]);

  return { formatPrice, currency };
};
