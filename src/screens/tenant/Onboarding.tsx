import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Camera, IdCard, ShieldCheck, Loader2, Check } from 'lucide-react'
import { Screen } from '../../components/Screen'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { ChoiceChip } from '../../components/Chip'
import { StepBar } from '../../components/StepBar'
import { Notice, FictionalTag, VerifiedBadge } from '../../components/Misc'
import { Avatar } from '../../components/Avatar'
import { useStore } from '../../store'
import type { Residence } from '../../data/types'
import { RULES } from '../../tokens'

const LANGS = ['ms', 'en', 'ja', 'vi', 'tl', 'zh']
const REFS = ['advisor', 'landlord', 'teacher']

export function Onboarding() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { tenant, patchTenant } = useStore()
  const step = tenant.verifyStep
  const [scan, setScan] = useState(0) // 0 idle, 1 card, 2 selfie, 3 success
  const steps = [t('onb.s1'), t('onb.s2'), t('onb.s3'), t('onb.s4')]

  useEffect(() => {
    if (scan === 0 || scan >= 3) return
    const id = setTimeout(() => setScan((s) => s + 1), 1300)
    return () => clearTimeout(id)
  }, [scan])
  useEffect(() => { if (scan === 3) patchTenant({ idDone: true }) }, [scan, patchTenant])

  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
  const residences: { id: Residence; key: string }[] = [
    { id: 'student', key: 'student' }, { id: 'resident', key: 'resident' }, { id: 'limited', key: 'limited' },
  ]

  if (step >= 4) {
    return (
      <Screen title={t('onb.doneTitle')} lede={t('onb.doneLede')} footer>
        <Card className="flex items-center gap-4">
          <Avatar hue={172} size={64} label={tenant.name} />
          <div>
            <p className="font-heading text-xl font-semibold">{tenant.name}, 22</p>
            <div className="mt-1 flex flex-wrap gap-1.5"><VerifiedBadge /><FictionalTag /></div>
          </div>
        </Card>
        {tenant.residence === 'student' && <Notice tone="purple" title={t('onb.trackerTitle')}>{t('onb.trackerBody', { n: RULES.studentWeeklyLimit })}</Notice>}
        {tenant.residence === 'limited' && <Notice tone="teal" title={t('onb.companionTitle')}>{t('onb.companionBody')}</Notice>}
        <Button icon={<ArrowRight size={20} aria-hidden />} onClick={() => nav('/tenant/browse')}>{t('onb.browse')}</Button>
        <Button variant="secondary" onClick={() => { patchTenant({ verifyStep: 0, idDone: false }); setScan(0) }}>{t('onb.again')}</Button>
      </Screen>
    )
  }

  return (
    <Screen title={t('onb.title')} lede={t('create.step', { n: step + 1, total: 4, name: steps[step] })} footer>
      <StepBar steps={steps} current={step} variant="progress" />

      {step === 0 && (
        <Card>
          <label htmlFor="nm" className="font-heading text-lg font-semibold">{t('onb.name')}</label>
          <input id="nm" value={tenant.name} onChange={(e) => patchTenant({ name: e.target.value })} className="mt-2 min-h-12 w-full rounded-input border border-line bg-bg px-4 text-base" />
          <p className="mb-2 mt-5 font-heading text-lg font-semibold">{t('onb.langs')}</p>
          <div className="flex flex-wrap gap-2">
            {LANGS.map((l) => <ChoiceChip key={l} selected={tenant.languages.includes(l)} onClick={() => patchTenant({ languages: toggle(tenant.languages, l) })}>{t(`langName.${l}`)}</ChoiceChip>)}
          </div>
        </Card>
      )}

      {step === 1 && (
        <div role="radiogroup" aria-label={t('onb.s2')} className="space-y-3">
          {residences.map((r) => (
            <button
              key={r.id} type="button" role="radio" aria-checked={tenant.residence === r.id} onClick={() => patchTenant({ residence: r.id })}
              className={`w-full rounded-card border-2 bg-white p-4 text-left shadow-soft ${tenant.residence === r.id ? 'border-purple-600' : 'border-line'}`}
            >
              <span className="block font-heading text-lg font-semibold">{t(`onb.res.${r.key}`)}</span>
              <span className="block text-base text-muted">{t(`onb.res.${r.key}Sub`)}</span>
            </button>
          ))}
          <p className="text-sm text-muted">{t('onb.resNote')}</p>
        </div>
      )}

      {step === 2 && (
        <Card>
          <div aria-live="polite">
            {scan === 0 && (
              <>
                <div className="flex items-center gap-3"><IdCard size={32} aria-hidden className="text-purple-700" /><p className="text-base">{t('onb.idBody')}</p></div>
                <Button className="mt-4" icon={<Camera size={20} aria-hidden />} onClick={() => setScan(1)}>{t('onb.startId')}</Button>
              </>
            )}
            {scan > 0 && scan < 3 && (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-2xl bg-bg p-3 text-base">
                    {scan > i ? <Check size={22} className="text-teal-700" aria-hidden /> : scan === i ? <Loader2 size={22} className="animate-spin text-purple-700" aria-hidden /> : <span className="h-[22px] w-[22px]" />}
                    {i === 1 ? t('onb.scanCard') : t('onb.scanSelfie')}
                  </div>
                ))}
              </div>
            )}
            {scan === 3 && (
              <Notice tone="teal" icon={<ShieldCheck size={24} className="text-teal-700" aria-hidden />} title={t('onb.idOk')}>{t('onb.idOkBody')}</Notice>
            )}
          </div>
          <p className="mt-3 text-sm text-muted">{t('onb.mock')}</p>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <p className="mb-2 font-heading text-lg font-semibold">{t('onb.refsTitle')}</p>
          <p className="mb-3 text-base text-muted">{t('onb.refsBody')}</p>
          <div className="flex flex-wrap gap-2">
            {REFS.map((r) => <ChoiceChip key={r} selected={tenant.refs.includes(r)} onClick={() => patchTenant({ refs: toggle(tenant.refs, r) })}>{t(`onb.ref.${r}`)}</ChoiceChip>)}
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        {step > 0 && <Button variant="secondary" block={false} onClick={() => patchTenant({ verifyStep: step - 1 })}>{t('common.back')}</Button>}
        <Button
          icon={<ArrowRight size={20} aria-hidden />}
          disabled={(step === 2 && scan !== 3 && !tenant.idDone) || (step === 3 && tenant.refs.length === 0)}
          onClick={() => patchTenant({ verifyStep: step + 1 })}
        >
          {step === 3 ? t('onb.finish') : t('common.next')}
        </Button>
      </div>
    </Screen>
  )
}
