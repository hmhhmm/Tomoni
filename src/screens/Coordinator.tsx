import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, ArrowLeft, Users, Clock, HeartPulse, MessageSquareWarning, Flag } from 'lucide-react'
import { useStore, missedRun, confirmedHours } from '../store'
import { Wordmark } from '../components/Wordmark'
import { Chip } from '../components/Chip'
import { FictionalTag } from '../components/Misc'
import { useL } from '../lib/hooks'
import type { CaseRow, CheckinStatus } from '../data/types'

const TONE = { healthy: 'teal', trial: 'purple', attention: 'amber', alert: 'rose' } as const
const DOT = { good: 'bg-teal-500', notgood: 'bg-amber-700', missed: 'bg-rose-700', pending: 'bg-line' } as const

export function Coordinator() {
  const { t } = useTranslation()
  const l = useL()
  const { cases, checkins, flags, tasks, lang, setLang, caseNotes, setCaseNote, simulateMissed } = useStore()
  const [sel, setSel] = useState('c1')

  const rows: CaseRow[] = useMemo(() => cases.map((c) => {
    const hist: CheckinStatus[] = c.id === 'c1' ? checkins.map((x) => x.status) : c.checkins
    const hasFlag = c.id === 'c1' && flags.length > 0
    const status: CaseRow['status'] = missedRun(hist) >= 2 ? 'alert' : hasFlag ? 'attention' : c.status === 'alert' ? 'healthy' : c.status
    return { ...c, checkins: hist, status, avgHours: c.id === 'c1' ? Math.max(confirmedHours(tasks), 5) : c.avgHours }
  }), [cases, checkins, flags, tasks])

  const alerts = [
    ...rows.filter((r) => missedRun(r.checkins) >= 2).map((r) => ({ id: `m-${r.id}`, caseId: r.id, icon: AlertTriangle, tone: 'rose' as const, title: t('coord.alertMissed'), body: `${l(r.household)}: ${t('coord.alertMissedBody')}`, when: '' })),
    ...flags.map((f) => ({ id: f.id, caseId: f.caseId, icon: f.kind === 'report' ? Flag : MessageSquareWarning, tone: (f.kind === 'notgood' || f.kind === 'report' ? 'amber' : 'rose') as 'amber' | 'rose', title: t(`coord.flag.${f.kind}`), body: `“${f.text}”`, when: f.when })),
  ]

  const answered = rows.flatMap((r) => r.checkins).filter((s) => s !== 'pending')
  const rate = Math.round((answered.filter((s) => s !== 'missed').length / Math.max(1, answered.length)) * 100)
  const avg = (rows.reduce((a, r) => a + r.avgHours, 0) / rows.length).toFixed(1)
  const current = rows.find((r) => r.id === sel)!
  const note = caseNotes[sel] ?? current.notes

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-6 py-3">
        <div className="flex items-center gap-4">
          <Wordmark />
          <Chip tone="purple" className="!text-base">{t('coord.concept')}</Chip>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setLang(lang === 'en' ? 'ja' : 'en')} className="min-h-12 rounded-full border border-line px-4 font-semibold">
            {lang === 'en' ? '日本語' : 'English'}
          </button>
          <Link to="/" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-purple-600 px-4 font-semibold text-white"><ArrowLeft size={18} aria-hidden /> {t('coord.back')}</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-6">
        <h1 className="text-3xl font-semibold">{t('coord.title')}</h1>
        <p className="-mt-3 text-base text-muted">{t('coord.lede')}</p>

        <section aria-label={t('coord.impact')} className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Users, label: t('coord.active'), value: String(rows.length) },
            { icon: Clock, label: t('coord.avg'), value: `${avg} h` },
            { icon: HeartPulse, label: t('coord.rate'), value: `${rate}%` },
          ].map((s) => (
            <div key={s.label} className="rounded-card border border-line bg-white p-5 shadow-soft">
              <s.icon size={22} aria-hidden className="text-purple-700" />
              <p className="mt-2 font-heading text-3xl font-semibold">{s.value}</p>
              <p className="text-base text-muted">{s.label}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section aria-label={t('coord.cases')} className="rounded-card border border-line bg-white p-5 shadow-soft">
            <h2 className="mb-3 text-xl font-semibold">{t('coord.cases')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-base">
                <thead><tr className="border-b border-line text-sm text-muted">
                  <th className="py-2 pr-3 font-medium">{t('coord.household')}</th><th className="pr-3 font-medium">{t('coord.status')}</th>
                  <th className="pr-3 font-medium">{t('coord.week')}</th><th className="font-medium">{t('coord.checkins')}</th>
                </tr></thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className={`border-b border-line last:border-0 ${sel === r.id ? 'bg-purple-50' : ''}`}>
                      <td className="py-3 pr-3">
                        <button type="button" onClick={() => setSel(r.id)} aria-pressed={sel === r.id} className="min-h-12 text-left font-semibold underline-offset-2 hover:underline">
                          {l(r.household)}
                          <span className="block text-sm font-normal text-muted">{t('coord.tenant')}: {r.tenant} <FictionalTag /></span>
                        </button>
                      </td>
                      <td className="pr-3"><Chip tone={TONE[r.status]}>{t(`coord.st.${r.status}`)}</Chip></td>
                      <td className="pr-3">{r.week}</td>
                      <td><span role="img" className="flex flex-wrap gap-1" aria-label={r.checkins.map((c) => t(`checkin.status.${c}`)).join(', ')}>
                        {r.checkins.slice(-8).map((c, i) => <span key={i} aria-hidden className={`h-3 w-3 rounded-full ${DOT[c]}`} />)}
                      </span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="space-y-6">
            <section aria-label={t('coord.alerts')} className="rounded-card border border-line bg-white p-5 shadow-soft">
              <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold">{t('coord.alerts')} <Chip tone={alerts.length ? 'rose' : 'teal'}>{alerts.length}</Chip></h2>
              {alerts.length === 0 ? <p className="text-base text-muted">{t('coord.noAlerts')}</p> : (
                <ul className="space-y-2" aria-live="polite">
                  {alerts.map((a) => (
                    <li key={a.id}>
                      <button type="button" onClick={() => setSel(a.caseId)} className={`flex w-full gap-3 rounded-2xl border p-3 text-left ${a.tone === 'rose' ? 'border-rose-200 bg-rose-50' : 'border-amber-200 bg-amber-50'}`}>
                        <a.icon size={22} aria-hidden className={a.tone === 'rose' ? 'text-rose-700' : 'text-amber-700'} />
                        <span><span className="block font-semibold">{a.title} {a.when && <span className="font-normal text-muted">· {a.when}</span>}</span><span className="block text-base">{a.body}</span></span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section aria-label={t('coord.detail')} className="rounded-card border border-line bg-white p-5 shadow-soft">
              <h2 className="text-xl font-semibold">{l(current.household)}</h2>
              <label htmlFor="notes" className="mt-3 block font-semibold">{t('coord.notes')}</label>
              <textarea id="notes" rows={4} value={note} onChange={(e) => setCaseNote(sel, e.target.value)} placeholder={t('coord.notesPh')}
                className="mt-1 w-full rounded-input border border-line bg-bg p-3 text-base" />
              <p className="text-sm text-muted">{t('coord.saved')}</p>
              <button type="button" onClick={() => simulateMissed(sel)} className="mt-3 min-h-12 rounded-full border border-line px-4 font-semibold hover:border-purple-200">
                {t('coord.simulate')}
              </button>
            </section>
          </div>
        </div>
        <p className="rounded-2xl bg-white/70 px-4 py-3 text-center text-sm text-muted">{t('common.concept')}</p>
      </main>
    </div>
  )
}
