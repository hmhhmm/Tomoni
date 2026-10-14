import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Ban, Check, Clock, FileSignature, Lock, PartyPopper, Undo2, X } from 'lucide-react'
import { Page, Notice, EmptyState } from '../components/domain/Bits'
import { Button, LinkButton } from '../components/ui/Button'
import { Chip, Pill } from '../components/ui/Chip'
import { Stepper } from '../components/ui/Stepper'
import { Select } from '../components/ui/Field'
import { HourMeter } from '../components/domain/HourMeter'
import { agreedHelps, companionOnly, useStore } from '../store'
import { HELP_DEFAULT, HELP_ORDER } from '../data/seed'
import { hoursOf, costs } from '../data/pricing'
import { SLOTS } from '../data/matching'
import { HELP_ICONS } from '../lib/helps'
import { yen } from '../lib/hooks'
import { useUI } from '../ui'
import type { HelpId } from '../data/types'
import { RULES } from '../tokens'

export function Agreement() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { persona, pactHelps, declined, setPactHelp, toggleDeclined, draft, match, pactSigned, pactApproved, sign, tenant, applicants } = useStore()
  const say = useUI((s) => s.say)
  const viewer = persona === 'tenant' ? 'tenant' : 'host'
  const agreed = agreedHelps({ pactHelps, declined })
  const total = hoursOf(agreed)
  const c = costs(draft.standardRent, draft.homeshareRent, agreed)
  const companion = companionOnly(tenant)
  const partner = applicants.find((a) => a.id === match.applicantId)
  const names = { host: t('names.sato'), tenant: viewer === 'tenant' ? tenant.name : (partner?.name ?? tenant.name) }
  const both = pactSigned.host && pactSigned.tenant
  const open = !pactApproved && !both
  const editable = viewer === 'host' && open
  // The housemate can mark tasks they can't do while the agreement is still open.
  const declinable = viewer === 'tenant' && open
  const signable = match.stage === 'pact'
  const anySigned = pactSigned.host || pactSigned.tenant

  if (match.stage === 'none' || (viewer === 'tenant' && match.applicantId !== 'a1')) {
    return (
      <Page narrow className="py-10">
        <EmptyState
          icon={<FileSignature size={26} aria-hidden />}
          title={t('pact.emptyTitle')}
          body={t('pact.emptyBody')}
          action={
            <LinkButton to={viewer === 'host' ? '/host/people' : '/explore'} variant="dark">
              {viewer === 'host' ? t('nav.people') : t('nav.explore')}
            </LinkButton>
          }
        />
      </Page>
    )
  }

  const edit = (id: HelpId, v: { h: number; slot: string } | null) => {
    if (!setPactHelp(id, v)) say(t('help.blockedShort'))
    else if (anySigned) say(t('pact.cleared'))
  }
  const decline = (id: HelpId) => {
    toggleDeclined(id)
    if (anySigned) say(t('pact.cleared'))
  }

  const sections: { n: number; body: React.ReactNode }[] = [
    { n: 1, body: <p>{t('pact.s1.body', { host: names.host, tenant: names.tenant })}</p> },
    { n: 2, body: <p className="font-medium">{t('pact.s2.body')}</p> },
    {
      n: 3,
      body: companion ? (
        <p>{t('pact.s3.companion')}</p>
      ) : (
        <div>
          <p className="mb-4">{t('pact.s3.body', { cap: RULES.weeklyHourCap, total })}</p>
          <div className="mb-5 max-w-md">
            <HourMeter value={total} compact />
          </div>
          <ul className="space-y-3">
            {HELP_ORDER.filter((id) => pactHelps[id]).map((id) => {
              const Icon = HELP_ICONS[id]
              const v = pactHelps[id]!
              const no = declined.includes(id)
              return (
                <li key={id} className={`rounded-card border p-4 ${no ? 'border-dashed border-line bg-surface' : 'border-line'}`}>
                  <div className="flex flex-wrap items-center gap-3 font-semibold">
                    <Icon size={20} aria-hidden />
                    <span className={no ? 'text-muted line-through' : ''}>{t(`help.${id}.title`)}</span>
                    {no && <Chip tone="amber">{t('pact.cantDoChip', { name: names.tenant })}</Chip>}
                    {(!editable || no) && (
                      <span className={`ml-auto text-sm font-normal text-muted ${no ? 'line-through' : ''}`}>
                        {t('help.hoursPerWeek', { n: v.h })} · {t(`slot.${v.slot}`)}
                      </span>
                    )}
                  </div>
                  {declinable && (
                    <Button
                      className="mt-3"
                      variant={no ? 'secondary' : 'ghost'}
                      size="sm"
                      aria-pressed={no}
                      icon={no ? <Undo2 size={16} aria-hidden /> : <Ban size={16} aria-hidden />}
                      onClick={() => decline(id)}
                    >
                      {no ? t('pact.canDo') : t('pact.cantDo')}
                    </Button>
                  )}
                  {editable && no && (
                    <Button className="mt-3" variant="ghost" size="sm" icon={<X size={16} aria-hidden />} onClick={() => edit(id, null)}>
                      {t('common.remove')}
                    </Button>
                  )}
                  {editable && !no && (
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <Stepper
                        value={v.h}
                        min={1}
                        max={6}
                        label={t('help.hoursFor', { name: t(`help.${id}.title`) })}
                        format={(n) => t('help.hoursPerWeek', { n })}
                        decLabel={t('common.less')}
                        incLabel={t('common.more')}
                        onChange={(h) => edit(id, { h, slot: v.slot })}
                      />
                      <Select
                        aria-label={t('help.when')}
                        value={v.slot}
                        onChange={(e) => edit(id, { h: v.h, slot: e.target.value })}
                        className="!w-auto"
                      >
                        {SLOTS.map((s) => (
                          <option key={s} value={s}>
                            {t(`slot.${s}`)}
                          </option>
                        ))}
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={t('common.remove')}
                        onClick={() => edit(id, null)}
                        icon={<X size={16} aria-hidden />}
                      />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
          {declinable && <p className="mt-4 text-sm text-muted">{t('pact.cantDoNote')}</p>}
          {editable && (
            <>
              <p className="mb-2 mt-5 text-sm font-semibold">{t('pact.addTask')}</p>
              <div className="flex flex-wrap gap-2">
                {HELP_ORDER.filter((id) => !pactHelps[id]).map((id) => (
                  <Pill key={id} selected={false} onClick={() => edit(id, HELP_DEFAULT[id])}>
                    + {t(`help.${id}.title`)}
                  </Pill>
                ))}
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      n: 4,
      body: (
        <ul className="grid gap-2 sm:grid-cols-2">
          {(['bathing', 'toileting', 'feeding', 'medical', 'money', 'inkan'] as const).map((b) => (
            <li key={b} className="flex items-center gap-2">
              <Lock size={16} aria-hidden className="shrink-0 text-rose-700" />
              {t(`banned.${b}`)}
            </li>
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
          <li>{t('detail.quiet', { h: draft.quiet.replace('-', ' – ') })}</li>
          <li>{t(`detail.guests.${draft.guests}`)}</li>
        </ul>
      ),
    },
    { n: 6, body: <p>{t('pact.s6.body', { weeks: match.trialWeeks })}</p> },
    { n: 7, body: <p>{t('pact.s7.body')}</p> },
    {
      n: 8,
      body: (
        <ol className="list-decimal space-y-1 pl-5">
          {[1, 2, 3, 4].map((i) => (
            <li key={i}>{t(`ladder.s${i}`)}</li>
          ))}
        </ol>
      ),
    },
    { n: 9, body: <p>{t('pact.s9.body')}</p> },
    { n: 10, body: <p>{t('pact.s10.body')}</p> },
    { n: 11, body: <p>{t('pact.s11.body')}</p> },
  ]

  return (
    <Page className="py-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-[1.75rem] font-semibold">{t('pact.title')}</h1>
        <Chip tone="amber">{t('pact.watermark')}</Chip>
      </div>
      <p className="mt-1 text-base text-muted">{t('pact.lede')}</p>
      {companion && (
        <div className="mt-5">
          <Notice tone="teal" title={t('pact.companionTitle')}>
            {t('pact.companionBody')}
          </Notice>
        </div>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="relative">
          <div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            {[10, 32, 54, 76, 96].map((top) => (
              <span
                key={top}
                className="absolute left-[-15%] w-[130%] -rotate-[20deg] select-none text-center font-heading text-[1.5rem] font-bold text-ink/[0.045]"
                style={{ top: `${top}%` }}
              >
                {t('pact.watermark')}
              </span>
            ))}
          </div>
          <ol className="divide-y divide-soft rounded-card border border-line">
            {sections.map((s) => (
              <li key={s.n} className="p-6">
                <h2 className="mb-3 flex items-baseline gap-3 text-lg font-semibold">
                  <span className="text-muted tabular-nums">{s.n}.</span>
                  {t(`pact.s${s.n}.title`)}
                </h2>
                <div className="text-base">{s.body}</div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-sheet border border-line bg-white p-6 shadow-lift">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <FileSignature size={20} aria-hidden />
              {t('pact.sign')}
            </h2>
            <dl className="mt-4 space-y-2 border-b border-soft pb-4 text-base">
              <div className="flex justify-between">
                <dt className="text-muted">{t('pact.cap')}</dt>
                <dd className="tabular-nums">
                  {total} / {RULES.weeklyHourCap} h
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">{t('pact.trial')}</dt>
                <dd>{t('stay.weeks', { n: match.trialWeeks })}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">{t('detail.rent')}</dt>
                <dd className="tabular-nums">{yen(draft.homeshareRent)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">{t('detail.membership')}</dt>
                <dd className="tabular-nums">{yen(c.monthlyAllIn - draft.homeshareRent)}</dd>
              </div>
            </dl>
            <ul className="mt-4 space-y-3">
              {(['host', 'tenant'] as const).map((who) => {
                const signed = pactSigned[who]
                const mine = viewer === who
                return (
                  <li key={who} className="rounded-card bg-surface p-3">
                    <p className="text-base font-semibold">
                      {names[who]} <span className="font-normal text-muted">({t(`pact.role.${who}`)})</span>
                    </p>
                    {signed ? (
                      <p className="mt-1 flex items-center gap-2 font-heading text-lg italic text-teal-700">
                        <Check size={18} aria-hidden />
                        {names[who]}
                      </p>
                    ) : mine ? (
                      <Button
                        className="mt-2"
                        block
                        variant="dark"
                        disabled={!signable}
                        icon={<FileSignature size={18} aria-hidden />}
                        onClick={() => sign(who)}
                      >
                        {t('pact.signBtn')}
                      </Button>
                    ) : (
                      <p className="mt-1 text-base text-muted">{t('pact.waiting', { name: names[who] })}</p>
                    )}
                  </li>
                )
              })}
            </ul>
            {!signable && !both && <p className="mt-3 text-sm text-muted">{t('pact.notYet')}</p>}
            {open && <p className="mt-3 text-sm text-muted">{t('pact.changeClears')}</p>}
            {both && !pactApproved && (
              <div className="mt-4">
                <Notice tone="amber" live icon={<Clock size={22} aria-hidden className="text-amber-700" />} title={t('pact.review')}>
                  {t('pact.reviewBody')}
                </Notice>
                <Link to="/coordinator" className="mt-3 inline-block text-sm font-semibold underline underline-offset-2">
                  {t('pact.openDesk')}
                </Link>
              </div>
            )}
            {pactApproved && (
              <div className="mt-4">
                <Notice tone="teal" live icon={<PartyPopper size={22} aria-hidden className="text-teal-700" />} title={t('pact.done')}>
                  {t('pact.doneBody')}
                </Notice>
                <Button className="mt-3" block variant="dark" onClick={() => nav(viewer === 'host' ? '/host/checkin' : '/log')}>
                  {viewer === 'host' ? t('pact.toCheckin') : t('pact.toLog')}
                </Button>
              </div>
            )}
            <p className="mt-4 text-sm text-muted">{t('pact.lease')}</p>
            <p className="mt-2 flex items-start gap-2 text-sm text-muted">
              <Ban size={14} aria-hidden className="mt-0.5 shrink-0" />
              {t('pact.notContract')}
            </p>
          </div>
        </aside>
      </div>
    </Page>
  )
}
