import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Home, Users, MessageCircle, FileSignature, HeartPulse, Search, ListChecks, UserRound, LayoutDashboard, PlayCircle } from 'lucide-react'
import { useStore } from '../store'
import { useUI } from '../ui'
import { Wordmark } from './Wordmark'
import { SafetyShield } from './SafetyShield'
import { DemoPanel } from './DemoPanel'

const BASE_PX = { host: 20, family: 18, tenant: 16, coordinator: 16 } as const

const TABS = {
  host: [
    { to: '/host/home', icon: Home, key: 'nav.home' },
    { to: '/host/applicants', icon: Users, key: 'nav.people' },
    { to: '/chat', icon: MessageCircle, key: 'nav.chat' },
    { to: '/pact', icon: FileSignature, key: 'nav.pact' },
    { to: '/host/checkin', icon: HeartPulse, key: 'nav.checkin' },
  ],
  tenant: [
    { to: '/tenant/browse', icon: Search, key: 'nav.browse' },
    { to: '/chat', icon: MessageCircle, key: 'nav.chat' },
    { to: '/tenant/tasks', icon: ListChecks, key: 'nav.log' },
    { to: '/pact', icon: FileSignature, key: 'nav.pact' },
    { to: '/tenant/me', icon: UserRound, key: 'nav.me' },
  ],
  family: [{ to: '/family/dashboard', icon: LayoutDashboard, key: 'nav.family' }],
}

/** Phone frame + header + role tab bar. Root font size follows role: host 20px, family 18px, tenant 16px. */
export function AppShell() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { role, lang, setLang, textScale, setTextScale } = useStore()
  const toast = useUI((s) => s.toast)
  const { demoOpen, setDemoOpen } = useUI()

  useEffect(() => { useUI.setState({ toast: null }) }, [pathname])

  useEffect(() => {
    const base = role ? BASE_PX[role] : 18
    const scale = role === 'host' || role === 'family' ? textScale : 1
    document.documentElement.style.fontSize = `${base * scale}px`
  }, [role, textScale])

  const tabs = role === 'host' || role === 'tenant' || role === 'family' ? TABS[role] : []
  const showScale = role === 'host' || role === 'family'
  const scales = [{ v: 1 as const, l: 'A' }, { v: 1.15 as const, l: 'A+' }, { v: 1.3 as const, l: 'A++' }]

  return (
    <div className="flex min-h-[100dvh] items-center justify-center gap-8 bg-[radial-gradient(1200px_600px_at_20%_-10%,#EFE9FF,transparent),radial-gradient(900px_500px_at_100%_100%,#DDF6F1,transparent)] bg-bg p-0 sm:p-6">
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-bg sm:h-[min(844px,calc(100dvh-48px))] sm:w-[390px] sm:rounded-[44px] sm:border-[10px] sm:border-ink sm:shadow-phone">
        <header className="z-20 shrink-0 border-b border-line bg-bg/95 px-[10px] pb-[8px] pt-[8px] text-[17px] backdrop-blur">
          <div className="flex items-center justify-between gap-2">
            <Link to="/" className="rounded-xl p-[4px]" aria-label="Tomoni home"><Wordmark /></Link>
            <div className="flex items-center gap-[6px]">
              <button
                type="button"
                onClick={() => setLang(lang === 'en' ? 'ja' : 'en')}
                className="flex min-h-[48px] shrink-0 items-center whitespace-nowrap rounded-full border border-line bg-white px-[4px] text-[17px] font-semibold"
              >
                <span className="sr-only">{t('lang.toggleLabel')}: </span>
                <span className={`rounded-full px-[8px] py-[6px] ${lang === 'ja' ? 'bg-purple-600 text-white' : 'text-ink'}`} lang="ja">日本語</span>
                <span className={`rounded-full px-[8px] py-[6px] ${lang === 'en' ? 'bg-purple-600 text-white' : 'text-ink'}`}>EN</span>
              </button>
              <SafetyShield />
            </div>
          </div>
          {showScale && (
            <div className="mt-[8px] flex items-center justify-between gap-[8px]" role="group" aria-label={t('common.textSize')}>
              <span className="text-[15px] font-medium text-ink">{t('common.textSize')}</span>
              <div className="flex gap-[6px]">
                {scales.map((s) => (
                  <button
                    key={s.l} type="button" aria-pressed={textScale === s.v} onClick={() => setTextScale(s.v)}
                    className={`min-h-[48px] min-w-[48px] rounded-full border px-[12px] text-[17px] font-bold ${textScale === s.v ? 'border-purple-600 bg-purple-600 text-white' : 'border-line bg-white'}`}
                  >
                    {s.l}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        <div className="relative min-h-0 flex-1">
        <main id="main" className="phone-scroll h-full overflow-y-auto overscroll-contain">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
        <AnimatePresence>
          {toast && (
            <motion.div
              role="status" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-x-4 top-3 z-50 rounded-2xl bg-ink px-4 py-3 text-center text-base font-medium text-white shadow-lift"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {tabs.length > 1 && (
          <nav aria-label="Main" className="z-20 shrink-0 border-t border-line bg-white px-1 pb-2 pt-1.5">
            <ul className="flex">
              {tabs.map((tab) => (
                <li key={tab.to} className="flex-1">
                  <NavLink
                    to={tab.to}
                    className={({ isActive }) =>
                      `flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-2xl px-0.5 text-[14px] font-semibold leading-tight ${isActive ? 'bg-purple-50 text-purple-700' : 'text-ink'}`
                    }
                  >
                    <tab.icon size={22} aria-hidden />
                    <span>{t(tab.key)}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}

      </div>

      {!demoOpen && (
        <button
          type="button" onClick={() => setDemoOpen(true)}
          className="fixed bottom-24 right-3 z-40 flex min-h-12 sm:bottom-4 sm:right-4 items-center gap-2 rounded-full bg-ink px-4 text-base font-semibold text-white shadow-lift"
        >
          <PlayCircle size={20} aria-hidden /> {t('demo.open')}
        </button>
      )}
      {demoOpen && <DemoPanel />}
    </div>
  )
}
