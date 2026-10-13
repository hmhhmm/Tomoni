import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Check, ImagePlus } from 'lucide-react'
import { Screen } from '../../components/Screen'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Chip, ChoiceChip } from '../../components/Chip'
import { StepBar } from '../../components/StepBar'
import { Stepper, Fieldset } from '../../components/Stepper'
import { RoomArt } from '../../components/RoomArt'
import { useStore } from '../../store'
import { AREAS } from '../../data/seed'
import { useL, yen } from '../../lib/hooks'

const SCENES = ['room', 'window', 'kitchen', 'garden'] as const

export function CreateListing() {
  const { t } = useTranslation()
  const l = useL()
  const nav = useNavigate()
  const { draft, patchDraft, draftStep: step, setDraftStep } = useStore()
  const steps = [t('create.s1'), t('create.s2'), t('create.s3')]
  const saving = draft.standardRent - draft.homeshareRent

  const togglePhoto = (p: string) =>
    patchDraft({ photos: draft.photos.includes(p) ? draft.photos.filter((x) => x !== p) : [...draft.photos, p] })

  const opt = <T extends string>(value: T, current: T, set: (v: T) => void, label: string) => (
    <ChoiceChip key={value} selected={current === value} onClick={() => set(value)}>{label}</ChoiceChip>
  )

  return (
    <Screen title={t('create.title')} lede={t('create.step', { n: step + 1, total: 3, name: steps[step] })} footer>
      <StepBar steps={steps} current={step} variant="progress" />

      {step === 0 && (
        <>
          <Fieldset legend={t('create.photos')}>
            <p className="mb-3 text-base text-muted">{t('create.photosHint')}</p>
            <div className="grid grid-cols-2 gap-3">
              {SCENES.map((sc) => {
                const on = draft.photos.includes(sc)
                return (
                  <button
                    key={sc} type="button" aria-pressed={on} onClick={() => togglePhoto(sc)}
                    className={`relative overflow-hidden rounded-2xl border-2 text-left ${on ? 'border-purple-600' : 'border-line'}`}
                  >
                    <div className="aspect-[16/10]"><RoomArt scene={sc} hue={262} /></div>
                    <span className="flex min-h-12 items-center gap-2 bg-white px-3 text-base font-medium">
                      {on ? <Check size={18} aria-hidden className="text-teal-700" /> : <ImagePlus size={18} aria-hidden className="text-muted" />}
                      {t(`create.scene.${sc}`)}
                    </span>
                  </button>
                )
              })}
            </div>
          </Fieldset>
          <Fieldset legend={t('create.area')}>
            <div className="flex flex-wrap gap-2">
              {AREAS.map((a) => opt(a.id, draft.areaId, (v) => patchDraft({ areaId: v }), l(a)))}
            </div>
          </Fieldset>
          <Fieldset legend={t('create.room')}>
            <p className="mb-2 text-base text-muted">{t('create.size')}</p>
            <Stepper value={draft.sizeJo} min={3} max={12} onChange={(v) => patchDraft({ sizeJo: v })} label={t('create.size')} format={(n) => `${n} ${t('create.jo')}`} decLabel={t('common.less')} incLabel={t('common.more')} />
            <p className="mb-2 mt-5 text-base text-muted">{t('create.bathroom')}</p>
            <div className="flex flex-wrap gap-2">
              {opt('shared', draft.bathroom, (v) => patchDraft({ bathroom: v }), t('create.shared'))}
              {opt('private', draft.bathroom, (v) => patchDraft({ bathroom: v }), t('create.private'))}
            </div>
            <p className="mb-2 mt-5 text-base text-muted">{t('create.furnished')}</p>
            <div className="flex gap-2">
              <ChoiceChip selected={draft.furnished} onClick={() => patchDraft({ furnished: true })}>{t('common.yes')}</ChoiceChip>
              <ChoiceChip selected={!draft.furnished} onClick={() => patchDraft({ furnished: false })}>{t('common.no')}</ChoiceChip>
            </div>
          </Fieldset>
        </>
      )}

      {step === 1 && (
        <>
          <Fieldset legend={t('create.standardRent')}>
            <Stepper value={draft.standardRent} step={5000} min={30000} max={120000} label={t('create.standardRent')} format={yen} decLabel={t('common.less')} incLabel={t('common.more')}
              onChange={(v) => patchDraft({ standardRent: v, homeshareRent: Math.min(draft.homeshareRent, v) })} />
          </Fieldset>
          <Fieldset legend={t('create.homeshareRent')}>
            <Stepper value={draft.homeshareRent} step={5000} min={10000} max={draft.standardRent} label={t('create.homeshareRent')} format={yen} decLabel={t('common.less')} incLabel={t('common.more')}
              onChange={(v) => patchDraft({ homeshareRent: v })} />
          </Fieldset>
          <Card tone="teal">
            <div className="flex items-center justify-between gap-2">
              <p className="font-heading text-lg font-semibold">{t('create.compare')}</p>
              <Chip tone="amber">{t('common.example')}</Chip>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-white p-3"><p className="text-sm text-muted">{t('create.standard')}</p><p className="font-heading text-xl font-semibold line-through decoration-2">{yen(draft.standardRent)}</p></div>
              <div className="rounded-2xl bg-white p-3 ring-2 ring-teal-300"><p className="text-sm text-teal-700">{t('create.homeshare')}</p><p className="font-heading text-xl font-semibold">{yen(draft.homeshareRent)}</p></div>
            </div>
            <p className="mt-3 text-base">{t('create.saving', { amount: yen(saving) })}</p>
            <p className="mt-1 text-base text-muted">{t('create.hostFree')}</p>
          </Card>
        </>
      )}

      {step === 2 && (
        <>
          <Fieldset legend={t('create.smoking')}>
            <div className="flex flex-wrap gap-2">
              {opt('no', draft.smoking, (v) => patchDraft({ smoking: v }), t('create.smokingNo'))}
              {opt('outside', draft.smoking, (v) => patchDraft({ smoking: v }), t('create.smokingOutside'))}
            </div>
          </Fieldset>
          <Fieldset legend={t('create.pets')}>
            <div className="flex gap-2">
              <ChoiceChip selected={draft.pets} onClick={() => patchDraft({ pets: true })}>{t('create.petsOk')}</ChoiceChip>
              <ChoiceChip selected={!draft.pets} onClick={() => patchDraft({ pets: false })}>{t('create.petsNo')}</ChoiceChip>
            </div>
          </Fieldset>
          <Fieldset legend={t('create.quiet')}>
            <div className="flex flex-wrap gap-2">
              {['20:00-08:00', '21:00-07:00', '22:00-06:00'].map((q) => opt(q, draft.quiet, (v) => patchDraft({ quiet: v }), q.replace('-', ' – ')))}
            </div>
          </Fieldset>
          <Fieldset legend={t('create.guests')}>
            <div className="flex flex-wrap gap-2">
              {opt('ask', draft.guests, (v) => patchDraft({ guests: v }), t('create.guestsAsk'))}
              {opt('sometimes', draft.guests, (v) => patchDraft({ guests: v }), t('create.guestsSome'))}
              {opt('no', draft.guests, (v) => patchDraft({ guests: v }), t('create.guestsNo'))}
            </div>
          </Fieldset>
          <Fieldset legend={t('create.gender')}>
            <div className="flex flex-wrap gap-2">
              {opt('any', draft.gender, (v) => patchDraft({ gender: v }), t('create.genderAny'))}
              {opt('women', draft.gender, (v) => patchDraft({ gender: v }), t('create.genderWomen'))}
              {opt('men', draft.gender, (v) => patchDraft({ gender: v }), t('create.genderMen'))}
            </div>
          </Fieldset>
        </>
      )}

      <div className="flex gap-3 pt-2">
        {step > 0 && <Button variant="secondary" block={false} icon={<ArrowLeft size={20} aria-hidden />} onClick={() => setDraftStep(step - 1)}>{t('common.back')}</Button>}
        {step < 2 ? (
          <Button icon={<ArrowRight size={20} aria-hidden />} onClick={() => setDraftStep(step + 1)}>{t('common.next')}</Button>
        ) : (
          <Button icon={<ArrowRight size={20} aria-hidden />} onClick={() => { setDraftStep(0); nav('/host/help') }}>{t('create.toHelp')}</Button>
        )}
      </div>
    </Screen>
  )
}
