import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, CalendarDays, Check, EyeOff, Hourglass, Lock, Mic, NotebookText, Phone, Send, ThumbsDown, ThumbsUp } from 'lucide-react'
import { Page, Notice, FictionalTag } from '../../components/domain/Bits'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { HourMeter } from '../../components/domain/HourMeter'
import { Chip } from '../../components/ui/Chip'
import { Modal } from '../../components/ui/Modal'
import { Textarea } from '../../components/ui/Field'
import { agreedHelps, useStore, weekHours } from '../../store'
import { HELP_ORDER } from '../../data/seed'
import { MEET_SLOTS } from '../../data/journey'
import { formatDayTime } from '../../lib/format'
import { useUI } from '../../ui'
import { SATO_HUE } from '../../tokens'

export function FamilyInvite() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { setFamilyConsent, setPersona } = useStore()
  return (
    <Page narrow className="py-10">
      <h1 className="text-[1.75rem] font-semibold">{t('invite.title')}</h1>
      <p className="mt-1 text-base text-muted">{t('invite.lede', { host: t('names.sato') })}</p>
      <div className="mt-6 flex items-center gap-3 rounded-card border border-line p-4">
        <Avatar hue={SATO_HUE} size={56} label={t('names.sato')} />
        <div>
          <p className="text-lg font-semibold">{t('names.sato')}</p>
          <FictionalTag />
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <section className="rounded-card border border-teal-100 bg-teal-50 p-5">
          <h2 className="text-lg font-semibold">{t('invite.seeTitle')}</h2>
          <ul className="mt-3 space-y-2">
            {(['a', 'b', 'c'] as const).map((k) => (
              <li key={k} className="flex gap-2 text-base">
                <Check size={18} aria-hidden className="mt-0.5 shrink-0 text-teal-700" />
                {t(`invite.seeItems.${k}`)}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-card border border-rose-200 bg-rose-50 p-5">
          <h2 className="text-lg font-semibold">{t('invite.neverTitle')}</h2>
          <ul className="mt-3 space-y-2">
            {(['a', 'b'] as const).map((k) => (
              <li key={k} className="flex gap-2 text-base">
                <EyeOff size={18} aria-hidden className="mt-0.5 shrink-0 text-rose-700" />
                {t(`invite.neverItems.${k}`)}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <p className="mt-5 text-base text-muted">{t('invite.revoke')}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            setFamilyConsent(true)
            nav('/family')
          }}
        >
          {t('invite.accept')}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => {
            setPersona(null)
            nav('/')
          }}
        >
          {t('invite.decline')}
        </Button>
      </div>
    </Page>
  )
}

export function FamilyDashboard() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const say = useUI((s) => s.say)
  const lang = useStore((s) => s.lang)
  const { familyConsent, setFamilyConsent, checkins, tasks, match, applicants, tenant, pactHelps, declined } = useStore()
  const addFlag = useStore((s) => s.addFlag)
  // "Contact the coordinator" lands on the coordinator desk for the Sato case.
  const [contactOpen, setContactOpen] = useState(false)
  const [contactMsg, setContactMsg] = useState('')
  if (!familyConsent) return <Navigate to="/family/invite" replace />

  const current = checkins[checkins.length - 1]
  const st = current?.status ?? 'pending'
  const hasStay = match.stage === 'living'
  const view = {
    good: { Icon: ThumbsUp, tone: 'border-teal-100 bg-teal-50', ic: 'text-teal-700', title: t('family.good'), body: t('family.goodBody') },
    notgood: {
      Icon: ThumbsDown,
      tone: 'border-amber-200 bg-amber-50',
      ic: 'text-amber-700',
      title: t('family.notGood'),
      body: t('family.notGoodBody'),
    },
    missed: { Icon: AlertTriangle, tone: 'border-rose-200 bg-rose-50', ic: 'text-rose-700', title: t('family.missed'), body: t('family.missedBody') },
    pending: { Icon: Hourglass, tone: 'border-line bg-surface', ic: 'text-muted', title: t('family.pending'), body: t('family.pendingBody') },
  }[st]
  // The meet-up is only "coming up" before it happens (the trial starts after it).
  const slot = match.stage === 'meet' ? MEET_SLOTS.find((s) => s.id === match.meetSlot) : undefined
  const fmt = (d: Date) => formatDayTime(d, lang)
  // Regular help from the agreement, with its usual time (companionship-only stays have none).
  const agreed = agreedHelps({ pactHelps, declined })
  // Only check-ins Mrs Sato chose to share, newest first (photo / voice note still within the retention period).
  const shared = checkins.filter((c) => c.shareFamily && (c.photoData || c.voiceSecs)).reverse()
  const regular = hasStay ? HELP_ORDER.filter((h) => agreed[h]).map((h) => ({ id: h, slot: agreed[h]!.slot })) : []

  // Weekly summary: built only from check-ins, confirmed hours and plans. Never from messages.
  const host = t('names.sato')
  const housemate = applicants.find((a) => a.id === match.applicantId)?.name ?? tenant.name
  const answered = checkins.filter((c) => c.status !== 'pending')
  const goodCount = answered.filter((c) => c.status === 'good').length
  const confirmedH = weekHours(tasks, true)
  const waitingH = weekHours(tasks, false) - confirmedH
  const summary = [
    t(`family.sum.${st}`, { host }),
    answered.length > 0 ? t('family.sum.streak', { good: goodCount, total: answered.length }) : null,
    confirmedH > 0 ? t('family.sum.hours', { name: housemate, h: confirmedH, host }) : t('family.sum.noHours'),
    waitingH > 0 ? t('family.sum.waiting', { h: waitingH, host }) : null,
    regular[0] ? t('family.sum.next', { what: t(`help.${regular[0].id}.title`), when: t(`slot.${regular[0].slot}`) }) : null,
  ].filter(Boolean) as string[]

  return (
    <Page className="py-8">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar hue={SATO_HUE} size={56} label={t('names.sato')} />
        <div>
          <h1 className="text-[1.75rem] font-semibold leading-tight">{t('family.title', { name: t('names.sato') })}</h1>
          <div className="mt-1 flex items-center gap-2">
            <FictionalTag />
            <span className="text-sm text-muted">{t('family.you')}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className={`rounded-sheet border p-8 ${view.tone}`} role="status">
          <view.Icon size={44} aria-hidden className={view.ic} />
          <p className="mt-4 text-sm font-semibold text-muted">{hasStay && current ? t('family.week', { n: current.week }) : t('family.noStay')}</p>
          <p className="mt-1 font-heading text-[2rem] font-semibold leading-tight">{hasStay ? view.title : t('family.beforeStay')}</p>
          <p className="mt-2 text-base">{hasStay ? view.body : t('family.beforeStayBody')}</p>
        </div>

        <div className="space-y-6">
          <section className="flex items-center gap-5 rounded-card border border-line p-5">
            <HourMeter variant="ring" value={weekHours(tasks, true)} size={104} label={t('meter.week')} />
            <div>
              <h2 className="text-lg font-semibold">{t('family.hours')}</h2>
              <p className="text-base text-muted">{t('family.hoursBody')}</p>
            </div>
          </section>
          <section className="rounded-card border border-line p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <CalendarDays size={20} aria-hidden />
              {t('family.upcoming')}
            </h2>
            <ul className="mt-3 space-y-2 text-base">
              {regular.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface px-3 py-2">
                  <span>{t(`help.${r.id}.title`)}</span>
                  <Chip>{t(`slot.${r.slot}`)}</Chip>
                </li>
              ))}
              {slot && (
                <li className="flex items-center justify-between gap-2 rounded-lg bg-surface px-3 py-2">
                  <span>{t('family.meetup')}</span>
                  <Chip>{fmt(slot.date())}</Chip>
                </li>
              )}
              {regular.length === 0 && !slot && <li className="text-muted">{t('family.noUpcoming')}</li>}
            </ul>
          </section>
        </div>
      </div>

      {shared.length > 0 && (
        <section aria-labelledby="shared-title" className="mt-6 rounded-card border border-line p-6">
          <h2 id="shared-title" className="text-lg font-semibold">
            {t('family.shared.title', { host: t('names.sato') })}
          </h2>
          <ul className="mt-3 grid gap-4 sm:grid-cols-2">
            {shared.map((c) => (
              <li key={c.week} className="rounded-card bg-surface p-4">
                <p className="text-sm font-semibold text-muted">{t('family.week', { n: c.week })}</p>
                {c.photoData && (
                  <img src={c.photoData} alt={t('family.shared.photoAlt', { n: c.week })} className="mt-2 max-h-56 w-full rounded-card object-cover" />
                )}
                {!!c.voiceSecs && (
                  <p className="mt-2 flex items-center gap-2 text-base">
                    <Mic size={18} aria-hidden className="text-muted" />
                    {t('family.shared.voice', { time: `0:${String(c.voiceSecs).padStart(2, '0')}` })}
                    <span className="text-sm text-muted">{t('family.shared.noAudio')}</span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasStay && (
        <section aria-labelledby="sum-title" className="mt-6 rounded-card border border-line p-6">
          <h2 id="sum-title" className="flex items-center gap-2 text-lg font-semibold">
            <NotebookText size={20} aria-hidden />
            {t('family.sum.title')}
          </h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-base">
            {summary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-3 flex items-start gap-2 text-sm text-muted">
            <Lock size={14} aria-hidden className="mt-0.5 shrink-0" />
            {t('family.sum.source')}
          </p>
        </section>
      )}

      <Modal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        title={t('family.contactTitle')}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setContactOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              icon={<Send size={16} aria-hidden />}
              onClick={() => {
                addFlag({ caseId: 'c1', kind: 'family', text: contactMsg.trim() || t('family.contactDefault') })
                setContactMsg('')
                setContactOpen(false)
                say(t('family.contacted'))
              }}
            >
              {t('family.contactSend')}
            </Button>
          </>
        }
      >
        <label htmlFor="family-msg" className="block text-base">
          {t('family.contactBody')}
        </label>
        <Textarea
          id="family-msg"
          rows={4}
          className="mt-3"
          value={contactMsg}
          onChange={(e) => setContactMsg(e.target.value)}
          placeholder={t('family.contactPh')}
        />
        <p className="mt-3 text-sm text-muted">{t('family.contactNote')}</p>
      </Modal>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button variant="dark" size="lg" icon={<Phone size={18} aria-hidden />} onClick={() => setContactOpen(true)}>
          {t('family.contact')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setFamilyConsent(false)
            nav('/family/invite')
          }}
        >
          {t('family.stop')}
        </Button>
      </div>
      <div className="mt-6 max-w-2xl">
        <Notice tone="neutral" icon={<EyeOff size={20} aria-hidden />} title={t('family.private')}>
          {t('family.privateBody')}
        </Notice>
      </div>
    </Page>
  )
}
