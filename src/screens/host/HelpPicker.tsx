import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Ban, Check, Lock } from 'lucide-react'
import { Wizard } from '../../components/layout/Wizard'
import { HourMeter } from '../../components/domain/HourMeter'
import { Notice } from '../../components/domain/Bits'
import { Stepper } from '../../components/ui/Stepper'
import { Select } from '../../components/ui/Field'
import { useStore } from '../../store'
import { HELP_DEFAULT, HELP_ORDER } from '../../data/seed'
import { hoursOf } from '../../data/pricing'
import { HELP_ICONS } from '../../lib/helps'
import { SLOTS } from '../../data/matching'
import { useUI } from '../../ui'
import type { HelpId } from '../../data/types'

export function HelpPicker() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { helps, setHelp } = useStore()
  const say = useUI((s) => s.say)
  const [blocked, setBlocked] = useState(false)
  const [tick, setTick] = useState(0)
  const total = hoursOf(helps)

  const attempt = (id: HelpId, v: { h: number; slot: string } | null) => {
    if (!setHelp(id, v)) {
      setBlocked(true)
      setTick((x) => x + 1)
      say(t('help.blockedShort'))
    } else setBlocked(false)
  }

  return (
    <Wizard
      step={3}
      total={4}
      title={t('help.title')}
      lede={t('help.lede')}
      onBack={() => nav('/host/create/3')}
      onNext={() => nav('/host/people')}
      nextLabel={t('help.save')}
      nextDisabled={total === 0}
    >
      <div className="space-y-6">
        <div className="sticky top-20 z-10 -mx-4 border-b border-soft bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-card sm:border sm:px-5">
          <HourMeter key={tick} value={total} shake={blocked} />
          <div aria-live="polite">
            {blocked && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-base text-amber-700">{t('help.blocked')}</p>}
          </div>
        </div>

        <ul className="space-y-3">
          {HELP_ORDER.map((id) => {
            const cur = helps[id]
            const Icon = HELP_ICONS[id]
            return (
              <li key={id} className={`rounded-card border p-4 transition-colors ${cur ? 'border-ink' : 'border-line'}`}>
                <button
                  type="button"
                  aria-pressed={!!cur}
                  onClick={() => attempt(id, cur ? null : HELP_DEFAULT[id])}
                  className="flex w-full items-center gap-4 text-left"
                >
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${cur ? 'bg-ink text-white' : 'bg-surface'}`}>
                    <Icon size={22} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold">{t(`help.${id}.title`)}</span>
                    <span className="block text-sm text-muted">{t(`help.${id}.desc`)}</span>
                  </span>
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border-2 ${cur ? 'border-ink bg-ink text-white' : 'border-line'}`}
                    aria-hidden
                  >
                    {cur && <Check size={16} />}
                  </span>
                </button>
                {cur && (
                  <div className="mt-4 grid gap-4 border-t border-soft pt-4 sm:grid-cols-2 sm:items-end">
                    <div>
                      <p className="mb-2 text-sm font-semibold">{t('help.hours')}</p>
                      <Stepper
                        value={cur.h}
                        min={1}
                        max={6}
                        label={t('help.hoursFor', { name: t(`help.${id}.title`) })}
                        format={(n) => t('help.hoursPerWeek', { n })}
                        decLabel={t('common.less')}
                        incLabel={t('common.more')}
                        onChange={(v) => attempt(id, { h: v, slot: cur.slot })}
                      />
                    </div>
                    <div>
                      <label htmlFor={`slot-${id}`} className="mb-2 block text-sm font-semibold">
                        {t('help.when')}
                      </label>
                      <Select id={`slot-${id}`} value={cur.slot} onChange={(e) => attempt(id, { h: cur.h, slot: e.target.value })}>
                        {SLOTS.map((s) => (
                          <option key={s} value={s}>
                            {t(`slot.${s}`)}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        <section className="rounded-card border border-rose-200 bg-rose-50 p-5" aria-labelledby="notincl">
          <h2 id="notincl" className="flex items-center gap-2 text-lg font-semibold">
            <Ban size={20} aria-hidden /> {t('help.notIncluded')}
          </h2>
          <p className="mt-1 text-base">{t('help.neverAdded')}</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {(['bathing', 'toileting', 'feeding', 'medical', 'money', 'inkan'] as const).map((b) => (
              <li key={b} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-base">
                <Lock size={16} aria-hidden className="shrink-0 text-rose-700" /> {t(`banned.${b}`)}
              </li>
            ))}
          </ul>
        </section>
        <Notice tone="purple" title={t('help.hostDecides')}>
          {t('help.hostDecidesBody')}
        </Notice>
      </div>
    </Wizard>
  )
}
