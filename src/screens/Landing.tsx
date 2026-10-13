import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Ban, BedDouble, ClipboardList, Clock, HeartHandshake, Home, HandHeart, Search, ShieldCheck, Users, KeyRound } from 'lucide-react'
import { Page } from '../components/domain/Bits'
import { Photo } from '../components/ui/Photo'
import { ListingCard } from '../components/domain/ListingCard'
import { Button, LinkButton } from '../components/ui/Button'
import { useStore } from '../store'
import { useListings } from '../lib/listings'
import { RULES } from '../tokens'
import type { Persona } from '../data/types'

export function Landing() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { setPersona, familyConsent } = useStore()
  const featured = useListings().slice(0, 4)
  const go = (p: Persona, to: string) => {
    setPersona(p)
    nav(to)
  }
  const roles = [
    { p: 'host' as const, icon: KeyRound, to: '/host', title: t('landing.host'), body: t('landing.hostBody') },
    { p: 'tenant' as const, icon: Search, to: '/explore', title: t('landing.tenant'), body: t('landing.tenantBody') },
    {
      p: 'family' as const,
      icon: HandHeart,
      to: familyConsent ? '/family' : '/family/invite',
      title: t('landing.family'),
      body: t('landing.familyBody'),
    },
  ]
  const steps = [
    { icon: Home, t: t('landing.s1t'), b: t('landing.s1b') },
    { icon: Users, t: t('landing.s2t'), b: t('landing.s2b') },
    { icon: BedDouble, t: t('landing.s3t'), b: t('landing.s3b') },
    { icon: HeartHandshake, t: t('landing.s4t'), b: t('landing.s4b') },
  ]
  const safe = [
    { icon: ShieldCheck, t: t('landing.f1t'), b: t('landing.f1b') },
    { icon: Clock, t: t('landing.f2t', { n: RULES.weeklyHourCap }), b: t('landing.f2b') },
    { icon: Ban, t: t('landing.f3t'), b: t('landing.f3b') },
    { icon: ClipboardList, t: t('landing.f4t'), b: t('landing.f4b') },
  ]

  return (
    <>
      <section className="bg-gradient-to-b from-purple-50 to-white">
        <Page className="grid items-center gap-10 py-12 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div>
            <p className="mb-3 text-base font-semibold text-purple-700">{t('landing.kicker')}</p>
            <h1 className="max-w-xl text-[2.25rem] font-semibold leading-[1.15] sm:text-[3rem]">{t('landing.tagline')}</h1>
            <p className="mt-4 max-w-xl text-lg text-muted">{t('landing.sub')}</p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {roles.map((r) => (
                <li key={r.p}>
                  <button
                    type="button"
                    onClick={() => go(r.p, r.to)}
                    className="group flex h-full w-full flex-col items-start rounded-card border border-line bg-white p-4 text-left transition hover:border-ink hover:shadow-lift"
                  >
                    <span className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-purple-50 text-purple-700">
                      <r.icon size={20} aria-hidden />
                    </span>
                    <span className="text-base font-semibold leading-snug">{r.title}</span>
                    <span className="mt-1 text-sm text-muted">{r.body}</span>
                    <ArrowRight size={18} aria-hidden className="mt-3 transition group-hover:translate-x-1" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative hidden lg:block" aria-hidden>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[4/5] overflow-hidden rounded-sheet">
                <Photo hue={262} scene="room" />
              </div>
              <div className="mt-10 aspect-[4/5] overflow-hidden rounded-sheet">
                <Photo hue={172} scene="garden" />
              </div>
              <div className="-mt-6 aspect-[4/3] overflow-hidden rounded-sheet">
                <Photo hue={330} scene="kitchen" />
              </div>
              <div className="aspect-[4/3] overflow-hidden rounded-sheet">
                <Photo hue={205} scene="window" />
              </div>
            </div>
          </div>
        </Page>
      </section>

      <Page className="py-12">
        <h2 className="mb-6 text-[1.75rem] font-semibold">{t('landing.how')}</h2>
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.t} className="flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface">
                <s.icon size={22} aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-muted">{t('landing.step', { n: i + 1 })}</p>
                <h3 className="text-lg font-semibold">{s.t}</h3>
                <p className="mt-1 text-base text-muted">{s.b}</p>
              </div>
            </li>
          ))}
        </ol>
      </Page>

      <Page className="py-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-[1.75rem] font-semibold">{t('landing.rooms')}</h2>
          <LinkButton
            to="/explore"
            variant="ghost"
            onClick={() => setPersona('tenant')}
            icon={<ArrowRight size={18} aria-hidden />}
            className="!px-0"
          >
            {t('landing.all')}
          </LinkButton>
        </div>
        <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((l) => (
            <ListingCard key={l.id} l={l} />
          ))}
        </div>
      </Page>

      <Page className="py-12">
        <div className="rounded-sheet bg-surface p-6 sm:p-10">
          <h2 className="text-[1.75rem] font-semibold">{t('landing.safe')}</h2>
          <p className="mt-1 max-w-2xl text-base text-muted">{t('landing.safeSub')}</p>
          <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {safe.map((s) => (
              <li key={s.t}>
                <s.icon size={28} aria-hidden className="text-purple-700" />
                <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
                <p className="mt-1 text-base text-muted">{s.b}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button variant="dark" size="lg" onClick={() => nav('/safety')}>
              {t('landing.safetyBtn')}
            </Button>
          </div>
        </div>
      </Page>
    </>
  )
}
