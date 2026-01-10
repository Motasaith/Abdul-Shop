import React, { useState, useEffect } from 'react';
import { countryCodes, CountryCode } from '../../utils/countryCodes';

interface PhoneInputProps {
  value: string;
  onChange: (value: string, countryCode?: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  label?: string;
  error?: string;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "Enter phone number",
  required = false,
  className = "",
  label = "Phone Number",
  error
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    countryCodes.find(c => c.code === 'PK') || countryCodes[0]
  );
  const [phoneNumber, setPhoneNumber] = useState('');

  // Initialize phone number from value prop
  useEffect(() => {
    if (value && value !== selectedCountry.dialCode) {
      // Extract number part if value starts with country code
      if (value.startsWith(selectedCountry.dialCode)) {
        setPhoneNumber(value.replace(selectedCountry.dialCode, ''));
      } else {
        setPhoneNumber(value.replace(/^\+\d{1,4}/, ''));
      }
    }
  }, [value, selectedCountry.dialCode]);

  const handleCountrySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    const country = countryCodes.find(c => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      const fullNumber = `${country.dialCode}${phoneNumber}`;
      onChange(fullNumber, country.code);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhoneNumber = e.target.value.replace(/[^\d]/g, ''); // Only allow digits
    setPhoneNumber(newPhoneNumber);
    const fullNumber = `${selectedCountry.dialCode}${newPhoneNumber}`;
    onChange(fullNumber, selectedCountry.code);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative flex space-x-2">
        {/* Country Code Select */}
        <div className="relative">
          <select
            value={selectedCountry.code}
            onChange={handleCountrySelect}
            className={`px-3 py-2 border rounded-l-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              error ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {countryCodes.map((country) => (
              <option key={country.code} value={country.code}>
                {country.flag} {country.dialCode} {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder={placeholder}
          required={required}
          className={`flex-1 px-3 py-2 border rounded-r-md text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Help Text */}
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Selected: {selectedCountry.name} ({selectedCountry.dialCode})
      </p>
    </div>
  );
};

export default PhoneInput;
