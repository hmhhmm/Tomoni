import { useTranslation } from 'react-i18next'
import { Heart } from 'lucide-react'
import { Page, EmptyState } from '../../components/domain/Bits'
import { ListingCard } from '../../components/domain/ListingCard'
import { LinkButton } from '../../components/ui/Button'
import { useStore } from '../../store'
import { useListings } from '../../lib/listings'

export function Saved() {
  const { t } = useTranslation()
  const saved = useStore((s) => s.saved)
  const items = useListings().filter((l) => saved.includes(l.id))
  return (
    <Page className="py-8">
      <h1 className="mb-6 text-[1.75rem] font-semibold">{t('saved.title')}</h1>
      {items.length === 0 ? (
        <EmptyState
          icon={<Heart size={26} aria-hidden />}
          title={t('saved.emptyTitle')}
          body={t('saved.emptyBody')}
          action={
            <LinkButton to="/explore" variant="dark">
              {t('saved.explore')}
            </LinkButton>
          }
        />
      ) : (
        <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((l) => (
            <ListingCard key={l.id} l={l} />
          ))}
        </div>
      )}
    </Page>
  )
}
