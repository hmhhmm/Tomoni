import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarClock, CalendarPlus, Check, ChevronRight, Languages, MessageCircle, Undo2, Info, UserX, Users } from 'lucide-react'
import { Page, FictionalTag, VerifiedBadge, EmptyState, Notice } from '../../components/domain/Bits'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Chip, Pill } from '../../components/ui/Chip'
import { Modal } from '../../components/ui/Modal'
import { useStore } from '../../store'
import { fit, type Fit } from '../../data/matching'
import { useL } from '../../lib/hooks'
import type { Applicant } from '../../data/types'

type Filter = 'all' | 'new' | 'chatting' | 'declined'

export function People() {
  const { t } = useTranslation()
  const { applicants, helps, unread, draft } = useStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const home = { helps, languages: ['ja'] as never[] }

  const scored = useMemo(
    () =>
      applicants
        .map((a) => ({ a, f: fit({ skills: a.skills, availability: a.availability, langs: a.langs, verified: a.verified }, home) }))
        .sort((x, y) => y.f.score - x.f.score),
    [applicants, helps], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const count = (s: Filter) =>
    s === 'all' ? applicants.filter((a) => a.status !== 'declined').length : applicants.filter((a) => a.status === s).length
  const shown = scored.filter(({ a }) => (filter === 'all' ? a.status !== 'declined' : a.status === filter))
  const opened = scored.find(({ a }) => a.id === openId)

  return (
    <Page className="py-8">
      <h1 className="text-[1.75rem] font-semibold">{t('people.title')}</h1>
      <p className="mt-1 max-w-2xl text-base text-muted">{t('people.lede')}</p>

      <div className="my-6 flex flex-wrap gap-2" role="group" aria-label={t('people.title')}>
        {(['all', 'new', 'chatting', 'declined'] as Filter[]).map((f) => (
          <Pill key={f} selected={filter === f} onClick={() => setFilter(f)}>
            {t(`people.f.${f}`)} <span className="opacity-70">{count(f)}</span>
          </Pill>
        ))}
      </div>

      <div className="mb-6">
        <Notice tone="neutral" icon={<Info size={20} aria-hidden />} title={t('people.control')}>
          {t('people.controlBody')}
        </Notice>
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={<Users size={26} aria-hidden />} title={t('people.emptyTitle')} body={t('people.emptyBody')} />
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {shown.map(({ a, f }) => (
            <li key={a.id} className="min-w-0">
              <button
                type="button"
                onClick={() => setOpenId(a.id)}
                aria-label={t('people.viewProfileOf', { name: a.name })}
                className={`group flex h-full w-full flex-col rounded-card border border-line p-5 text-left transition hover:border-ink hover:shadow-lift ${a.status === 'declined' ? 'opacity-70' : ''}`}
              >
                <Summary a={a} f={f} unreadN={unread.host[a.id] ?? 0} />
                <span className="mt-auto flex items-center gap-1 border-t border-soft pt-4 text-base font-semibold text-brand-700">
                  {t('people.viewProfile')}
                  <ChevronRight size={18} aria-hidden className="transition group-hover:translate-x-0.5" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-sm text-muted">{t('people.listing', { rent: draft.homeshareRent.toLocaleString() })}</p>

      {opened && <Profile a={opened.a} f={opened.f} onClose={() => setOpenId(null)} />}
    </Page>
  )
}

/** Card body, shared by the list and the profile. */
function Summary({ a, f, unreadN }: { a: Applicant; f: Fit; unreadN: number }) {
  const { t } = useTranslation()
  const text = useL()
  return (
    <>
      <div className="flex items-start gap-4">
        <Avatar hue={a.hue} size={64} label={`${a.name}, avatar`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-lg font-semibold leading-tight">
              {a.name}, {a.age}
            </h2>
            <span className="shrink-0 rounded-full bg-ink px-2.5 py-1 text-sm font-semibold tabular-nums text-white" title={t('people.scoreTitle')}>
              {t('people.match', { n: f.score })}
            </span>
          </div>
          <p className="text-base text-muted">
            {text(a.country)} · {text(a.occupation)}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <VerifiedBadge verified={a.verified} />
            <FictionalTag />
            {a.status === 'declined' && <Chip tone="rose">{t('people.rejected')}</Chip>}
            {unreadN > 0 && a.status !== 'declined' ? <Chip tone="brand">{t('people.newMsg')}</Chip> : null}
          </div>
        </div>
      </div>

      <ul className="mb-4 mt-4 space-y-1.5 text-base">
        <li className="flex items-start gap-2">
          <Check size={18} aria-hidden className="mt-0.5 shrink-0 text-teal-700" />
          {t('people.rSkills', { a: f.skills.covered, b: f.skills.total })}
        </li>
        <li className="flex items-start gap-2">
          <CalendarClock size={18} aria-hidden className="mt-0.5 shrink-0 text-muted" />
          {t('people.rSlots', { a: f.slots.covered, b: f.slots.total, h: f.hours.covered, t: f.hours.total })}
        </li>
        <li className="flex items-start gap-2">
          <Languages size={18} aria-hidden className="mt-0.5 shrink-0 text-muted" />
          {f.language.shared
            ? t('people.rLang', { lang: t(`langName.${f.language.best!.code}`), level: t(`level.${f.language.best!.level}`) })
            : t('people.rLangTr')}
        </li>
      </ul>
    </>
  )
}

/** Full profile: the host messages, plans a meet-up or rejects from here. */
function Profile({ a, f, onClose }: { a: Applicant; f: Fit; onClose: () => void }) {
  const { t } = useTranslation()
  const text = useL()
  const nav = useNavigate()
  const { setApplicantStatus, startMeeting, unread } = useStore()
  const declined = a.status === 'declined'

  const message = () => {
    if (a.status === 'new') setApplicantStatus(a.id, 'chatting')
    nav(`/messages/${a.id}`)
  }
  const meet = () => {
    if (a.status === 'new') setApplicantStatus(a.id, 'chatting')
    startMeeting(a.id)
    nav('/stay')
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={t('people.profileTitle', { name: a.name })}
      size="lg"
      footer={
        declined ? (
          <Button variant="secondary" icon={<Undo2 size={16} aria-hidden />} onClick={() => setApplicantStatus(a.id, 'new')}>
            {t('people.undoReject')}
          </Button>
        ) : (
          <div className="flex w-full flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              className="!text-rose-700"
              icon={<UserX size={16} aria-hidden />}
              onClick={() => {
                setApplicantStatus(a.id, 'declined')
                onClose()
              }}
            >
              {t('people.reject')}
            </Button>
            <span className="flex-1" />
            <Button variant="secondary" icon={<MessageCircle size={16} aria-hidden />} onClick={message}>
              {t('people.meet')}
            </Button>
            <Button variant="primary" size="lg" icon={<CalendarPlus size={18} aria-hidden />} onClick={meet}>
              {t('chat.schedule')}
            </Button>
          </div>
        )
      }
    >
      <Summary a={a} f={f} unreadN={unread.host[a.id] ?? 0} />
      <section className="rounded-card bg-surface p-4">
        <h3 className="text-sm font-semibold text-muted">{t('people.intro')}</h3>
        <p className="mt-1 text-base">{text(a.intro)}</p>
      </section>
      <h3 className="mt-5 text-sm font-semibold text-muted">{t('people.free')}</h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {a.availability.map((s) => (
          <Chip key={s}>{t(`slot.${s}`)}</Chip>
        ))}
      </div>
      <details className="mt-5 text-sm text-muted">
        <summary className="cursor-pointer font-medium text-ink">{t('people.how')}</summary>
        <p className="mt-2">{t('people.howBody')}</p>
      </details>
      {!declined && <p className="mt-5 text-sm text-muted">{t('people.meetWhy')}</p>}
    </Modal>
  )
}
