import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check, EyeOff } from 'lucide-react'
import { Screen } from '../../components/Screen'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Avatar } from '../../components/Avatar'
import { FictionalTag } from '../../components/Misc'
import { useStore } from '../../store'

export function FamilyInvite() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const { setFamilyConsent, setRole } = useStore()
  return (
    <Screen title={t('invite.title')} lede={t('invite.lede', { host: t('names.sato') })} footer>
      <Card className="flex items-center gap-3">
        <Avatar hue={262} size={56} label={t('names.sato')} />
        <div><p className="font-heading text-lg font-semibold">{t('names.sato')}</p><FictionalTag /></div>
      </Card>
      <Card tone="teal">
        <h2 className="font-heading text-lg font-semibold">{t('invite.seeTitle')}</h2>
        <ul className="mt-2 space-y-2">
          {['a', 'b', 'c'].map((k) => <li key={k} className="flex gap-2 text-base"><Check size={20} aria-hidden className="mt-0.5 shrink-0 text-teal-700" />{t(`invite.seeItems.${k}`)}</li>)}
        </ul>
      </Card>
      <Card tone="rose">
        <h2 className="font-heading text-lg font-semibold">{t('invite.neverTitle')}</h2>
        <ul className="mt-2 space-y-2">
          {['a', 'b'].map((k) => <li key={k} className="flex gap-2 text-base"><EyeOff size={20} aria-hidden className="mt-0.5 shrink-0 text-rose-700" />{t(`invite.neverItems.${k}`)}</li>)}
        </ul>
      </Card>
      <p className="text-base text-muted">{t('invite.revoke')}</p>
      <Button onClick={() => { setFamilyConsent(true); nav('/family/dashboard') }}>{t('invite.accept')}</Button>
      <Button variant="secondary" onClick={() => { setRole(null); nav('/') }}>{t('invite.decline')}</Button>
    </Screen>
  )
}
