import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Flag, Gauge, HeartPulse, ShieldCheck, UserRound } from 'lucide-react'
import { Page, VerifiedBadge, FictionalTag } from '../../components/domain/Bits'
import { Avatar } from '../../components/ui/Avatar'
import { Pill } from '../../components/ui/Chip'
import { Input, Field } from '../../components/ui/Field'
import { useStore } from '../../store'
import { toggle } from '../../lib/format'
import { HELP_ORDER } from '../../data/seed'
import { SLOTS } from '../../data/matching'
import type { HelpId, Slot } from '../../data/types'

export function Account() {
  const { t } = useTranslation()
  const { tenant, patchTenant, pulse } = useStore()
  return (
    <Page narrow className="py-8">
      <div className="mb-8 flex items-center gap-4">
        <Avatar hue={172} size={72} label={tenant.name} />
        <div>
          <h1 className="text-[1.75rem] font-semibold leading-tight">{tenant.name}</h1>
          <p className="text-base text-muted">{t(`onb.res.${tenant.residence}`)}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <VerifiedBadge verified={tenant.idDone} />
            <FictionalTag />
          </div>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {[
          {
            to: '/account/verify',
            icon: ShieldCheck,
            title: t('account.verify'),
            sub: tenant.verifyStep >= 4 ? t('account.verified') : t('account.inProgress'),
          },
          { to: '/log', icon: Gauge, title: t('account.tracker'), sub: t('account.trackerSub') },
          { to: '/pulse', icon: HeartPulse, title: t('account.pulse'), sub: pulse ? t('account.pulseDone') : t('account.pulseSub') },
          { to: '/safety?report=1', icon: Flag, title: t('account.report'), sub: t('account.reportSub') },
        ].map((r) => (
          <li key={r.to}>
            <Link to={r.to} className="flex h-full items-center gap-4 rounded-card border border-line p-5 transition hover:shadow-lift">
              <r.icon size={26} aria-hidden />
              <span className="flex-1">
                <span className="block text-base font-semibold">{r.title}</span>
                <span className="block text-sm text-muted">{r.sub}</span>
              </span>
              <ChevronRight size={18} aria-hidden className="text-muted" />
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-10 space-y-6 rounded-card border border-line p-6" aria-labelledby="prof">
        <h2 id="prof" className="flex items-center gap-2 text-xl font-semibold">
          <UserRound size={20} aria-hidden />
          {t('account.profile')}
        </h2>
        <Field label={t('onb.name')} htmlFor="nm">
          <Input id="nm" value={tenant.name} onChange={(e) => patchTenant({ name: e.target.value })} />
        </Field>
        <div>
          <p className="mb-1 text-sm font-semibold">{t('account.skills')}</p>
          <p className="mb-3 text-sm text-muted">{t('account.skillsHint')}</p>
          <div className="flex flex-wrap gap-2">
            {HELP_ORDER.map((h: HelpId) => (
              <Pill key={h} selected={tenant.skills.includes(h)} onClick={() => patchTenant({ skills: toggle(tenant.skills, h) })}>
                {t(`help.${h}.title`)}
              </Pill>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 text-sm font-semibold">{t('account.availability')}</p>
          <p className="mb-3 text-sm text-muted">{t('account.availabilityHint')}</p>
          <div className="flex flex-wrap gap-2">
            {SLOTS.map((s: Slot) => (
              <Pill key={s} selected={tenant.availability.includes(s)} onClick={() => patchTenant({ availability: toggle(tenant.availability, s) })}>
                {t(`slot.${s}`)}
              </Pill>
            ))}
          </div>
        </div>
      </section>
    </Page>
  )
}
