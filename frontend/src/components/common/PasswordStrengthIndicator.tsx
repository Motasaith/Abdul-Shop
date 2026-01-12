
import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const getStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;

    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    return score;
  };

  const strength = getStrength(password);

  const getColor = () => {
    switch (strength) {
      case 0: return 'bg-gray-200 dark:bg-gray-700';
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-blue-500';
      case 5: return 'bg-green-500';
      default: return 'bg-gray-200 dark:bg-gray-700';
    }
  };

  const getLabel = () => {
    switch (strength) {
      case 0: return 'Enter password';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      case 5: return 'Very Strong';
      default: return '';
    }
  };

  return (
    <div className="mt-1">
      <div className="flex h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${getColor()}`} 
          style={{ width: `${(strength / 5) * 100}%` }}
        />
      </div>
      <p className={`text-xs mt-1 font-medium ${
        strength <= 2 ? 'text-red-500' : 
        strength === 3 ? 'text-yellow-600 dark:text-yellow-400' : 
        'text-green-600 dark:text-green-400'
      }`}>
        {password && getLabel()}
      </p>
      {password && strength < 4 && (
        <ul className="text-xs text-gray-500 dark:text-gray-400 mt-1 list-disc list-inside">
          {password.length < 8 && <li>At least 8 characters</li>}
          {!/[A-Z]/.test(password) && <li>Uppercase letter</li>}
          {!/[a-z]/.test(password) && <li>Lowercase letter</li>}
          {!/[0-9]/.test(password) && <li>Number</li>}
          {!/[^A-Za-z0-9]/.test(password) && <li>Special character</li>}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
