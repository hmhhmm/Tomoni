import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarDays, EyeOff, Phone, ThumbsUp, ThumbsDown, Hourglass, AlertTriangle } from 'lucide-react'
import { Screen } from '../../components/Screen'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { HourMeter } from '../../components/HourMeter'
import { Chip, } from '../../components/Chip'
import { FictionalTag, Notice } from '../../components/Misc'
import { useStore, confirmedHours } from '../../store'
import { useUI } from '../../ui'

export function FamilyDashboard() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const say = useUI((s) => s.say)
  const { familyConsent, setFamilyConsent, checkins, tasks, meetSlot, stage } = useStore()
  if (!familyConsent) return <Navigate to="/family/invite" replace />

  const current = checkins[checkins.length - 1]
  const st = current?.status ?? 'pending'
  const view = {
    good: { Icon: ThumbsUp, cls: 'bg-teal-700 text-white', title: t('family.good'), body: t('family.goodBody') },
    notgood: { Icon: ThumbsDown, cls: 'bg-amber-50 text-amber-700 border-2 border-amber-700', title: t('family.notGood'), body: t('family.notGoodBody') },
    missed: { Icon: AlertTriangle, cls: 'bg-rose-50 text-rose-700 border-2 border-rose-700', title: t('family.missed'), body: t('family.missedBody') },
    pending: { Icon: Hourglass, cls: 'bg-white text-ink border border-line', title: t('family.pending'), body: t('family.pendingBody') },
  }[st]

  return (
    <Screen title={t('family.title', { name: t('names.sato') })} lede={t('family.lede')} footer>
      <div className="flex items-center gap-2"><FictionalTag /><span className="text-sm text-muted">{t('family.you')}</span></div>

      <div role="status" className={`rounded-sheet p-5 shadow-lift ${view.cls}`}>
        <div className="flex items-center gap-3">
          <view.Icon size={40} aria-hidden />
          <div>
            <p className="text-sm font-medium opacity-90">{t('family.week', { n: current?.week ?? 3 })}</p>
            <p className="font-heading text-2xl font-semibold leading-tight">{view.title}</p>
          </div>
        </div>
        <p className="mt-2 text-base">{view.body}</p>
      </div>

      <Card className="flex items-center gap-4">
        <HourMeter variant="ring" value={confirmedHours(tasks)} size={104} label={t('meter.week')} />
        <div><p className="font-heading text-lg font-semibold">{t('family.hours')}</p><p className="text-base text-muted">{t('family.hoursBody')}</p></div>
      </Card>

      <Card>
        <h2 className="flex items-center gap-2 font-heading text-lg font-semibold"><CalendarDays size={20} aria-hidden /> {t('family.upcoming')}</h2>
        <ul className="mt-2 space-y-2 text-base">
          <li className="flex items-center justify-between gap-2 rounded-2xl bg-purple-50 px-3 py-2"><span>{t('family.dinner')}</span><Chip tone="purple">{t('family.sunday')}</Chip></li>
          {meetSlot && stage === 'meet' && <li className="flex items-center justify-between gap-2 rounded-2xl bg-purple-50 px-3 py-2"><span>{t('family.meetup')}</span><Chip tone="purple">{t(`trial.slot.${meetSlot}`)}</Chip></li>}
        </ul>
      </Card>

      <Button icon={<Phone size={20} aria-hidden />} onClick={() => { say(t('family.contacted')); nav('/safety') }}>{t('family.contact')}</Button>
      <Notice tone="purple" icon={<EyeOff size={22} className="text-purple-700" aria-hidden />} title={t('family.private')}>{t('family.privateBody')}</Notice>
      <Button variant="ghost" onClick={() => { setFamilyConsent(false); nav('/family/invite') }}>{t('family.stop')}</Button>
    </Screen>
  )
}
