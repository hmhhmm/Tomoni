import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, CheckCircle2, Pencil } from 'lucide-react'
import { Screen } from '../../components/Screen'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { StepBar } from '../../components/StepBar'
import { HourMeter } from '../../components/HourMeter'
import { FictionalTag } from '../../components/Misc'
import { Avatar } from '../../components/Avatar'
import { useStore, totalHours } from '../../store'
import { useL } from '../../lib/hooks'
import { AREAS } from '../../data/seed'
import { HELP_ICONS } from '../../lib/helps'

export function HostHome() {
  const { t } = useTranslation()
  const l = useL()
  const nav = useNavigate()
  const { stage, helps, draft, tasks, confirmTask, applicants, activeApplicant, trialWeeks } = useStore()
  const area = AREAS.find((a) => a.id === draft.areaId)!
  const pending = tasks.filter((x) => x.status === 'pending')
  const idx = { meet: 0, trial: 1, pact: 2, living: 3, ended: 0 }[stage]
  const applicant = applicants.find((a) => a.id === activeApplicant)!
  const next = {
    meet: { label: t('host.next.meet'), to: '/host/applicants' },
    trial: { label: t('host.next.trial'), to: '/trial' },
    pact: { label: t('host.next.pact'), to: '/pact' },
    living: { label: t('host.next.living'), to: '/host/checkin' },
    ended: { label: t('host.next.ended'), to: '/host/applicants' },
  }[stage]

  return (
    <Screen title={t('host.hello', { name: t('names.sato') })} lede={t('host.homeLede')} footer>
      <div className="flex items-center gap-2"><FictionalTag /><span className="text-sm text-muted">{t('host.fictionalNote')}</span></div>

      <Card>
        <p className="mb-3 font-heading text-lg font-semibold">{t('host.journey')}</p>
        <StepBar steps={[t('steps.meet'), t('steps.trial'), t('steps.pact'), t('steps.living')]} current={idx} />
        {stage === 'trial' && <p className="mt-3 text-base text-muted">{t('host.trialDay', { n: 3, total: trialWeeks * 7 })}</p>}
        {stage === 'ended' && <p className="mt-3 text-base text-muted">{t('host.endedNote')}</p>}
        <Button className="mt-4" icon={<ArrowRight size={20} aria-hidden />} onClick={() => nav(next.to)}>{next.label}</Button>
      </Card>

      {pending.length > 0 && (
        <Card tone="teal">
          <p className="font-heading text-lg font-semibold">{t('host.toConfirm')}</p>
          <ul className="mt-2 space-y-2">
            {pending.map((p) => {
              const Icon = HELP_ICONS[p.help]
              return (
                <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-white p-3">
                  <Icon size={24} aria-hidden className="text-teal-700" />
                  <span className="flex-1 text-base font-medium">{t(`help.${p.help}.title`)} · {p.hours}h · {applicant.name}</span>
                  <Button block={false} variant="teal" icon={<CheckCircle2 size={20} aria-hidden />} onClick={() => confirmTask(p.id)}>{t('host.confirm')}</Button>
                </li>
              )
            })}
          </ul>
        </Card>
      )}

      <Card>
        <div className="flex items-start gap-3">
          <Avatar hue={262} size={56} label={t('names.sato')} />
          <div className="flex-1">
            <p className="font-heading text-lg font-semibold">{t('host.yourRoom')}</p>
            <p className="text-base text-muted">{l(area)} · {draft.sizeJo} {t('create.jo')} · ¥{draft.homeshareRent.toLocaleString()}</p>
          </div>
        </div>
        <Button variant="secondary" className="mt-3" icon={<Pencil size={18} aria-hidden />} onClick={() => nav('/host/create')}>{t('host.editListing')}</Button>
      </Card>

      <Card>
        <HourMeter value={totalHours(helps)} />
        <ul className="mt-3 flex flex-wrap gap-2">
          {Object.entries(helps).map(([id, h]) => (
            <li key={id} className="rounded-full bg-purple-50 px-3 py-1 text-base text-purple-700">{t(`help.${id}.title`)} · {h}h</li>
          ))}
        </ul>
        <Button variant="secondary" className="mt-3" icon={<Pencil size={18} aria-hidden />} onClick={() => nav('/host/help')}>{t('host.editHelp')}</Button>
      </Card>
    </Screen>
  )
}
