import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Wordmark } from './Wordmark'

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="mt-16 border-t border-soft bg-surface pb-24 lg:pb-10">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10 xl:px-20">
        <div>
          <Wordmark />
          <p className="mt-3 max-w-sm text-base text-muted">{t('footer.tag')}</p>
        </div>
        <div>
          <h2 className="text-base font-semibold">{t('footer.support')}</h2>
          <ul className="mt-3 space-y-2 text-base text-muted">
            <li>
              <Link className="hover:text-ink hover:underline" to="/safety">
                {t('footer.safety')}
              </Link>
            </li>
            <li>
              <Link className="hover:text-ink hover:underline" to="/safety?report=1">
                {t('footer.report')}
              </Link>
            </li>
            <li>
              <Link className="hover:text-ink hover:underline" to="/coordinator">
                {t('footer.coordinator')}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-base font-semibold">{t('footer.rules')}</h2>
          <ul className="mt-3 space-y-2 text-base text-muted">
            <li>{t('footer.r1')}</li>
            <li>{t('footer.r2')}</li>
            <li>{t('footer.r3')}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-soft">
        <p className="mx-auto max-w-[1440px] px-4 py-4 text-sm text-muted sm:px-6 lg:px-10 xl:px-20">
          {t('common.concept')} {t('footer.fictional')}
        </p>
      </div>
    </footer>
  )
}
