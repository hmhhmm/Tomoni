import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useStore } from '../../store'
import { useUI } from '../../ui'
import { RULES } from '../../tokens'
import { Header } from './Header'
import { TabBar } from './TabBar'
import { Footer } from './Footer'

/**
 * Web-app shell: sticky header (role navigation on desktop), bottom tab bar on small screens.
 * Root font size follows persona and text level (host 18/20/22px, family 17/19/21, tenant 16/18/20).
 */
export function AppShell() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { persona, textLevel } = useStore()
  const toast = useUI((s) => s.toast)
  const focused = /^\/(host\/create|host\/help|aisha\/account\/verify)/.test(pathname)

  useEffect(() => {
    window.scrollTo(0, 0)
    useUI.setState({ toast: null })
  }, [pathname])
  useEffect(() => {
    document.documentElement.style.fontSize = `${RULES.rootPx[persona ?? 'none'][textLevel]}px`
  }, [persona, textLevel])

  return (
    <div className="min-h-[100dvh] bg-white">
      <a href="#main" className="sr-only z-50 rounded-full bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        {t('common.skip')}
      </a>
      <Header />
      <main id="main" className="min-h-[60dvh] pb-24 lg:pb-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {!focused && <Footer />}
      {!focused && <TabBar />}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed bottom-24 left-1/2 z-[60] w-[min(92vw,460px)] -translate-x-1/2 rounded-xl bg-ink px-4 py-3 text-center text-base font-medium text-white shadow-pop lg:bottom-8"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
