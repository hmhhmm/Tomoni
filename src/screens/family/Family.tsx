import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, CalendarDays, Check, EyeOff, Hourglass, Phone, ThumbsDown, ThumbsUp } from 'lucide-react'
import { Page, Notice, FictionalTag } from '../../components/domain/Bits'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { HourMeter } from '../../components/domain/HourMeter'
import { Chip } from '../../components/ui/Chip'
import { useStore, weekHours } from '../../store'
import { MEET_SLOTS } from '../../data/journey'
import { formatDayTime } from '../../lib/format'
import { useUI } from '../../ui'

export function FamilyInvite() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { setFamilyConsent, setPersona } = useStore()
  return (
    <Page narrow className="py-10">
      <h1 className="text-[1.75rem] font-semibold">{t('invite.title')}</h1>
      <p className="mt-1 text-base text-muted">{t('invite.lede', { host: t('names.sato') })}</p>
      <div className="mt-6 flex items-center gap-3 rounded-card border border-line p-4">
        <Avatar hue={262} size={56} label={t('names.sato')} />
        <div>
          <p className="text-lg font-semibold">{t('names.sato')}</p>
          <FictionalTag />
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <section className="rounded-card border border-teal-100 bg-teal-50 p-5">
          <h2 className="text-lg font-semibold">{t('invite.seeTitle')}</h2>
          <ul className="mt-3 space-y-2">
            {(['a', 'b', 'c'] as const).map((k) => (
              <li key={k} className="flex gap-2 text-base">
                <Check size={18} aria-hidden className="mt-0.5 shrink-0 text-teal-700" />
                {t(`invite.seeItems.${k}`)}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-card border border-rose-200 bg-rose-50 p-5">
          <h2 className="text-lg font-semibold">{t('invite.neverTitle')}</h2>
          <ul className="mt-3 space-y-2">
            {(['a', 'b'] as const).map((k) => (
              <li key={k} className="flex gap-2 text-base">
                <EyeOff size={18} aria-hidden className="mt-0.5 shrink-0 text-rose-700" />
                {t(`invite.neverItems.${k}`)}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <p className="mt-5 text-base text-muted">{t('invite.revoke')}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant="dark"
          size="lg"
          onClick={() => {
            setFamilyConsent(true)
            nav('/family')
          }}
        >
          {t('invite.accept')}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => {
            setPersona(null)
            nav('/')
          }}
        >
          {t('invite.decline')}
        </Button>
      </div>
    </Page>
  )
}

export function FamilyDashboard() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const say = useUI((s) => s.say)
  const lang = useStore((s) => s.lang)
  const { familyConsent, setFamilyConsent, checkins, tasks, match } = useStore()
  if (!familyConsent) return <Navigate to="/family/invite" replace />

  const current = checkins[checkins.length - 1]
  const st = current?.status ?? 'pending'
  const hasStay = match.stage === 'living'
  const view = {
    good: { Icon: ThumbsUp, tone: 'border-teal-100 bg-teal-50', ic: 'text-teal-700', title: t('family.good'), body: t('family.goodBody') },
    notgood: {
      Icon: ThumbsDown,
      tone: 'border-amber-200 bg-amber-50',
      ic: 'text-amber-700',
      title: t('family.notGood'),
      body: t('family.notGoodBody'),
    },
    missed: { Icon: AlertTriangle, tone: 'border-rose-200 bg-rose-50', ic: 'text-rose-700', title: t('family.missed'), body: t('family.missedBody') },
    pending: { Icon: Hourglass, tone: 'border-line bg-surface', ic: 'text-muted', title: t('family.pending'), body: t('family.pendingBody') },
  }[st]
  const slot = MEET_SLOTS.find((s) => s.id === match.meetSlot)
  const fmt = (d: Date) => formatDayTime(d, lang)

  return (
    <Page className="py-8">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar hue={262} size={56} label={t('names.sato')} />
        <div>
          <h1 className="text-[1.75rem] font-semibold leading-tight">{t('family.title', { name: t('names.sato') })}</h1>
          <div className="mt-1 flex items-center gap-2">
            <FictionalTag />
            <span className="text-sm text-muted">{t('family.you')}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className={`rounded-sheet border p-8 ${view.tone}`} role="status">
          <view.Icon size={44} aria-hidden className={view.ic} />
          <p className="mt-4 text-sm font-semibold text-muted">{hasStay && current ? t('family.week', { n: current.week }) : t('family.noStay')}</p>
          <p className="mt-1 font-heading text-[2rem] font-semibold leading-tight">{hasStay ? view.title : t('family.beforeStay')}</p>
          <p className="mt-2 text-base">{hasStay ? view.body : t('family.beforeStayBody')}</p>
        </div>

        <div className="space-y-6">
          <section className="flex items-center gap-5 rounded-card border border-line p-5">
            <HourMeter variant="ring" value={weekHours(tasks, true)} size={104} label={t('meter.week')} />
            <div>
              <h2 className="text-lg font-semibold">{t('family.hours')}</h2>
              <p className="text-base text-muted">{t('family.hoursBody')}</p>
            </div>
          </section>
          <section className="rounded-card border border-line p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <CalendarDays size={20} aria-hidden />
              {t('family.upcoming')}
            </h2>
            <ul className="mt-3 space-y-2 text-base">
              {hasStay && (
                <li className="flex items-center justify-between gap-2 rounded-lg bg-surface px-3 py-2">
                  <span>{t('family.dinner')}</span>
                  <Chip>{t('family.sunday')}</Chip>
                </li>
              )}
              {slot && (
                <li className="flex items-center justify-between gap-2 rounded-lg bg-surface px-3 py-2">
                  <span>{t('family.meetup')}</span>
                  <Chip>{fmt(slot.date())}</Chip>
                </li>
              )}
              {!hasStay && !slot && <li className="text-muted">{t('family.noUpcoming')}</li>}
            </ul>
          </section>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          variant="dark"
          size="lg"
          icon={<Phone size={18} aria-hidden />}
          onClick={() => {
            say(t('family.contacted'))
            nav('/safety')
          }}
        >
          {t('family.contact')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setFamilyConsent(false)
            nav('/family/invite')
          }}
        >
          {t('family.stop')}
        </Button>
      </div>
      <div className="mt-6 max-w-2xl">
        <Notice tone="neutral" icon={<EyeOff size={20} aria-hidden />} title={t('family.private')}>
          {t('family.privateBody')}
        </Notice>
      </div>
    </Page>
  )
}
