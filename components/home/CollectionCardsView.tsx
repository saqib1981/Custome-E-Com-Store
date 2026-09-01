'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'
import type { CollectionCardsConfig, ResolvedCollectionCard } from '@/lib/collection-cards'

const COLLECTION_CARD_RATIO_STYLE = { '--bs-aspect-ratio': '133.333%' } as CSSProperties

type CollectionCardsViewProps = {
  config: Pick<CollectionCardsConfig, 'enabled' | 'titlePosition'>
  cards: ResolvedCollectionCard[]
  preview?: boolean
  onPreviewNavigate?: (path: string) => void
  pageTitle?: string
  gridClassName?: string
  bootstrapRowClassName?: string
  sectionClassName?: string
  showProductCountBadge?: boolean
}

function CollectionCardLink({
  card,
  preview,
  onPreviewNavigate,
  children,
  className = 'group block w-full text-left',
}: {
  card: ResolvedCollectionCard
  preview?: boolean
  onPreviewNavigate?: (path: string) => void
  children: React.ReactNode
  className?: string
}) {
  if (!card.href) return <div className="block">{children}</div>

  if (preview && onPreviewNavigate) {
    return (
      <button type="button" onClick={() => onPreviewNavigate(card.href)} className={className}>
        {children}
      </button>
    )
  }

  return (
    <Link href={card.href} className={className}>
      {children}
    </Link>
  )
}

function CollectionCardMedia({
  card,
  titlePosition,
  showProductCountBadge,
  useBootstrapLayout,
}: {
  card: ResolvedCollectionCard
  titlePosition: CollectionCardsConfig['titlePosition']
  showProductCountBadge: boolean
  useBootstrapLayout: boolean
}) {
  const hasCollection = Boolean(card.href && card.title)
  const showOverlayTitle = titlePosition === 'overlay' && hasCollection
  const showCountBadge = showProductCountBadge && typeof card.productCount === 'number'

  const badge = showCountBadge ? (
    <span
      className={
        useBootstrapLayout
          ? 'badge collection-card-product-count position-absolute'
          : 'absolute right-[3px] top-[3px] z-10 min-w-[3.375rem] rounded-[10px] bg-black/80 px-[18px] py-1 text-center text-lg font-semibold leading-tight tracking-wide text-white sm:min-w-[3.75rem] sm:px-5 sm:py-1.5 sm:text-[20px]'
      }
      aria-label={`${card.productCount} products`}
    >
      {card.productCount}
    </span>
  ) : null

  const placeholder = (
    <div className="flex h-full items-center justify-center px-3 text-center text-xs text-gray-400">
      {hasCollection ? 'No image in collection' : 'Select a collection'}
    </div>
  )

  const overlayTitle = showOverlayTitle ? (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3 pb-3 pt-10">
      <p className="text-center text-sm font-medium text-white">{card.title}</p>
    </div>
  ) : null

  if (useBootstrapLayout) {
    return (
      <div className="relative overflow-hidden bg-gray-100 ring-1 ring-gray-200 transition group-hover:ring-primary-400 dark:bg-gray-800 dark:ring-gray-700">
        {badge}
        <div className="ratio" style={COLLECTION_CARD_RATIO_STYLE}>
          {card.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={card.imageUrl}
              alt={card.imageAlt}
              className="object-fit-cover transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            placeholder
          )}
        </div>
        {overlayTitle}
      </div>
    )
  }

  return (
    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 ring-1 ring-gray-200 transition group-hover:ring-primary-400 dark:bg-gray-800 dark:ring-gray-700">
      {badge}
      {card.imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={card.imageUrl}
          alt={card.imageAlt}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          loading="lazy"
        />
      ) : (
        placeholder
      )}
      {overlayTitle}
    </div>
  )
}

function CollectionCardItem({
  card,
  titlePosition,
  preview,
  onPreviewNavigate,
  showProductCountBadge = false,
  useBootstrapLayout = false,
}: {
  card: ResolvedCollectionCard
  titlePosition: CollectionCardsConfig['titlePosition']
  preview?: boolean
  onPreviewNavigate?: (path: string) => void
  showProductCountBadge?: boolean
  useBootstrapLayout?: boolean
}) {
  const hasCollection = Boolean(card.href && card.title)
  const showBelowTitle = titlePosition === 'below' && hasCollection

  const content = (
    <>
      <CollectionCardMedia
        card={card}
        titlePosition={titlePosition}
        showProductCountBadge={showProductCountBadge}
        useBootstrapLayout={useBootstrapLayout}
      />
      {showBelowTitle ? (
        <p className="mt-2.5 text-center text-sm font-medium text-gray-900 group-hover:text-primary-600 dark:text-gray-100">
          {card.title}
        </p>
      ) : !hasCollection ? (
        <p className="mt-2.5 text-center text-sm text-gray-400">Empty card</p>
      ) : null}
    </>
  )

  if (useBootstrapLayout) {
    return (
      <div className="col">
        <CollectionCardLink card={card} preview={preview} onPreviewNavigate={onPreviewNavigate}>
          {content}
        </CollectionCardLink>
      </div>
    )
  }

  return (
    <CollectionCardLink card={card} preview={preview} onPreviewNavigate={onPreviewNavigate}>
      {content}
    </CollectionCardLink>
  )
}

export default function CollectionCardsView({
  config,
  cards,
  preview = false,
  onPreviewNavigate,
  pageTitle,
  gridClassName = 'grid-cols-2 sm:grid-cols-4',
  bootstrapRowClassName,
  sectionClassName,
  showProductCountBadge = false,
}: CollectionCardsViewProps) {
  if (!config.enabled) return null

  const hasAnyCard = cards.some((card) => card.href && card.title)
  if (!preview && !hasAnyCard) return null

  const useBootstrapLayout = Boolean(bootstrapRowClassName)
  const sectionPadding = sectionClassName ?? (pageTitle ? 'p-[10px]' : 'px-[5px]')

  return (
    <section className={`w-full max-w-none ${sectionPadding}`} aria-label={pageTitle || 'Collection cards'}>
      {pageTitle ? (
        <h1 className="mb-4 text-center text-xl font-semibold text-gray-900 dark:text-gray-100 sm:text-2xl">
          {pageTitle}
        </h1>
      ) : null}
      <div
        className={
          useBootstrapLayout ? `${bootstrapRowClassName} w-100` : `grid w-full gap-2 ${gridClassName}`
        }
      >
        {cards.map((card) => (
          <CollectionCardItem
            key={card.id}
            card={card}
            titlePosition={config.titlePosition}
            preview={preview}
            onPreviewNavigate={onPreviewNavigate}
            showProductCountBadge={showProductCountBadge}
            useBootstrapLayout={useBootstrapLayout}
          />
        ))}
      </div>
    </section>
  )
}
