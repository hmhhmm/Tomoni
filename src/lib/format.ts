import type { UiLang } from '../data/types'
import { localeOf } from '../i18n/langs'

export const toggle = <T>(list: T[], value: T): T[] => (list.includes(value) ? list.filter((x) => x !== value) : [...list, value])

const locale = (lang: UiLang) => localeOf(lang)

/** "Sat, 17 Oct" */
export const formatDay = (d: Date | string, lang: UiLang) =>
  new Date(d).toLocaleDateString(locale(lang), { weekday: 'short', day: 'numeric', month: 'short' })

/** "Sat, 17 Oct, 14:00" */
export const formatDayTime = (d: Date, lang: UiLang) =>
  d.toLocaleString(locale(lang), { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
