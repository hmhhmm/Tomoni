import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Camera, Check, IdCard, Loader2, ShieldCheck } from 'lucide-react'
import { Wizard, Section } from '../../components/layout/Wizard'
import { Pill } from '../../components/ui/Chip'
import { Button } from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Field'
import { Notice } from '../../components/domain/Bits'
import { companionOnly, useStore } from '../../store'
import { toggle } from '../../lib/format'
import type { LangCode, Residence } from '../../data/types'
import { RULES } from '../../tokens'

const LANGS: LangCode[] = ['ms', 'en', 'ja', 'vi', 'tl', 'hi', 'zh']
const REFS = ['advisor', 'landlord', 'teacher']
export function Verify() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { tenant, patchTenant } = useStore()
  const step = Math.min(tenant.verifyStep, 3)
  const [scan, setScan] = useState(tenant.idDone ? 3 : 0)
  const done = tenant.verifyStep >= 4

  useEffect(() => {
    if (scan === 0 || scan >= 3) return
    const id = setTimeout(() => setScan((s) => s + 1), 1300)
    return () => clearTimeout(id)
  }, [scan])
  useEffect(() => {
    if (scan === 3 && !tenant.idDone) patchTenant({ idDone: true })
  }, [scan, tenant.idDone, patchTenant])

  if (done) {
    return (
      <Wizard
        step={3}
        total={4}
        title={t('onb.doneTitle')}
        lede={t('onb.doneLede')}
        exitTo="/aisha/account"
        onNext={() => nav('/aisha/explore')}
        nextLabel={t('onb.browse')}
      >
        {tenant.residence === 'student' && tenant.workPermit && (
          <Notice tone="brand" title={t('onb.trackerTitle')}>
            {t('onb.trackerBody', { n: RULES.studentWeeklyLimit })}
          </Notice>
        )}
        {companionOnly(tenant) && (
          <Notice tone="teal" title={t('onb.companionTitle')}>
            {t('onb.companionBody')}
          </Notice>
        )}
        <Button
          variant="secondary"
          onClick={() => {
            patchTenant({ verifyStep: 0, idDone: false, idConsent: false })
            setScan(0)
          }}
        >
          {t('onb.again')}
        </Button>
      </Wizard>
    )
  }

  const next = () => patchTenant({ verifyStep: tenant.verifyStep + 1 })
  const back = step > 0 ? () => patchTenant({ verifyStep: tenant.verifyStep - 1 }) : undefined
  const titles = [t('onb.s1'), t('onb.s2'), t('onb.s3'), t('onb.s4')]
  const residences: { id: Residence; key: string }[] = [
    { id: 'student', key: 'student' },
    { id: 'resident', key: 'resident' },
    { id: 'limited', key: 'limited' },
  ]

  return (
    <Wizard
      step={step}
      total={4}
      title={titles[step]}
      lede={t('onb.lede')}
      exitTo="/aisha/account"
      onBack={back}
      onNext={next}
      nextLabel={step === 3 ? t('onb.finish') : t('common.next')}
      nextDisabled={(step === 0 && !tenant.name.trim()) || (step === 2 && scan !== 3 && !tenant.idDone) || (step === 3 && tenant.refs.length === 0)}
    >
      {step === 0 && (
        <>
          <Section title={t('onb.name')}>
            <Field label={t('onb.name')} htmlFor="vn">
              <Input id="vn" value={tenant.name} onChange={(e) => patchTenant({ name: e.target.value })} />
            </Field>
          </Section>
          <Section title={t('onb.langs')}>
            <div className="flex flex-wrap gap-2">
              {LANGS.map((l) => {
                const on = tenant.langs.some((x) => x.code === l)
                return (
                  <Pill
                    key={l}
                    selected={on}
                    onClick={() =>
                      patchTenant({ langs: on ? tenant.langs.filter((x) => x.code !== l) : [...tenant.langs, { code: l, level: 'conversational' }] })
                    }
                  >
                    {t(`langName.${l}`)}
                  </Pill>
                )
              })}
            </div>
          </Section>
        </>
      )}
      {step === 1 && (
        <div role="radiogroup" aria-label={t('onb.s2')} className="space-y-3">
          {residences.map((r) => (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={tenant.residence === r.id}
              onClick={() => patchTenant({ residence: r.id })}
              className={`w-full rounded-card border-2 p-5 text-left transition ${tenant.residence === r.id ? 'border-ink' : 'border-line hover:border-muted'}`}
            >
              <span className="block text-lg font-semibold">{t(`onb.res.${r.key}`)}</span>
              <span className="block text-base text-muted">{t(`onb.res.${r.key}Sub`)}</span>
            </button>
          ))}
          {tenant.residence === 'student' && (
            <label className="flex items-start gap-3 rounded-card border border-line p-4 text-base">
              <input
                type="checkbox"
                checked={tenant.workPermit}
                onChange={(e) => patchTenant({ workPermit: e.target.checked })}
                className="mt-1 h-5 w-5 accent-brand-600"
              />
              <span>
                <span className="block font-semibold">{t('onb.permit')}</span>
                <span className="block text-sm text-muted">{tenant.workPermit ? t('onb.permitYes') : t('onb.permitNo')}</span>
              </span>
            </label>
          )}
          <p className="text-sm text-muted">{t('onb.resNote')}</p>
        </div>
      )}
      {step === 2 && (
        <Section title={t('onb.idTitle')}>
          <div aria-live="polite">
            {scan === 0 && (
              <>
                <div className="flex items-center gap-3">
                  <IdCard size={32} aria-hidden className="text-brand-700" />
                  <p className="text-base">{t('onb.idBody')}</p>
                </div>
                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted">
                  <li>{t('onb.data1')}</li>
                  <li>{t('onb.data2')}</li>
                  <li>{t('onb.data3')}</li>
                </ul>
                <label className="mt-4 flex items-start gap-3 text-base">
                  <input
                    type="checkbox"
                    checked={tenant.idConsent}
                    onChange={(e) => patchTenant({ idConsent: e.target.checked })}
                    className="mt-1 h-5 w-5 accent-brand-600"
                  />
                  <span>{t('onb.consent')}</span>
                </label>
                <Button
                  className="mt-4"
                  variant="dark"
                  disabled={!tenant.idConsent}
                  icon={<Camera size={18} aria-hidden />}
                  onClick={() => setScan(1)}
                >
                  {t('onb.startId')}
                </Button>
              </>
            )}
            {scan > 0 && scan < 3 && (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-card bg-surface p-3 text-base">
                    {scan > i ? (
                      <Check size={20} className="text-teal-700" aria-hidden />
                    ) : scan === i ? (
                      <Loader2 size={20} className="animate-spin" aria-hidden />
                    ) : (
                      <span className="h-5 w-5" />
                    )}
                    {i === 1 ? t('onb.scanCard') : t('onb.scanSelfie')}
                  </div>
                ))}
              </div>
            )}
            {scan === 3 && (
              <Notice tone="teal" icon={<ShieldCheck size={22} aria-hidden className="text-teal-700" />} title={t('onb.idOk')}>
                {t('onb.idOkBody')}
              </Notice>
            )}
          </div>
          <p className="mt-4 text-sm text-muted">{t('onb.mock')}</p>
        </Section>
      )}
      {step === 3 && (
        <Section title={t('onb.refsTitle')} hint={t('onb.refsBody')}>
          <div className="flex flex-wrap gap-2">
            {REFS.map((r) => (
              <Pill key={r} selected={tenant.refs.includes(r)} onClick={() => patchTenant({ refs: toggle(tenant.refs, r) })}>
                {t(`onb.ref.${r}`)}
              </Pill>
            ))}
          </div>
        </Section>
      )}
    </Wizard>
  )
}
