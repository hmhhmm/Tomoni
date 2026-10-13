import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useNav } from './Header'

/** Airbnb-style bottom tab bar for small screens. */
export function TabBar() {
  const { t } = useTranslation()
  const items = useNav().filter((i) => i.bottom)
  if (items.length < 2) return null
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 border-t border-soft bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto flex max-w-xl">
        {items.map((it) => (
          <li key={it.to} className="flex-1">
            <NavLink
              to={it.to}
              end={it.to === '/host'}
              className={({ isActive }) =>
                `relative flex min-h-[60px] flex-col items-center justify-center gap-1 px-1 text-[12px] font-medium leading-tight ${isActive ? 'text-purple-600' : 'text-muted'}`
              }
            >
              <span className="relative">
                <it.icon size={24} aria-hidden />
                {!!it.badge && (
                  <span
                    className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-purple-600 px-1 text-[10px] font-bold text-white"
                    aria-label={t('nav.unread', { n: it.badge })}
                  >
                    {it.badge}
                  </span>
                )}
              </span>
              <span>{t(it.key)}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
