'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  collectionProductCardAspectClass,
  type CollectionProductCard,
  type CollectionProductCardAspect,
} from '@/lib/collection-products'

type StoreProductCardProps = {
  product: CollectionProductCard
  preview?: boolean
  onPreviewNavigate?: (path: string) => void
  showSaleBadge?: boolean
  showNewBadge?: boolean
  imageAspect?: CollectionProductCardAspect
}

function ProductLink({
  href,
  preview,
  onPreviewNavigate,
  children,
}: {
  href: string
  preview?: boolean
  onPreviewNavigate?: (path: string) => void
  children: React.ReactNode
}) {
  if (preview && onPreviewNavigate) {
    return (
      <button
        type="button"
        onClick={() => onPreviewNavigate(href)}
        className="group flex h-full w-full flex-col text-left"
      >
        {children}
      </button>
    )
  }

  return (
    <Link href={href} className="group flex h-full w-full flex-col">
      {children}
    </Link>
  )
}

export default function StoreProductCard({
  product,
  preview = false,
  onPreviewNavigate,
  showSaleBadge = true,
  showNewBadge = true,
  imageAspect = 'square',
}: StoreProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(product.imageUrl) && !imageFailed
  const aspectClass = collectionProductCardAspectClass(imageAspect)

  return (
    <ProductLink href={product.href} preview={preview} onPreviewNavigate={onPreviewNavigate}>
      <article className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-md bg-white ring-1 ring-gray-200 transition group-hover:ring-primary-400 dark:bg-gray-900 dark:ring-gray-700">
        <div className={`relative w-full shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-800 ${aspectClass}`}>
          {showImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={product.imageUrl}
              alt={product.imageAlt || product.title}
              className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-3 text-center text-xs text-gray-400">
              {product.imageAlt || product.title || 'No image'}
            </div>
          )}
          {showNewBadge && product.isNew ? (
            <span className="absolute left-2 top-2 rounded bg-gray-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              New
            </span>
          ) : null}
          {showSaleBadge && product.onSale ? (
            <span className="absolute right-2 top-2 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              Sale
            </span>
          ) : null}
          {!product.available ? (
            <span className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1.5 text-center text-[11px] font-medium text-white">
              Out of stock
            </span>
          ) : null}
        </div>
        <div className="flex min-h-[4.25rem] min-w-0 flex-1 flex-col gap-1 p-2.5">
          <h3
            className="store-product-card-title w-full min-w-0 text-sm font-medium leading-tight text-gray-900 group-hover:text-primary-600 dark:text-gray-100"
            title={product.title}
          >
            {product.title}
          </h3>
          <div className="mt-auto flex min-h-[1.25rem] flex-wrap items-baseline gap-x-2 gap-y-0.5">
            {product.price ? (
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{product.price}</p>
            ) : (
              <p className="text-sm text-transparent" aria-hidden>
                —
              </p>
            )}
            {product.compareAtPrice ? (
              <p className="text-sm text-red-600 line-through">{product.compareAtPrice}</p>
            ) : null}
          </div>
        </div>
      </article>
    </ProductLink>
  )
}
