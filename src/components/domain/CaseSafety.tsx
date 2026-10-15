import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, LockKeyhole, PauseCircle, PlayCircle, Send, ShieldCheck } from 'lucide-react'
import { Button } from '../ui/Button'
import { SAFEGUARD_KEYS, useStore } from '../../store'
import { useL } from '../../lib/hooks'
import type { CoordMessage, ReferralKind, SafeguardKey } from '../../data/types'

// Routine first, then the two escalations (shown in the danger style).
// Stable empty values: a selector returning a new {} or [] each call makes React re-render forever.
const NO_CHECKS: Partial<Record<SafeguardKey, boolean>> = {}
const NO_REFERRALS: { kind: ReferralKind; when: string }[] = []

const REFERRALS: ReferralKind[] = ['family', 'careManager', 'municipal', 'police']

/** Shown to host and housemate while the coordinator has paused the live case. */
export function PausedNotice() {
  const { t } = useTranslation()
  const paused = useStore((s) => !!s.paused.c1 && s.match.stage !== 'none')
  if (!paused) return null
  return (
    <div role="status" className="mb-6 flex items-start gap-3 rounded-card border border-amber-200 bg-amber-50 p-4">
      <PauseCircle size={22} aria-hidden className="mt-0.5 shrink-0 text-amber-700" />
      <div>
        <p className="font-semibold text-amber-700">{t('paused.title')}</p>
        <p className="text-base">{t('paused.body')}</p>
      </div>
    </div>
  )
}

/** Safeguarding checklist and pause switch for one case (IDEA.md §3.3, Autonomy). */
export function SafeguardPanel({ caseId }: { caseId: string }) {
  const { t } = useTranslation()
  const done = useStore((s) => s.safeguards[caseId] ?? NO_CHECKS)
  const paused = useStore((s) => !!s.paused[caseId])
  const toggle = useStore((s) => s.toggleSafeguard)
  const setPaused = useStore((s) => s.setPaused)
  return (
    <section aria-labelledby={`sg-${caseId}`} className="mt-5">
      <h3 id={`sg-${caseId}`} className="flex items-center gap-2 text-sm font-semibold">
        <ShieldCheck size={16} aria-hidden /> {t('coord.sg.title')}
      </h3>
      <ul className="mt-2 space-y-1.5">
        {SAFEGUARD_KEYS.map((k) => (
          <li key={k}>
            <label className="flex cursor-pointer items-start gap-3 rounded-btn px-2 py-1.5 text-base hover:bg-surface">
              <input type="checkbox" checked={!!done[k]} onChange={() => toggle(caseId, k)} className="mt-1 h-5 w-5 accent-ink" />
              <span>{t(`coord.sg.${k}`)}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className={`mt-3 rounded-card border p-3 ${paused ? 'border-amber-200 bg-amber-50' : 'border-line'}`}>
        <p className="text-sm">{paused ? t('coord.sg.pausedBody') : t('coord.sg.pauseBody')}</p>
        <Button
          className="mt-2"
          size="sm"
          variant="secondary"
          icon={paused ? <PlayCircle size={16} aria-hidden /> : <PauseCircle size={16} aria-hidden />}
          onClick={() => setPaused(caseId, !paused)}
        >
          {paused ? t('coord.sg.resume') : t('coord.sg.pause')}
        </Button>
      </div>
    </section>
  )
}

/** One-tap onward referrals; each is logged with the time (IDEA.md §3.2(c)). */
export function ReferralPanel({ caseId }: { caseId: string }) {
  const { t } = useTranslation()
  const log = useStore((s) => s.referrals[caseId] ?? NO_REFERRALS)
  const add = useStore((s) => s.addReferral)
  // Family can only be informed with the host's consent (the live case uses the real consent).
  const familyOk = useStore((s) => (caseId === 'c1' ? s.familyConsent : true))
  return (
    <section aria-labelledby={`ref-${caseId}`} className="mt-5">
      <h3 id={`ref-${caseId}`} className="text-sm font-semibold">
        {t('coord.ref.title')}
      </h3>
      <div className="mt-2 flex flex-wrap gap-2">
        {REFERRALS.map((k) => (
          <Button
            key={k}
            size="sm"
            variant={k === 'municipal' || k === 'police' ? 'danger' : 'secondary'}
            disabled={k === 'family' && !familyOk}
            title={k === 'family' && !familyOk ? t('coord.ref.noConsent') : undefined}
            onClick={() => add(caseId, k)}
          >
            {t(`coord.ref.${k}`)}
          </Button>
        ))}
      </div>
      {!familyOk && <p className="mt-2 text-sm text-muted">{t('coord.ref.noConsent')}</p>}
      {log.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">
          {log.map((r, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check size={14} aria-hidden className="text-teal-700" />
              {t(`coord.ref.done.${r.kind}`)} · <span className="text-muted">{r.when}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Private housemate ↔ coordinator chat. `side` decides whose bubbles are on the right. */
export function CoordChat({ side }: { side: 'tenant' | 'coord' }) {
  const { t } = useTranslation()
  const text = useL()
  const thread = useStore((s) => s.coordThread)
  const send = useStore((s) => s.sendCoord)
  const markRead = useStore((s) => s.markCoordRead)
  const tenantName = useStore((s) => s.tenant.name)
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    markRead(side)
  }, [side, thread.length, markRead])
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' })
  }, [thread.length])
  const show = (m: CoordMessage) => (typeof m.text === 'string' ? m.text : text(m.text))
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="flex items-center gap-2 bg-teal-50 px-4 py-2 text-sm text-teal-700">
        <LockKeyhole size={14} aria-hidden /> {side === 'tenant' ? t('coordChat.privateTenant') : t('coordChat.privateCoord', { name: tenantName })}
      </p>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {thread.map((m) => {
          const mine = m.from === side
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${mine ? 'rounded-br-md bg-ink text-white' : 'rounded-bl-md bg-surface ring-1 ring-soft'}`}
              >
                <p className={`mb-0.5 text-xs font-semibold ${mine ? 'text-white/80' : 'text-muted'}`}>
                  {m.from === 'coord' ? t('coordChat.coord') : tenantName}
                </p>
                <p className="text-base">{show(m)}</p>
                <p className={`mt-1 text-right text-xs ${mine ? 'text-white/70' : 'text-muted'}`}>{m.when}</p>
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(side, draft)
          setDraft('')
        }}
        className="flex items-center gap-2 border-t border-soft px-4 py-3"
      >
        <label className="sr-only" htmlFor={`coord-${side}`}>
          {t('chat.write')}
        </label>
        <input
          id={`coord-${side}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoComplete="off"
          placeholder={side === 'tenant' ? t('coordChat.phTenant') : t('coordChat.phCoord')}
          className="h-12 min-w-0 flex-1 rounded-full border border-line px-5 text-base outline-none hover:border-ink focus:border-ink focus:ring-1 focus:ring-ink"
        />
        <Button type="submit" variant="dark" disabled={!draft.trim()} icon={<Send size={18} aria-hidden />}>
          {t('chat.send')}
        </Button>
      </form>
    </div>
  )
}
