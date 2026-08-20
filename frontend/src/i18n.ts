import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import hi from './locales/hi.json'
import mr from './locales/mr.json'

export type Language = 'en' | 'hi' | 'mr'

const getStoredLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en'
  const stored = localStorage.getItem('i18nLng')
  if (stored === 'en' || stored === 'hi' || stored === 'mr') return stored
  return 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    mr: { translation: mr },
  },
  lng: getStoredLanguage(),
  fallbackLng: 'en',
  debug: false,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
})

export const setLanguage = (lng: Language) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('i18nLng', lng)
  }
  i18n.changeLanguage(lng)
}

export const currentLanguage = (): Language =>
  (i18n.language as Language) || getStoredLanguage()

export default i18n
