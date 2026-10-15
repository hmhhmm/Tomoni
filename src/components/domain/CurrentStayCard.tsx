import { useTranslation } from 'react-i18next'
import { ArrowRight, CalendarCheck, FileSignature, ListChecks, MessageCircle } from 'lucide-react'
import { LinkButton } from '../ui/Button'
import { Photo } from '../ui/Photo'
import { Chip } from '../ui/Chip'
import { useStore, trialDay, weekHours } from '../../store'
import { MEET_SLOTS } from '../../data/journey'
import { formatDayTime } from '../../lib/format'
import { RULES, SATO_HUE } from '../../tokens'

/** Aisyah has (or is about to have) a room with Mrs Sato. */
export const useHasStay = () =>
  useStore(
    (s) => s.match.applicantId === 'a1' && (['trial', 'pact', 'living'].includes(s.match.stage) || (s.match.stage === 'meet' && !!s.match.meetSlot)),
  )

/** Aisyah is living there or on a trial: Stay and Task log come first. */
export const useLivesThere = () => useStore((s) => s.match.applicantId === 'a1' && ['trial', 'pact', 'living'].includes(s.match.stage))

/** Full-width card at the top of Explore: her current stay and the one thing to do next. */
export function CurrentStayCard() {
  const { t } = useTranslation()
  const { match, tasks, lang } = useStore()
  const has = useHasStay()
  if (!has) return null

  const slot = MEET_SLOTS.find((s) => s.id === match.meetSlot)
  const hours = weekHours(tasks, false)
  const next = (() => {
    if (match.stage === 'meet' && !match.meetConfirmed)
      return {
        line: t('myStay.meetConfirm', { when: slot ? formatDayTime(slot.date(), lang) : '' }),
        to: '/aisha/messages/l1',
        label: t('myStay.confirmMeet'),
        icon: CalendarCheck,
      }
    if (match.stage === 'meet')
      return {
        line: t('myStay.meetOn', { when: slot ? formatDayTime(slot.date(), lang) : '' }),
        to: '/aisha/stay',
        label: t('myStay.viewStay'),
        icon: ArrowRight,
      }
    if (match.stage === 'pact') return { line: t('myStay.pact'), to: '/aisha/agreement', label: t('myStay.openPact'), icon: FileSignature }
    if (match.stage === 'trial')
      return {
        line: t('myStay.trial', { n: trialDay(match), total: match.trialWeeks * 7 }),
        to: '/aisha/log',
        label: t('myStay.logToday'),
        icon: ListChecks,
      }
    return { line: t('myStay.living', { h: hours, max: RULES.weeklyHourCap }), to: '/aisha/log', label: t('myStay.logToday'), icon: ListChecks }
  })()

  return (
    <section aria-labelledby="my-stay" className="overflow-hidden rounded-sheet border border-line bg-white shadow-lift sm:flex">
      <div className="aspect-[16/7] sm:aspect-auto sm:w-64 sm:shrink-0">
        <Photo hue={SATO_HUE} scene="room" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Chip tone="brand">{t(`myStay.stage.${match.stage}`)}</Chip>
          <span className="text-sm text-muted">{t('myStay.where')}</span>
        </div>
        <h2 id="my-stay" className="text-xl font-semibold leading-tight">
          {t('myStay.title', { name: t('names.sato') })}
        </h2>
        <p className="text-base">{next.line}</p>
        <div className="mt-auto flex flex-wrap gap-2">
          <LinkButton to={next.to} variant="primary" icon={<next.icon size={18} aria-hidden />}>
            {next.label}
          </LinkButton>
          {next.to !== '/aisha/stay' && (
            <LinkButton to="/aisha/stay" variant="secondary">
              {t('myStay.viewStay')}
            </LinkButton>
          )}
          <LinkButton to="/aisha/messages/l1" variant="ghost" icon={<MessageCircle size={18} aria-hidden />}>
            {t('myStay.message', { name: t('names.sato') })}
          </LinkButton>
        </div>
      </div>
    </section>
  )
}
