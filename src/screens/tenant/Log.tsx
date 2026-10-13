import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Clock, Info, ListChecks } from 'lucide-react'
import { Page, EmptyState, Notice } from '../../components/domain/Bits'
import { Button, LinkButton } from '../../components/ui/Button'
import { Chip, Pill } from '../../components/ui/Chip'
import { Stepper } from '../../components/ui/Stepper'
import { HourMeter } from '../../components/domain/HourMeter'
import { useStore, weekHours } from '../../store'
import { HELP_ORDER } from '../../data/seed'
import { HELP_ICONS } from '../../lib/helps'
import { formatDay } from '../../lib/format'
import { useUI } from '../../ui'
import { RULES } from '../../tokens'
import type { HelpId } from '../../data/types'

export function Log() {
  const { t } = useTranslation()
  const lang = useStore((s) => s.lang)
  const { helps, tasks, logTask, tenant, patchTenant, match } = useStore()
  const say = useUI((s) => s.say)
  const [pick, setPick] = useState<HelpId | null>(null)
  const active = match.applicantId === 'a1' && (match.stage === 'trial' || match.stage === 'living' || match.stage === 'pact')

  if (!active) {
    return (
      <Page narrow className="py-10">
        <EmptyState
          icon={<ListChecks size={26} aria-hidden />}
          title={t('log.emptyTitle')}
          body={t('log.emptyBody')}
          action={
            <LinkButton to="/stay" variant="dark">
              {t('nav.stay')}
            </LinkButton>
          }
        />
      </Page>
    )
  }

  const done = weekHours(tasks, true)
  const all = weekHours(tasks, false)
  const pendingH = all - done
  const capLeft = RULES.weeklyHourCap - all
  const options = HELP_ORDER.filter((h) => helps[h])
  const student = tenant.residence === 'student'
  const used = tenant.otherHours + all
  const near = used >= RULES.studentWeeklyLimit - 4

  const choose = (h: number) => {
    if (!pick) return
    if (!logTask(pick, h)) {
      say(t('log.overCap'))
      return
    }
    setPick(null)
    say(t('log.logged'))
  }

  return (
    <Page className="py-8">
      <h1 className="text-[1.75rem] font-semibold">{t('log.title')}</h1>
      <p className="mt-1 text-base text-muted">{t('log.lede')}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-card border border-line p-6">
          <h2 className="mb-4 text-lg font-semibold">{t('log.thisWeek')}</h2>
          <div className="flex items-center gap-6">
            <HourMeter variant="ring" value={all} size={128} label={t('meter.week')} />
            <div className="space-y-1 text-base">
              <p>
                <span className="font-semibold tabular-nums">{done}</span> h {t('log.confirmedWord')}
              </p>
              <p className="text-amber-700">
                <span className="font-semibold tabular-nums">{pendingH}</span> h {t('log.waitingWord')}
              </p>
              <p className="text-muted">{t('log.left', { n: Math.max(0, capLeft) })}</p>
            </div>
          </div>
        </section>

        {student && (
          <section className={`rounded-card border p-6 ${near ? 'border-amber-200 bg-amber-50' : 'border-line'}`}>
            <h2 className="text-lg font-semibold">{t('log.tracker')}</h2>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-base">{t('log.trackerCount', { used, max: RULES.studentWeeklyLimit })}</span>
              <span className={`text-xl font-semibold tabular-nums ${near ? 'text-amber-700' : ''}`}>
                {used} / {RULES.studentWeeklyLimit} h
              </span>
            </div>
            <div
              role="meter"
              aria-label={t('log.tracker')}
              aria-valuemin={0}
              aria-valuemax={RULES.studentWeeklyLimit}
              aria-valuenow={used}
              className="mt-2 h-3 overflow-hidden rounded-full bg-soft"
            >
              <div
                className={`h-full rounded-full ${near ? 'bg-amber-700' : 'bg-ink'}`}
                style={{ width: `${Math.min(100, (used / RULES.studentWeeklyLimit) * 100)}%` }}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-base">{t('log.otherHours')}</span>
              <Stepper
                value={tenant.otherHours}
                min={0}
                max={28}
                label={t('log.otherHours')}
                format={(n) => `${n} h`}
                decLabel={t('common.less')}
                incLabel={t('common.more')}
                onChange={(v) => patchTenant({ otherHours: v })}
              />
            </div>
            <p className="mt-3 flex gap-2 text-sm text-muted">
              <Info size={16} aria-hidden className="mt-0.5 shrink-0" />
              {t('log.trackerNote')}
            </p>
            {near && (
              <p role="status" className="mt-2 text-base font-semibold text-amber-700">
                {t('log.trackerNear')}
              </p>
            )}
          </section>
        )}
      </div>

      <section className="mt-6 rounded-card border border-line p-6">
        <h2 className="text-lg font-semibold">{t('log.twoTap')}</h2>
        <p className="mt-1 text-base text-muted">{pick ? t('log.tap2', { name: t(`help.${pick}.title`) }) : t('log.tap1')}</p>
        {!pick ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {options.map((h) => {
              const Icon = HELP_ICONS[h]
              return (
                <li key={h}>
                  <button
                    type="button"
                    onClick={() => setPick(h)}
                    className="flex h-16 w-full items-center gap-3 rounded-card border border-line px-4 text-left font-semibold transition hover:border-ink"
                  >
                    <Icon size={22} aria-hidden />
                    <span>{t(`help.${h}.title`)}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {[1, 2, 3].map((h) => (
              <Pill key={h} selected={false} onClick={() => choose(h)}>
                {t('log.hours', { n: h })}
              </Pill>
            ))}
            <Button variant="ghost" onClick={() => setPick(null)}>
              {t('common.back')}
            </Button>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-card border border-line p-6">
        <h2 className="text-lg font-semibold">{t('log.recent')}</h2>
        {tasks.length === 0 ? (
          <p className="mt-2 text-base text-muted">{t('log.none')}</p>
        ) : (
          <ul className="mt-2 divide-y divide-soft">
            {[...tasks].reverse().map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-base">
                <span className="font-medium">
                  {t(`help.${e.help}.title`)} · {e.hours} h <span className="text-muted">({formatDay(e.date, lang)})</span>
                </span>
                {e.status === 'confirmed' ? (
                  <Chip tone="teal" icon={<CheckCircle2 size={14} aria-hidden />}>
                    {t('log.statusDone')}
                  </Chip>
                ) : (
                  <Chip tone="amber" icon={<Clock size={14} aria-hidden />}>
                    {t('log.statusWait', { name: t('names.sato') })}
                  </Chip>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      <div className="mt-6">
        <Notice tone="neutral">{t('log.hostConfirms')}</Notice>
      </div>
    </Page>
  )
}
