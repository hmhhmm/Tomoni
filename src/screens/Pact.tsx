import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Ban, Check, FileSignature, Lock, PartyPopper, X } from 'lucide-react'
import { Screen } from '../components/Screen'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Chip, ChoiceChip } from '../components/Chip'
import { Notice } from '../components/Misc'
import { Stepper } from '../components/Stepper'
import { HourMeter } from '../components/HourMeter'
import { ViewAs } from '../components/ViewAs'
import { useStore, totalHours } from '../store'
import { HELP_DEFAULT_HOURS } from '../data/seed'
import { HELP_ICONS, HELP_ORDER } from '../lib/helps'
import { useUI } from '../ui'
import type { HelpId } from '../data/types'

export function Pact() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { role, helps, setHelp, draft, trialWeeks, pactSigned, sign, tenant } = useStore()
  const say = useUI((s) => s.say)
  const viewer: 'host' | 'tenant' = role === 'tenant' ? 'tenant' : 'host'
  const [open, setOpen] = useState<number | null>(null)
  const total = totalHours(helps)
  const companion = tenant.residence === 'limited'
  const names = { host: t('names.sato'), tenant: tenant.name }

  const edit = (id: HelpId, h: number | null) => {
    if (!setHelp(id, h)) say(t('help.blockedShort'))
  }
  const sections = [
    { n: 1, body: <p>{t('pact.s1.body', { host: names.host, tenant: names.tenant })}</p> },
    { n: 2, body: <p className="font-medium">{t('pact.s2.body')}</p> },
    {
      n: 3,
      body: companion ? <p>{t('pact.s3.companion')}</p> : (
        <div>
          <p className="mb-3">{t('pact.s3.body', { cap: 10, total })}</p>
          <HourMeter value={total} compact />
          <ul className="mt-4 space-y-3">
            {HELP_ORDER.filter((id) => helps[id] !== undefined).map((id) => {
              const Icon = HELP_ICONS[id]
              return (
                <li key={id} className="rounded-2xl border border-line p-3">
                  <div className="flex items-center gap-2 font-semibold"><Icon size={20} aria-hidden className="text-purple-700" />{t(`help.${id}.title`)}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1">
                      <Stepper value={helps[id]!} min={1} max={6} label={t('help.hoursFor', { name: t(`help.${id}.title`) })} format={(n) => t('help.hoursPerWeek', { n })}
                        decLabel={t('common.less')} incLabel={t('common.more')} onChange={(v) => edit(id, v)} />
                    </div>
                    <Button block={false} variant="ghost" aria-label={t('common.remove')} onClick={() => edit(id, null)}><X size={20} aria-hidden /></Button>
                  </div>
                </li>
              )
            })}
          </ul>
          <p className="mb-2 mt-4 text-sm font-medium text-muted">{t('pact.addTask')}</p>
          <div className="flex flex-wrap gap-2">
            {HELP_ORDER.filter((id) => helps[id] === undefined).map((id) => (
              <ChoiceChip key={id} selected={false} onClick={() => edit(id, HELP_DEFAULT_HOURS[id])}>+ {t(`help.${id}.title`)}</ChoiceChip>
            ))}
          </div>
        </div>
      ),
    },
    {
      n: 4,
      body: (
        <ul className="space-y-2">
          {(['bathing', 'toileting', 'feeding', 'medical', 'money', 'inkan'] as const).map((b) => (
            <li key={b} className="flex items-center gap-2"><Lock size={18} aria-hidden className="shrink-0 text-rose-700" />{t(`banned.${b}`)}</li>
          ))}
        </ul>
      ),
    },
    {
      n: 5,
      body: (
        <ul className="list-disc space-y-1 pl-5">
          <li>{draft.smoking === 'no' ? t('create.smokingNo') : t('create.smokingOutside')}</li>
          <li>{draft.pets ? t('create.petsOk') : t('create.petsNo')}</li>
          <li>{t('create.quiet')}: {draft.quiet.replace('-', ' – ')}</li>
          <li>{t('create.guests')}: {t(`create.guests${{ ask: 'Ask', sometimes: 'Some', no: 'No' }[draft.guests]}`)}</li>
        </ul>
      ),
    },
    { n: 6, body: <p>{t('pact.s6.body', { weeks: trialWeeks })}</p> },
    { n: 7, body: <p>{t('pact.s7.body')}</p> },
    {
      n: 8,
      body: (
        <ol className="list-decimal space-y-1 pl-5">
          {[1, 2, 3, 4].map((i) => <li key={i}>{t(`ladder.s${i}`)}</li>)}
        </ol>
      ),
    },
    { n: 9, body: <p>{t('pact.s9.body')}</p> },
    { n: 10, body: <p>{t('pact.s10.body')}</p> },
    { n: 11, body: <p>{t('pact.s11.body')}</p> },
  ]

  const both = pactSigned.host && pactSigned.tenant

  return (
    <Screen title={t('pact.title')} lede={t('pact.lede')} footer>
      <ViewAs />
      <Chip tone="amber" className="!text-base">{t('pact.watermark')}</Chip>
      {companion && <Notice tone="teal" title={t('pact.companionTitle')}>{t('pact.companionBody')}</Notice>}

      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          {[12, 38, 64, 90].map((top) => (
            <span key={top} className="absolute left-[-10%] w-[120%] -rotate-[24deg] select-none text-center font-heading text-[1.6rem] font-bold leading-tight text-purple-600/[0.10]" style={{ top: `${top}%` }}>
              {t('pact.watermark')}
            </span>
          ))}
        </div>
        <ol className="space-y-3">
          {sections.map((s) => {
            const isOpen = open === s.n || s.n === 3 || s.n === 2
            return (
              <li key={s.n}>
                <Card className="!p-0">
                  <button
                    type="button" aria-expanded={isOpen} aria-controls={`pact-${s.n}`}
                    onClick={() => setOpen(open === s.n ? null : s.n)}
                    className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-purple-50 font-heading font-semibold text-purple-700">{s.n}</span>
                    <span className="flex-1 font-heading text-lg font-semibold leading-tight">{t(`pact.s${s.n}.title`)}</span>
                  </button>
                  {isOpen && <div id={`pact-${s.n}`} className="px-4 pb-4 text-base">{s.body}</div>}
                </Card>
              </li>
            )
          })}
        </ol>
      </div>

      <Card tone="purple">
        <p className="flex items-center gap-2 font-heading text-lg font-semibold"><FileSignature size={22} aria-hidden /> {t('pact.sign')}</p>
        <p className="mt-1 text-base">{t('pact.lease')}</p>
        <ul className="mt-4 space-y-3">
          {(['host', 'tenant'] as const).map((who) => {
            const signed = pactSigned[who]
            const mine = viewer === who
            return (
              <li key={who} className="rounded-2xl bg-white p-3">
                <p className="font-semibold">{names[who]} <span className="font-normal text-muted">({t(`pact.role.${who}`)})</span></p>
                {signed ? (
                  <p className="mt-1 flex items-center gap-2 font-heading text-lg italic text-teal-700"><Check size={20} aria-hidden /> {names[who]} · {t('pact.signed')}</p>
                ) : mine ? (
                  <Button className="mt-2" icon={<FileSignature size={20} aria-hidden />} onClick={() => sign(who)}>{t('pact.signBtn', { name: names[who] })}</Button>
                ) : (
                  <p className="mt-1 text-base text-muted">{t('pact.waiting', { name: names[who] })}</p>
                )}
              </li>
            )
          })}
        </ul>
        {both && (
          <div className="mt-4">
            <Notice tone="teal" live icon={<PartyPopper size={24} className="text-teal-700" aria-hidden />} title={t('pact.done')}>{t('pact.doneBody')}</Notice>
            <Button className="mt-3" onClick={() => nav(viewer === 'host' ? '/host/checkin' : '/tenant/tasks')}>{viewer === 'host' ? t('pact.toCheckin') : t('pact.toLog')}</Button>
          </div>
        )}
        <p className="mt-3 flex items-center gap-2 text-sm text-muted"><Ban size={16} aria-hidden /> {t('pact.notContract')}</p>
      </Card>
    </Screen>
  )
}
