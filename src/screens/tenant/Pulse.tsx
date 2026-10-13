import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { EyeOff, Flag, Check } from 'lucide-react'
import { Screen } from '../../components/Screen'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { ChoiceChip } from '../../components/Chip'
import { Notice } from '../../components/Misc'
import { useStore } from '../../store'

const QS = ['q1', 'q2', 'q3'] as const
const OPTS = ['great', 'fine', 'notgreat'] as const

export function Pulse() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { pulseDone, setPulseDone } = useStore()
  const [ans, setAns] = useState<Record<string, string>>({})
  const ready = QS.every((q) => ans[q])

  return (
    <Screen title={t('pulse.title')} lede={t('pulse.lede')} footer>
      <Notice tone="purple" icon={<EyeOff size={22} className="text-purple-700" aria-hidden />} title={t('pulse.anon')}>{t('pulse.anonBody')}</Notice>
      {pulseDone ? (
        <Notice tone="teal" live icon={<Check size={22} className="text-teal-700" aria-hidden />} title={t('pulse.thanks')}>{t('pulse.thanksBody')}</Notice>
      ) : (
        <>
          {QS.map((q) => (
            <Card key={q}>
              <fieldset>
                <legend className="font-heading text-lg font-semibold">{t(`pulse.${q}`)}</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {OPTS.map((o) => <ChoiceChip key={o} selected={ans[q] === o} onClick={() => setAns({ ...ans, [q]: o })}>{t(`pulse.${o}`)}</ChoiceChip>)}
                </div>
              </fieldset>
            </Card>
          ))}
          <Button disabled={!ready} onClick={setPulseDone}>{t('pulse.send')}</Button>
        </>
      )}
      <Card tone="amber">
        <p className="font-heading text-lg font-semibold">{t('pulse.concernTitle')}</p>
        <p className="text-base">{t('pulse.concernBody')}</p>
        <Button className="mt-3" variant="secondary" icon={<Flag size={20} aria-hidden />} onClick={() => nav('/safety?report=1')}>{t('pulse.concern')}</Button>
      </Card>
    </Screen>
  )
}
