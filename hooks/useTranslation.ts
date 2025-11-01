import { useContext } from 'react';
import { LocaleContext } from '../contexts/LocaleContext';

export const useTranslation = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LocaleProvider');
  }
  return context;
};
