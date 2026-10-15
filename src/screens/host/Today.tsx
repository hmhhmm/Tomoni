import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, CheckCircle2, ClipboardCheck, Pencil, Clock } from 'lucide-react'
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
import { formatDay } from '../../lib/format'
import { useL } from '../../lib/hooks'
import { SATO_HUE } from '../../tokens'

export function HostToday() {
  const { t } = useTranslation()
  const text = useL()
  const nav = useNavigate()
  const { draft, helps, applicants, match, tasks, confirmTask, lang } = useStore()
  const area = AREAS.find((a) => a.id === draft.areaId)!
  const c = costs(draft.standardRent, draft.homeshareRent, helps)
  const pending = tasks.filter((x) => x.status === 'pending')
  const idx = stageIndex(match.stage)
  const partner = applicants.find((a) => a.id === match.applicantId)
  const hour = new Date().getHours()
  const greet = hour < 11 ? 'greet.morning' : hour < 17 ? 'greet.day' : 'greet.evening'

  const next = {
    none: { label: t('today.next.none'), to: '/saito/people' },
    meet: { label: t('today.next.meet'), to: '/saito/stay' },
    trial: { label: t('today.next.trial'), to: '/saito/stay' },
    pact: { label: t('today.next.pact'), to: '/saito/agreement' },
    living: { label: t('today.next.living'), to: '/saito/checkin' },
    ended: { label: t('today.next.ended'), to: '/saito/people' },
  }[match.stage]

  return (
    <Page className="py-8">
      <div className="mb-8 flex items-center gap-3">
        <Avatar hue={SATO_HUE} size={56} label={t('names.sato')} />
        <div>
          <h1 className="text-[1.75rem] font-semibold leading-tight">{t(greet, { name: t('names.sato') })}</h1>
          <FictionalTag />
        </div>
      </div>

      {/* Logged help waiting for her OK comes first: it is the one thing only she can do. */}
      {pending.length > 0 && (
        <section aria-labelledby="confirm-title" className="mb-10 rounded-sheet border border-line bg-white p-5 shadow-lift sm:p-6">
          <h2 id="confirm-title" className="flex items-center gap-2 text-xl font-semibold">
            <ClipboardCheck size={24} aria-hidden className="text-teal-700" />
            {t('today.confirmTitle', { name: partner?.name ?? 'Aisyah', count: pending.length })}
          </h2>
          <p className="mt-1 text-base text-muted">{t('today.confirmBody')}</p>
          <ul className="mt-4 space-y-2">
            {pending.map((p) => {
              const Icon = HELP_ICONS[p.help]
              return (
                <li
                  key={p.id}
                  className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-card bg-surface px-4 py-3 sm:grid-cols-[auto_1fr_auto]"
                >
                  <Icon size={22} aria-hidden />
                  <span className="text-base font-medium">
                    {t(`help.${p.help}.title`)} · {p.hours} h · {formatDay(p.date, lang)}
                  </span>
                  <Button
                    size="md"
                    variant="teal"
                    className="max-sm:col-span-2 max-sm:w-full"
                    icon={<CheckCircle2 size={18} aria-hidden />}
                    onClick={() => confirmTask(p.id)}
                  >
                    {t('today.confirm')}
                  </Button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

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
                  variant={pending.length > 0 ? 'secondary' : 'primary'}
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
        </div>

        <aside className="space-y-6">
          <section className="overflow-hidden rounded-card border border-line">
            <div className="aspect-[16/10]">
              <Photo hue={SATO_HUE} scene="room" />
            </div>
            <div className="space-y-3 p-5">
              <div>
                <h2 className="text-lg font-semibold">{t('today.yourRoom')}</h2>
                <p className="text-base text-muted">
                  {text(area)} · {t('card.jo', { n: draft.sizeJo })} · {draft.published ? t('today.published') : t('today.unpublished')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <LinkButton to="/saito/create/1" variant="secondary" size="sm" icon={<Pencil size={14} aria-hidden />}>
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
            <LinkButton to="/saito/help" variant="secondary" size="sm" className="mt-4" icon={<Clock size={14} aria-hidden />}>
              {t('today.editHelp')}
            </LinkButton>
          </section>
        </aside>
      </div>
    </Page>
  )
}
