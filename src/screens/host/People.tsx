import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CalendarClock, Check, Languages, MessageCircle, Undo2, Info } from 'lucide-react'
import { Page, FictionalTag, VerifiedBadge, EmptyState, Notice } from '../../components/domain/Bits'
import { Avatar } from '../../components/ui/Avatar'
import { Button } from '../../components/ui/Button'
import { Chip, Pill } from '../../components/ui/Chip'
import { useStore } from '../../store'
import { fit } from '../../data/matching'
import { useL } from '../../lib/hooks'
import { Users } from 'lucide-react'

type Filter = 'all' | 'new' | 'chatting' | 'declined'

export function People() {
  const { t } = useTranslation()
  const text = useL()
  const nav = useNavigate()
  const { applicants, helps, setApplicantStatus, unread, draft } = useStore()
  const [filter, setFilter] = useState<Filter>('all')
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

  const message = (id: string) => {
    if (useStore.getState().applicants.find((x) => x.id === id)?.status === 'new') setApplicantStatus(id, 'chatting')
    nav(`/messages/${id}`)
  }

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
            <li key={a.id} className="flex min-w-0 flex-col rounded-card border border-line p-5">
              <div className="flex items-start gap-4">
                <Avatar hue={a.hue} size={64} label={`${a.name}, avatar`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-semibold leading-tight">
                      {a.name}, {a.age}
                    </h2>
                    <span
                      className="shrink-0 rounded-full bg-ink px-2.5 py-1 text-sm font-semibold tabular-nums text-white"
                      title={t('people.scoreTitle')}
                    >
                      {t('people.match', { n: f.score })}
                    </span>
                  </div>
                  <p className="text-base text-muted">
                    {text(a.country)} · {text(a.occupation)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <VerifiedBadge verified={a.verified} />
                    <FictionalTag />
                    {unread.host[a.id] ? <Chip tone="purple">{t('people.newMsg')}</Chip> : null}
                  </div>
                </div>
              </div>

              <ul className="mt-4 space-y-1.5 text-base">
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

              <div className="mt-4 flex flex-wrap gap-1.5">
                {a.availability.map((s) => (
                  <Chip key={s}>{t(`slot.${s}`)}</Chip>
                ))}
              </div>
              <details className="mb-5 mt-3 text-sm text-muted">
                <summary className="cursor-pointer font-medium text-ink">{t('people.how')}</summary>
                <p className="mt-2">{t('people.howBody')}</p>
              </details>

              <div className="mt-auto flex flex-wrap gap-2 border-t border-soft pt-4">
                {a.status === 'declined' ? (
                  <Button variant="secondary" icon={<Undo2 size={16} aria-hidden />} onClick={() => setApplicantStatus(a.id, 'new')}>
                    {t('common.undo')}
                  </Button>
                ) : (
                  <>
                    <Button variant="dark" icon={<MessageCircle size={16} aria-hidden />} onClick={() => message(a.id)}>
                      {a.status === 'chatting' ? t('people.continue') : t('people.meet')}
                    </Button>
                    <Button variant="secondary" onClick={() => setApplicantStatus(a.id, 'declined')}>
                      {t('people.notNow')}
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-sm text-muted">{t('people.listing', { rent: draft.homeshareRent.toLocaleString() })}</p>
    </Page>
  )
}
