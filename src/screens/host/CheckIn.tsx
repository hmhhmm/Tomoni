import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ThumbsUp, ThumbsDown, Mic, Square, Trash2, Phone } from 'lucide-react'
import { Screen } from '../../components/Screen'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { Notice } from '../../components/Misc'
import { useStore } from '../../store'

export function CheckIn() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { checkins, submitCheckin } = useStore()
  const pending = checkins.find((c) => c.status === 'pending')
  const last = [...checkins].reverse().find((c) => c.status !== 'pending')
  const [rec, setRec] = useState<'idle' | 'recording' | 'done'>('idle')
  const [secs, setSecs] = useState(0)

  useEffect(() => {
    if (rec !== 'recording') return
    const id = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [rec])

  const mmss = `0:${String(secs).padStart(2, '0')}`
  const tone = (s: string) => (s === 'good' ? 'teal' : s === 'notgood' ? 'amber' : s === 'missed' ? 'rose' : 'neutral') as 'teal' | 'amber' | 'rose' | 'neutral'

  return (
    <Screen title={t('checkin.title')} lede={pending ? t('checkin.lede', { week: pending.week }) : t('checkin.doneLede')} footer>
      {pending ? (
        <>
          <button
            type="button" onClick={() => submitCheckin('good', rec === 'done')}
            className="flex min-h-[10rem] w-full flex-col items-center justify-center gap-2 rounded-sheet bg-teal-700 p-6 text-white shadow-lift transition active:scale-[.98]"
          >
            <ThumbsUp size={52} aria-hidden />
            <span className="font-heading text-2xl font-semibold">{t('checkin.good')}</span>
          </button>
          <button
            type="button" onClick={() => submitCheckin('notgood', rec === 'done')}
            className="flex min-h-[10rem] w-full flex-col items-center justify-center gap-2 rounded-sheet border-2 border-amber-700 bg-amber-50 p-6 text-amber-700 shadow-soft transition active:scale-[.98]"
          >
            <ThumbsDown size={52} aria-hidden />
            <span className="font-heading text-2xl font-semibold">{t('checkin.notGood')}</span>
          </button>

          <Card>
            <p className="font-heading text-lg font-semibold">{t('checkin.voice')}</p>
            <p className="text-base text-muted">{t('checkin.voiceHint')}</p>
            {rec === 'idle' && <Button className="mt-3" variant="secondary" icon={<Mic size={20} aria-hidden />} onClick={() => { setSecs(0); setRec('recording') }}>{t('checkin.record')}</Button>}
            {rec === 'recording' && (
              <div className="mt-3 flex items-center gap-3">
                <span aria-hidden className="h-4 w-4 animate-pulse rounded-full bg-rose-700" />
                <span role="timer" className="font-heading text-xl font-semibold">{mmss}</span>
                <Button block={false} variant="danger" icon={<Square size={18} aria-hidden />} onClick={() => setRec('done')}>{t('checkin.stop')}</Button>
              </div>
            )}
            {rec === 'done' && (
              <div className="mt-3 flex items-center gap-3">
                <Chip tone="teal">{t('checkin.voiceSaved', { time: mmss })}</Chip>
                <Button block={false} variant="ghost" icon={<Trash2 size={18} aria-hidden />} onClick={() => setRec('idle')}>{t('common.remove')}</Button>
              </div>
            )}
          </Card>
        </>
      ) : (
        <Notice tone={last?.status === 'notgood' ? 'amber' : 'teal'} live title={last?.status === 'notgood' ? t('checkin.thanksNotGood') : t('checkin.thanksGood')}>
          {last?.status === 'notgood' ? t('checkin.thanksNotGoodBody') : t('checkin.thanksGoodBody')}
        </Notice>
      )}

      {last?.status === 'notgood' && !pending && (
        <Button variant="secondary" icon={<Phone size={20} aria-hidden />} onClick={() => nav('/safety')}>{t('checkin.talkCoord')}</Button>
      )}

      <Card>
        <p className="font-heading text-lg font-semibold">{t('checkin.history')}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {checkins.map((c) => (
            <li key={c.week}><Chip tone={tone(c.status)}>{t('checkin.week', { n: c.week })}: {t(`checkin.status.${c.status}`)}</Chip></li>
          ))}
        </ul>
      </Card>
    </Screen>
  )
}
