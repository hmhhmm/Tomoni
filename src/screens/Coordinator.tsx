import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, ArrowLeft, Clock, Flag, HeartPulse, MessageSquareWarning, Users, Globe } from 'lucide-react'
import { useStore, missedRun, weekHours } from '../store'
import { Wordmark } from '../components/layout/Wordmark'
import { Chip } from '../components/ui/Chip'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Field'
import { useL } from '../lib/hooks'
import type { CaseRow, CheckinStatus } from '../data/types'

const TONE = { healthy: 'teal', trial: 'purple', attention: 'amber', alert: 'rose' } as const
const DOT = { good: 'bg-teal-500', notgood: 'bg-amber-700', missed: 'bg-rose-700', pending: 'bg-soft' } as const

export function Coordinator() {
  const { t } = useTranslation()
  const text = useL()
  const { cases, checkins, flags, tasks, lang, setLang, caseNotes, setCaseNote, markMissed, match } = useStore()
  const [sel, setSel] = useState('c1')
  useEffect(() => {
    document.documentElement.style.fontSize = '16px'
  }, [])

  const rows: CaseRow[] = useMemo(
    () =>
      cases.map((c) => {
        const hist: CheckinStatus[] = c.id === 'c1' ? checkins.map((x) => x.status) : c.checkins
        const live = c.id === 'c1'
        const hasFlag = live && flags.length > 0
        const base: CaseRow['status'] = live ? (match.stage === 'living' ? 'healthy' : match.stage === 'none' ? 'trial' : 'trial') : c.status
        const status: CaseRow['status'] = missedRun(hist) >= 2 ? 'alert' : hasFlag ? 'attention' : base
        return { ...c, checkins: hist, status, week: live ? Math.max(1, hist.length) : c.week, avgHours: live ? weekHours(tasks, true) : c.avgHours }
      }),
    [cases, checkins, flags, tasks, match.stage],
  )

  const alerts = [
    ...rows
      .filter((r) => missedRun(r.checkins) >= 2)
      .map((r) => ({
        id: `m-${r.id}`,
        caseId: r.id,
        icon: AlertTriangle,
        tone: 'rose' as const,
        title: t('coord.alertMissed'),
        body: `${text(r.household)}: ${t('coord.alertMissedBody')}`,
        when: '',
      })),
    ...flags.map((f) => ({
      id: f.id,
      caseId: f.caseId,
      icon: f.kind === 'report' ? Flag : MessageSquareWarning,
      tone: (f.kind === 'notgood' || f.kind === 'report' ? 'amber' : 'rose') as 'amber' | 'rose',
      title: t(`coord.flag.${f.kind}`),
      body: `“${f.text}”`,
      when: f.when,
    })),
  ]

  const answered = rows.flatMap((r) => r.checkins).filter((s) => s !== 'pending')
  const rate = Math.round((answered.filter((s) => s !== 'missed').length / Math.max(1, answered.length)) * 100)
  const avg = (rows.reduce((a, r) => a + r.avgHours, 0) / rows.length).toFixed(1)
  const current = rows.find((r) => r.id === sel)!
  const note = caseNotes[sel] ?? current.notes

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="border-b border-soft bg-white">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <Wordmark />
            <Chip tone="purple">{t('coord.concept')}</Chip>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'ja' : 'en')}
              className="flex h-11 items-center gap-2 rounded-full px-3 text-base font-medium hover:bg-surface"
            >
              <Globe size={18} aria-hidden />
              <span className="sr-only">{t('lang.toggleLabel')}: </span>
              {lang === 'en' ? '日本語' : 'English'}
            </button>
            <Link to="/" className="inline-flex h-11 items-center gap-2 rounded-btn bg-ink px-4 text-base font-semibold text-white">
              <ArrowLeft size={16} aria-hidden /> {t('coord.back')}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-8 sm:px-6 lg:px-10">
        <div>
          <h1 className="text-[1.75rem] font-semibold">{t('coord.title')}</h1>
          <p className="text-base text-muted">{t('coord.lede')}</p>
        </div>

        <section aria-label={t('coord.impact')} className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Users, label: t('coord.active'), value: String(rows.length) },
            { icon: Clock, label: t('coord.avg'), value: `${avg} h` },
            { icon: HeartPulse, label: t('coord.rate'), value: `${rate}%` },
          ].map((s) => (
            <div key={s.label} className="rounded-card border border-line bg-white p-5">
              <s.icon size={20} aria-hidden className="text-muted" />
              <p className="mt-2 text-[1.75rem] font-semibold tabular-nums leading-tight">{s.value}</p>
              <p className="text-base text-muted">{s.label}</p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr] [&>*]:min-w-0">
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
                    <tr key={r.id} className={`border-b border-soft last:border-0 ${sel === r.id ? 'bg-surface' : ''}`}>
                      <td className="py-3 pr-3">
                        <button
                          type="button"
                          onClick={() => setSel(r.id)}
                          aria-pressed={sel === r.id}
                          className="text-left font-semibold underline-offset-2 hover:underline"
                        >
                          {text(r.household)}
                          <span className="mt-0.5 block text-sm font-normal text-muted">
                            {t('coord.tenant')}: {r.tenant}
                          </span>
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
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => setSel(a.caseId)}
                        className={`flex w-full gap-3 rounded-card border p-3 text-left ${a.tone === 'rose' ? 'border-rose-200 bg-rose-50' : 'border-amber-200 bg-amber-50'}`}
                      >
                        <a.icon size={20} aria-hidden className={`mt-0.5 shrink-0 ${a.tone === 'rose' ? 'text-rose-700' : 'text-amber-700'}`} />
                        <span>
                          <span className="block font-semibold">
                            {a.title} {a.when && <span className="font-normal text-muted">· {a.when}</span>}
                          </span>
                          <span className="block text-base">{a.body}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-label={t('coord.detail')} className="rounded-card border border-line bg-white p-5">
              <h2 className="text-lg font-semibold">{text(current.household)}</h2>
              <label htmlFor="notes" className="mb-1.5 mt-3 block text-sm font-semibold">
                {t('coord.notes')}
              </label>
              <Textarea id="notes" rows={4} value={note} onChange={(e) => setCaseNote(sel, e.target.value)} placeholder={t('coord.notesPh')} />
              <p className="mt-1 text-sm text-muted">{t('coord.saved')}</p>
              <Button className="mt-3" variant="secondary" onClick={() => markMissed(sel)}>
                {t('coord.markMissed')}
              </Button>
            </section>
          </div>
        </div>
        <p className="text-center text-sm text-muted">{t('common.concept')}</p>
      </main>
    </div>
  )
}
