import { ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/** Persistent safety entry point. Always icon + text label. */
export function SafetyShield() {
  const { t } = useTranslation()
  return (
    <Link
      to="/safety"
      aria-label={t('safety.open')}
      className="flex min-h-[48px] items-center gap-[6px] whitespace-nowrap rounded-full bg-teal-50 px-[10px] font-semibold text-teal-700 ring-1 ring-teal-100 transition hover:bg-teal-100"
    >
      <ShieldAlert size={22} aria-hidden />
      <span className="text-[17px]">{t('safety.short')}</span>
    </Link>
  )
}
