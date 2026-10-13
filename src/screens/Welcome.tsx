import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Home, Search, HeartHandshake, ChevronRight, Monitor } from 'lucide-react'
import { Wordmark } from '../components/Wordmark'
import { useStore } from '../store'
import { ConceptFooter } from '../components/Misc'
import type { Role } from '../data/types'

export default function Welcome() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { setRole, tenant, familyConsent } = useStore()

  const go = (role: Role, to: string) => { setRole(role); nav(to) }
  const roles = [
    { role: 'host' as const, icon: Home, title: t('welcome.host'), sub: t('welcome.hostSub'), to: '/host/home', tone: 'bg-purple-600 text-white', sub2: 'text-white' },
    { role: 'tenant' as const, icon: Search, title: t('welcome.tenant'), sub: t('welcome.tenantSub'), to: '/tenant/onboarding', tone: 'bg-white text-ink border border-line', sub2: 'text-muted' },
    { role: 'family' as const, icon: HeartHandshake, title: t('welcome.family'), sub: t('welcome.familySub'), to: familyConsent ? '/family/dashboard' : '/family/invite', tone: 'bg-white text-ink border border-line', sub2: 'text-muted' },
  ]
  void tenant

  return (
    <div className="px-4 pb-8 pt-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="relative overflow-hidden rounded-sheet bg-gradient-to-br from-purple-100 via-white to-teal-100 p-5 shadow-soft">
          <div aria-hidden className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-purple-200/50 blur-2xl" />
          <div aria-hidden className="absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-teal-300/40 blur-2xl" />
          <div className="relative">
            <Wordmark size="lg" />
            <h1 className="mt-4 text-[1.75rem] font-semibold leading-snug">{t('welcome.tagline')}</h1>
            <p className="mt-2 text-base text-ink/80">{t('welcome.sub')}</p>
          </div>
        </div>

        <h2 className="mb-3 mt-6 text-lg font-semibold">{t('welcome.who')}</h2>
        <ul className="space-y-3">
          {roles.map((r) => (
            <li key={r.role}>
              <button
                type="button"
                onClick={() => go(r.role, r.to)}
                className={`flex min-h-[4.5rem] w-full items-center gap-4 rounded-card p-4 text-left shadow-soft transition active:scale-[.99] ${r.tone}`}
              >
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${r.role === 'host' ? 'bg-white/20' : 'bg-purple-50 text-purple-700'}`}>
                  <r.icon size={26} aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="block font-heading text-lg font-semibold leading-tight">{r.title}</span>
                  <span className={`block text-sm ${r.sub2}`}>{r.sub}</span>
                </span>
                <ChevronRight size={22} aria-hidden />
              </button>
            </li>
          ))}
        </ul>

        <button type="button" onClick={() => nav('/coordinator')} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-full text-base font-semibold text-purple-700 hover:bg-purple-50">
          <Monitor size={18} aria-hidden /> {t('welcome.coordinator')}
        </button>
        <ConceptFooter />
      </motion.div>
    </div>
  )
}
