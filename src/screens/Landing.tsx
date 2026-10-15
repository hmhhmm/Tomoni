import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ArrowRight, Ban, Check, Clock, HandHeart, Info, LifeBuoy, ShieldCheck, Users } from 'lucide-react'
import { FictionalTag, Page } from '../components/domain/Bits'
import { Photo } from '../components/ui/Photo'
import { ListingCard } from '../components/domain/ListingCard'
import { Button, LinkButton } from '../components/ui/Button'
import { useStore } from '../store'
import { useListings } from '../lib/listings'
import { RULES, SATO_HUE } from '../tokens'
import type { Persona } from '../data/types'

const ease = [0.22, 1, 0.36, 1] as const

export function Landing() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { setPersona, familyConsent } = useStore()
  const featured = useListings().slice(0, 4)
  const go = (p: Persona, to: string) => {
    setPersona(p)
    nav(to)
  }
  const familyTo = familyConsent ? '/family' : '/family/invite'
  const cap = RULES.weeklyHourCap

  const deal = [t('landing.dealRent'), t('landing.dealHelp', { n: cap }), t('landing.dealNo'), t('landing.dealHost')]
  const steps = [
    { t: t('landing.s1t'), b: t('landing.s1b') },
    { t: t('landing.s2t'), b: t('landing.s2b') },
    { t: t('landing.s3t'), b: t('landing.s3b', { n: cap }) },
    { t: t('landing.s4t'), b: t('landing.s4b') },
  ]
  const safe = [
    { icon: ShieldCheck, t: t('landing.f1t'), b: t('landing.f1b') },
    { icon: Clock, t: t('landing.f2t', { n: cap }), b: t('landing.f2b') },
    { icon: Ban, t: t('landing.f3t'), b: t('landing.f3b') },
    { icon: LifeBuoy, t: t('landing.f4t'), b: t('landing.f4b') },
    { icon: Users, t: t('landing.f5t'), b: t('landing.f5b') },
  ]
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease, delay },
  })

  return (
    <>
      {/* Hero: the one-liner, two clear doors in, and the arrangement at a glance */}
      <section aria-labelledby="hero-title">
        <Page className="grid items-center gap-10 pb-14 pt-8 sm:pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-20 lg:pt-16">
          <div className="min-w-0">
            <motion.p {...rise(0)} className="mb-3 text-base font-semibold text-brand-700">
              {t('landing.kicker')}
            </motion.p>
            <motion.h1
              {...rise(0.05)}
              id="hero-title"
              className="max-w-[18ch] text-balance text-[clamp(2.25rem,4.2vw+1rem,3.75rem)] font-semibold leading-[1.1] tracking-[-0.025em]"
            >
              {t('landing.tagline')}
            </motion.h1>
            <motion.p {...rise(0.12)} className="mt-5 max-w-[34rem] text-pretty text-lg text-ink/80 sm:text-xl">
              {t('landing.sub')}
            </motion.p>
            <motion.div {...rise(0.18)} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button size="lg" onClick={() => go('host', '/saito')} icon={<HandHeart size={20} aria-hidden />}>
                {t('landing.host')}
              </Button>
              <Button size="lg" variant="secondary" onClick={() => go('tenant', '/aisha/explore')}>
                {t('landing.tenant')}
              </Button>
            </motion.div>
            <motion.p {...rise(0.22)} className="mt-5 text-base text-muted">
              {t('landing.family')}{' '}
              <button
                type="button"
                onClick={() => go('family', familyTo)}
                className="inline-flex min-h-11 items-center gap-1 font-semibold text-ink underline underline-offset-4 hover:decoration-2"
              >
                {t('landing.familyCta')}
                <ArrowRight size={16} aria-hidden />
              </button>
            </motion.p>
            <motion.p {...rise(0.26)} className="mt-4 flex items-start gap-2 text-sm text-muted">
              <Info size={16} aria-hidden className="mt-[3px] shrink-0" />
              {t('landing.concept')}
            </motion.p>
          </div>

          <motion.figure
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease, delay: 0.1 }}
            className="relative m-0 min-w-0"
          >
            <div className="grid grid-cols-[1.6fr_1fr] gap-3 sm:gap-4" aria-hidden>
              <div className="row-span-2 aspect-[4/5] overflow-hidden rounded-sheet">
                <Photo hue={SATO_HUE} scene="room" />
              </div>
              <div className="overflow-hidden rounded-sheet">
                <Photo hue={172} scene="garden" />
              </div>
              <div className="overflow-hidden rounded-sheet">
                <Photo hue={330} scene="kitchen" />
              </div>
            </div>
            <figcaption className="relative z-10 -mt-12 ml-3 mr-3 rounded-card border border-line bg-white p-4 shadow-pop sm:ml-auto sm:mr-6 sm:max-w-sm lg:-ml-10 lg:mr-auto">
              <p className="text-base font-semibold">{t('landing.deal')}</p>
              <ul className="mt-2 space-y-1.5">
                {deal.map((d) => (
                  <li key={d} className="flex gap-2 text-base leading-snug">
                    <Check size={18} aria-hidden className="mt-[3px] shrink-0 text-teal-700" />
                    {d}
                  </li>
                ))}
              </ul>
            </figcaption>
          </motion.figure>
        </Page>
      </section>

      {/* Who it is for: both sides of the match, with sourced context */}
      <section aria-labelledby="who-title" className="border-t border-soft">
        <Page className="py-14 lg:py-20">
          <h2 id="who-title" className="text-balance text-[clamp(1.75rem,2vw+1rem,2.25rem)] font-semibold leading-tight">
            {t('landing.whoTitle')}
          </h2>
          <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-8 lg:gap-14">
            <article className="flex min-w-0 flex-col">
              <div className="aspect-[16/9] overflow-hidden rounded-sheet" aria-hidden>
                <Photo hue={SATO_HUE} scene="window" />
              </div>
              <h3 className="mt-5 text-balance text-xl font-semibold leading-snug">{t('landing.whoHostTitle')}</h3>
              <p className="mt-2 max-w-prose text-base text-ink/80">{t('landing.whoHostBody')}</p>
              <div className="mt-5 space-y-3 border-t border-soft pt-4">
                <Fact text={t('landing.statOld')} src={t('landing.srcOld')} />
                <Fact text={t('landing.statAlone')} src={t('landing.srcAlone')} />
              </div>
              <div className="mt-auto pt-6">
                <Button
                  variant="secondary"
                  onClick={() => go('host', '/saito')}
                  icon={<ArrowRight size={18} aria-hidden />}
                  className="flex-row-reverse"
                >
                  {t('landing.whoHostCta')}
                </Button>
              </div>
            </article>
            <article className="flex min-w-0 flex-col">
              <div className="aspect-[16/9] overflow-hidden rounded-sheet" aria-hidden>
                <Photo hue={172} scene="entry" />
              </div>
              <h3 className="mt-5 text-balance text-xl font-semibold leading-snug">{t('landing.whoTenantTitle')}</h3>
              <p className="mt-2 max-w-prose text-base text-ink/80">{t('landing.whoTenantBody')}</p>
              <div className="mt-5 space-y-3 border-t border-soft pt-4">
                <Fact text={t('landing.statRefused')} src={t('landing.srcRefused')} />
              </div>
              <div className="mt-auto pt-6">
                <Button
                  variant="secondary"
                  onClick={() => go('tenant', '/aisha/explore')}
                  icon={<ArrowRight size={18} aria-hidden />}
                  className="flex-row-reverse"
                >
                  {t('landing.whoTenantCta')}
                </Button>
              </div>
            </article>
          </div>
        </Page>
      </section>

      {/* How it works: a real sequence, so it earns its numbers */}
      <section aria-labelledby="how-title" className="bg-surface">
        <Page className="py-14 lg:py-20">
          <h2 id="how-title" className="text-balance text-[clamp(1.75rem,2vw+1rem,2.25rem)] font-semibold leading-tight">
            {t('landing.how')}
          </h2>
          <p className="mt-2 max-w-2xl text-lg text-ink/80">{t('landing.howSub')}</p>
          <ol className="relative mt-10 grid gap-8 md:grid-cols-4 md:gap-6">
            <span
              aria-hidden
              className="absolute left-[19px] top-2 h-[calc(100%-1rem)] w-px bg-line md:left-0 md:right-0 md:top-[19px] md:h-px md:w-auto"
            />
            {steps.map((s, i) => (
              <li key={s.t} className="relative flex gap-4 md:flex-col md:gap-0">
                <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink bg-white text-base font-semibold">
                  <span className="sr-only">{t('landing.step', { n: i + 1 })}: </span>
                  <span aria-hidden>{i + 1}</span>
                </span>
                <div className="min-w-0 md:mt-5 md:pr-4">
                  <h3 className="text-lg font-semibold leading-snug">{s.t}</h3>
                  <p className="mt-1 text-base text-ink/80">{s.b}</p>
                </div>
              </li>
            ))}
          </ol>
        </Page>
      </section>

      {/* Rooms: photo-first, clearly fictional */}
      <section aria-labelledby="rooms-title">
        <Page className="py-14 lg:py-20">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="rooms-title" className="text-[clamp(1.75rem,2vw+1rem,2.25rem)] font-semibold leading-tight">
                {t('landing.rooms')}
              </h2>
              <FictionalTag />
            </div>
            <LinkButton
              to="/aisha/explore"
              variant="ghost"
              onClick={() => setPersona('tenant')}
              icon={<ArrowRight size={18} aria-hidden />}
              className="flex-row-reverse !px-0"
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
      </section>

      {/* Safety: the reason a family would say yes */}
      <section aria-labelledby="safe-title" className="border-t border-soft">
        <Page className="grid gap-10 py-14 lg:grid-cols-[1fr_1.5fr] lg:gap-16 lg:py-20">
          <div className="min-w-0 lg:sticky lg:top-[calc(var(--hdr)+2rem)] lg:self-start">
            <h2 id="safe-title" className="text-balance text-[clamp(1.75rem,2vw+1rem,2.25rem)] font-semibold leading-tight">
              {t('landing.safe')}
            </h2>
            <p className="mt-2 max-w-md text-lg text-ink/80">{t('landing.safeSub')}</p>
            <div className="mt-6">
              <Button variant="teal" size="lg" onClick={() => nav('/safety')} icon={<ShieldCheck size={20} aria-hidden />}>
                {t('landing.safetyBtn')}
              </Button>
            </div>
          </div>
          <ul className="min-w-0 divide-y divide-soft border-y border-soft">
            {safe.map((s) => (
              <li key={s.t} className="flex gap-4 py-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-teal-50 text-teal-700">
                  <s.icon size={22} aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold leading-snug">{s.t}</h3>
                  <p className="mt-1 text-base text-ink/80">{s.b}</p>
                </div>
              </li>
            ))}
          </ul>
        </Page>
      </section>
    </>
  )
}

function Fact({ text, src }: { text: string; src: string }) {
  const { t } = useTranslation()
  return (
    <div>
      <p className="text-base font-semibold leading-snug">{text}</p>
      <p className="mt-0.5 text-sm text-muted">{t('landing.source', { s: src })}</p>
    </div>
  )
}
