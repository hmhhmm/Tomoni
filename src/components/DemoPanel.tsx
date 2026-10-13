import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { X, RotateCcw, Monitor, ChevronRight } from 'lucide-react'
import { useStore } from '../store'
import { useUI } from '../ui'
import { STORY_HELPS } from '../data/seed'
import { FictionalTag } from './Misc'

type Step = { id: number; go: () => void; alt?: { key: string; go: () => void }; assist?: { key: string; go: () => void } }

/** The 90-second story as a jump list. Every step restores the state it needs, so there are no dead ends. */
export function DemoPanel() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { setDemoOpen, say } = useUI()
  const [active, setActive] = useState(0)

  const S = useStore
  const clearTests = () =>
    S.setState((s) => ({ messages: { ...s.messages, a1: (s.messages.a1 ?? []).filter((m) => !m.flag) }, flags: s.flags.filter((f) => f.kind !== 'money' && f.kind !== 'care') }))
  const ensureHelps = () => {
    if (Object.keys(S.getState().helps).length === 0) S.setState({ helps: { ...STORY_HELPS } })
  }

  const steps: Step[] = [
    {
      id: 1,
      go: () => { S.setState({ role: 'host', helps: {}, stage: 'meet' }); nav('/host/help') },
      assist: { key: 'demo.fill', go: () => { S.setState({ helps: { ...STORY_HELPS } }); say(t('demo.filled')) } },
    },
    {
      id: 2,
      go: () => { ensureHelps(); S.setState({ role: 'tenant', applied: true, activeApplicant: 'a1' }); clearTests(); nav('/chat') },
      alt: { key: 'demo.step2alt', go: () => { ensureHelps(); S.setState({ role: 'tenant' }); nav('/tenant/listing/l1') } },
    },
    {
      id: 3,
      go: () => { ensureHelps(); S.setState({ role: 'host', activeApplicant: 'a1' }); clearTests(); nav('/chat?say=care') },
      alt: { key: 'demo.step3alt', go: () => { S.setState({ role: 'host', activeApplicant: 'a1' }); nav('/chat?say=money') } },
    },
    {
      id: 4,
      go: () => { ensureHelps(); S.setState({ role: 'host', stage: 'pact', pactSigned: { host: false, tenant: false } }); nav('/pact') },
    },
    {
      id: 5,
      go: () => {
        ensureHelps()
        S.setState((s) => ({
          role: 'host', stage: 'living', pactSigned: { host: true, tenant: true }, familyConsent: true,
          checkins: s.checkins.map((c) => (c.week === 3 ? { ...c, status: 'pending' as const } : c)),
        }))
        nav('/host/checkin')
      },
      alt: { key: 'demo.step5alt', go: () => { S.setState({ role: 'family', familyConsent: true }); nav('/family/dashboard') } },
    },
  ]

  return (
    <aside
      aria-label={t('demo.title')}
      className="fixed inset-x-2 bottom-2 z-50 max-h-[62dvh] overflow-y-auto rounded-card border border-line bg-white p-4 shadow-lift lg:static lg:inset-auto lg:max-h-[min(844px,calc(100dvh-48px))] lg:w-[340px] lg:shrink-0"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">{t('demo.title')}</h2>
          <p className="text-sm text-muted">{t('demo.sub')}</p>
        </div>
        <button type="button" onClick={() => setDemoOpen(false)} className="grid min-h-12 min-w-12 place-items-center rounded-full hover:bg-purple-50" aria-label={t('common.close')}>
          <X size={22} aria-hidden />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-sm text-muted">
        <FictionalTag /> <span>{t('demo.cast')}</span>
      </div>

      <ol className="mt-3 space-y-2">
        {steps.map((s, i) => (
          <li key={s.id} className={`rounded-2xl border p-3 ${active === i ? 'border-purple-200 bg-purple-50' : 'border-line'}`}>
            <p className="font-heading font-semibold">{s.id}. {t(`demo.s${s.id}.title`)}</p>
            <p className="mt-0.5 text-sm text-muted">{t(`demo.s${s.id}.desc`)}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setActive(i); s.go() }}
                className="inline-flex min-h-12 items-center gap-1 rounded-full bg-purple-600 px-4 text-base font-semibold text-white"
              >
                {t('demo.jump')} <ChevronRight size={18} aria-hidden />
              </button>
              {s.assist && (
                <button type="button" onClick={s.assist.go} className="min-h-12 rounded-full border border-line bg-white px-4 text-base font-semibold">{t(s.assist.key)}</button>
              )}
              {s.alt && (
                <button type="button" onClick={() => { setActive(i); s.alt!.go() }} className="min-h-12 rounded-full border border-line bg-white px-4 text-base font-semibold">{t(s.alt.key)}</button>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-3 flex flex-col gap-2">
        <button type="button" onClick={() => nav('/coordinator')} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line px-4 text-base font-semibold">
          <Monitor size={18} aria-hidden /> {t('demo.coord')}
        </button>
        <button
          type="button"
          onClick={() => { S.getState().resetDemo(); setActive(0); say(t('demo.resetDone')); nav('/') }}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-4 text-base font-semibold text-white"
        >
          <RotateCcw size={18} aria-hidden /> {t('demo.reset')}
        </button>
      </div>
    </aside>
  )
}
