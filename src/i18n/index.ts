import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './en'
import { ja } from './ja'
import { ms } from './ms'
import { vi } from './vi'
import { zh } from './zh'
import { isUiLang } from './langs'
import type { UiLang } from '../data/types'

let initial: UiLang = 'en'
try {
  const raw = localStorage.getItem('tomoni-v2')
  const saved = raw ? JSON.parse(raw)?.state?.lang : undefined
  if (isUiLang(saved)) initial = saved
} catch {
  /* storage unavailable: default to English */
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ja: { translation: ja }, ms: { translation: ms }, vi: { translation: vi }, zh: { translation: zh } },
  lng: initial,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
