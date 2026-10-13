import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { CalendarClock, Check, MessageCircle, Undo2 } from 'lucide-react'
import { Screen } from '../../components/Screen'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { Avatar } from '../../components/Avatar'
import { FictionalTag, VerifiedBadge, Notice } from '../../components/Misc'
import { useStore } from '../../store'
import { useL } from '../../lib/hooks'

export function Applicants() {
  const { t } = useTranslation()
  const l = useL()
  const nav = useNavigate()
  const { applicants, setApplicantStatus, setActive } = useStore()

  return (
    <Screen title={t('people.title')} lede={t('people.lede')} footer>
      <Notice tone="purple" title={t('people.control')}>{t('people.controlBody')}</Notice>
      <ul className="space-y-4">
        {applicants.map((a, i) =>
          a.status === 'declined' ? (
            <li key={a.id}>
              <Card className="flex items-center gap-3">
                <Avatar hue={a.hue} size={44} label={a.name} />
                <p className="flex-1 text-base text-muted">{t('people.declined', { name: a.name })}</p>
                <Button variant="ghost" block={false} icon={<Undo2 size={18} aria-hidden />} onClick={() => setApplicantStatus(a.id, 'new')}>{t('common.undo')}</Button>
              </Card>
            </li>
          ) : (
            <motion.li key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.2 }}>
              <Card className="!p-5">
                <div className="flex items-start gap-4">
                  <Avatar hue={a.hue} size={72} label={`${a.name}, illustrated avatar`} />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-semibold leading-tight">{a.name}, {a.age}</h2>
                    <p className="text-base text-muted">{l(a.country)} · {l(a.occupation)}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5"><VerifiedBadge verified={a.verified} /><FictionalTag /></div>
                  </div>
                </div>
                <dl className="mt-4 space-y-3 text-base">
                  <div><dt className="font-semibold">{t('people.languages')}</dt><dd className="text-muted">{l(a.languages)}</dd></div>
                  <div><dt className="font-semibold">{t('people.skills')}</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">{a.skills.map((s) => <Chip key={s.en} tone="purple">{l(s)}</Chip>)}</dd></div>
                  <div><dt className="flex items-center gap-1.5 font-semibold"><CalendarClock size={18} aria-hidden /> {t('people.availability')}</dt><dd className="text-muted">{l(a.availability)}</dd></div>
                  <div><dt className="font-semibold">{t('people.whyMatch')}</dt>
                    <dd><ul className="mt-1 space-y-1">{a.reasons.map((r) => (
                      <li key={r.en} className="flex items-center gap-2"><Check size={18} aria-hidden className="shrink-0 text-teal-700" />{l(r)}</li>
                    ))}</ul></dd></div>
                </dl>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Button icon={<MessageCircle size={20} aria-hidden />}
                    onClick={() => { setActive(a.id); setApplicantStatus(a.id, 'meeting'); nav('/chat') }}>
                    {a.status === 'meeting' ? t('people.continue') : t('people.meet')}
                  </Button>
                  <Button variant="secondary" onClick={() => setApplicantStatus(a.id, 'declined')}>{t('people.notNow')}</Button>
                </div>
              </Card>
            </motion.li>
          ),
        )}
      </ul>
    </Screen>
  )
}
