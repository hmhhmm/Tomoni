import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Ban,
  BedDouble,
  Check,
  Heart,
  Lock,
  MessageCircle,
  ShieldCheck,
  TrainFront,
  Grid2x2,
  HandHeart,
  Languages,
  CalendarClock,
} from 'lucide-react'
import { Page, FictionalTag, VerifiedBadge, Notice } from '../../components/domain/Bits'
import { Photo, SCENES } from '../../components/ui/Photo'
import { Avatar } from '../../components/ui/Avatar'
import { Button, LinkButton } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Textarea } from '../../components/ui/Field'
import { HourMeter } from '../../components/domain/HourMeter'
import { MapView } from '../../components/domain/MapView'
import { companionOnly, useStore } from '../../store'
import { useListings } from '../../lib/listings'
import { HELP_ICONS } from '../../lib/helps'
import { HELP_ORDER, APPLICANTS } from '../../data/seed'
import { costs } from '../../data/pricing'
import { fit } from '../../data/matching'
import { useL, yen, monthLabel } from '../../lib/hooks'
import { useUI } from '../../ui'
import { RULES } from '../../tokens'

export function ListingDetail() {
  const { t } = useTranslation()
  const text = useL()
  const nav = useNavigate()
  const { id } = useParams()
  const listings = useListings()
  const l = listings.find((x) => x.id === id)
  const { lang, persona, saved, toggleSaved, applications, apply, withdraw, tenant, draft } = useStore()
  const say = useUI((s) => s.say)
  const [gallery, setGallery] = useState(false)
  const [applyOpen, setApplyOpen] = useState(false)
  const [intro, setIntro] = useState(APPLICANTS[0].intro.en)
  const [agree, setAgree] = useState(false)

  if (!l) {
    return (
      <Page className="py-16">
        <Notice tone="amber" title={t('detail.notFound')}>
          <Link className="font-semibold underline" to="/aisha/explore">
            {t('detail.backToExplore')}
          </Link>
        </Notice>
      </Page>
    )
  }
  const c = costs(l.standardRent, l.homeshareRent, l.helps)
  const isSaved = saved.includes(l.id)
  const app = applications[l.id]
  const active = app && app.status !== 'withdrawn'
  const blocked = companionOnly(tenant) && l.tier !== 'companionship'
  const myFit = fit(
    { skills: tenant.skills, availability: tenant.availability, langs: tenant.langs, verified: tenant.idDone },
    { helps: l.helps, languages: l.languages },
  )
  const isOwner = persona === 'host' && l.id === 'l1'
  const rules =
    l.id === 'l1'
      ? [
          draft.smoking === 'no' ? t('create.smokingNo') : t('create.smokingOutside'),
          draft.pets ? t('create.petsOk') : t('create.petsNo'),
          t('detail.quiet', { h: draft.quiet.replace('-', ' – ') }),
          t(`detail.guests.${draft.guests}`),
        ]
      : [t('create.smokingNo'), l.pets ? t('create.petsOk') : t('create.petsNo'), t('detail.quiet', { h: '21:00 – 07:00' }), t('detail.guests.ask')]

  const submit = () => {
    apply(l.id, intro)
    setApplyOpen(false)
    say(t('detail.sent'))
    nav(`/aisha/messages/${l.id}`)
  }

  const highlights = [
    { icon: ShieldCheck, title: t('detail.h1t'), body: t('detail.h1b') },
    {
      icon: HandHeart,
      title: l.tier === 'companionship' ? t('detail.h2tc') : t('detail.h2t', { n: c.weeklyHours }),
      body: l.tier === 'companionship' ? t('detail.h2bc') : t('detail.h2b'),
    },
    { icon: BedDouble, title: t('detail.h3t'), body: t('detail.h3b') },
  ]

  return (
    <Page className="pb-10 pt-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <Link to="/aisha/explore" className="mb-3 inline-flex items-center gap-1.5 text-base font-medium underline-offset-4 hover:underline">
            <ArrowLeft size={18} aria-hidden />
            {t('common.back')}
          </Link>
          <h1 className="text-[1.75rem] font-semibold leading-tight">{t('detail.title', { area: text(l.area), n: l.sizeJo })}</h1>
        </div>
        <button
          type="button"
          aria-pressed={isSaved}
          onClick={() => toggleSaved(l.id)}
          className="mt-9 flex h-11 items-center gap-2 rounded-lg px-3 text-base font-semibold underline-offset-4 hover:bg-surface"
        >
          <Heart size={20} aria-hidden className={isSaved ? 'fill-brand-600 text-brand-600' : ''} />
          {isSaved ? t('detail.saved') : t('detail.save')}
        </button>
      </div>

      {/* Photo mosaic */}
      <div className="relative">
        <div className="grid h-[240px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-sheet sm:h-[360px] lg:h-[440px]">
          {SCENES.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setGallery(true)}
              aria-label={t('detail.photo', { n: i + 1 })}
              className={`overflow-hidden transition hover:brightness-95 ${i === 0 ? 'col-span-4 row-span-2 sm:col-span-2' : 'hidden sm:block'}`}
            >
              <Photo hue={l.hue} scene={s} />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setGallery(true)}
          className="absolute bottom-4 right-4 flex h-10 items-center gap-2 rounded-lg border border-ink bg-white px-3 text-sm font-semibold shadow-soft hover:bg-surface"
        >
          <Grid2x2 size={16} aria-hidden />
          {t('detail.showAll')}
        </button>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* Left column */}
        <div className="min-w-0 divide-y divide-soft">
          <section className="pb-6">
            <h2 className="text-[1.375rem] font-semibold">{t('detail.hosted', { name: text(l.hostName) })}</h2>
            <p className="mt-1 text-base text-muted">
              {t('detail.facts', { n: l.sizeJo })} · {l.bathroom === 'shared' ? t('create.shared') : t('create.private')} {t('detail.bath')} ·{' '}
              {l.furnished ? t('detail.furnished') : t('detail.unfurnished')} · {t('detail.from', { m: monthLabel(l.availableFrom, lang) })}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Avatar hue={l.hue} size={56} label={text(l.hostName)} />
              <div className="flex flex-wrap items-center gap-2">
                <VerifiedBadge />
                <FictionalTag />
              </div>
            </div>
          </section>

          <section className="space-y-5 py-6">
            {highlights.map((h) => (
              <div key={h.title} className="flex gap-4">
                <h.icon size={26} aria-hidden className="mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-base font-semibold">{h.title}</h3>
                  <p className="text-base text-muted">{h.body}</p>
                </div>
              </div>
            ))}
          </section>

          <section className="py-6">
            <p className="text-base leading-relaxed">{text(l.bio)}</p>
          </section>

          <section className="py-6">
            <h2 className="mb-4 text-[1.375rem] font-semibold">{t('detail.helpTitle')}</h2>
            {l.tier === 'companionship' && <p className="mb-3 text-base text-muted">{t('detail.noPact')}</p>}
            <ul className="grid gap-3 sm:grid-cols-2">
              {HELP_ORDER.filter((h) => l.helps[h]).map((h) => {
                const Icon = HELP_ICONS[h]
                const v = l.helps[h]!
                return (
                  <li key={h} className="flex items-start gap-3 rounded-card border border-line p-4">
                    <Icon size={24} aria-hidden className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">{t(`help.${h}.title`)}</p>
                      <p className="text-sm text-muted">
                        {t('help.hoursPerWeek', { n: v.h })} · {t(`slot.${v.slot}`)}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="mt-5 max-w-md">
              <HourMeter value={c.weeklyHours} compact label={t('meter.help')} />
            </div>
          </section>

          <section className="py-6">
            <h2 className="mb-3 flex items-center gap-2 text-[1.375rem] font-semibold">
              <Ban size={22} aria-hidden />
              {t('help.notIncluded')}
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {(['bathing', 'toileting', 'feeding', 'medical', 'money', 'inkan'] as const).map((b) => (
                <li key={b} className="flex items-center gap-2 text-base">
                  <Lock size={16} aria-hidden className="shrink-0 text-rose-700" />
                  {t(`banned.${b}`)}
                </li>
              ))}
            </ul>
          </section>

          <section className="py-6">
            <h2 className="mb-4 text-[1.375rem] font-semibold">{t('detail.where')}</h2>
            <MapView items={[l]} selected={l.id} className="h-64" />
            <p className="mt-3 flex items-center gap-2 text-base">
              <TrainFront size={18} aria-hidden />
              {t('card.walk', { n: l.walkMin, station: text(l.station) })}
            </p>
          </section>

          <section className="py-6">
            <h2 className="mb-4 text-[1.375rem] font-semibold">{t('detail.know')}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <h3 className="mb-2 font-semibold">{t('detail.rules')}</h3>
                <ul className="space-y-1 text-base text-muted">
                  {rules.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">{t('detail.safetyH')}</h3>
                <ul className="space-y-1 text-base text-muted">
                  <li>{t('detail.s1')}</li>
                  <li>{t('detail.s2')}</li>
                  <li>{t('detail.s3')}</li>
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">{t('detail.stayH')}</h3>
                <ul className="space-y-1 text-base text-muted">
                  <li>{t('detail.t1')}</li>
                  <li>{t('detail.t2')}</li>
                  <li>{t('detail.t3')}</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Sticky booking card */}
        <aside className="lg:sticky lg:top-28 lg:self-start" aria-label={t('detail.applyTitle')}>
          <div className="rounded-sheet border border-line bg-white p-6 shadow-lift">
            <p className="flex items-baseline gap-2">
              <span className="text-[1.625rem] font-semibold tabular-nums">{yen(c.monthlyAllIn)}</span>
              <span className="text-base text-muted">{t('detail.allIn')}</span>
            </p>
            <dl className="mt-4 space-y-2 text-base">
              <div className="flex justify-between">
                <dt className="text-muted">{t('detail.rent')}</dt>
                <dd className="tabular-nums">{yen(l.homeshareRent)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">{t('detail.membership')}</dt>
                <dd className="tabular-nums">{yen(RULES.membershipYen)}</dd>
              </div>
              <div className="flex justify-between border-t border-soft pt-2 font-semibold">
                <dt>{t('detail.total')}</dt>
                <dd className="tabular-nums">{yen(c.monthlyAllIn)}</dd>
              </div>
            </dl>
            <div className="mt-4 rounded-xl bg-teal-50 p-3 text-base text-teal-700">
              {t('detail.saving', { std: yen(l.standardRent), save: yen(c.netSaving), year: yen(c.yearlyNetSaving) })}
            </div>
            {c.weeklyHours > 0 && <p className="mt-3 text-sm text-muted">{t('detail.hoursMonth', { w: c.weeklyHours, m: c.monthlyHours })}</p>}

            {persona === 'tenant' && l.tier === 'standard' && (
              <div className="mt-4 rounded-xl border border-soft p-3">
                <p className="mb-1 text-sm font-semibold">{t('detail.fit')}</p>
                <ul className="space-y-1 text-sm text-muted">
                  <li className="flex items-center gap-2">
                    <Check size={14} aria-hidden className="text-teal-700" />
                    {t('detail.fitSkills', { a: myFit.skills.covered, b: myFit.skills.total })}
                  </li>
                  <li className="flex items-center gap-2">
                    <CalendarClock size={14} aria-hidden />
                    {t('detail.fitSlots', { a: myFit.slots.covered, b: myFit.slots.total })}
                  </li>
                  <li className="flex items-center gap-2">
                    <Languages size={14} aria-hidden />
                    {myFit.language.shared
                      ? t('detail.fitLang', { lang: t(`langName.${myFit.language.best!.code}`), level: t(`level.${myFit.language.best!.level}`) })
                      : t('detail.fitLangTr')}
                  </li>
                </ul>
              </div>
            )}

            <div className="mt-5">
              {persona !== 'tenant' ? (
                <Notice tone="neutral">{isOwner ? t('detail.yourListing') : t('detail.switchToApply')}</Notice>
              ) : active ? (
                <div role="status" className="space-y-3">
                  <p className="flex items-center gap-2 text-base font-semibold text-teal-700">
                    <Check size={18} aria-hidden />
                    {t(`detail.status.${app.status}`)}
                  </p>
                  <LinkButton to={`/aisha/messages/${l.id}`} variant="dark" block icon={<MessageCircle size={18} aria-hidden />}>
                    {t('detail.openChat')}
                  </LinkButton>
                  {app.status !== 'declined' && (
                    <Button
                      variant="ghost"
                      block
                      onClick={() => {
                        withdraw(l.id)
                        say(t('detail.withdrawn'))
                      }}
                    >
                      {t('detail.withdraw')}
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <Button size="lg" block disabled={blocked} onClick={() => setApplyOpen(true)}>
                    {t('detail.applyBtn')}
                  </Button>
                  {blocked ? (
                    <p className="mt-3 text-sm text-amber-700">{t('detail.blockedBody')}</p>
                  ) : (
                    <p className="mt-3 text-center text-sm text-muted">{t('detail.noCharge')}</p>
                  )}
                </>
              )}
            </div>
            <p className="mt-4 text-xs text-muted">{t('detail.priceNote')}</p>
          </div>
        </aside>
      </div>

      <Modal open={gallery} onClose={() => setGallery(false)} title={t('detail.photos')} size="lg">
        <div className="space-y-3">
          {SCENES.map((s) => (
            <div key={s} className="aspect-[4/3] overflow-hidden rounded-card">
              <Photo hue={l.hue} scene={s} />
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        title={t('detail.applyTitle')}
        size="md"
        footer={
          <>
            <span className="text-sm text-muted">{t('detail.noCharge')}</span>
            <Button size="lg" disabled={!agree || !intro.trim()} onClick={submit}>
              {t('detail.send')}
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3 rounded-card bg-surface p-3">
          <Avatar hue={l.hue} size={44} label={text(l.hostName)} />
          <div>
            <p className="font-semibold">{text(l.hostName)}</p>
            <p className="text-sm text-muted">
              {text(l.area)} · {yen(c.monthlyAllIn)} {t('common.perMonth')}
            </p>
          </div>
        </div>
        <label htmlFor="intro" className="mb-1.5 mt-5 block text-sm font-semibold">
          {t('detail.introLabel')}
        </label>
        <Textarea id="intro" rows={5} value={intro} onChange={(e) => setIntro(e.target.value)} />
        <p className="mt-1.5 text-sm text-muted">{t('detail.introHint')}</p>
        <label className="mt-5 flex cursor-pointer items-start gap-3 text-base">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 accent-brand-600" />
          <span>{t('detail.agree', { cap: RULES.weeklyHourCap })}</span>
        </label>
      </Modal>
    </Page>
  )
}
