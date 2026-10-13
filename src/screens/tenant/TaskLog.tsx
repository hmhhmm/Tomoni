import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Clock, Info } from 'lucide-react'
import { Screen } from '../../components/Screen'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Chip, ChoiceChip } from '../../components/Chip'
import { HourMeter } from '../../components/HourMeter'
import { Stepper } from '../../components/Stepper'
import { Notice } from '../../components/Misc'
import { useStore, confirmedHours } from '../../store'
import { HELP_ICONS, HELP_ORDER } from '../../lib/helps'
import { useUI } from '../../ui'
import { RULES } from '../../tokens'
import type { HelpId } from '../../data/types'

export function TaskLog() {
  const { t } = useTranslation()
  const { helps, tasks, logTask, confirmTask, tenant, patchTenant } = useStore()
  const say = useUI((s) => s.say)
  const [pick, setPick] = useState<HelpId | null>(null)
  const done = confirmedHours(tasks)
  const pending = tasks.filter((x) => x.status === 'pending')
  const pendingH = pending.reduce((a, x) => a + x.hours, 0)
  const options = HELP_ORDER.filter((h) => helps[h] !== undefined)
  const capLeft = RULES.weeklyHourCap - done - pendingH
  const student = tenant.residence === 'student'
  const used = tenant.otherHours + done + pendingH
  const near = used >= RULES.studentWeeklyLimit - 4

  const choose = (h: number) => {
    if (!pick) return
    if (h > capLeft) { say(t('log.overCap')); return }
    logTask(pick, h)
    setPick(null)
    say(t('log.logged'))
  }

  return (
    <Screen title={t('log.title')} lede={t('log.lede')} footer>
      <Card className="flex items-center gap-4">
        <HourMeter variant="ring" value={done} size={112} label={t('meter.week')} />
        <div>
          <p className="font-heading text-lg font-semibold">{t('log.thisWeek')}</p>
          <p className="text-base text-muted">{t('log.confirmed', { n: done })}</p>
          {pendingH > 0 && <p className="text-base text-amber-700">{t('log.waiting', { n: pendingH })}</p>}
        </div>
      </Card>

      {student && (
        <Card tone={near ? 'amber' : 'purple'}>
          <h2 className="font-heading text-lg font-semibold">{t('log.tracker')}</h2>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-base">{t('log.trackerCount', { used, max: RULES.studentWeeklyLimit })}</span>
            <span className={`font-heading text-xl font-semibold ${near ? 'text-amber-700' : 'text-purple-700'}`}>{used}/{RULES.studentWeeklyLimit}h</span>
          </div>
          <div role="meter" aria-label={t('log.tracker')} aria-valuemin={0} aria-valuemax={RULES.studentWeeklyLimit} aria-valuenow={used} className="mt-2 h-4 overflow-hidden rounded-full bg-white">
            <div className={`h-full rounded-full ${near ? 'bg-amber-700' : 'bg-purple-600'}`} style={{ width: `${Math.min(100, (used / RULES.studentWeeklyLimit) * 100)}%` }} />
          </div>
          <p className="mb-2 mt-4 text-base">{t('log.otherHours')}</p>
          <Stepper value={tenant.otherHours} min={0} max={28} label={t('log.otherHours')} format={(n) => `${n}h`} decLabel={t('common.less')} incLabel={t('common.more')} onChange={(v) => patchTenant({ otherHours: v })} />
          <p className="mt-3 flex gap-2 text-sm text-muted"><Info size={16} aria-hidden className="mt-0.5 shrink-0" />{t('log.trackerNote')}</p>
          {near && <p role="status" className="mt-2 text-base font-medium text-amber-700">{t('log.trackerNear')}</p>}
        </Card>
      )}

      <Card>
        <h2 className="font-heading text-lg font-semibold">{t('log.twoTap')}</h2>
        <p className="mt-1 text-base text-muted">{pick ? t('log.tap2') : t('log.tap1')}</p>
        {!pick ? (
          <ul className="mt-3 grid grid-cols-2 gap-3">
            {options.map((h) => {
              const Icon = HELP_ICONS[h]
              return (
                <li key={h}>
                  <button type="button" onClick={() => setPick(h)} className="flex min-h-[5.5rem] w-full flex-col items-center justify-center gap-1 rounded-2xl border border-line bg-white p-3 text-center font-semibold transition hover:border-purple-600 active:scale-[.98]">
                    <Icon size={26} aria-hidden className="text-purple-700" />
                    <span className="text-base leading-tight">{t(`help.${h}.title`)}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="mt-3">
            <p className="mb-2 font-semibold">{t(`help.${pick}.title`)}</p>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((h) => <ChoiceChip key={h} selected={false} onClick={() => choose(h)}>{t('log.hours', { n: h })}</ChoiceChip>)}
            </div>
            <Button variant="ghost" className="mt-2" onClick={() => setPick(null)}>{t('common.back')}</Button>
          </div>
        )}
      </Card>

      <Card>
        <h2 className="font-heading text-lg font-semibold">{t('log.recent')}</h2>
        <ul className="mt-2 divide-y divide-line">
          {[...tasks].reverse().map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-2 py-3 text-base">
              <span className="font-medium">{t(`help.${e.help}.title`)} · {e.hours}h <span className="text-muted">({e.day.en === 'Today' ? t('common.today') : e.day.en})</span></span>
              {e.status === 'confirmed'
                ? <Chip tone="teal" icon={<CheckCircle2 size={16} aria-hidden />}>{t('log.statusDone')}</Chip>
                : (
                  <span className="flex items-center gap-2">
                    <Chip tone="amber" icon={<Clock size={16} aria-hidden />}>{t('log.statusWait')}</Chip>
                    <Button block={false} variant="soft" onClick={() => confirmTask(e.id)}>{t('log.confirmAsHost')}</Button>
                  </span>
                )}
            </li>
          ))}
        </ul>
      </Card>

      <Notice tone="purple" title={t('log.pulseTitle')}>
        <Link to="/tenant/pulse" className="mt-1 inline-flex min-h-12 items-center font-semibold text-purple-700 underline">{t('log.pulseLink')}</Link>
      </Notice>
    </Screen>
  )
}
