import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Ban, Check, Lock } from 'lucide-react'
import { Screen } from '../../components/Screen'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { HourMeter } from '../../components/HourMeter'
import { Notice } from '../../components/Misc'
import { Stepper } from '../../components/Stepper'
import { useStore, totalHours } from '../../store'
import { HELP_DEFAULT_HOURS } from '../../data/seed'
import { HELP_ICONS, HELP_ORDER } from '../../lib/helps'
import { useUI } from '../../ui'
import type { HelpId } from '../../data/types'

export function HelpPicker() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { helps, setHelp } = useStore()
  const say = useUI((s) => s.say)
  const [blocked, setBlocked] = useState(false)
  const [tick, setTick] = useState(0)
  const total = totalHours(helps)

  const attempt = (id: HelpId, hours: number | null) => {
    const ok = setHelp(id, hours)
    if (!ok) {
      setBlocked(true); setTick((x) => x + 1)
      say(t('help.blockedShort'))
    } else setBlocked(false)
  }

  const banned = ['bathing', 'toileting', 'feeding', 'medical', 'money', 'inkan'] as const

  return (
    <Screen title={t('help.title')} lede={t('help.lede')} footer>
      <div className="sticky top-0 z-10 -mx-4 border-b border-line bg-bg/95 px-4 pb-3 pt-2 backdrop-blur">
        <HourMeter key={tick} value={total} shake={blocked} />
        <div aria-live="polite" className="min-h-[1.5rem]">
          {blocked && <p className="mt-2 rounded-2xl bg-amber-50 px-3 py-2 text-base text-amber-700">{t('help.blocked')}</p>}
        </div>
      </div>

      <ul className="space-y-3">
        {HELP_ORDER.map((id) => {
          const on = helps[id] !== undefined
          const Icon = HELP_ICONS[id]
          return (
            <li key={id}>
              <div className={`rounded-card border-2 bg-white p-4 shadow-soft transition-colors duration-150 ${on ? 'border-purple-600' : 'border-line'}`}>
                <button
                  type="button" aria-pressed={on}
                  onClick={() => attempt(id, on ? null : HELP_DEFAULT_HOURS[id])}
                  className="flex min-h-14 w-full items-center gap-3 text-left"
                >
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${on ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700'}`}><Icon size={26} aria-hidden /></span>
                  <span className="flex-1">
                    <span className="block font-heading text-lg font-semibold leading-tight">{t(`help.${id}.title`)}</span>
                    <span className="block text-base text-muted">{t(`help.${id}.desc`)}</span>
                  </span>
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 ${on ? 'border-purple-600 bg-purple-600 text-white' : 'border-line'}`} aria-hidden>
                    {on && <Check size={20} />}
                  </span>
                </button>
                {on && (
                  <div className="mt-3 border-t border-line pt-3">
                    <Stepper
                      value={helps[id]!} min={1} max={6} label={t('help.hoursFor', { name: t(`help.${id}.title`) })}
                      format={(n) => t('help.hoursPerWeek', { n })} decLabel={t('common.less')} incLabel={t('common.more')}
                      onChange={(v) => attempt(id, v)}
                    />
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <Card tone="rose" aria-labelledby="notincl">
        <h2 id="notincl" className="flex items-center gap-2 text-lg font-semibold"><Ban size={22} aria-hidden /> {t('help.notIncluded')}</h2>
        <p className="mt-1 text-base">{t('help.neverAdded')}</p>
        <ul className="mt-3 space-y-2">
          {banned.map((b) => (
            <li key={b} className="flex items-center gap-3 rounded-2xl bg-white p-3 text-base font-medium">
              <Lock size={20} aria-hidden className="shrink-0 text-rose-700" /> {t(`banned.${b}`)}
            </li>
          ))}
        </ul>
      </Card>

      <Notice tone="purple" title={t('help.hostDecides')}>{t('help.hostDecidesBody')}</Notice>
      <Button icon={<ArrowRight size={20} aria-hidden />} onClick={() => nav('/host/applicants')} disabled={total === 0}>{t('help.save')}</Button>
    </Screen>
  )
}
