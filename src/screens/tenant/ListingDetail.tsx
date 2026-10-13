import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Ban, Check, Lock, Send } from 'lucide-react'
import { Screen } from '../../components/Screen'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Chip } from '../../components/Chip'
import { HourMeter } from '../../components/HourMeter'
import { RoomArt } from '../../components/RoomArt'
import { Avatar } from '../../components/Avatar'
import { FictionalTag, VerifiedBadge, Notice } from '../../components/Misc'
import { useStore } from '../../store'
import { HELP_ICONS, HELP_ORDER } from '../../lib/helps'
import { useL, yen } from '../../lib/hooks'
import { useListings, listingHours } from './Browse'
import { APPLICANTS } from '../../data/seed'
import { RULES } from '../../tokens'

const SCENES = ['room', 'window', 'kitchen', 'garden'] as const

export function ListingDetail() {
  const { t } = useTranslation()
  const l = useL()
  const nav = useNavigate()
  const { id } = useParams()
  const listings = useListings()
  const x = listings.find((v) => v.id === id) ?? listings[0]
  const { applied, apply, draft, tenant } = useStore()
  const [intro, setIntro] = useState(APPLICANTS[0].intro.en)
  const [sentOther, setSentOther] = useState(false)
  const [slide, setSlide] = useState(0)
  const rail = useRef<HTMLUListElement>(null)
  const isSato = x.id === 'l1'
  const companionBlocked = tenant.residence === 'limited' && x.tier !== 'companionship'
  const hours = listingHours(x)
  const total = x.homeshareRent + RULES.membershipYen
  const rules = isSato
    ? [draft.smoking === 'no' ? t('create.smokingNo') : t('create.smokingOutside'), draft.pets ? t('create.petsOk') : t('create.petsNo'), `${t('create.quiet')}: ${draft.quiet.replace('-', ' – ')}`, `${t('create.guests')}: ${t(`create.guests${{ ask: 'Ask', sometimes: 'Some', no: 'No' }[draft.guests]}`)}`]
    : [t('create.smokingNo'), x.pets ? t('create.petsOk') : t('create.petsNo'), `${t('create.quiet')}: 21:00 – 07:00`, t('create.guestsAsk')]
  const applied_ = isSato ? applied : sentOther

  const go = (i: number) => {
    setSlide(i)
    rail.current?.children[i]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  return (
    <div className="pb-8">
      <div className="px-4 pt-3">
        <Button variant="ghost" block={false} icon={<ArrowLeft size={20} aria-hidden />} onClick={() => nav('/tenant/browse')}>{t('common.back')}</Button>
      </div>
      <div className="relative">
        <ul ref={rail} className="scroll-hide flex snap-x snap-mandatory overflow-x-auto" aria-label={t('detail.gallery')}>
          {SCENES.map((s, i) => (
            <li key={s} className="aspect-[16/10] w-full shrink-0 snap-center"><RoomArt hue={x.hue} scene={s} /><span className="sr-only">{i + 1}/4</span></li>
          ))}
        </ul>
        <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1">
          {SCENES.map((s, i) => (
            <button key={s} type="button" onClick={() => go(i)} aria-label={t('detail.photo', { n: i + 1 })} aria-current={slide === i}
              className="grid min-h-12 min-w-6 place-items-center"><span className={`h-2.5 w-2.5 rounded-full ${slide === i ? 'bg-purple-600' : 'bg-white/90 ring-1 ring-line'}`} /></button>
          ))}
        </div>
      </div>

      <div className="space-y-4 px-4 pt-4">
        <div>
          <h1 className="text-[1.6rem] font-semibold leading-tight">{l(x.area)} · {t('detail.room', { n: x.sizeJo })}</h1>
          <p className="text-base text-muted">{l(x.station)}</p>
        </div>

        <Card>
          <div className="flex items-center gap-3">
            <Avatar hue={x.hue} size={60} label={l(x.hostName)} />
            <div>
              <p className="font-heading text-lg font-semibold">{l(x.hostName)}, {x.hostAge}</p>
              <div className="mt-1 flex flex-wrap gap-1.5"><VerifiedBadge /><FictionalTag /></div>
            </div>
          </div>
          <p className="mt-3 text-base">{l(x.bio)}</p>
        </Card>

        <Card>
          <h2 className="font-heading text-lg font-semibold">{t('detail.helpRequested')}</h2>
          {x.tier === 'companionship' && <p className="mt-1 text-base text-muted">{t('detail.noPact')}</p>}
          <ul className="mt-3 space-y-2">
            {HELP_ORDER.filter((h) => x.helps[h] !== undefined).map((h) => {
              const Icon = HELP_ICONS[h]
              return (
                <li key={h} className="flex items-center gap-3 rounded-2xl bg-purple-50 px-3 py-2 text-base">
                  <Icon size={22} aria-hidden className="text-purple-700" />
                  <span className="flex-1 font-medium">{t(`help.${h}.title`)}</span>
                  <span className="font-semibold text-purple-700">{t('help.hoursPerWeek', { n: x.helps[h] })}</span>
                </li>
              )
            })}
            {hours === 0 && <li className="text-base text-muted">{t('detail.noHelp')}</li>}
          </ul>
          <div className="mt-4"><HourMeter value={hours} compact /></div>
        </Card>

        <Card tone="rose">
          <h2 className="flex items-center gap-2 font-heading text-lg font-semibold"><Ban size={20} aria-hidden /> {t('help.notIncluded')}</h2>
          <ul className="mt-2 space-y-1.5">
            {(['bathing', 'toileting', 'feeding', 'medical', 'money', 'inkan'] as const).map((b) => (
              <li key={b} className="flex items-center gap-2 text-base"><Lock size={16} aria-hidden className="shrink-0 text-rose-700" />{t(`banned.${b}`)}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-heading text-lg font-semibold">{t('detail.rules')}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-base">{rules.map((r) => <li key={r}>{r}</li>)}</ul>
        </Card>

        <Card tone="teal">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">{t('detail.cost')}</h2>
            <Chip tone="amber">{t('common.examplePrice')}</Chip>
          </div>
          <dl className="mt-3 space-y-2 text-base">
            <div className="flex justify-between"><dt>{t('detail.rent')}</dt><dd className="font-semibold">{yen(x.homeshareRent)}</dd></div>
            <div className="flex justify-between"><dt>{t('detail.membership')}</dt><dd className="font-semibold">{yen(RULES.membershipYen)}</dd></div>
            <div className="flex justify-between border-t border-teal-100 pt-2 font-heading text-lg font-semibold"><dt>{t('detail.total')}</dt><dd>{yen(total)}</dd></div>
          </dl>
          <p className="mt-2 text-base text-muted">{t('detail.vs', { std: yen(x.standardRent), save: yen(x.standardRent - total) })}</p>
        </Card>

        {companionBlocked && <Notice tone="amber" title={t('detail.blockedTitle')}>{t('detail.blockedBody')}</Notice>}

        <Card tone="purple">
          <h2 className="font-heading text-lg font-semibold">{t('detail.apply')}</h2>
          {applied_ ? (
            <div role="status">
              <p className="mt-2 flex items-center gap-2 text-base font-medium text-teal-700"><Check size={20} aria-hidden /> {t('detail.applied')}</p>
              {isSato && <Button className="mt-3" onClick={() => nav('/chat')}>{t('detail.openChat')}</Button>}
            </div>
          ) : (
            <>
              <label htmlFor="intro" className="mt-1 block text-base text-muted">{t('detail.introLabel')}</label>
              <textarea id="intro" rows={4} value={intro} onChange={(e) => setIntro(e.target.value)} disabled={companionBlocked}
                className="mt-2 w-full rounded-input border border-line bg-white p-3 text-base" />
              <Button className="mt-3" icon={<Send size={20} aria-hidden />} disabled={companionBlocked || !intro.trim()}
                onClick={() => { if (isSato) { apply(intro); nav('/chat') } else setSentOther(true) }}>
                {t('detail.send')}
              </Button>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
