import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { Wizard, Section } from '../../components/layout/Wizard'
import { Pill } from '../../components/ui/Chip'
import { Photo, SCENES } from '../../components/ui/Photo'
import { Stepper } from '../../components/ui/Stepper'
import { Notice } from '../../components/domain/Bits'
import { useStore } from '../../store'
import { AREAS } from '../../data/seed'
import { costs, suggestedRange } from '../../data/pricing'
import { useL, yen } from '../../lib/hooks'
import { RULES } from '../../tokens'

export function CreateListing() {
  const { t } = useTranslation()
  const text = useL()
  const nav = useNavigate()
  const { step: s } = useParams()
  const step = Math.min(2, Math.max(0, +(s ?? '1') - 1))
  const { draft, patchDraft, helps } = useStore()
  const total = 4
  const go = (n: number) => nav(`/host/create/${n + 1}`)
  const c = costs(draft.standardRent, draft.homeshareRent, helps)
  const range = suggestedRange(draft.standardRent)
  const inRange = draft.homeshareRent >= range.min && draft.homeshareRent <= range.max

  const opt = <T extends string>(value: T, current: T, set: (v: T) => void, label: string) => (
    <Pill key={value} selected={current === value} onClick={() => set(value)}>
      {label}
    </Pill>
  )

  const togglePhoto = (p: string) => patchDraft({ photos: draft.photos.includes(p) ? draft.photos.filter((x) => x !== p) : [...draft.photos, p] })

  if (step === 0) {
    return (
      <Wizard step={0} total={total} title={t('create.t1')} lede={t('create.l1')} nextDisabled={draft.photos.length < 3} onNext={() => go(1)}>
        <Section title={t('create.photos')} hint={t('create.photosHint', { n: draft.photos.length })}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SCENES.map((sc) => {
              const on = draft.photos.includes(sc)
              return (
                <button
                  key={sc}
                  type="button"
                  aria-pressed={on}
                  onClick={() => togglePhoto(sc)}
                  className={`group relative overflow-hidden rounded-card text-left ring-offset-2 transition ${on ? 'ring-2 ring-ink' : 'ring-1 ring-line hover:ring-ink'}`}
                >
                  <div className="aspect-[4/3]">
                    <Photo hue={262} scene={sc} />
                  </div>
                  <span className="flex h-11 items-center justify-between px-3 text-base font-medium">
                    {t(`create.scene.${sc}`)}
                    {on && <Check size={18} aria-hidden className="text-teal-700" />}
                  </span>
                </button>
              )
            })}
          </div>
        </Section>
        <Section title={t('create.area')}>
          <div className="flex flex-wrap gap-2">{AREAS.map((a) => opt(a.id, draft.areaId, (v) => patchDraft({ areaId: v }), text(a)))}</div>
        </Section>
        <Section title={t('create.room')}>
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <span className="text-base">{t('create.size')}</span>
              <Stepper
                value={draft.sizeJo}
                min={3}
                max={12}
                onChange={(v) => patchDraft({ sizeJo: v })}
                label={t('create.size')}
                format={(n) => `${n} ${t('create.jo')}`}
                decLabel={t('common.less')}
                incLabel={t('common.more')}
              />
            </div>
            <div>
              <p className="mb-2 text-base">{t('create.bathroom')}</p>
              <div className="flex gap-2">
                {opt('shared', draft.bathroom, (v) => patchDraft({ bathroom: v }), t('create.shared'))}
                {opt('private', draft.bathroom, (v) => patchDraft({ bathroom: v }), t('create.private'))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-base">{t('create.furnished')}</p>
              <div className="flex gap-2">
                <Pill selected={draft.furnished} onClick={() => patchDraft({ furnished: true })}>
                  {t('common.yes')}
                </Pill>
                <Pill selected={!draft.furnished} onClick={() => patchDraft({ furnished: false })}>
                  {t('common.no')}
                </Pill>
              </div>
            </div>
          </div>
        </Section>
      </Wizard>
    )
  }

  if (step === 1) {
    const pct = (draft.homeshareRent - 10000) / (draft.standardRent - 10000)
    return (
      <Wizard
        step={1}
        total={total}
        title={t('create.t2')}
        lede={t('create.l2')}
        onBack={() => go(0)}
        onNext={() => go(2)}
        nextDisabled={draft.homeshareRent > draft.standardRent}
      >
        <Section title={t('create.standardRent')} hint={t('create.standardHint')}>
          <Stepper
            value={draft.standardRent}
            step={5000}
            min={30000}
            max={120000}
            label={t('create.standardRent')}
            format={yen}
            decLabel={t('common.less')}
            incLabel={t('common.more')}
            onChange={(v) => patchDraft({ standardRent: v, homeshareRent: Math.min(draft.homeshareRent, v) })}
          />
        </Section>
        <Section title={t('create.homeshareRent')} hint={t('create.suggest', { a: yen(range.min), b: yen(range.max) })}>
          <Stepper
            value={draft.homeshareRent}
            step={1000}
            min={10000}
            max={draft.standardRent}
            label={t('create.homeshareRent')}
            format={yen}
            decLabel={t('common.less')}
            incLabel={t('common.more')}
            onChange={(v) => patchDraft({ homeshareRent: v })}
          />
          <div className="mt-5" aria-hidden>
            <div className="relative h-2 rounded-full bg-soft">
              <div
                className="absolute inset-y-0 rounded-full bg-teal-300/60"
                style={{
                  left: `${((range.min - 10000) / (draft.standardRent - 10000)) * 100}%`,
                  right: `${100 - ((range.max - 10000) / (draft.standardRent - 10000)) * 100}%`,
                }}
              />
              <div
                className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-ink shadow-soft"
                style={{ left: `calc(${pct * 100}% - 10px)` }}
              />
            </div>
          </div>
          <p className={`mt-3 text-base ${inRange ? 'text-teal-700' : 'text-amber-700'}`}>{inRange ? t('create.inRange') : t('create.outRange')}</p>
        </Section>
        <Section title={t('create.preview')}>
          <dl className="space-y-2 text-base">
            <div className="flex justify-between">
              <dt className="text-muted">{t('create.housemateRent')}</dt>
              <dd className="font-semibold tabular-nums">{yen(draft.homeshareRent)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{t('detail.membership')}</dt>
              <dd className="tabular-nums">{yen(RULES.membershipYen)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">{t('create.discount')}</dt>
              <dd className="tabular-nums">{c.discountPct}%</dd>
            </div>
            <div className="flex justify-between border-t border-soft pt-2">
              <dt className="text-muted">{t('create.youEarn')}</dt>
              <dd className="font-semibold tabular-nums">{yen(draft.homeshareRent)}</dd>
            </div>
          </dl>
        </Section>
        <Notice tone="neutral">{t('create.hostFree')}</Notice>
      </Wizard>
    )
  }

  return (
    <Wizard
      step={2}
      total={total}
      title={t('create.t3')}
      lede={t('create.l3')}
      onBack={() => go(1)}
      onNext={() => {
        patchDraft({ published: true })
        nav('/host/help')
      }}
      nextLabel={t('create.toHelp')}
    >
      <Section title={t('create.smoking')}>
        <div className="flex flex-wrap gap-2">
          {opt('no', draft.smoking, (v) => patchDraft({ smoking: v }), t('create.smokingNo'))}
          {opt('outside', draft.smoking, (v) => patchDraft({ smoking: v }), t('create.smokingOutside'))}
        </div>
      </Section>
      <Section title={t('create.pets')}>
        <div className="flex gap-2">
          <Pill selected={draft.pets} onClick={() => patchDraft({ pets: true })}>
            {t('create.petsOk')}
          </Pill>
          <Pill selected={!draft.pets} onClick={() => patchDraft({ pets: false })}>
            {t('create.petsNo')}
          </Pill>
        </div>
      </Section>
      <Section title={t('create.quiet')}>
        <div className="flex flex-wrap gap-2">
          {['20:00-08:00', '21:00-07:00', '22:00-06:00'].map((q) => opt(q, draft.quiet, (v) => patchDraft({ quiet: v }), q.replace('-', ' – ')))}
        </div>
      </Section>
      <Section title={t('create.guests')}>
        <div className="flex flex-wrap gap-2">
          {opt('ask', draft.guests, (v) => patchDraft({ guests: v }), t('create.guestsAsk'))}
          {opt('sometimes', draft.guests, (v) => patchDraft({ guests: v }), t('create.guestsSome'))}
          {opt('no', draft.guests, (v) => patchDraft({ guests: v }), t('create.guestsNo'))}
        </div>
      </Section>
      <Section title={t('create.gender')} hint={t('create.genderHint')}>
        <div className="flex flex-wrap gap-2">
          {opt('any', draft.gender, (v) => patchDraft({ gender: v }), t('create.genderAny'))}
          {opt('women', draft.gender, (v) => patchDraft({ gender: v }), t('create.genderWomen'))}
          {opt('men', draft.gender, (v) => patchDraft({ gender: v }), t('create.genderMen'))}
        </div>
      </Section>
    </Wizard>
  )
}
