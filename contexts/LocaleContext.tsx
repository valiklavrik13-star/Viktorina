import React, { createContext, useMemo, useCallback, PropsWithChildren } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import ru from '../locales/ru.ts';
import uk from '../locales/uk.ts';

export type Locale = 'ru' | 'uk';
type Translations = { [key: string]: string };

const translations: { [key in Locale]: Translations } = { ru, uk };

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

export const LocaleContext = createContext<LocaleContextType>({
  locale: 'ru',
  setLocale: () => {},
  t: (key) => key,
});

// FIX: Changed props to use PropsWithChildren to fix type error in index.tsx
export const LocaleProvider = ({ children }: PropsWithChildren) => {
  const [locale, setLocale] = useLocalStorage<Locale>('locale', 'ru');

  const t = useCallback((key: string, replacements?: { [key: string]: string | number }) => {
    let translation = translations[locale][key] || key;
    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            translation = translation.replace(`{${rKey}}`, String(replacements[rKey]));
        });
    }
    return translation;
  }, [locale]);
  
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};