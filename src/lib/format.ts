import type { Lang } from '../data/types'

export const toggle = <T>(list: T[], value: T): T[] => (list.includes(value) ? list.filter((x) => x !== value) : [...list, value])

const locale = (lang: Lang) => (lang === 'ja' ? 'ja-JP' : 'en-GB')

/** "Sat, 17 Oct" */
export const formatDay = (d: Date | string, lang: Lang) =>
  new Date(d).toLocaleDateString(locale(lang), { weekday: 'short', day: 'numeric', month: 'short' })

/** "Sat, 17 Oct, 14:00" */
export const formatDayTime = (d: Date, lang: Lang) =>
  d.toLocaleString(locale(lang), { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
