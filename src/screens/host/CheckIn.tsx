import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ThumbsUp, ThumbsDown, Mic, Square, Trash2, Phone, HeartPulse, ImagePlus, Lock } from 'lucide-react'
import { Page, EmptyState, Notice } from '../../components/domain/Bits'
import { Button, LinkButton } from '../../components/ui/Button'
import { Chip } from '../../components/ui/Chip'
import { useStore } from '../../store'
import { StayTabs } from '../../components/domain/StayTabs'

export function CheckIn() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { checkins, submitCheckin, match } = useStore()
  const pending = checkins.find((c) => c.status === 'pending')
  const last = [...checkins].reverse().find((c) => c.status !== 'pending')
  const [rec, setRec] = useState<'idle' | 'recording' | 'done'>('idle')
  const [secs, setSecs] = useState(0)
  const [choice, setChoice] = useState<'good' | 'notgood' | null>(null)
  // Optional photo: previewed in the browser only; the prototype keeps just "a photo was attached".
  const [photo, setPhoto] = useState<{ url: string; name: string } | null>(null)
  useEffect(() => () => (photo ? URL.revokeObjectURL(photo.url) : undefined), [photo])

  useEffect(() => {
    if (rec !== 'recording') return
    const id = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [rec])
  const mmss = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
  const tone = (s: string) =>
    (s === 'good' ? 'teal' : s === 'notgood' ? 'amber' : s === 'missed' ? 'rose' : 'neutral') as 'teal' | 'amber' | 'rose' | 'neutral'

  if (match.stage !== 'living') {
    return (
      <Page className="py-8">
        <StayTabs />
        <EmptyState
          align="left"
          icon={<HeartPulse size={26} aria-hidden />}
          title={t('checkin.notYetTitle')}
          body={t('checkin.notYetBody')}
          action={
            <LinkButton to="/saito/stay" variant="dark">
              {t('nav.stay')}
            </LinkButton>
          }
        />
      </Page>
    )
  }

  return (
    <Page className="py-8">
      <StayTabs />
      <div className="max-w-3xl">
        <h1 className="text-[1.75rem] font-semibold">{t('checkin.title')}</h1>
        <p className="mt-1 text-base text-muted">{pending ? t('checkin.lede', { week: pending.week }) : t('checkin.doneLede')}</p>

        {pending ? (
          <div className="mt-8 space-y-5">
            <div role="radiogroup" aria-label={t('checkin.title')} className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ['good', ThumbsUp, t('checkin.good'), t('checkin.goodHint')],
                  ['notgood', ThumbsDown, t('checkin.notGood'), t('checkin.notGoodHint')],
                ] as const
              ).map(([k, Icon, label, hint]) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={choice === k}
                  onClick={() => setChoice(k)}
                  className={`flex flex-col items-start gap-3 rounded-card border-2 p-5 text-left transition ${choice === k ? (k === 'good' ? 'border-teal-700 bg-teal-50' : 'border-amber-700 bg-amber-50') : 'border-line hover:border-ink'}`}
                >
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-full ${k === 'good' ? 'bg-teal-100 text-teal-700' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'}`}
                  >
                    <Icon size={24} aria-hidden />
                  </span>
                  <span className="text-lg font-semibold">{label}</span>
                  <span className="text-base text-muted">{hint}</span>
                </button>
              ))}
            </div>

            <div className="rounded-card border border-line p-5">
              <h2 className="text-base font-semibold">{t('checkin.voice')}</h2>
              <p className="text-sm text-muted">{t('checkin.voiceHint')}</p>
              {rec === 'idle' && (
                <Button
                  className="mt-3"
                  variant="secondary"
                  icon={<Mic size={18} aria-hidden />}
                  onClick={() => {
                    setSecs(0)
                    setRec('recording')
                  }}
                >
                  {t('checkin.record')}
                </Button>
              )}
              {rec === 'recording' && (
                <div className="mt-3 flex items-center gap-3">
                  <span aria-hidden className="h-3 w-3 animate-pulse rounded-full bg-rose-700" />
                  <span role="timer" className="font-semibold tabular-nums">
                    {mmss}
                  </span>
                  <Button variant="danger" size="sm" icon={<Square size={14} aria-hidden />} onClick={() => setRec('done')}>
                    {t('checkin.stop')}
                  </Button>
                </div>
              )}
              {rec === 'done' && (
                <div className="mt-3 flex items-center gap-3">
                  <Chip tone="teal">{t('checkin.voiceSaved', { time: mmss })}</Chip>
                  <Button variant="ghost" size="sm" icon={<Trash2 size={14} aria-hidden />} onClick={() => setRec('idle')}>
                    {t('common.remove')}
                  </Button>
                </div>
              )}
            </div>

            <div className="rounded-card border border-line p-5">
              <h2 className="text-base font-semibold">{t('checkin.photo')}</h2>
              <p className="text-sm text-muted">{t('checkin.photoHint')}</p>
              {photo ? (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <img src={photo.url} alt={t('checkin.photoAlt')} className="h-24 w-24 rounded-card object-cover ring-1 ring-line" />
                  <span className="min-w-0 flex-1 truncate text-sm text-muted">{photo.name}</span>
                  <Button variant="ghost" size="sm" icon={<Trash2 size={14} aria-hidden />} onClick={() => setPhoto(null)}>
                    {t('common.remove')}
                  </Button>
                </div>
              ) : (
                <label className="mt-3 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-btn border border-ink px-5 text-base font-semibold hover:bg-surface focus-within:ring-2 focus-within:ring-ink">
                  <ImagePlus size={18} aria-hidden />
                  {t('checkin.addPhoto')}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) setPhoto({ url: URL.createObjectURL(f), name: f.name })
                      e.target.value = ''
                    }}
                  />
                </label>
              )}
              <p className="mt-3 flex items-start gap-2 text-sm text-muted">
                <Lock size={14} aria-hidden className="mt-0.5 shrink-0" />
                {t('checkin.photoPrivacy')}
              </p>
            </div>

            <div className="flex">
              <Button
                variant="primary"
                size="lg"
                disabled={!choice}
                onClick={() => {
                  submitCheckin(choice!, rec === 'done', !!photo)
                  setChoice(null)
                  setRec('idle')
                  setPhoto(null)
                }}
              >
                {t('checkin.submit')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <Notice
              tone={last?.status === 'notgood' ? 'amber' : 'teal'}
              live
              title={last?.status === 'notgood' ? t('checkin.thanksNotGood') : t('checkin.thanksGood')}
            >
              {last?.status === 'notgood' ? t('checkin.thanksNotGoodBody') : t('checkin.thanksGoodBody')}
            </Notice>
            {last?.status === 'notgood' && (
              <Button variant="secondary" icon={<Phone size={18} aria-hidden />} onClick={() => nav('/safety')}>
                {t('checkin.talkCoord')}
              </Button>
            )}
          </div>
        )}

        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">{t('checkin.history')}</h2>
          <ul className="flex flex-wrap gap-2">
            {checkins.map((c) => (
              <li key={c.week}>
                <Chip tone={tone(c.status)}>
                  {t('checkin.week', { n: c.week })}: {t(`checkin.status.${c.status}`)}
                </Chip>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Page>
  )
}
