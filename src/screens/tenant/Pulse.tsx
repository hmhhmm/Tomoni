import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { EyeOff, Flag, Check } from 'lucide-react'
import { Page, Notice } from '../../components/domain/Bits'
import { Button } from '../../components/ui/Button'
import { Pill } from '../../components/ui/Chip'
import { useStore } from '../../store'

const QS = ['q1', 'q2', 'q3'] as const
const OPTS = ['great', 'fine', 'notgreat'] as const

export function Pulse() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { pulse, setPulse } = useStore()
  const [ans, setAns] = useState<Record<string, string>>({})
  const ready = QS.every((q) => ans[q])
  return (
    <Page narrow className="py-8">
      <h1 className="text-[1.75rem] font-semibold">{t('pulse.title')}</h1>
      <p className="mt-1 text-base text-muted">{t('pulse.lede')}</p>
      <div className="mt-6 space-y-4">
        <Notice tone="brand" icon={<EyeOff size={20} aria-hidden className="text-brand-700" />} title={t('pulse.anon')}>
          {t('pulse.anonBody')}
        </Notice>
        {pulse ? (
          <Notice tone="teal" live icon={<Check size={20} aria-hidden className="text-teal-700" />} title={t('pulse.thanks')}>
            {t('pulse.thanksBody')}
          </Notice>
        ) : (
          <>
            {QS.map((q) => (
              <fieldset key={q} className="rounded-card border border-line p-5">
                <legend className="px-1 text-lg font-semibold">{t(`pulse.${q}`)}</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {OPTS.map((o) => (
                    <Pill key={o} selected={ans[q] === o} onClick={() => setAns({ ...ans, [q]: o })}>
                      {t(`pulse.${o}`)}
                    </Pill>
                  ))}
                </div>
              </fieldset>
            ))}
            <div className="flex justify-end">
              <Button variant="dark" size="lg" disabled={!ready} onClick={() => setPulse(ans)}>
                {t('pulse.send')}
              </Button>
            </div>
          </>
        )}
        <section className="rounded-card border border-line p-5">
          <h2 className="text-lg font-semibold">{t('pulse.concernTitle')}</h2>
          <p className="text-base text-muted">{t('pulse.concernBody')}</p>
          <Button className="mt-3" variant="secondary" icon={<Flag size={18} aria-hidden />} onClick={() => nav('/safety?report=1')}>
            {t('pulse.concern')}
          </Button>
        </section>
      </div>
    </Page>
  )
}
