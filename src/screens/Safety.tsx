import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LADDER } from '../data/journey'
import { ArrowLeft, Check, Flag, Phone, PhoneCall, Siren, UserRound, X } from 'lucide-react'
import { Page, Notice } from '../components/domain/Bits'
import { Button } from '../components/ui/Button'
import { Pill } from '../components/ui/Chip'
import { Textarea } from '../components/ui/Field'
import { useStore } from '../store'
import { useUI } from '../ui'

export function Safety() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const addFlag = useStore((s) => s.addFlag)
  const match = useStore((s) => s.match)
  const say = useUI((s) => s.say)
  const [calling, setCalling] = useState(false)
  const [coord, setCoord] = useState(false)
  const [cat, setCat] = useState<string | null>(null)
  const [detail, setDetail] = useState('')
  const [sent, setSent] = useState(false)
  const reportRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (params.get('report')) reportRef.current?.scrollIntoView({ block: 'center' })
  }, [params])
  const cats = ['uncomfortable', 'money', 'tasks', 'safety', 'other']

  return (
    <Page className="py-8">
      <button
        type="button"
        onClick={() => nav(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-base font-medium underline-offset-4 hover:underline"
      >
        <ArrowLeft size={18} aria-hidden />
        {t('common.back')}
      </button>
      <h1 className="text-[1.75rem] font-semibold">{t('safety.title')}</h1>
      <p className="mt-1 text-base text-muted">{t('safety.lede')}</p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <section className="rounded-card border border-rose-200 bg-rose-50 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Siren size={20} aria-hidden /> {t('safety.emergency')}
          </h2>
          <p className="mt-1 text-base">{t('safety.emergencyBody')}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              ['110', t('safety.police')],
              ['119', t('safety.ambulance')],
            ].map(([n, l]) => (
              <div key={n} className="min-w-0 rounded-card bg-white p-4 text-center">
                <p className="font-heading text-4xl font-bold text-rose-700">{n}</p>
                <p className="break-words text-base font-medium">{l}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-card border border-line p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Phone size={20} aria-hidden /> {t('safety.line')}
          </h2>
          <p className="mt-1 text-base text-muted">{t('safety.lineBody')}</p>
          {calling ? (
            <div role="status" className="mt-4 rounded-card bg-surface p-4">
              <p className="font-semibold">{t('safety.calling')}</p>
              <Button className="mt-3" variant="secondary" icon={<X size={16} aria-hidden />} onClick={() => setCalling(false)}>
                {t('safety.hangup')}
              </Button>
            </div>
          ) : (
            <Button className="mt-4" variant="teal" icon={<PhoneCall size={18} aria-hidden />} onClick={() => setCalling(true)}>
              {t('safety.call')}
            </Button>
          )}
        </section>

        <section className="rounded-card border border-line p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <UserRound size={20} aria-hidden /> {t('safety.coordinator')}
          </h2>
          <p className="mt-1 text-base text-muted">{t('safety.coordinatorBody')}</p>
          {coord ? (
            <p role="status" className="mt-4 flex items-center gap-2 rounded-card bg-teal-50 p-3 text-base font-medium text-teal-700">
              <Check size={18} aria-hidden /> {t('safety.coordinatorSent')}
            </p>
          ) : (
            <Button
              className="mt-4"
              variant="secondary"
              onClick={() => {
                setCoord(true)
                say(t('safety.coordinatorSent'))
              }}
            >
              {t('safety.coordinatorBtn')}
            </Button>
          )}
        </section>

        <section ref={reportRef} className="scroll-mt-28 rounded-card border border-amber-200 bg-amber-50 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Flag size={20} aria-hidden /> {t('safety.report')}
          </h2>
          {sent ? (
            <div className="mt-3">
              <Notice tone="teal" live title={t('safety.reportSent')}>
                {t('safety.reportSentBody')}
              </Notice>
            </div>
          ) : (
            <>
              <p className="mt-1 text-base">{t('safety.reportBody')}</p>
              <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label={t('safety.report')}>
                {cats.map((c) => (
                  <Pill key={c} selected={cat === c} onClick={() => setCat(c)}>
                    {t(`safety.cat.${c}`)}
                  </Pill>
                ))}
              </div>
              <label htmlFor="rep" className="mb-1.5 mt-4 block text-sm font-semibold">
                {t('safety.detail')}
              </label>
              <Textarea id="rep" rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} />
              <Button
                className="mt-4"
                variant="dark"
                disabled={!cat}
                onClick={() => {
                  addFlag({
                    caseId: match.stage === 'none' ? null : 'c1',
                    kind: 'report',
                    text: `${t(`safety.cat.${cat}`)}${detail ? `: ${detail}` : ''}`,
                  })
                  setSent(true)
                }}
              >
                {t('safety.reportSend')}
              </Button>
            </>
          )}
        </section>

        <section className="rounded-card border border-line p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold">{t('ladder.title')}</h2>
          <p className="text-base text-muted">{t('ladder.lede')}</p>
          <ol className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {LADDER.map((i) => (
              <li key={i} className="relative">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-ink font-heading font-semibold text-white">{i}</span>
                <p className="mt-3 font-semibold leading-tight">{t(`ladder.s${i}`)}</p>
                <p className="mt-1 text-base text-muted">{t(`ladder.d${i}`)}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Page>
  )
}
