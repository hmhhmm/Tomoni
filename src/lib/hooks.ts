import { useStore } from '../store'
import type { Pair, UiLang } from '../data/types'
import { contentLang, localeOf } from '../i18n/langs'

/** Pick the current UI language from a bilingual pair. */
export function useL() {
  const lang = useStore((s) => s.lang)
  return (p: Pair) => p[contentLang(lang)]
}

export const yen = (n: number) => `¥${n.toLocaleString('en-US')}`
export const monthLabel = (ym: string, lang: UiLang) => {
  const [y, m] = ym.split('-').map(Number)
  return lang === 'ja' ? `${y}年${m}月` : new Date(y, m - 1, 1).toLocaleString(localeOf(lang), { month: 'short', year: 'numeric' })
}
