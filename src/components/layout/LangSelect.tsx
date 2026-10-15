import { Globe, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../../store'
import type { UiLang } from '../../data/types'
import { UI_LANGS } from '../../i18n/langs'

/** Language dropdown: shows the language the page is in now, and switches the whole page on change. */
export function LangSelect({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  const lang = useStore((s) => s.lang)
  const setLang = useStore((s) => s.setLang)
  return (
    <label className={`relative flex h-11 items-center rounded-full hover:bg-surface ${className}`}>
      <span className="sr-only">{t('lang.toggleLabel')}</span>
      <Globe size={20} aria-hidden className="pointer-events-none absolute left-2.5" />
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as UiLang)}
        className="h-11 cursor-pointer appearance-none rounded-full bg-transparent pl-9 pr-8 text-[15px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        {UI_LANGS.map((l) => (
          <option key={l.id} value={l.id} lang={l.html}>
            {l.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} aria-hidden className="pointer-events-none absolute right-2.5 text-muted" />
    </label>
  )
}
