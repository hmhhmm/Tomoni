import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Phone, PhoneCall, Siren, Flag, UserRound, Check, X } from 'lucide-react'
import { Screen } from '../components/Screen'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { ChoiceChip } from '../components/Chip'
import { Notice } from '../components/Misc'
import { useStore } from '../store'
import { useUI } from '../ui'

export function Safety() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const addFlag = useStore((s) => s.addFlag)
  const say = useUI((s) => s.say)
  const [calling, setCalling] = useState(false)
  const [coord, setCoord] = useState(false)
  const [cat, setCat] = useState<string | null>(null)
  const [detail, setDetail] = useState('')
  const [sent, setSent] = useState(false)
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (params.get('report')) reportRef.current?.scrollIntoView({ block: 'start' }) }, [params])

  const cats = ['uncomfortable', 'money', 'tasks', 'safety', 'other']
  const submit = () => {
    addFlag({ caseId: 'c1', kind: 'report', text: `${t(`safety.cat.${cat}`)}${detail ? `: ${detail}` : ''}` })
    setSent(true)
  }
  const steps = [1, 2, 3, 4]

  return (
    <Screen title={t('safety.title')} lede={t('safety.lede')} footer
      action={undefined}>
      <Button variant="ghost" block={false} className="-ml-3 -mt-3" icon={<ArrowLeft size={20} aria-hidden />} onClick={() => nav(-1)}>{t('common.back')}</Button>

      <Card tone="rose">
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold"><Siren size={22} aria-hidden /> {t('safety.emergency')}</h2>
        <p className="text-base">{t('safety.emergencyBody')}</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white p-3 text-center"><p className="font-heading text-4xl font-bold text-rose-700">110</p><p className="text-base font-medium">{t('safety.police')}</p></div>
          <div className="rounded-2xl bg-white p-3 text-center"><p className="font-heading text-4xl font-bold text-rose-700">119</p><p className="text-base font-medium">{t('safety.ambulance')}</p></div>
        </div>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold"><Phone size={22} aria-hidden /> {t('safety.line')}</h2>
        <p className="text-base text-muted">{t('safety.lineBody')}</p>
        {calling ? (
          <div role="status" className="mt-3 rounded-2xl bg-purple-50 p-3 text-base">
            <p className="font-semibold">{t('safety.calling')}</p>
            <Button className="mt-2" variant="secondary" icon={<X size={18} aria-hidden />} onClick={() => setCalling(false)}>{t('safety.hangup')}</Button>
          </div>
        ) : (
          <Button className="mt-3" icon={<PhoneCall size={20} aria-hidden />} onClick={() => setCalling(true)}>{t('safety.call')}</Button>
        )}
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold"><UserRound size={22} aria-hidden /> {t('safety.coordinator')}</h2>
        <p className="text-base text-muted">{t('safety.coordinatorBody')}</p>
        {coord ? (
          <p role="status" className="mt-3 flex items-center gap-2 rounded-2xl bg-teal-50 p-3 text-base font-medium text-teal-700"><Check size={20} aria-hidden /> {t('safety.coordinatorSent')}</p>
        ) : (
          <Button className="mt-3" variant="secondary" onClick={() => { setCoord(true); say(t('safety.coordinatorSent')) }}>{t('safety.coordinatorBtn')}</Button>
        )}
      </Card>

      <div ref={reportRef} className="scroll-mt-4">
        <Card tone="amber">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold"><Flag size={22} aria-hidden /> {t('safety.report')}</h2>
          {sent ? (
            <Notice tone="teal" live title={t('safety.reportSent')}>{t('safety.reportSentBody')}</Notice>
          ) : (
            <>
              <p className="text-base">{t('safety.reportBody')}</p>
              <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={t('safety.report')}>
                {cats.map((c) => <ChoiceChip key={c} selected={cat === c} onClick={() => setCat(c)}>{t(`safety.cat.${c}`)}</ChoiceChip>)}
              </div>
              <label htmlFor="rep" className="mt-3 block text-base font-medium">{t('safety.detail')}</label>
              <textarea id="rep" rows={3} value={detail} onChange={(e) => setDetail(e.target.value)} className="mt-1 w-full rounded-input border border-line bg-white p-3 text-base" />
              <Button className="mt-3" disabled={!cat} onClick={submit}>{t('safety.reportSend')}</Button>
            </>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="font-heading text-lg font-semibold">{t('ladder.title')}</h2>
        <p className="text-base text-muted">{t('ladder.lede')}</p>
        <ol className="mt-4 space-y-0">
          {steps.map((i) => (
            <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
              {i < 4 && <span aria-hidden className="absolute left-[1.1rem] top-10 h-[calc(100%-2rem)] w-0.5 bg-purple-100" />}
              <span className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-purple-600 font-heading font-semibold text-white">{i}</span>
              <div><p className="font-heading font-semibold leading-tight">{t(`ladder.s${i}`)}</p><p className="text-base text-muted">{t(`ladder.d${i}`)}</p></div>
            </li>
          ))}
        </ol>
      </Card>
    </Screen>
  )
}
