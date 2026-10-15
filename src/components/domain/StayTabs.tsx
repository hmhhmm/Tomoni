import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BedDouble, FileSignature, HeartPulse } from 'lucide-react'
import { useStore } from '../../store'

/** Stay, Agreement and Check-in are one area: these tabs move between them. */
export function StayTabs() {
  const { t } = useTranslation()
  const persona = useStore((s) => s.persona)
  const tabs = [
    { to: '/stay', icon: BedDouble, label: t('stayTabs.overview') },
    { to: '/agreement', icon: FileSignature, label: t('nav.agreement') },
    ...(persona === 'host' ? [{ to: '/host/checkin', icon: HeartPulse, label: t('nav.checkin') }] : []),
  ]
  return (
    <nav aria-label={t('nav.stay')} className="mb-6 border-b border-soft">
      <ul className="scroll-hide -mb-px flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <li key={tab.to} className="shrink-0">
            <NavLink
              to={tab.to}
              className={({ isActive }) =>
                `flex h-12 items-center gap-2 border-b-[3px] px-3 text-base transition-colors ${isActive ? 'border-purple-600 font-semibold text-ink' : 'border-transparent font-medium text-muted hover:border-line hover:text-ink'}`
              }
            >
              <tab.icon size={18} aria-hidden />
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
