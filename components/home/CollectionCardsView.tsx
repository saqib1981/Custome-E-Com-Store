'use client'

import Link from 'next/link'
import type { CollectionCardsConfig, ResolvedCollectionCard } from '@/lib/collection-cards'

type CollectionCardsViewProps = {
  config: CollectionCardsConfig
  cards: ResolvedCollectionCard[]
  preview?: boolean
  onPreviewNavigate?: (path: string) => void
}

function CollectionCardLink({
  card,
  preview,
  onPreviewNavigate,
  children,
}: {
  card: ResolvedCollectionCard
  preview?: boolean
  onPreviewNavigate?: (path: string) => void
  children: React.ReactNode
}) {
  if (!card.href) return <div className="block">{children}</div>

  if (preview && onPreviewNavigate) {
    return (
      <button
        type="button"
        onClick={() => onPreviewNavigate(card.href)}
        className="group block w-full text-left"
      >
        {children}
      </button>
    )
  }

  return (
    <Link href={card.href} className="group block w-full">
      {children}
    </Link>
  )
}

function CollectionCardItem({
  card,
  titlePosition,
  preview,
  onPreviewNavigate,
}: {
  card: ResolvedCollectionCard
  titlePosition: CollectionCardsConfig['titlePosition']
  preview?: boolean
  onPreviewNavigate?: (path: string) => void
}) {
  const hasCollection = Boolean(card.href && card.title)
  const showOverlayTitle = titlePosition === 'overlay' && hasCollection
  const showBelowTitle = titlePosition === 'below' && hasCollection

  return (
    <CollectionCardLink card={card} preview={preview} onPreviewNavigate={onPreviewNavigate}>
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 ring-1 ring-gray-200 transition group-hover:ring-primary-400 dark:bg-gray-800 dark:ring-gray-700">
        {card.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={card.imageUrl}
            alt={card.imageAlt}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-3 text-center text-xs text-gray-400">
            {hasCollection ? 'No image in collection' : 'Select a collection'}
          </div>
        )}
        {showOverlayTitle ? (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3 pb-3 pt-10">
            <p className="text-center text-sm font-medium text-white">{card.title}</p>
          </div>
        ) : null}
      </div>
      {showBelowTitle ? (
        <p className="mt-2.5 text-center text-sm font-medium text-gray-900 group-hover:text-primary-600 dark:text-gray-100">
          {card.title}
        </p>
      ) : !hasCollection ? (
        <p className="mt-2.5 text-center text-sm text-gray-400">Empty card</p>
      ) : null}
    </CollectionCardLink>
  )
}

export default function CollectionCardsView({
  config,
  cards,
  preview = false,
  onPreviewNavigate,
}: CollectionCardsViewProps) {
  if (!config.enabled) return null

  const hasAnyCard = cards.some((card) => card.href && card.title)
  if (!preview && !hasAnyCard) return null

  return (
    <section className="w-full max-w-none px-[5px]" aria-label="Collection cards">
      <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-2">
        {cards.map((card) => (
          <CollectionCardItem
            key={card.id}
            card={card}
            titlePosition={config.titlePosition}
            preview={preview}
            onPreviewNavigate={onPreviewNavigate}
          />
        ))}
      </div>
    </section>
  )
}
