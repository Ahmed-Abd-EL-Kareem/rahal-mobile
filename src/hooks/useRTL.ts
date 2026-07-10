// src/hooks/useRTL.ts
import { useTranslation } from 'react-i18next';

export function useRTL() {
  const { i18n } = useTranslation();
  return i18n.language === 'ar';
}

export function useLocale() {
  const { i18n, t } = useTranslation();
  return {
    locale: i18n.language,
    isRTL: i18n.language === 'ar',
    t,
    changeLanguage: (lang: 'en' | 'ar') => i18n.changeLanguage(lang),
  };
}