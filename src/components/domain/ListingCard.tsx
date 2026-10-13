import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Heart, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Photo, SCENES } from '../ui/Photo'
import { useStore } from '../../store'
import { useL, yen } from '../../lib/hooks'
import { hoursOf } from '../../data/pricing'
import type { Listing } from '../../data/types'
import { FictionalTag } from './Bits'

/** Airbnb-style card: photo carousel with save heart, then four quiet text rows. No shadow, no border. */
export function ListingCard({ l, highlight = false }: { l: Listing; highlight?: boolean }) {
  const { t } = useTranslation()
  const text = useL()
  const saved = useStore((s) => s.saved.includes(l.id))
  const toggle = useStore((s) => s.toggleSaved)
  const rail = useRef<HTMLUListElement>(null)
  const [i, setI] = useState(0)
  const go = (n: number) => {
    const next = Math.max(0, Math.min(SCENES.length - 1, n))
    setI(next)
    const el = rail.current
    if (el) el.scrollTo({ left: el.clientWidth * next, behavior: 'smooth' })
  }
  const hours = hoursOf(l.helps)
  return (
    <article className={`group relative ${highlight ? 'rounded-card ring-2 ring-ink ring-offset-4' : ''}`}>
      <div className="relative aspect-[20/19] overflow-hidden rounded-card bg-soft">
        <ul
          ref={rail}
          onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="scroll-hide flex h-full snap-x snap-mandatory overflow-x-auto"
        >
          {SCENES.map((s) => (
            <li key={s} className="h-full w-full shrink-0 snap-center">
              <Link to={`/rooms/${l.id}`} tabIndex={-1} aria-hidden className="block h-full">
                <Photo hue={l.hue} scene={s} />
              </Link>
            </li>
          ))}
        </ul>
        <div className="pointer-events-none absolute left-3 top-3">
          <FictionalTag className="bg-white/95" />
        </div>
        <button
          type="button"
          onClick={() => toggle(l.id)}
          aria-pressed={saved}
          aria-label={saved ? t('card.unsave', { name: text(l.hostName) }) : t('card.save', { name: text(l.hostName) })}
          className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-full transition hover:scale-110"
        >
          <Heart size={24} aria-hidden className={saved ? 'fill-purple-600 text-purple-600' : 'fill-black/40 text-white'} strokeWidth={2} />
        </button>
        {i > 0 && (
          <button
            type="button"
            aria-label={t('card.prev')}
            onClick={() => go(i - 1)}
            className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/95 opacity-0 shadow-soft transition group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
        )}
        {i < SCENES.length - 1 && (
          <button
            type="button"
            aria-label={t('card.next')}
            onClick={() => go(i + 1)}
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/95 opacity-0 shadow-soft transition group-hover:opacity-100 focus-visible:opacity-100"
          >
            <ChevronRight size={18} aria-hidden />
          </button>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center gap-1" aria-hidden>
          {SCENES.map((s, n) => (
            <span key={s} className={`h-1.5 w-1.5 rounded-full ${n === i ? 'bg-white' : 'bg-white/60'}`} />
          ))}
        </div>
      </div>
      <Link to={`/rooms/${l.id}`} className="mt-3 block rounded-md focus-visible:outline-offset-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base font-semibold leading-snug">
            {text(l.area)} · {t('card.hostedBy', { name: text(l.hostName) })}
          </h2>
          <ShieldCheck size={18} aria-label={t('common.verified')} className="mt-0.5 shrink-0 text-teal-700" />
        </div>
        <p className="text-base text-muted">{t('card.walk', { n: l.walkMin, station: text(l.station) })}</p>
        <p className="text-base text-muted">
          {l.tier === 'companionship' ? t('card.companion') : t('card.help', { n: hours })} · {t('card.jo', { n: l.sizeJo })}
        </p>
        <p className="mt-1 text-base">
          <span className="font-semibold">{yen(l.homeshareRent)}</span> <span className="text-muted">{t('common.perMonth')}</span>
          <span className="ml-2 text-muted line-through">{yen(l.standardRent)}</span>
        </p>
      </Link>
    </article>
  )
}
