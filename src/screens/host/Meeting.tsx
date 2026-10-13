import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, CalendarCheck, HandHeart, Undo2, DoorOpen } from 'lucide-react'
import { Screen } from '../../components/Screen'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { ChoiceChip } from '../../components/Chip'
import { StepBar } from '../../components/StepBar'
import { Notice } from '../../components/Misc'
import { Avatar } from '../../components/Avatar'
import { useStore } from '../../store'
import { useState } from 'react'

const SLOTS = ['sat14', 'sat15', 'sun11'] as const

export function Meeting() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { stage, setStage, meetSlot, setMeetSlot, trialWeeks, startTrial, endTrial, applicants, activeApplicant, trialDay } = useStore()
  const [slot, setSlot] = useState<string>(meetSlot ?? 'sat14')
  const [weeks, setWeeks] = useState(trialWeeks)
  const a = applicants.find((x) => x.id === activeApplicant)!
  const idx = { meet: 0, trial: 1, pact: 2, living: 3, ended: 0 }[stage]
  const total = trialWeeks * 7

  return (
    <Screen title={t('trial.title')} lede={t('trial.lede')} footer>
      <Card><StepBar steps={[t('steps.meet'), t('steps.trial'), t('steps.pact'), t('steps.living')]} current={idx} /></Card>

      <Card className="flex items-center gap-3">
        <Avatar hue={a.hue} size={52} label={a.name} />
        <div><p className="font-heading text-lg font-semibold">{a.name}, {a.age}</p><p className="text-base text-muted">{t('trial.with')}</p></div>
      </Card>

      {stage === 'meet' && !meetSlot && (
        <Card>
          <h2 className="text-lg font-semibold">{t('trial.pickTime')}</h2>
          <div role="radiogroup" aria-label={t('trial.pickTime')} className="mt-3 flex flex-col gap-2">
            {SLOTS.map((s) => (
              <ChoiceChip key={s} selected={slot === s} onClick={() => setSlot(s)} className="!rounded-2xl text-left">{t(`trial.slot.${s}`)}</ChoiceChip>
            ))}
          </div>
          <p className="mt-3 text-base text-muted">{t('trial.tip')}</p>
          <Button className="mt-4" icon={<CalendarCheck size={20} aria-hidden />} onClick={() => setMeetSlot(slot)}>{t('trial.confirmMeet')}</Button>
        </Card>
      )}

      {stage === 'meet' && meetSlot && (
        <>
          <Notice tone="teal" live icon={<CalendarCheck size={24} className="text-teal-700" aria-hidden />} title={t('trial.booked')}>{t(`trial.slot.${meetSlot}`)}</Notice>
          <Card>
            <h2 className="text-lg font-semibold">{t('trial.startTitle')}</h2>
            <p className="mt-1 text-base text-muted">{t('trial.startBody')}</p>
            <div className="mt-3 flex gap-2" role="radiogroup" aria-label={t('trial.length')}>
              {[2, 3, 4].map((w) => <ChoiceChip key={w} selected={weeks === w} onClick={() => setWeeks(w)}>{t('trial.weeks', { n: w })}</ChoiceChip>)}
            </div>
            <Button className="mt-4" icon={<ArrowRight size={20} aria-hidden />} onClick={() => startTrial(weeks)}>{t('trial.start')}</Button>
            <Button variant="ghost" className="mt-2" onClick={() => setMeetSlot(null)}>{t('trial.change')}</Button>
          </Card>
        </>
      )}

      {stage === 'trial' && (
        <>
          <Card>
            <h2 className="text-lg font-semibold">{t('trial.running')}</h2>
            <p className="mt-1 text-base text-muted">{t('host.trialDay', { n: trialDay, total })}</p>
            <div className="mt-3 h-4 overflow-hidden rounded-full bg-purple-100" role="progressbar" aria-label={t("trial.running")} aria-valuemin={0} aria-valuemax={total} aria-valuenow={trialDay}>
              <div className="h-full rounded-full bg-purple-600" style={{ width: `${(trialDay / total) * 100}%` }} />
            </div>
            <Button className="mt-4" icon={<ArrowRight size={20} aria-hidden />} onClick={() => { setStage('pact'); nav('/pact') }}>{t('trial.toPact')}</Button>
          </Card>
          <Card tone="amber">
            <h2 className="text-lg font-semibold">{t('trial.endTitle')}</h2>
            <p className="mt-1 text-base">{t('trial.endBody')}</p>
            <Button variant="secondary" className="mt-3" icon={<DoorOpen size={20} aria-hidden />} onClick={endTrial}>{t('trial.end')}</Button>
          </Card>
        </>
      )}

      {stage === 'pact' && (
        <Card><p className="text-base">{t('trial.pactNote')}</p><Button className="mt-3" icon={<ArrowRight size={20} aria-hidden />} onClick={() => nav('/pact')}>{t('trial.toPact')}</Button></Card>
      )}

      {stage === 'living' && (
        <Notice tone="teal" icon={<HandHeart size={24} className="text-teal-700" aria-hidden />} title={t('trial.living')}>{t('trial.livingBody')}</Notice>
      )}

      {stage === 'ended' && (
        <Card tone="purple">
          <p role="status" className="text-base"><strong>{t('trial.endedTitle')}</strong> {t('trial.endedBody')}</p>
          <div className="mt-3 flex flex-col gap-2">
            <Button onClick={() => nav('/host/applicants')}>{t('trial.findOther')}</Button>
            <Button variant="secondary" icon={<Undo2 size={18} aria-hidden />} onClick={() => setStage('trial')}>{t('trial.resume')}</Button>
          </div>
        </Card>
      )}
    </Screen>
  )
}
