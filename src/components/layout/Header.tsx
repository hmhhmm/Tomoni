import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Check,
  Globe,
  Home,
  Users,
  MessageCircle,
  FileSignature,
  HeartPulse,
  Search,
  Heart,
  ListChecks,
  BedDouble,
  Menu,
  ShieldAlert,
  ALargeSmall,
  LayoutDashboard,
  UserRound,
  RotateCcw,
  Monitor,
  HandHeart,
  KeyRound,
  type LucideIcon,
} from 'lucide-react'
import { useStore } from '../../store'
import { useUI } from '../../ui'
import { Wordmark } from './Wordmark'
import { Avatar } from '../ui/Avatar'
import { RULES } from '../../tokens'

export interface NavItem {
  to: string
  icon: LucideIcon
  key: string
  badge?: number
  bottom?: boolean
}

export function useNav(): NavItem[] {
  const persona = useStore((s) => s.persona)
  const unread = useStore((s) => s.unread)
  const newApplicants = useStore((s) => s.applicants.filter((a) => a.status === 'new').length)
  const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0)
  if (persona === 'host') {
    return [
      { to: '/host', icon: Home, key: 'nav.today', bottom: true },
      { to: '/host/people', icon: Users, key: 'nav.people', badge: newApplicants, bottom: true },
      { to: '/messages', icon: MessageCircle, key: 'nav.messages', badge: sum(unread.host), bottom: true },
      { to: '/stay', icon: BedDouble, key: 'nav.stay', bottom: true },
      { to: '/agreement', icon: FileSignature, key: 'nav.agreement' },
      { to: '/host/checkin', icon: HeartPulse, key: 'nav.checkin', bottom: true },
    ]
  }
  if (persona === 'tenant') {
    return [
      { to: '/explore', icon: Search, key: 'nav.explore', bottom: true },
      { to: '/saved', icon: Heart, key: 'nav.saved', bottom: true },
      { to: '/messages', icon: MessageCircle, key: 'nav.messages', badge: sum(unread.tenant), bottom: true },
      { to: '/stay', icon: BedDouble, key: 'nav.stay', bottom: true },
      { to: '/log', icon: ListChecks, key: 'nav.log', bottom: true },
    ]
  }
  if (persona === 'family') return [{ to: '/family', icon: LayoutDashboard, key: 'nav.family', bottom: true }]
  return []
}

function Popover({
  button,
  children,
  align = 'right',
  label,
}: {
  button: (p: { open: boolean; toggle: () => void }) => ReactNode
  children: (close: () => void) => ReactNode
  align?: 'left' | 'right'
  label: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const down = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', down)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('mousedown', down)
      document.removeEventListener('keydown', key)
    }
  }, [open])
  return (
    <div ref={ref} className="relative">
      {button({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div
          role="dialog"
          aria-label={label}
          className={`absolute top-[calc(100%+8px)] z-50 w-[22rem] max-w-[calc(100vw-2rem)] animate-pop rounded-sheet border border-soft bg-white py-2 shadow-pop ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}

const Item = ({
  onClick,
  children,
  icon,
  checked,
  strong,
}: {
  onClick: () => void
  children: ReactNode
  icon?: ReactNode
  checked?: boolean
  strong?: boolean
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left text-[15px] hover:bg-surface ${strong ? 'font-semibold' : ''}`}
  >
    {icon && <span className="text-muted">{icon}</span>}
    <span className="min-w-0 flex-1 leading-snug">{children}</span>
    {checked && <Check size={18} aria-hidden className="text-teal-700" />}
  </button>
)
const Divider = () => <div className="my-2 border-t border-soft" role="separator" />

export function Header() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { persona, lang, setLang, setPersona, textLevel, setTextLevel, tenant, loadScenario } = useStore()
  const say = useUI((s) => s.say)
  const items = useNav()
  const key = persona ?? 'none'
  const sizes = RULES.rootPx[key]
  const who = { host: t('names.sato'), tenant: tenant.name, family: t('names.emi') }
  const hue = { host: 262, tenant: 172, family: 28 }

  const personas = [
    { id: 'host' as const, label: t('menu.asHost', { name: who.host }), icon: <KeyRound size={20} aria-hidden />, to: '/host' },
    { id: 'tenant' as const, label: t('menu.asTenant', { name: who.tenant }), icon: <Search size={20} aria-hidden />, to: '/explore' },
    { id: 'family' as const, label: t('menu.asFamily', { name: who.family }), icon: <HandHeart size={20} aria-hidden />, to: '/family' },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-soft bg-white/95 text-[15px] backdrop-blur" id="site-header">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center gap-3 whitespace-nowrap px-4 sm:px-6 lg:px-10 xl:px-20">
        <Link to="/" className="rounded-lg" aria-label="Tomoni home">
          <Wordmark />
        </Link>

        {items.length > 1 && (
          <nav aria-label="Main" className="ml-2 hidden min-w-0 flex-1 lg:block">
            <ul className="flex items-center gap-0.5">
              {items.map((it) => (
                <li key={it.to}>
                  <NavLink
                    to={it.to}
                    end={it.to === '/host'}
                    className={({ isActive }) =>
                      `relative flex h-11 items-center gap-2 rounded-full px-[12px] text-[15px] font-medium transition-colors ${isActive ? 'bg-surface font-semibold text-ink' : 'text-muted hover:bg-surface hover:text-ink'}`
                    }
                  >
                    <span>{t(it.key)}</span>
                    {!!it.badge && (
                      <span
                        className="grid h-5 min-w-5 place-items-center rounded-full bg-purple-600 px-1.5 text-xs font-bold text-white"
                        aria-label={t('nav.unread', { n: it.badge })}
                      >
                        {it.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {(persona === 'host' || persona === 'family') && (
            <Popover
              label={t('common.textSize')}
              button={({ toggle, open }) => (
                <button
                  type="button"
                  onClick={toggle}
                  aria-expanded={open}
                  className="hidden h-11 items-center gap-2 rounded-full px-[10px] sm:flex text-[15px] font-medium hover:bg-surface"
                >
                  <ALargeSmall size={22} aria-hidden />
                  <span className="hidden xl:inline">{t('common.textSize')}</span>
                  <span className="sr-only xl:hidden">{t('common.textSize')}</span>
                </button>
              )}
            >
              {(close) => (
                <div role="radiogroup" aria-label={t('common.textSize')}>
                  <p className="px-4 pb-1 pt-2 text-sm font-semibold text-muted">{t('common.textSize')}</p>
                  {[0, 1, 2].map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={textLevel === n}
                      onClick={() => {
                        setTextLevel(n as 0 | 1 | 2)
                        close()
                      }}
                      className="flex min-h-11 w-full items-center gap-3 px-4 text-left hover:bg-surface"
                    >
                      <span className="w-10 font-heading font-semibold" style={{ fontSize: sizes[n] }}>
                        {['A', 'A+', 'A++'][n]}
                      </span>
                      <span className="flex-1 text-base text-muted">{t(`common.size${n}`)}</span>
                      {textLevel === n && <Check size={18} aria-hidden className="text-teal-700" />}
                    </button>
                  ))}
                </div>
              )}
            </Popover>
          )}

          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'ja' : 'en')}
            className="flex h-11 items-center gap-2 rounded-full px-[10px] text-[15px] font-medium hover:bg-surface"
          >
            <Globe size={20} aria-hidden />
            <span className="sr-only">{t('lang.toggleLabel')}: </span>
            <span lang={lang === 'en' ? 'ja' : 'en'}>{lang === 'en' ? '日本語' : 'English'}</span>
          </button>

          <Link
            to="/safety"
            className="flex h-11 items-center gap-2 rounded-full bg-teal-50 px-[12px] text-[15px] font-semibold text-teal-700 ring-1 ring-teal-100 hover:bg-teal-100"
            aria-label={t('safety.open')}
          >
            <ShieldAlert size={20} aria-hidden />
            <span>{t('safety.short')}</span>
          </Link>

          <Popover
            label={t('menu.title')}
            button={({ toggle, open }) => (
              <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                aria-haspopup="dialog"
                className="flex h-11 items-center gap-2 rounded-full border border-line py-1 pl-3 pr-1 transition hover:shadow-lift"
              >
                <Menu size={18} aria-hidden />
                <span className="sr-only">{t('menu.title')}</span>
                {persona ? (
                  <Avatar hue={hue[persona]} size={34} label={who[persona]} />
                ) : (
                  <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-muted text-white">
                    <UserRound size={18} aria-hidden />
                  </span>
                )}
              </button>
            )}
          >
            {(close) => (
              <>
                <p className="px-4 pb-1 pt-2 text-sm font-semibold text-muted">{t('menu.switch')}</p>
                {personas.map((p) => (
                  <Item
                    key={p.id}
                    checked={persona === p.id}
                    icon={p.icon}
                    strong={persona === p.id}
                    onClick={() => {
                      setPersona(p.id)
                      close()
                      nav(p.id === 'family' && !useStore.getState().familyConsent ? '/family/invite' : p.to)
                    }}
                  >
                    {p.label}
                  </Item>
                ))}
                {(persona === 'host' || persona === 'family') && (
                  <>
                    <Divider />
                    <p className="px-4 pb-1 text-sm font-semibold text-muted">{t('common.textSize')}</p>
                    <div className="flex gap-2 px-4 pb-1" role="radiogroup" aria-label={t('common.textSize')}>
                      {[0, 1, 2].map((n) => (
                        <button
                          key={n}
                          type="button"
                          role="radio"
                          aria-checked={textLevel === n}
                          onClick={() => setTextLevel(n as 0 | 1 | 2)}
                          className={`h-10 flex-1 rounded-lg border text-[15px] font-semibold ${textLevel === n ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink'}`}
                        >
                          {['A', 'A+', 'A++'][n]}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <Divider />
                {persona === 'tenant' && (
                  <Item
                    icon={<UserRound size={20} aria-hidden />}
                    onClick={() => {
                      close()
                      nav('/account')
                    }}
                  >
                    {t('menu.account')}
                  </Item>
                )}
                <Item
                  icon={<ShieldAlert size={20} aria-hidden />}
                  onClick={() => {
                    close()
                    nav('/safety')
                  }}
                >
                  {t('menu.safety')}
                </Item>
                <Item
                  icon={<Monitor size={20} aria-hidden />}
                  onClick={() => {
                    close()
                    nav('/coordinator')
                  }}
                >
                  {t('menu.coordinator')}
                </Item>
                <Divider />
                <Item
                  icon={<BedDouble size={20} aria-hidden />}
                  onClick={() => {
                    loadScenario('living')
                    say(t('menu.loadedLiving'))
                    close()
                    nav('/stay')
                  }}
                >
                  {t('menu.loadLiving')}
                </Item>
                <Item
                  icon={<RotateCcw size={20} aria-hidden />}
                  onClick={() => {
                    loadScenario('start')
                    say(t('menu.loadedStart'))
                    close()
                    nav('/')
                  }}
                >
                  {t('menu.reset')}
                </Item>
              </>
            )}
          </Popover>
        </div>
      </div>
    </header>
  )
}
