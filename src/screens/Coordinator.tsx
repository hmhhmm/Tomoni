import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  Check,
  ChevronDown,
  FileSignature,
  Flag,
  HeartPulse,
  LockKeyhole,
  MessageSquareWarning,
  Mic,
  PhoneCall,
  Timer,
  Users,
} from 'lucide-react'
import { agreedHelps, safeguardsDone, useStore, missedRun, weekHours } from '../store'
import { CoordChat, ReferralPanel, SafeguardPanel } from '../components/domain/CaseSafety'
import { Wordmark } from '../components/layout/Wordmark'
import { LangSelect } from '../components/layout/LangSelect'
import { ViewMenu } from '../components/layout/Header'
import { Chip } from '../components/ui/Chip'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Field'
import { useL } from '../lib/hooks'
import { hoursOf } from '../data/pricing'
import { RULES } from '../tokens'
import { LADDER } from '../data/journey'
import type { CaseRow, CheckinStatus, Flag as FlagT } from '../data/types'
import { SEED_PULSES } from '../data/seed'
import { hoursLeft, isSafety } from '../lib/sla'

const TONE = { healthy: 'teal', trial: 'neutral', review: 'neutral', attention: 'amber', alert: 'rose', paused: 'amber' } as const
/** Detail banner colour follows the case status. */
const BANNER = {
  healthy: 'border-teal-100 bg-teal-50',
  trial: 'border-line bg-surface',
  review: 'border-line bg-surface',
  attention: 'border-amber-200 bg-amber-50',
  alert: 'border-rose-200 bg-rose-50',
  paused: 'border-amber-200 bg-amber-50',
} as const
const DOT = { good: 'bg-teal-500', notgood: 'bg-amber-700', missed: 'bg-rose-700', pending: 'bg-soft' } as const

export function Coordinator() {
  const { t } = useTranslation()
  const text = useL()
  const {
    cases,
    checkins,
    flags,
    tasks,
    caseNotes,
    setCaseNote,
    markMissed,
    match,
    pactSigned,
    pactApproved,
    pactHelps,
    declined,
    approvePact,
    resolveFlag,
    caseStep,
    setCaseStep,
    caseMinutes,
    addCaseMinutes,
    pulse,
    paused,
    safeguards,
    coordUnread,
    keepMedia,
    setKeepMedia,
  } = useStore()
  const [sel, setSel] = useState('c1')
  useEffect(() => {
    document.documentElement.style.fontSize = '16px'
  }, [])

  const open = useMemo(() => flags.filter((f) => !f.resolved), [flags])
  const awaitingApproval = match.stage === 'pact' && pactSigned.host && pactSigned.tenant && !pactApproved

  const rows: CaseRow[] = useMemo(
    () =>
      cases.map((c) => {
        const hist: CheckinStatus[] = c.id === 'c1' ? checkins.map((x) => x.status) : c.checkins
        const live = c.id === 'c1'
        const hasFlag = open.some((f) => f.caseId === c.id)
        const base: CaseRow['status'] = live ? (match.stage === 'living' ? 'healthy' : awaitingApproval ? 'review' : 'trial') : c.status
        const status: CaseRow['status'] = missedRun(hist) >= 2 ? 'alert' : paused[c.id] ? 'paused' : hasFlag ? 'attention' : base
        return { ...c, checkins: hist, status, week: live ? Math.max(1, hist.length) : c.week, avgHours: live ? weekHours(tasks, true) : c.avgHours }
      }),
    [cases, checkins, open, tasks, match.stage, awaitingApproval, paused],
  )

  const flagBody = (f: FlagT) =>
    f.kind === 'pulse'
      ? t('coord.pulseFlag', {
          qs: f.text
            .split(',')
            .map((q) => `“${t(`pulse.${q}`)}”`)
            .join(', '),
        })
      : f.kind === 'family'
        ? `${t('names.emi')}: “${f.text}”`
        : `${f.caseId ? '' : `${t('coord.preMatch')}: `}“${f.text}”`

  const alerts = [
    ...(awaitingApproval
      ? [
          {
            id: 'approve-c1',
            caseId: 'c1' as string | null,
            flagId: null as string | null,
            icon: FileSignature,
            tone: 'amber' as const,
            title: t('coord.approveAlert'),
            body: t('coord.approveAlertBody'),
            when: '',
            flag: null as FlagT | null,
          },
        ]
      : []),
    ...rows
      .filter((r) => missedRun(r.checkins) >= 2)
      .map((r) => ({
        id: `m-${r.id}`,
        caseId: r.id as string | null,
        flagId: null as string | null,
        icon: AlertTriangle,
        tone: 'rose' as const,
        title: t('coord.alertMissed'),
        body: `${text(r.household)}: ${t('coord.alertMissedBody')}`,
        when: '',
        flag: null as FlagT | null,
      })),
    // Open flags, most urgent deadline first.
    ...[...open]
      .sort((x, y) => (hoursLeft(x) ?? 1e9) - (hoursLeft(y) ?? 1e9))
      .map((f) => ({
        id: f.id,
        caseId: f.caseId,
        flagId: f.id as string | null,
        icon:
          f.kind === 'report'
            ? Flag
            : f.kind === 'family'
              ? Users
              : f.kind === 'pulse'
                ? HeartPulse
                : f.kind === 'private'
                  ? LockKeyhole
                  : MessageSquareWarning,
        tone: (['notgood', 'report', 'family', 'pulse', 'private'].includes(f.kind) ? 'amber' : 'rose') as 'amber' | 'rose',
        title: t(`coord.flag.${f.kind}`),
        body: flagBody(f),
        when: f.when,
        flag: f as FlagT | null,
      })),
  ]

  const step = caseStep[sel] ?? 0
  const media = checkins.filter((c) => c.photoData || c.voiceSecs || c.mediaDeleted)
  // Anonymous pulse: pooled across homes, never tied to a case or a name.
  const pulses = [...SEED_PULSES, ...(pulse ? [pulse] : [])]
  const caseFlags = open.filter((f) => f.caseId === sel)
  const detailRef = useRef<HTMLElement>(null)
  const open_ = (id: string) => {
    setSel(id)
    // On narrow screens the detail sits below the table; bring it into view.
    if (window.matchMedia('(max-width: 1023px)').matches) requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: 'smooth' }))
  }
  const spent = caseMinutes[sel] ?? 0
  const agreed = agreedHelps({ pactHelps, declined })
  const current = rows.find((r) => r.id === sel)!
  const note = caseNotes[sel] ?? current.notes

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="border-b border-soft bg-white">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <Wordmark />
            <Chip tone="brand">{t('coord.concept')}</Chip>
          </div>
          <div className="flex items-center gap-2">
            <LangSelect />
            <ViewMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-8 sm:px-6 lg:px-10">
        <div>
          <h1 className="text-[1.75rem] font-semibold">{t('coord.title')}</h1>
          <p className="text-base text-muted">{t('coord.lede')}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] [&>*]:min-w-0">
          <div className="min-w-0 space-y-6">
            <section aria-label={t('coord.alerts')} className="rounded-card border border-line bg-white p-5">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                {t('coord.alerts')} <Chip tone={alerts.length ? 'rose' : 'teal'}>{alerts.length}</Chip>
              </h2>
              {alerts.length === 0 ? (
                <p className="text-base text-muted">{t('coord.noAlerts')}</p>
              ) : (
                <ul className="space-y-2" aria-live="polite">
                  {alerts.map((a) => (
                    <li
                      key={a.id}
                      className={`rounded-card border p-3 ${a.tone === 'rose' ? 'border-rose-200 bg-rose-50' : 'border-amber-200 bg-amber-50'}`}
                    >
                      <button
                        type="button"
                        onClick={() => a.caseId && open_(a.caseId)}
                        disabled={!a.caseId}
                        className="flex w-full gap-3 text-left disabled:cursor-default"
                      >
                        <a.icon size={20} aria-hidden className={`mt-0.5 shrink-0 ${a.tone === 'rose' ? 'text-rose-700' : 'text-amber-700'}`} />
                        <span>
                          <span className="block font-semibold">
                            {a.title} {a.when && <span className="font-normal text-muted">· {a.when}</span>}
                            {a.flag && <Due f={a.flag} />}
                          </span>
                          <span className="block text-base">{a.body}</span>
                        </span>
                      </button>
                      {a.flagId && (
                        <Button
                          className="ml-8 mt-2"
                          variant="secondary"
                          size="sm"
                          icon={<Check size={16} aria-hidden />}
                          onClick={() => resolveFlag(a.flagId!)}
                        >
                          {t('coord.resolve')}
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-label={t('coord.cases')} className="rounded-card border border-line bg-white p-5">
              <h2 className="mb-3 text-lg font-semibold">{t('coord.cases')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-base">
                  <thead>
                    <tr className="border-b border-soft text-sm text-muted">
                      <th className="py-2 pr-3 font-medium">{t('coord.household')}</th>
                      <th className="pr-3 font-medium">{t('coord.status')}</th>
                      <th className="pr-3 font-medium">{t('coord.week')}</th>
                      <th className="font-medium">{t('coord.checkins')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => open_(r.id)}
                        className={`cursor-pointer border-b border-soft transition-colors last:border-0 hover:bg-surface ${sel === r.id ? 'bg-surface font-medium' : ''}`}
                      >
                        <td className="py-3 pr-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              open_(r.id)
                            }}
                            aria-pressed={sel === r.id}
                            className="text-left font-semibold underline-offset-2 hover:underline"
                          >
                            {text(r.household)}
                            <span className="mt-0.5 block text-sm font-normal text-muted">
                              {t('coord.tenant')}: {r.tenant}
                            </span>
                            {r.id === 'c1' && coordUnread.coord > 0 && (
                              <span className="mt-1 inline-block rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
                                {t('coordChat.unread', { n: coordUnread.coord })}
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="pr-3">
                          <Chip tone={TONE[r.status]}>{t(`coord.st.${r.status}`)}</Chip>
                        </td>
                        <td className="pr-3 tabular-nums">{r.week}</td>
                        <td>
                          <span
                            role="img"
                            className="flex flex-wrap gap-1"
                            aria-label={r.checkins.map((c) => t(`checkin.status.${c}`)).join(', ') || t('coord.none')}
                          >
                            {r.checkins.slice(-8).map((c, i) => (
                              <span key={i} aria-hidden className={`h-3 w-3 rounded-full ${DOT[c]}`} />
                            ))}
                            {r.checkins.length === 0 && <span className="text-sm text-muted">—</span>}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section aria-labelledby="pulse-title" className="rounded-card border border-line bg-white p-5 lg:col-start-1">
              <h2 id="pulse-title" className="text-lg font-semibold">
                {t('coord.pulseTitle')}
              </h2>
              <p className="text-sm text-muted">{t('coord.pulseSub', { n: pulses.length })}</p>
              <ul className="mt-4 space-y-3">
                {(['q1', 'q2', 'q3'] as const).map((q) => {
                  const n = (o: string) => pulses.filter((p) => p[q] === o).length
                  return (
                    <li key={q}>
                      <p className="text-base font-medium">{t(`pulse.${q}`)}</p>
                      <div className="mt-1 flex h-3 overflow-hidden rounded-full bg-soft" aria-hidden>
                        <span className="bg-teal-500" style={{ width: `${(n('great') / pulses.length) * 100}%` }} />
                        <span className="bg-line" style={{ width: `${(n('fine') / pulses.length) * 100}%` }} />
                        <span className="bg-amber-700" style={{ width: `${(n('notgreat') / pulses.length) * 100}%` }} />
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {t('pulse.great')} {n('great')} · {t('pulse.fine')} {n('fine')} · {t('pulse.notgreat')} {n('notgreat')}
                      </p>
                    </li>
                  )
                })}
              </ul>
              <p className="mt-3 text-sm text-muted">{t('coord.pulseNote')}</p>
            </section>
          </div>

          <div className="min-w-0 space-y-6">
            <section ref={detailRef} aria-label={t('coord.detail')} className="scroll-mt-4 rounded-card border border-line bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{text(current.household)}</h2>
                <Chip tone={TONE[current.status]}>{t(`coord.st.${current.status}`)}</Chip>
              </div>

              <div className={`mt-3 rounded-card border p-4 ${BANNER[current.status]}`} role="status">
                <p className="font-semibold">{t(`coord.why.${current.status}Title`, { week: current.week })}</p>
                <p className="mt-1 text-base">{t(`coord.why.${current.status}`, { tenant: current.tenant })}</p>
                {current.status === 'alert' && (
                  <Button
                    className="mt-3"
                    size="sm"
                    variant="dark"
                    icon={<PhoneCall size={16} aria-hidden />}
                    onClick={() => {
                      setCaseStep(sel, Math.max(step, 2))
                      addCaseMinutes(sel, 15)
                    }}
                  >
                    {t('coord.logCall')}
                  </Button>
                )}
                {caseFlags.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {caseFlags.map((f) => (
                      <li key={f.id} className="flex flex-wrap items-center gap-2 rounded-btn bg-white/70 p-2 text-sm">
                        <span className="min-w-0 flex-1">
                          <strong>{t(`coord.flag.${f.kind}`)}</strong> · {flagBody(f)} <Due f={f} />
                        </span>
                        <Button size="sm" variant="secondary" icon={<Check size={14} aria-hidden />} onClick={() => resolveFlag(f.id)}>
                          {t('coord.resolve')}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-base">
                {[
                  [t('coord.tenant'), current.tenant],
                  [t('coord.area'), text(current.area)],
                  [t('coord.week'), String(current.week)],
                  [t('coord.hoursWeek'), `${current.avgHours} h`],
                  [
                    t('coord.checkins'),
                    t('coord.checkinsCount', {
                      ok: current.checkins.filter((c) => c === 'good').length,
                      n: current.checkins.filter((c) => c !== 'pending').length,
                    }),
                  ],
                  [t('coord.timeSpent'), t('coord.timeValue', { h: Math.floor(spent / 60), m: spent % 60 })],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-btn bg-surface px-3 py-2">
                    <dt className="text-sm text-muted">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>

              {sel === 'c1' && (media.length > 0 || match.stage === 'living') && (
                <section aria-labelledby="media-title" className="mt-4 rounded-card border border-line p-4">
                  <h3 id="media-title" className="text-sm font-semibold">
                    {t('coord.media.title')}
                  </h3>
                  {media.length === 0 && <p className="mt-1 text-sm text-muted">{t('coord.media.none')}</p>}
                  <ul className="mt-2 space-y-2">
                    {media.map((c) => (
                      <li key={c.week} className="flex flex-wrap items-center gap-3 text-base">
                        <span className="font-medium">{t('checkin.week', { n: c.week })}</span>
                        {c.photoData && (
                          <img src={c.photoData} alt={t('coord.media.photoAlt', { n: c.week })} className="h-12 w-12 rounded-btn object-cover" />
                        )}
                        {!!c.voiceSecs && (
                          <span className="inline-flex items-center gap-1 text-sm">
                            <Mic size={14} aria-hidden /> 0:{String(c.voiceSecs).padStart(2, '0')}
                          </span>
                        )}
                        {c.mediaDeleted && <span className="text-sm text-muted">{t('coord.media.deleted', { days: RULES.mediaDays })}</span>}
                        {!c.mediaDeleted && (
                          <Chip tone={c.shareFamily ? 'teal' : 'neutral'}>
                            {c.shareFamily ? t('coord.media.shared') : t('coord.media.coordOnly')}
                          </Chip>
                        )}
                      </li>
                    ))}
                  </ul>
                  <label className="mt-3 flex cursor-pointer items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={!!keepMedia.c1}
                      onChange={(e) => setKeepMedia('c1', e.target.checked)}
                      className="mt-0.5 h-5 w-5 accent-ink"
                    />
                    <span>{t('coord.media.keep', { days: RULES.mediaDays })}</span>
                  </label>
                </section>
              )}

              {sel === 'c1' && awaitingApproval && (
                <div className="mt-3 rounded-card border border-amber-200 bg-amber-50 p-4">
                  <p className="font-semibold">{t('coord.approveTitle')}</p>
                  <ul className="mt-2 space-y-1 text-base">
                    {Object.entries(agreed).map(([id, v]) => (
                      <li key={id}>
                        {t(`help.${id}.title`)} · {t('help.hoursPerWeek', { n: v!.h })}
                      </li>
                    ))}
                    {Object.keys(agreed).length === 0 && <li>{t('pact.s3.companion')}</li>}
                  </ul>
                  <p className="mt-2 text-sm text-muted">
                    {t('coord.approveTotal', { total: hoursOf(agreed), cap: RULES.weeklyHourCap, n: declined.length })}
                  </p>
                  {!safeguardsDone(safeguards.c1) && <p className="mt-2 text-sm font-semibold text-amber-700">{t('coord.sg.needed')}</p>}
                  <Button
                    className="mt-3"
                    variant="primary"
                    disabled={!safeguardsDone(safeguards.c1)}
                    icon={<Check size={18} aria-hidden />}
                    onClick={approvePact}
                  >
                    {t('coord.approve')}
                  </Button>
                </div>
              )}

              <Group key={`sg-${sel}`} title={t('coord.grp.safety')} open={(sel === 'c1' && awaitingApproval) || !!paused[sel]}>
                <SafeguardPanel caseId={sel} />
                <ReferralPanel caseId={sel} />
              </Group>
              {sel === 'c1' && (
                <Group
                  key={`chat-${sel}`}
                  title={t('coordChat.deskTitle', { name: current.tenant })}
                  badge={coordUnread.coord}
                  open={coordUnread.coord > 0 || caseFlags.some((f) => f.kind === 'private')}
                >
                  <div className="-mx-4 -mb-4 flex h-80 flex-col border-t border-soft">
                    <CoordChat side="coord" />
                  </div>
                </Group>
              )}
              <Group key={`esc-${sel}`} title={t('coord.grp.escalation')} open={current.status === 'alert'}>
                <div className="mt-4">
                  <p className="text-sm font-semibold">{t('coord.ladder')}</p>
                  <ol className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-3" aria-label={t('coord.ladder')}>
                    {LADDER.map((n) => (
                      <li
                        key={n}
                        aria-current={step === n ? 'step' : undefined}
                        className={`rounded-btn px-2 py-1.5 text-center text-sm ${step >= n ? 'bg-amber-50 font-semibold text-amber-700' : 'bg-surface text-muted'}`}
                      >
                        {t(`ladder.s${n}`)}
                      </li>
                    ))}
                  </ol>
                  <p className="mt-2 text-sm text-muted">{step === 0 ? t('coord.ladderNone') : t(`ladder.d${step}`)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button variant="secondary" size="sm" disabled={step >= LADDER.length} onClick={() => setCaseStep(sel, step + 1)}>
                      {step === 0 ? t('coord.ladderStart') : t('coord.ladderNext')}
                    </Button>
                    {step > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setCaseStep(sel, 0)}>
                        {t('coord.ladderClear')}
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                  <Button variant="secondary" size="sm" icon={<Timer size={16} aria-hidden />} onClick={() => addCaseMinutes(sel, 15)}>
                    {t('coord.addTime')}
                  </Button>
                </div>

                <label htmlFor="notes" className="mb-1.5 mt-4 block text-sm font-semibold">
                  {t('coord.notes')}
                </label>
                <Textarea id="notes" rows={4} value={note} onChange={(e) => setCaseNote(sel, e.target.value)} placeholder={t('coord.notesPh')} />
                <p className="mt-1 text-sm text-muted">{t('coord.saved')}</p>
                <Button className="mt-3" variant="secondary" onClick={() => markMissed(sel)}>
                  {t('coord.markMissed')}
                </Button>
              </Group>
            </section>
          </div>
        </div>
        <p className="text-center text-sm text-muted">{t('common.concept')}</p>
      </main>
    </div>
  )
}

/** Response deadline: 24 h for safety items, 5 working days otherwise (lib/sla.ts). */
function Due({ f }: { f: FlagT }) {
  const { t } = useTranslation()
  const h = hoursLeft(f)
  if (h === null) return null
  const over = h < 0
  const label = over ? t('coord.overdue', { h: Math.abs(h) }) : h < 48 ? t('coord.dueH', { h }) : t('coord.dueD', { d: Math.ceil(h / 24) })
  return (
    <span
      className={`ml-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 align-middle text-xs font-semibold ${over ? 'bg-rose-700 text-white' : h < 6 ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : 'bg-white text-muted ring-1 ring-line'}`}
      title={isSafety(f.kind) ? t('coord.slaSafety') : t('coord.slaOther')}
    >
      <Timer size={12} aria-hidden />
      {label}
    </span>
  )
}

/** Collapsible group inside the case detail, so the overview stays short. */
function Group({ title, open, badge, children }: { title: string; open: boolean; badge?: number; children: React.ReactNode }) {
  return (
    <details open={open} className="group mt-4 rounded-card border border-line [&_section]:mt-3">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 font-semibold [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          {title}
          {!!badge && <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">{badge}</span>}
        </span>
        <ChevronDown size={18} aria-hidden className="shrink-0 transition group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  )
}
