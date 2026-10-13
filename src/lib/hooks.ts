import { useStore } from '../store'
import type { Pair } from '../data/types'

/** Pick the current UI language from a bilingual pair. */
export function useL() {
  const lang = useStore((s) => s.lang)
  return (p: Pair) => p[lang]
}

export const yen = (n: number) => `¥${n.toLocaleString('en-US')}`
