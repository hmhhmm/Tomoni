import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, CheckCircle2, ClipboardCheck, MessageCircle, Pencil, Users, HeartPulse, Clock } from 'lucide-react'
import { Page, FictionalTag, SectionTitle } from '../../components/domain/Bits'
import { Avatar } from '../../components/ui/Avatar'
import { Button, LinkButton } from '../../components/ui/Button'
import { Photo } from '../../components/ui/Photo'
import { StepBar } from '../../components/domain/StepBar'
import { HourMeter } from '../../components/domain/HourMeter'
import { useStore, trialDay } from '../../store'
import { costs } from '../../data/pricing'
import { stageIndex } from '../../data/journey'
import { AREAS } from '../../data/seed'
import { HELP_ICONS } from '../../lib/helps'
import { useL, yen } from '../../lib/hooks'

export function HostToday() {
  const { t } = useTranslation()
  const text = useL()
  const nav = useNavigate()
  const { draft, helps, applicants, match, tasks, confirmTask, checkins, unread } = useStore()
  const area = AREAS.find((a) => a.id === draft.areaId)!
  const c = costs(draft.standardRent, draft.homeshareRent, helps)
  const pending = tasks.filter((x) => x.status === 'pending')
  const newApps = applicants.filter((a) => a.status === 'new')
  const unreadN = Object.values(unread.host).reduce((a, b) => a + b, 0)
  const idx = stageIndex(match.stage)
  const partner = applicants.find((a) => a.id === match.applicantId)
  const pendingCheckin = checkins.find((x) => x.status === 'pending')
  const last = [...checkins].reverse().find((x) => x.status !== 'pending')
  const hour = new Date().getHours()
  const greet = hour < 11 ? 'greet.morning' : hour < 17 ? 'greet.day' : 'greet.evening'

  const next = {
    none: { label: t('today.next.none'), to: '/host/people' },
    meet: { label: t('today.next.meet'), to: '/stay' },
    trial: { label: t('today.next.trial'), to: '/stay' },
    pact: { label: t('today.next.pact'), to: '/agreement' },
    living: { label: t('today.next.living'), to: '/host/checkin' },
    ended: { label: t('today.next.ended'), to: '/host/people' },
  }[match.stage]

  const todos = [
    ...(pending.length ? [{ icon: ClipboardCheck, title: t('today.todoConfirm', { count: pending.length }), to: null as null | string }] : []),
    ...(newApps.length ? [{ icon: Users, title: t('today.todoApplicants', { count: newApps.length }), to: '/host/people' }] : []),
    ...(unreadN ? [{ icon: MessageCircle, title: t('today.todoMessages', { count: unreadN }), to: '/messages' }] : []),
    ...(match.stage === 'living' && pendingCheckin
      ? [{ icon: HeartPulse, title: t('today.todoCheckin', { week: pendingCheckin.week }), to: '/host/checkin' }]
      : []),
  ]

  return (
    <Page className="py-8">
      <div className="mb-8 flex items-center gap-3">
        <Avatar hue={262} size={56} label={t('names.sato')} />
        <div>
          <h1 className="text-[1.75rem] font-semibold leading-tight">{t(greet, { name: t('names.sato') })}</h1>
          <FictionalTag />
        </div>
      </div>

      {/* Metrics computed from real state */}
      <section aria-label={t('today.metrics')} className="mb-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Metric
          label={t('today.mApplicants')}
          value={String(applicants.filter((a) => a.status !== 'declined').length)}
          sub={t('today.mApplicantsSub', { n: newApps.length })}
        />
        <Metric label={t('today.mHours')} value={`${c.weeklyHours} / 10 h`} sub={t('today.mHoursSub', { m: c.monthlyHours })} />
        <Metric
          label={t('today.mRent')}
          value={yen(draft.homeshareRent)}
          sub={t('today.mRentSub', { pct: c.discountPct, std: yen(draft.standardRent) })}
        />
        <Metric
          label={t('today.mCheckin')}
          value={last ? t(`checkin.status.${last.status}`) : match.stage === 'living' ? t('checkin.status.pending') : '—'}
          sub={last ? t('checkin.week', { n: last.week }) : t('today.mCheckinNone')}
          tone={last?.status === 'good' ? 'teal' : last?.status === 'notgood' ? 'amber' : undefined}
        />
      </section>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-10">
          <section>
            <SectionTitle>{t('today.journey')}</SectionTitle>
            <div className="rounded-card border border-line p-6">
              <StepBar steps={[t('steps.meet'), t('steps.trial'), t('steps.pact'), t('steps.living')]} current={idx} />
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-soft pt-5">
                <p className="max-w-md text-base text-muted">
                  {match.stage === 'trial' && partner
                    ? t('today.trialDay', { name: partner.name, n: trialDay(match), total: match.trialWeeks * 7 })
                    : match.stage === 'ended'
                      ? t('today.endedNote')
                      : match.stage === 'none'
                        ? t('today.noneNote')
                        : partner
                          ? t('today.withNote', { name: partner.name })
                          : ''}
                </p>
                <Button
                  variant="dark"
                  size="lg"
                  icon={<ArrowRight size={18} aria-hidden />}
                  className="flex-row-reverse"
                  onClick={() => nav(next.to)}
                >
                  {next.label}
                </Button>
              </div>
            </div>
          </section>

          <section>
            <SectionTitle>{t('today.todo')}</SectionTitle>
            {todos.length === 0 && pending.length === 0 ? (
              <p className="flex items-center gap-2 rounded-card border border-dashed border-line p-5 text-base text-muted">
                <CheckCircle2 size={20} aria-hidden className="text-teal-700" />
                {t('today.allDone')}
              </p>
            ) : (
              <ul className="divide-y divide-soft rounded-card border border-line">
                {todos.map((td) => (
                  <li key={td.title} className="flex items-center gap-4 px-5 py-4">
                    <td.icon size={22} aria-hidden />
                    <span className="flex-1 text-base font-medium">{td.title}</span>
                    {td.to && (
                      <LinkButton to={td.to} variant="secondary" size="sm">
                        {t('common.open')}
                      </LinkButton>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {pending.length > 0 && (
              <ul className="mt-4 divide-y divide-soft rounded-card border border-line">
                {pending.map((p) => {
                  const Icon = HELP_ICONS[p.help]
                  return (
                    <li key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                      <Icon size={22} aria-hidden />
                      <span className="flex-1 text-base font-medium">
                        {t(`help.${p.help}.title`)} · {p.hours} h · {partner?.name ?? 'Aisyah'}
                      </span>
                      <Button size="sm" variant="teal" icon={<CheckCircle2 size={16} aria-hidden />} onClick={() => confirmTask(p.id)}>
                        {t('today.confirm')}
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="overflow-hidden rounded-card border border-line">
            <div className="aspect-[16/10]">
              <Photo hue={262} scene="room" />
            </div>
            <div className="space-y-3 p-5">
              <div>
                <h2 className="text-lg font-semibold">{t('today.yourRoom')}</h2>
                <p className="text-base text-muted">
                  {text(area)} · {t('card.jo', { n: draft.sizeJo })} · {draft.published ? t('today.published') : t('today.unpublished')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <LinkButton to="/host/create/1" variant="secondary" size="sm" icon={<Pencil size={14} aria-hidden />}>
                  {t('today.editListing')}
                </LinkButton>
                <LinkButton to="/rooms/l1" variant="ghost" size="sm">
                  {t('today.viewListing')}
                </LinkButton>
              </div>
            </div>
          </section>
          <section className="rounded-card border border-line p-5">
            <HourMeter value={c.weeklyHours} />
            <ul className="mt-4 flex flex-wrap gap-2">
              {Object.entries(helps).map(([id, v]) => (
                <li key={id} className="rounded-full bg-surface px-3 py-1 text-sm">
                  {t(`help.${id}.title`)} · {v!.h} h
                </li>
              ))}
            </ul>
            <LinkButton to="/host/help" variant="secondary" size="sm" className="mt-4" icon={<Clock size={14} aria-hidden />}>
              {t('today.editHelp')}
            </LinkButton>
          </section>
        </aside>
      </div>
    </Page>
  )
}

function Metric({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: 'teal' | 'amber' }) {
  return (
    <div className="rounded-card border border-line p-4 sm:p-5">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p
        className={`mt-1 text-[1.25rem] sm:text-[1.5rem] font-semibold tabular-nums leading-tight ${tone === 'teal' ? 'text-teal-700' : tone === 'amber' ? 'text-amber-700' : ''}`}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-muted">{sub}</p>
    </div>
  )
}
