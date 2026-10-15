import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Search,
  SlidersHorizontal,
  Map as MapIcon,
  List,
  Layers,
  Coffee,
  PawPrint,
  TrainFront,
  Languages,
  Wallet,
  UserRound,
  LayoutGrid,
  SearchX,
  Heart,
} from 'lucide-react'
import { Page, EmptyState, Notice } from '../../components/domain/Bits'
import { ListingCard } from '../../components/domain/ListingCard'
import { MapView } from '../../components/domain/MapView'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Pill } from '../../components/ui/Chip'
import { Select } from '../../components/ui/Field'
import { companionOnly as isCompanionOnly, useStore } from '../../store'
import { useListings } from '../../lib/listings'
import { useL, yen, monthLabel } from '../../lib/hooks'
import { AREAS } from '../../data/seed'
import { hoursOf } from '../../data/pricing'
import { RULES } from '../../tokens'
import type { Listing } from '../../data/types'

const CATS = [
  { id: 'all', icon: LayoutGrid },
  { id: 'light', icon: Layers },
  { id: 'company', icon: Coffee },
  { id: 'pets', icon: PawPrint },
  { id: 'station', icon: TrainFront },
  { id: 'english', icon: Languages },
  { id: 'value', icon: Wallet },
  { id: 'women', icon: UserRound },
] as const

const MONTHS = ['2026-11', '2026-12', '2027-01']
const BUDGETS = [40000, 45000, 50000, 55000, 60000]
const LANGS = ['ja', 'en', 'vi'] as const

export function useFilters() {
  const [sp, setSp] = useSearchParams()
  const get = (k: string, d = '') => sp.get(k) ?? d
  const set = (patch: Record<string, string | null>) => {
    const n = new URLSearchParams(sp)
    Object.entries(patch).forEach(([k, v]) => (v === null || v === '' ? n.delete(k) : n.set(k, v)))
    setSp(n, { replace: true })
  }
  return { get, set, clear: () => setSp(new URLSearchParams(), { replace: true }) }
}

export function applyFilters(all: Listing[], f: ReturnType<typeof useFilters>, companionOnly: boolean) {
  const where = f.get('where'),
    month = f.get('month'),
    budget = +f.get('budget', '0'),
    cat = f.get('cat', 'all')
  const min = +f.get('min', '0'),
    max = +f.get('max', '0'),
    maxH = f.get('hours'),
    lang = f.get('lang'),
    gender = f.get('gender'),
    pets = f.get('pets'),
    walk = +f.get('walk', '0'),
    tier = f.get('tier')
  return all.filter((l) => {
    const allIn = l.homeshareRent + RULES.membershipYen
    if (companionOnly && l.tier !== 'companionship') return false
    if (where && l.areaId !== where) return false
    if (month && l.availableFrom > month) return false
    if (budget && allIn > budget) return false
    if (min && allIn < min) return false
    if (max && allIn > max) return false
    if (tier && l.tier !== tier) return false
    if (maxH && hoursOf(l.helps) > +maxH) return false
    if (lang && !l.languages.includes(lang as never)) return false
    if (gender && l.gender !== 'any' && l.gender !== gender) return false
    if (pets && !l.pets) return false
    if (walk && l.walkMin > walk) return false
    if (cat === 'light' && !(l.tier === 'standard' && hoursOf(l.helps) <= 4)) return false
    if (cat === 'company' && l.tier !== 'companionship') return false
    if (cat === 'pets' && !l.pets) return false
    if (cat === 'station' && l.walkMin > 7) return false
    if (cat === 'english' && !l.languages.includes('en')) return false
    if (cat === 'value' && allIn > 45000) return false
    if (cat === 'women' && l.gender !== 'women') return false
    return true
  })
}

export function Explore() {
  const { t } = useTranslation()
  const text = useL()
  const lang = useStore((s) => s.lang)
  const tenant = useStore((s) => s.tenant)
  const saved = useStore((s) => s.saved)
  const all = useListings()
  const f = useFilters()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const companionOnly = isCompanionOnly(tenant)
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 350)
    return () => clearTimeout(id)
  }, [])

  const showMap = f.get('map') === '1'
  // Saved rooms are a view of this page (?saved=1), not a separate tab.
  const savedOnly = f.get('saved') === '1'
  const sort = f.get('sort', 'rec')
  const results = useMemo(() => {
    const r = savedOnly ? all.filter((l) => saved.includes(l.id)) : applyFilters(all, f, companionOnly)
    const by: Record<string, (a: Listing, b: Listing) => number> = {
      cost: (a, b) => a.homeshareRent - b.homeshareRent,
      hours: (a, b) => hoursOf(a.helps) - hoursOf(b.helps),
      walk: (a, b) => a.walkMin - b.walkMin,
    }
    return by[sort] ? [...r].sort(by[sort]) : r
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    all,
    f.get('where'),
    f.get('month'),
    f.get('budget'),
    f.get('cat'),
    f.get('min'),
    f.get('max'),
    f.get('hours'),
    f.get('lang'),
    f.get('gender'),
    f.get('pets'),
    f.get('walk'),
    f.get('tier'),
    sort,
    companionOnly,
    savedOnly,
    saved,
  ])

  const activeFilters = ['min', 'max', 'hours', 'lang', 'gender', 'pets', 'walk', 'tier'].filter((k) => f.get(k)).length

  return (
    <>
      {/* Search pill + category row */}
      <div className="z-20 border-b border-soft bg-white lg:sticky lg:top-20">
        <Page>
          <div className="flex flex-col gap-3 py-4">
            <form
              onSubmit={(e) => e.preventDefault()}
              role="search"
              aria-label={t('explore.search')}
              className="mx-auto grid w-full max-w-3xl grid-cols-2 items-stretch rounded-3xl border border-line bg-white p-1 shadow-lift sm:flex sm:rounded-full sm:p-0"
            >
              {[
                {
                  id: 'where',
                  label: t('explore.where'),
                  el: (
                    <select
                      id="where"
                      value={f.get('where')}
                      onChange={(e) => f.set({ where: e.target.value })}
                      className="w-full min-w-0 truncate bg-transparent text-sm text-ink outline-none sm:text-base"
                    >
                      <option value="">{t('explore.anywhere')}</option>
                      {AREAS.map((a) => (
                        <option key={a.id} value={a.id}>
                          {text(a)}
                        </option>
                      ))}
                    </select>
                  ),
                },
                {
                  id: 'month',
                  label: t('explore.movein'),
                  el: (
                    <select
                      id="month"
                      value={f.get('month')}
                      onChange={(e) => f.set({ month: e.target.value })}
                      className="w-full min-w-0 truncate bg-transparent text-sm text-ink outline-none sm:text-base"
                    >
                      <option value="">{t('explore.anyMonth')}</option>
                      {MONTHS.map((m) => (
                        <option key={m} value={m}>
                          {t('explore.byMonth', { m: monthLabel(m, lang) })}
                        </option>
                      ))}
                    </select>
                  ),
                },
                {
                  id: 'budget',
                  label: t('explore.budget'),
                  el: (
                    <select
                      id="budget"
                      value={f.get('budget')}
                      onChange={(e) => f.set({ budget: e.target.value })}
                      className="w-full min-w-0 truncate bg-transparent text-sm text-ink outline-none sm:text-base"
                    >
                      <option value="">{t('explore.anyBudget')}</option>
                      {BUDGETS.map((b) => (
                        <option key={b} value={b}>
                          {t('explore.upTo', { amount: yen(b) })}
                        </option>
                      ))}
                    </select>
                  ),
                },
              ].map((seg, i) => (
                <label
                  key={seg.id}
                  htmlFor={seg.id}
                  className={`flex min-w-0 flex-1 cursor-pointer flex-col justify-center rounded-2xl px-4 py-2 hover:bg-surface sm:rounded-full sm:px-6 sm:py-2.5 ${i === 1 ? 'border-l border-soft' : i === 2 ? 'col-span-1 border-t border-soft sm:border-l sm:border-t-0' : ''}`}
                >
                  <span className="text-xs font-semibold">{seg.label}</span>
                  {seg.el}
                </label>
              ))}
              <button
                type="submit"
                aria-label={t('explore.searchBtn')}
                className="m-1.5 grid h-12 w-12 shrink-0 place-items-center self-center justify-self-end rounded-full bg-gradient-to-r from-brand-400 via-brand-600 to-brand-700 text-white transition hover:brightness-95"
              >
                <Search size={20} aria-hidden />
                <span className="sr-only">{t('explore.searchBtn')}</span>
              </button>
            </form>

            <div className="flex items-center gap-4">
              <ul className="scroll-hide -mx-1 flex flex-1 gap-2 overflow-x-auto px-1 py-1">
                {CATS.map((c) => {
                  const on = f.get('cat', 'all') === c.id
                  return (
                    <li key={c.id} className="shrink-0">
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => f.set({ cat: c.id === 'all' ? null : c.id })}
                        className={`flex h-[60px] min-w-[84px] flex-col items-center justify-center gap-1 rounded-xl border-b-2 px-3 text-sm font-medium transition ${on ? 'border-ink text-ink' : 'border-transparent text-muted hover:border-line hover:text-ink'}`}
                      >
                        <c.icon size={22} aria-hidden strokeWidth={on ? 2.4 : 1.8} />
                        <span>{t(`explore.cat.${c.id}`)}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="flex h-12 shrink-0 items-center gap-2 rounded-xl border border-line px-4 text-base font-semibold hover:border-ink"
              >
                <SlidersHorizontal size={18} aria-hidden />
                {t('explore.filters')}
                {activeFilters > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-xs font-bold text-white">{activeFilters}</span>
                )}
              </button>
            </div>
          </div>
        </Page>
      </div>

      <Page className="pt-6">
        {companionOnly && (
          <div className="mb-5">
            <Notice tone="teal" title={t('explore.companionTitle')}>
              {t('explore.companionBody')}
            </Notice>
          </div>
        )}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-base font-semibold" aria-live="polite">
            {savedOnly ? t('saved.title') : t('explore.count', { count: results.length })}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant={savedOnly ? 'soft' : 'secondary'}
              size="sm"
              aria-pressed={savedOnly}
              icon={<Heart size={16} aria-hidden className={savedOnly ? 'fill-brand-600 text-brand-600' : ''} />}
              onClick={() => f.set({ saved: savedOnly ? null : '1' })}
            >
              {savedOnly ? t('saved.showAll') : t('saved.button', { n: saved.length })}
            </Button>
            <label className="flex items-center gap-2 text-sm text-muted">
              <span>{t('explore.sort')}</span>
              <Select
                value={sort}
                onChange={(e) => f.set({ sort: e.target.value === 'rec' ? null : e.target.value })}
                className="!h-10 !w-auto !py-0 !text-sm !text-ink"
              >
                {['rec', 'cost', 'hours', 'walk'].map((s) => (
                  <option key={s} value={s}>
                    {t(`explore.sorts.${s}`)}
                  </option>
                ))}
              </Select>
            </label>
            <Button
              variant="secondary"
              size="sm"
              icon={showMap ? <List size={16} aria-hidden /> : <MapIcon size={16} aria-hidden />}
              onClick={() => f.set({ map: showMap ? null : '1' })}
            >
              {showMap ? t('explore.showList') : t('explore.showMap')}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="skeleton aspect-[20/19] rounded-card" />
                <div className="skeleton mt-3 h-4 w-3/4 rounded" />
                <div className="skeleton mt-2 h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : savedOnly && results.length === 0 ? (
          <EmptyState
            icon={<Heart size={26} aria-hidden />}
            title={t('saved.emptyTitle')}
            body={t('saved.emptyBody')}
            action={
              <Button variant="dark" onClick={() => f.set({ saved: null })}>
                {t('saved.explore')}
              </Button>
            }
          />
        ) : results.length === 0 ? (
          <EmptyState
            icon={<SearchX size={26} aria-hidden />}
            title={t('explore.emptyTitle')}
            body={t('explore.emptyBody')}
            action={
              <Button variant="dark" onClick={f.clear}>
                {t('explore.clear')}
              </Button>
            }
          />
        ) : showMap ? (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-2">
              {results.map((l) => (
                <ListingCard key={l.id} l={l} />
              ))}
            </div>
            <MapView items={results} className="h-[420px] lg:sticky lg:top-[11.5rem] lg:h-[calc(100dvh-13rem)]" />
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((l) => (
              <ListingCard key={l.id} l={l} />
            ))}
          </div>
        )}
      </Page>

      <FiltersModal open={filtersOpen} onClose={() => setFiltersOpen(false)} f={f} all={all} companionOnly={companionOnly} />
    </>
  )
}

function FiltersModal({
  open,
  onClose,
  f,
  all,
  companionOnly,
}: {
  open: boolean
  onClose: () => void
  f: ReturnType<typeof useFilters>
  all: Listing[]
  companionOnly: boolean
}) {
  const { t } = useTranslation()
  const n = applyFilters(all, f, companionOnly).length
  const min = +f.get('min', '30000'),
    max = +f.get('max', '60000')
  const row = 'border-b border-soft py-6 first:pt-0 last:border-0'
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('explore.filters')}
      size="md"
      footer={
        <>
          <button type="button" onClick={f.clear} className="text-base font-semibold underline underline-offset-4">
            {t('explore.clear')}
          </button>
          <Button variant="dark" size="lg" onClick={onClose}>
            {t('explore.show', { count: n })}
          </Button>
        </>
      }
    >
      <section className={row}>
        <h3 className="mb-1 text-lg font-semibold">{t('explore.fPrice')}</h3>
        <p className="mb-3 text-sm text-muted">{t('explore.fPriceNote')}</p>
        <p className="mb-2 text-base font-semibold tabular-nums">
          {yen(min)} – {yen(max)}
        </p>
        <label className="sr-only" htmlFor="pmin">
          {t('explore.fMin')}
        </label>
        <input
          id="pmin"
          type="range"
          min={30000}
          max={60000}
          step={1000}
          value={min}
          onChange={(e) => f.set({ min: +e.target.value >= 60000 || +e.target.value <= 30000 ? null : e.target.value })}
        />
        <label className="sr-only" htmlFor="pmax">
          {t('explore.fMax')}
        </label>
        <input
          id="pmax"
          type="range"
          min={30000}
          max={60000}
          step={1000}
          value={max}
          onChange={(e) => f.set({ max: +e.target.value >= 60000 ? null : e.target.value })}
        />
      </section>
      <section className={row}>
        <h3 className="mb-3 text-lg font-semibold">{t('explore.fTier')}</h3>
        <div className="flex flex-wrap gap-2">
          {[
            ['', 'any'],
            ['standard', 'light'],
            ['companionship', 'company'],
          ].map(([v, k]) => (
            <Pill key={k} selected={f.get('tier') === v} onClick={() => f.set({ tier: v || null })}>
              {t(`explore.tier.${k}`)}
            </Pill>
          ))}
        </div>
      </section>
      <section className={row}>
        <h3 className="mb-1 text-lg font-semibold">{t('explore.fHours')}</h3>
        <p className="mb-2 text-base tabular-nums">{f.get('hours') ? t('explore.upToH', { n: f.get('hours') }) : t('explore.anyHours')}</p>
        <label className="sr-only" htmlFor="hrs">
          {t('explore.fHours')}
        </label>
        <input
          id="hrs"
          type="range"
          min={0}
          max={10}
          value={f.get('hours', '10')}
          onChange={(e) => f.set({ hours: +e.target.value >= 10 ? null : e.target.value })}
        />
      </section>
      <section className={row}>
        <h3 className="mb-3 text-lg font-semibold">{t('explore.fWalk')}</h3>
        <div className="flex flex-wrap gap-2">
          {['', '5', '10', '15'].map((v) => (
            <Pill key={v} selected={f.get('walk') === v} onClick={() => f.set({ walk: v || null })}>
              {v ? t('explore.walkMax', { n: v }) : t('explore.any')}
            </Pill>
          ))}
        </div>
      </section>
      <section className={row}>
        <h3 className="mb-3 text-lg font-semibold">{t('explore.fLang')}</h3>
        <div className="flex flex-wrap gap-2">
          {LANGS.map((x) => (
            <Pill key={x} selected={f.get('lang') === x} onClick={() => f.set({ lang: f.get('lang') === x ? null : x })}>
              {t(`langName.${x}`)}
            </Pill>
          ))}
        </div>
      </section>
      <section className={row}>
        <h3 className="mb-3 text-lg font-semibold">{t('explore.fGender')}</h3>
        <div className="flex flex-wrap gap-2">
          {[
            ['', 'any'],
            ['women', 'women'],
            ['men', 'men'],
          ].map(([v, k]) => (
            <Pill key={k} selected={f.get('gender') === v} onClick={() => f.set({ gender: v || null })}>
              {t(`explore.gender.${k}`)}
            </Pill>
          ))}
        </div>
      </section>
      <section className={row}>
        <h3 className="mb-3 text-lg font-semibold">{t('explore.fPets')}</h3>
        <Pill selected={!!f.get('pets')} onClick={() => f.set({ pets: f.get('pets') ? null : '1' })}>
          {t('explore.petsOk')}
        </Pill>
      </section>
    </Modal>
  )
}
