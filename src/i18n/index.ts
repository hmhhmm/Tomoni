import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './en'
import { ja } from './ja'

let initial: 'en' | 'ja' = 'en'
try {
  const raw = localStorage.getItem('tomoni-v2')
  if (raw) initial = JSON.parse(raw)?.state?.lang === 'ja' ? 'ja' : 'en'
} catch {
  /* storage unavailable: default to English */
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ja: { translation: ja } },
  lng: initial,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
