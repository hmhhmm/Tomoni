import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, MapPin, Heart } from 'lucide-react'
import { Screen } from '../../components/Screen'
import { Card } from '../../components/Card'
import { Chip, ChoiceChip } from '../../components/Chip'
import { HourMeter } from '../../components/HourMeter'
import { RoomArt } from '../../components/RoomArt'
import { Notice, FictionalTag } from '../../components/Misc'
import { useStore, totalHours } from '../../store'
import { AREAS, LISTINGS } from '../../data/seed'
import { useL, yen } from '../../lib/hooks'
import type { Listing } from '../../data/types'

export function useListings() {
  const helps = useStore((s) => s.helps)
  return LISTINGS.map((l) => (l.id === 'l1' ? { ...l, helps } : l))
}
export const listingHours = (l: Listing) => totalHours(l.helps)

function MapPreview({ items }: { items: Listing[] }) {
  const { t } = useTranslation()
  const l = useL()
  const pos: Record<string, [number, number]> = { l1: [22, 26], l5: [52, 26], l4: [80, 26], l2: [20, 74], l3: [50, 72], l6: [80, 74] }
  return (
    <Card className="!p-0 overflow-hidden" aria-label={t('browse.map')}>
      <div className="relative h-40 bg-gradient-to-br from-teal-50 to-purple-50">
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          <path d="M0 40C20 30 30 50 50 36S80 20 100 30" stroke="#CDF2EC" strokeWidth="5" fill="none" />
          <path d="M10 0 30 60M60 0 70 60M0 18 100 12" stroke="#fff" strokeWidth="2" />
        </svg>
        {items.map((x) => (
          <Link
            key={x.id} to={`/tenant/listing/${x.id}`}
            style={{ left: `${pos[x.id][0]}%`, top: `${pos[x.id][1]}%` }}
            className="absolute flex min-h-12 -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-white px-2.5 text-sm font-semibold shadow-lift ring-1 ring-line hover:ring-purple-600"
          >
            <MapPin size={14} aria-hidden className="text-purple-700" /> {l(x.area)} · {yen(x.homeshareRent)}
          </Link>
        ))}
      </div>
      <p className="px-4 py-2 text-sm text-muted">{t('browse.mapNote')}</p>
    </Card>
  )
}

export function Browse() {
  const { t } = useTranslation()
  const l = useL()
  const tenant = useStore((s) => s.tenant)
  const all = useListings()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [areas, setAreas] = useState<string[]>([])
  const [budget, setBudget] = useState(50000)
  const [lang, setLang] = useState<string | null>(null)
  const [gender, setGender] = useState<'any' | 'women' | 'men'>('any')
  const [pets, setPets] = useState(false)
  const companion = tenant.residence === 'limited'

  const items = useMemo(() => all.filter((x) => {
    if (companion && x.tier !== 'companionship') return false
    const text = `${x.area.en} ${x.area.ja} ${x.hostName.en} ${x.hostName.ja}`.toLowerCase()
    if (q && !text.includes(q.toLowerCase())) return false
    if (areas.length && !areas.includes(x.areaId)) return false
    if (x.homeshareRent + 8000 > budget) return false
    if (lang && !x.languages.includes(lang)) return false
    if (gender !== 'any' && x.gender !== gender && x.gender !== 'any') return false
    if (gender === 'women' && x.gender === 'men') return false
    if (pets && !x.pets) return false
    return true
  }), [all, q, areas, budget, lang, gender, pets, companion])

  const reset = () => { setQ(''); setAreas([]); setBudget(50000); setLang(null); setGender('any'); setPets(false) }

  return (
    <Screen title={t('browse.title')} lede={t('browse.lede')} footer>
      {companion && <Notice tone="teal" title={t('browse.companionTitle')}>{t('browse.companionBody')}</Notice>}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <label htmlFor="q" className="sr-only">{t('browse.search')}</label>
          <Search size={20} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('browse.search')} className="min-h-12 w-full rounded-full border border-line bg-white pl-11 pr-4 text-base shadow-soft" />
        </div>
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex min-h-12 items-center gap-1.5 rounded-full border border-line bg-white px-4 text-base font-semibold shadow-soft">
          <SlidersHorizontal size={20} aria-hidden /> {t('browse.filters')}
        </button>
      </div>

      {open && (
        <Card className="space-y-4">
          <div>
            <p className="mb-2 font-semibold">{t('browse.area')}</p>
            <div className="flex flex-wrap gap-2">
              {AREAS.map((a) => <ChoiceChip key={a.id} selected={areas.includes(a.id)} onClick={() => setAreas(areas.includes(a.id) ? areas.filter((x) => x !== a.id) : [...areas, a.id])}>{l(a)}</ChoiceChip>)}
            </div>
          </div>
          <div>
            <label htmlFor="bud" className="mb-1 block font-semibold">{t('browse.budget', { amount: yen(budget) })}</label>
            <input id="bud" type="range" min={30000} max={60000} step={1000} value={budget} onChange={(e) => setBudget(+e.target.value)} />
            <p className="text-sm text-muted">{t('browse.budgetNote')}</p>
          </div>
          <div>
            <p className="mb-2 font-semibold">{t('browse.language')}</p>
            <div className="flex flex-wrap gap-2">
              {['ja', 'en', 'vi'].map((x) => <ChoiceChip key={x} selected={lang === x} onClick={() => setLang(lang === x ? null : x)}>{t(`langName.${x}`)}</ChoiceChip>)}
            </div>
          </div>
          <div>
            <p className="mb-2 font-semibold">{t('browse.gender')}</p>
            <div className="flex flex-wrap gap-2">
              {(['any', 'women', 'men'] as const).map((g) => <ChoiceChip key={g} selected={gender === g} onClick={() => setGender(g)}>{t(`create.gender${{ any: 'Any', women: 'Women', men: 'Men' }[g]}`)}</ChoiceChip>)}
            </div>
          </div>
          <ChoiceChip selected={pets} onClick={() => setPets(!pets)}>{t('browse.pets')}</ChoiceChip>
          <button type="button" onClick={reset} className="block min-h-12 font-semibold text-purple-700 underline">{t('browse.clear')}</button>
        </Card>
      )}

      <MapPreview items={items} />

      <p className="text-base text-muted" aria-live="polite">{t('browse.count', { n: items.length })}</p>

      {items.length === 0 ? (
        <Card className="text-center">
          <Heart size={32} aria-hidden className="mx-auto text-purple-200" />
          <p className="mt-2 font-heading text-lg font-semibold">{t('browse.emptyTitle')}</p>
          <p className="text-base text-muted">{t('browse.emptyBody')}</p>
          <button type="button" onClick={reset} className="mt-2 min-h-12 font-semibold text-purple-700 underline">{t('browse.clear')}</button>
        </Card>
      ) : (
        <ul className="space-y-4">
          {items.map((x, i) => (
            <motion.li key={x.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link to={`/tenant/listing/${x.id}`} className="block overflow-hidden rounded-card border border-line bg-white shadow-soft transition hover:shadow-lift">
                <div className="aspect-[16/9]"><RoomArt hue={x.hue} scene={(['room', 'window', 'kitchen', 'garden'] as const)[i % 4]} /></div>
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="font-heading text-lg font-semibold leading-tight">{l(x.area)} · {l(x.hostName)}</h2>
                      <p className="text-base text-muted">{l(x.station)}</p>
                    </div>
                    <FictionalTag />
                  </div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-heading text-xl font-semibold">{yen(x.homeshareRent)}<span className="text-base font-normal text-muted"> {t('common.perMonth')}</span></span>
                    <span className="text-base text-muted line-through">{yen(x.standardRent)}</span>
                    <Chip tone="teal">{t('browse.save', { amount: yen(x.standardRent - x.homeshareRent) })}</Chip>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {x.tier === 'companionship' ? <Chip tone="purple">{t('browse.companionOnly')}</Chip> : <Chip tone="purple">{t('browse.tasks')}</Chip>}
                    {x.languages.map((g) => <Chip key={g}>{t(`langName.${g}`)}</Chip>)}
                    {x.pets && <Chip>{t('browse.petsOk')}</Chip>}
                    {x.gender !== 'any' && <Chip>{t(`create.gender${x.gender === 'women' ? 'Women' : 'Men'}`)}</Chip>}
                  </div>
                  <HourMeter value={listingHours(x)} compact label={t('meter.help')} />
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </Screen>
  )
}
