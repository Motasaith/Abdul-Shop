import { useAppSelector } from '../hooks/redux';
// Rebuild hook
import { translations } from '../locales/translations';

type Language = keyof typeof translations;
type Category = keyof typeof translations.en;

export const useTranslation = () => {
  const { language } = useAppSelector((state) => state.preferences);
  
  // Default to English if language not found
  const currentLanguage = (translations[language as Language] ? language : 'en') as Language;
  
  const t = (key: string, params?: Record<string, any>) => {
    const keys = key.split('.');
    let value: any = translations[currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k as keyof typeof value];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    if (typeof value === 'string' && params) {
      let text = value;
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        if (paramKey !== 'returnObjects') {
          text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
        }
      });
      return text;
    }
    
    return value;
  };

  return { t, language: currentLanguage };
};
