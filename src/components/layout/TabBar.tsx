import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useIsActive, useNav } from './Header'

/** Airbnb-style bottom tab bar for small screens. */
export function TabBar() {
  const { t } = useTranslation()
  const items = useNav().filter((i) => i.bottom)
  const isActive = useIsActive()
  if (items.length < 2) return null
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t border-soft bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto flex max-w-xl">
        {items.map((it) => (
          <li key={it.to} className="flex-1">
            <Link
              to={it.to}
              aria-current={isActive(it) ? 'page' : undefined}
              className={`relative flex min-h-[60px] flex-col items-center justify-center gap-1 px-1 text-[12px] leading-tight before:absolute before:inset-x-5 before:top-0 before:h-[3px] before:rounded-b-full ${isActive(it) ? 'font-semibold text-brand-600 before:bg-brand-600' : 'font-medium text-muted before:bg-transparent'}`}
            >
              <span className="relative">
                <it.icon size={24} aria-hidden />
                {!!it.badge && (
                  <span
                    className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white"
                    aria-label={t('nav.unread', { n: it.badge })}
                  >
                    {it.badge}
                  </span>
                )}
              </span>
              <span>{t(it.key)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
