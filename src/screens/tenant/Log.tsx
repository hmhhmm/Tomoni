import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Clock, Info, ListChecks, PartyPopper, Plus } from 'lucide-react'
import { Page, EmptyState } from '../../components/domain/Bits'
import { LinkButton } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import { Stepper } from '../../components/ui/Stepper'
import { HourMeter } from '../../components/domain/HourMeter'
import { agreedHelps, startOfWeek, useStore, weekHours } from '../../store'
import { HELP_ORDER } from '../../data/seed'
import { HELP_ICONS } from '../../lib/helps'
import { formatDay } from '../../lib/format'
import { useUI } from '../../ui'
import { RULES } from '../../tokens'
import type { HelpId } from '../../data/types'

/** A colour per task so the log reads at a glance (fills only; text stays at AA contrast). */
const TINT: Record<HelpId, { tile: string; icon: string; pill: string }> = {
  groceries: {
    tile: 'hover:border-amber-200 hover:bg-amber-50',
    icon: 'bg-amber-50 text-amber-700',
    pill: 'bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-200/60',
  },
  garden: {
    tile: 'hover:border-teal-100 hover:bg-teal-50',
    icon: 'bg-teal-50 text-teal-700',
    pill: 'bg-teal-50 text-teal-700 ring-teal-100 hover:bg-teal-100',
  },
  cooking: {
    tile: 'hover:border-purple-100 hover:bg-purple-50',
    icon: 'bg-purple-50 text-purple-700',
    pill: 'bg-purple-50 text-purple-700 ring-purple-100 hover:bg-purple-100',
  },
  company: {
    tile: 'hover:border-purple-100 hover:bg-purple-50',
    icon: 'bg-purple-100 text-purple-700',
    pill: 'bg-purple-50 text-purple-700 ring-purple-100 hover:bg-purple-100',
  },
  walks: {
    tile: 'hover:border-teal-100 hover:bg-teal-50',
    icon: 'bg-teal-100 text-teal-700',
    pill: 'bg-teal-50 text-teal-700 ring-teal-100 hover:bg-teal-100',
  },
  parcels: {
    tile: 'hover:border-amber-200 hover:bg-amber-50',
    icon: 'bg-amber-50 text-amber-700',
    pill: 'bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-200/60',
  },
}

export function Log() {
  const { t } = useTranslation()
  const lang = useStore((s) => s.lang)
  const { pactHelps, declined, tasks, logTask, tenant, patchTenant, match } = useStore()
  const say = useUI((s) => s.say)
  const [pick, setPick] = useState<HelpId | null>(null)
  const [justLogged, setJustLogged] = useState<{ help: HelpId; hours: number } | null>(null)
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
  // Only tasks in the agreement, minus any the housemate declined.
  const agreed = agreedHelps({ pactHelps, declined })
  const options = HELP_ORDER.filter((h) => agreed[h])
  const student = tenant.residence === 'student'
  const used = tenant.otherHours + all
  const near = used >= RULES.studentWeeklyLimit - 4

  // Mon-Sun strip: which days this week have help logged.
  const monday = startOfWeek()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const entries = tasks.filter((x) => new Date(x.date).toDateString() === d.toDateString())
    return { d, entries, today: d.toDateString() === new Date().toDateString() }
  })

  const choose = (h: number) => {
    if (!pick) return
    const r = logTask(pick, h)
    if (r !== 'ok') {
      say(t(r === 'student' ? 'log.overStudent' : 'log.overCap'))
      return
    }
    setJustLogged({ help: pick, hours: h })
    setPick(null)
  }

  return (
    <Page className="py-8">
      <h1 className="text-[1.75rem] font-semibold">{t('log.title')}</h1>
      <p className="mt-1 text-base text-muted">{t('log.lede', { name: t('names.sato') })}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* 1. Log today's help: the main action */}
        <section className="rounded-sheet border border-line p-6 shadow-soft">
          <h2 className="text-xl font-semibold">{t('log.twoTap')}</h2>
          <p className="mt-1 text-base text-muted">{pick ? t('log.tap2', { name: t(`help.${pick}.title`) }) : t('log.tap1')}</p>

          <AnimatePresence>
            {justLogged && !pick && (
              <motion.div
                role="status"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-center gap-3 rounded-card border border-teal-100 bg-teal-50 p-3 text-teal-700"
              >
                <PartyPopper size={22} aria-hidden className="shrink-0" />
                <p className="flex-1 text-base">
                  <strong>{t('log.niceTitle')}</strong>{' '}
                  {t('log.nice', { n: justLogged.hours, task: t(`help.${justLogged.help}.title`), name: t('names.sato') })}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!pick ? (
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {options.map((h) => {
                const Icon = HELP_ICONS[h]
                return (
                  <li key={h}>
                    <button
                      type="button"
                      onClick={() => {
                        setJustLogged(null)
                        setPick(h)
                      }}
                      className={`group flex h-full w-full flex-col items-start gap-3 rounded-card border border-line p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lift active:scale-[.98] ${TINT[h].tile}`}
                    >
                      <span className={`grid h-11 w-11 place-items-center rounded-full ${TINT[h].icon}`}>
                        <Icon size={22} aria-hidden />
                      </span>
                      <span className="font-semibold leading-tight">{t(`help.${h}.title`)}</span>
                      <span className="mt-auto flex items-center gap-1 text-sm text-muted group-hover:text-ink">
                        <Plus size={14} aria-hidden /> {t('log.add')}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="mt-5">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = HELP_ICONS[pick]
                  return (
                    <span className={`grid h-12 w-12 place-items-center rounded-full ${TINT[pick].icon}`}>
                      <Icon size={24} aria-hidden />
                    </span>
                  )
                })()}
                <p className="text-lg font-semibold">{t(`help.${pick}.title`)}</p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3" role="group" aria-label={t('log.tap2', { name: t(`help.${pick}.title`) })}>
                {[1, 2, 3].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => choose(h)}
                    className={`h-16 rounded-card text-xl font-semibold tabular-nums ring-1 transition active:scale-[.97] ${TINT[pick].pill}`}
                  >
                    {t('log.hours', { n: h })}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setPick(null)}
                className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-base font-medium text-muted hover:bg-surface hover:text-ink"
              >
                <ArrowLeft size={16} aria-hidden /> {t('common.back')}
              </button>
            </div>
          )}
        </section>

        {/* 2. This week at a glance */}
        <section className="rounded-sheet bg-gradient-to-br from-purple-50 to-teal-50 p-6">
          <h2 className="text-lg font-semibold">{t('log.thisWeek')}</h2>
          <div className="mt-4 flex items-center gap-5">
            <HourMeter variant="ring" value={all} size={120} label={t('meter.week')} />
            <div className="flex flex-col items-start gap-2">
              <Chip tone="teal" icon={<CheckCircle2 size={14} aria-hidden />}>
                {t('log.confirmedChip', { n: done })}
              </Chip>
              {pendingH > 0 && (
                <Chip tone="purple" icon={<Clock size={14} aria-hidden />}>
                  {t('log.waitingChip', { n: pendingH })}
                </Chip>
              )}
              <span className="text-sm text-muted">{t('log.left', { n: Math.max(0, capLeft) })}</span>
            </div>
          </div>
          <ol className="mt-6 grid grid-cols-7 gap-1.5" aria-label={t('log.weekStrip')}>
            {days.map(({ d, entries, today }) => (
              <li key={d.toISOString()} className="flex flex-col items-center gap-1.5">
                <span className={`text-xs ${today ? 'font-semibold text-ink' : 'text-muted'}`}>
                  {d.toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-GB', { weekday: 'narrow' })}
                </span>
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full text-xs font-semibold tabular-nums ${entries.length ? 'bg-purple-600 text-white' : today ? 'bg-white ring-2 ring-purple-600' : 'bg-white/70 text-muted'}`}
                  title={entries.map((x) => `${t(`help.${x.help}.title`)} ${x.hours} h`).join(', ')}
                >
                  {entries.length ? entries.reduce((a, x) => a + x.hours, 0) : d.getDate()}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* 3. Recent entries */}
      <section className="mt-6 rounded-card border border-line p-6">
        <h2 className="text-lg font-semibold">{t('log.recent')}</h2>
        {tasks.length === 0 ? (
          <p className="mt-2 text-base text-muted">{t('log.none')}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {[...tasks].reverse().map((e) => {
              const Icon = HELP_ICONS[e.help]
              return (
                <li key={e.id} className="flex flex-wrap items-center gap-3 rounded-card bg-surface px-4 py-3">
                  <span className={`grid h-10 w-10 place-items-center rounded-full ${TINT[e.help].icon}`}>
                    <Icon size={20} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">
                      {t(`help.${e.help}.title`)} · {e.hours} h
                    </span>
                    <span className="block text-sm text-muted">{formatDay(e.date, lang)}</span>
                  </span>
                  {e.status === 'confirmed' ? (
                    <Chip tone="teal" icon={<CheckCircle2 size={14} aria-hidden />}>
                      {t('log.statusDone')}
                    </Chip>
                  ) : (
                    <Chip tone="purple" icon={<Clock size={14} aria-hidden />}>
                      {t('log.statusWait', { name: t('names.sato') })}
                    </Chip>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* 4. Student limit: calm unless close to the limit */}
      {student && (
        <section className={`mt-6 rounded-card border p-6 ${near ? 'border-amber-200 bg-amber-50' : 'border-line'}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">{t('log.tracker')}</h2>
            <span className={`text-base font-semibold tabular-nums ${near ? 'text-amber-700' : 'text-muted'}`}>
              {used} / {RULES.studentWeeklyLimit} h
            </span>
          </div>
          <div
            role="meter"
            aria-label={t('log.tracker')}
            aria-valuemin={0}
            aria-valuemax={RULES.studentWeeklyLimit}
            aria-valuenow={used}
            aria-valuetext={t('log.trackerCount', { used, max: RULES.studentWeeklyLimit })}
            className="mt-3 h-2.5 overflow-hidden rounded-full bg-soft"
          >
            <div
              className={`h-full rounded-full ${near ? 'bg-amber-700' : 'bg-teal-500'}`}
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
    </Page>
  )
}
