import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, BedDouble, CalendarCheck, DoorOpen, FileSignature, HandHeart, Undo2, Users, MapPin } from 'lucide-react'
import { Page, EmptyState, Notice, FictionalTag, VerifiedBadge } from '../components/domain/Bits'
import { Avatar } from '../components/ui/Avatar'
import { Button, LinkButton } from '../components/ui/Button'
import { Pill } from '../components/ui/Chip'
import { StepBar } from '../components/domain/StepBar'
import { HourMeter } from '../components/domain/HourMeter'
import { agreedHelps, useStore, trialDay } from '../store'
import { costs } from '../data/pricing'
import { MEET_SLOTS, stageIndex } from '../data/journey'
import { formatDayTime } from '../lib/format'
import { useL, yen } from '../lib/hooks'
import { StayTabs } from '../components/domain/StayTabs'

export function Stay() {
  const { t } = useTranslation()
  const text = useL()
  const nav = useNavigate()
  const { persona, lang, match, applicants, draft, pactHelps, declined, bookMeet, clearMeet, startTrial, endTrial, resumeTrial, goPact, pactSigned } =
    useStore()
  const [weeks, setWeeks] = useState(match.trialWeeks)
  const side = persona === 'tenant' ? 'tenant' : 'host'
  const a = applicants.find((x) => x.id === match.applicantId)
  const c = costs(draft.standardRent, draft.homeshareRent, agreedHelps({ pactHelps, declined }))
  const fmt = (d: Date) => formatDayTime(d, lang)

  // Tenant persona (Aisyah) only sees a stay that involves her.
  const visible = match.stage !== 'none' && a && (side === 'host' || a.id === 'a1')
  if (!visible) {
    return (
      <Page narrow className="py-10">
        <StayTabs />
        <EmptyState
          icon={<BedDouble size={26} aria-hidden />}
          title={t('stay.emptyTitle')}
          body={side === 'host' ? t('stay.emptyHost') : t('stay.emptyTenant')}
          action={
            <LinkButton to={side === 'host' ? '/host/people' : '/explore'} variant="dark">
              {side === 'host' ? t('nav.people') : t('nav.explore')}
            </LinkButton>
          }
        />
      </Page>
    )
  }

  const idx = stageIndex(match.stage)
  const day = trialDay(match)
  const total = match.trialWeeks * 7
  const partner =
    side === 'host'
      ? { name: a.name, hue: a.hue, verified: a.verified, sub: text(a.occupation) }
      : { name: t('names.sato'), hue: 262, verified: true, sub: text({ en: 'Nerima', ja: '練馬区' }) }
  const slot = MEET_SLOTS.find((s) => s.id === match.meetSlot)

  return (
    <Page className="py-8">
      <StayTabs />
      <h1 className="text-[1.75rem] font-semibold">{t('stay.title')}</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-8">
          <div className="rounded-card border border-line p-6">
            <StepBar steps={[t('steps.meet'), t('steps.trial'), t('steps.pact'), t('steps.living')]} current={idx} />
          </div>

          {match.stage === 'meet' && (
            <section className="rounded-card border border-line p-6">
              {!slot ? (
                <>
                  <h2 className="text-xl font-semibold">{t('stay.pick')}</h2>
                  <p className="mt-1 text-base text-muted">{t('stay.tip')}</p>
                  <ul className="mt-5 space-y-3">
                    {MEET_SLOTS.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => bookMeet(s.id)}
                          className="flex w-full items-center gap-4 rounded-card border border-line p-4 text-left transition hover:border-ink"
                        >
                          <CalendarCheck size={22} aria-hidden />
                          <span className="flex-1">
                            <span className="block text-base font-semibold">{fmt(s.date())}</span>
                            <span className="block text-sm text-muted">{t(`stay.place.${s.place}`)}</span>
                          </span>
                          <ArrowRight size={18} aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <Notice tone="teal" live icon={<CalendarCheck size={22} aria-hidden className="text-teal-700" />} title={t('stay.booked')}>
                    {fmt(slot.date())} · {t(`stay.place.${slot.place}`)}
                  </Notice>
                  <div className="mt-6 border-t border-soft pt-6">
                    <h2 className="text-xl font-semibold">{t('stay.startTitle')}</h2>
                    <p className="mt-1 text-base text-muted">{t('stay.startBody')}</p>
                    {side === 'host' ? (
                      <>
                        <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label={t('stay.length')}>
                          {[2, 3, 4].map((w) => (
                            <Pill key={w} selected={weeks === w} onClick={() => setWeeks(w)}>
                              {t('stay.weeks', { n: w })}
                            </Pill>
                          ))}
                        </div>
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <Button variant="dark" size="lg" onClick={() => startTrial(weeks)}>
                            {t('stay.start')}
                          </Button>
                          <Button variant="ghost" onClick={clearMeet}>
                            {t('stay.change')}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="mt-4 text-base text-muted">{t('stay.waitHost', { name: t('names.sato') })}</p>
                    )}
                  </div>
                </>
              )}
            </section>
          )}

          {match.stage === 'trial' && (
            <>
              <section className="rounded-card border border-line p-6">
                <h2 className="text-xl font-semibold">{t('stay.running')}</h2>
                <p className="mt-1 text-base text-muted">{t('stay.dayOf', { n: day, total })}</p>
                <div
                  className="mt-4 h-3 overflow-hidden rounded-full bg-soft"
                  role="progressbar"
                  aria-label={t('stay.running')}
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-valuenow={day}
                >
                  <div className="h-full rounded-full bg-ink" style={{ width: `${(day / total) * 100}%` }} />
                </div>
                <div className="mt-5">
                  <Button
                    variant="dark"
                    size="lg"
                    icon={<FileSignature size={18} aria-hidden />}
                    onClick={() => {
                      goPact()
                      nav('/agreement')
                    }}
                  >
                    {t('stay.toPact')}
                  </Button>
                </div>
              </section>
              <Notice tone="amber" title={t('stay.endTitle')}>
                <p>{t('stay.endBody')}</p>
                <Button className="mt-3" variant="secondary" icon={<DoorOpen size={18} aria-hidden />} onClick={endTrial}>
                  {t('stay.end')}
                </Button>
              </Notice>
            </>
          )}

          {match.stage === 'pact' && (
            <section className="rounded-card border border-line p-6">
              <h2 className="text-xl font-semibold">{t('stay.pactTitle')}</h2>
              <p className="mt-1 text-base text-muted">{t('stay.pactBody', { n: Number(pactSigned.host) + Number(pactSigned.tenant) })}</p>
              <LinkButton to="/agreement" variant="dark" size="lg" className="mt-5" icon={<ArrowRight size={18} aria-hidden />}>
                {t('stay.openPact')}
              </LinkButton>
            </section>
          )}

          {match.stage === 'living' && (
            <section className="rounded-card border border-line p-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <HandHeart size={22} aria-hidden />
                {t('stay.living')}
              </h2>
              <p className="mt-1 text-base text-muted">{t('stay.livingBody')}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <LinkButton to={side === 'host' ? '/host/checkin' : '/log'} variant="dark">
                  {side === 'host' ? t('nav.checkin') : t('nav.log')}
                </LinkButton>
                <LinkButton to="/agreement" variant="secondary">
                  {t('nav.agreement')}
                </LinkButton>
              </div>
            </section>
          )}

          {match.stage === 'ended' && (
            <section className="rounded-card border border-line bg-surface p-6">
              <p role="status" className="text-base">
                <strong>{t('stay.endedTitle')}</strong> {t('stay.endedBody')}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <LinkButton to={side === 'host' ? '/host/people' : '/explore'} variant="dark">
                  {t('stay.findOther')}
                </LinkButton>
                <Button variant="secondary" icon={<Undo2 size={16} aria-hidden />} onClick={resumeTrial}>
                  {t('stay.resume')}
                </Button>
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-sheet border border-line p-6 shadow-lift">
            <div className="flex items-center gap-3">
              <Avatar hue={partner.hue} size={56} label={partner.name} />
              <div>
                <p className="text-lg font-semibold leading-tight">{partner.name}</p>
                <p className="text-sm text-muted">{partner.sub}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <VerifiedBadge verified={partner.verified} />
              <FictionalTag />
            </div>
            <dl className="mt-5 space-y-3 border-t border-soft pt-5 text-base">
              <div className="flex items-center gap-3">
                <MapPin size={18} aria-hidden className="text-muted" />
                <dd>{t('stay.room', { n: draft.sizeJo })}</dd>
              </div>
              <div className="flex items-center gap-3">
                <Users size={18} aria-hidden className="text-muted" />
                <dd>{t('stay.rentLine', { rent: yen(draft.homeshareRent), total: yen(c.monthlyAllIn) })}</dd>
              </div>
            </dl>
            <div className="mt-5 border-t border-soft pt-5">
              <HourMeter value={c.weeklyHours} compact label={t('meter.help')} />
            </div>
          </div>
        </aside>
      </div>
    </Page>
  )
}
