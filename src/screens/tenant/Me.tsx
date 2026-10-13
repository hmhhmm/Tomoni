import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, ShieldCheck, Gauge, CalendarClock, MessageSquareHeart, Flag, LogOut } from 'lucide-react'
import { Screen } from '../../components/Screen'
import { Card } from '../../components/Card'
import { Avatar } from '../../components/Avatar'
import { FictionalTag, VerifiedBadge } from '../../components/Misc'
import { useStore } from '../../store'

export function Me() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { tenant, setRole } = useStore()
  const rows = [
    { icon: ShieldCheck, label: t('me.verify'), to: '/tenant/onboarding' },
    { icon: Gauge, label: t('me.tracker'), to: '/tenant/tasks' },
    { icon: CalendarClock, label: t('me.trial'), to: '/trial' },
    { icon: MessageSquareHeart, label: t('me.pulse'), to: '/tenant/pulse' },
    { icon: Flag, label: t('me.report'), to: '/safety?report=1' },
  ]
  return (
    <Screen title={t('me.title')} footer>
      <Card className="flex items-center gap-4">
        <Avatar hue={172} size={64} label={tenant.name} />
        <div>
          <p className="font-heading text-xl font-semibold">{tenant.name}, 22</p>
          <p className="text-base text-muted">{t(`onb.res.${tenant.residence}`)}</p>
          <div className="mt-1 flex flex-wrap gap-1.5"><VerifiedBadge /><FictionalTag /></div>
        </div>
      </Card>
      <ul className="space-y-2">
        {rows.map((r) => (
          <li key={r.to + r.label}>
            <button type="button" onClick={() => nav(r.to)} className="flex min-h-14 w-full items-center gap-3 rounded-2xl border border-line bg-white px-4 text-left text-base font-semibold shadow-soft">
              <r.icon size={22} aria-hidden className="text-purple-700" />
              <span className="flex-1">{r.label}</span>
              <ChevronRight size={20} aria-hidden className="text-muted" />
            </button>
          </li>
        ))}
        <li>
          <button type="button" onClick={() => { setRole(null); nav('/') }} className="flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 text-left text-base font-semibold text-muted">
            <LogOut size={22} aria-hidden /> {t('me.switch')}
          </button>
        </li>
      </ul>
    </Screen>
  )
}
