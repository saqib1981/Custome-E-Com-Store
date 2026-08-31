'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import type { CollectionTabsConfig, ResolvedCollectionTab } from '@/lib/collection-tabs'

type CollectionTabsViewProps = {
  config: CollectionTabsConfig
  tabs: ResolvedCollectionTab[]
  preview?: boolean
  onPreviewNavigate?: (path: string) => void
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
      <button type="button" onClick={() => onPreviewNavigate(href)} className="group block w-full text-left">
        {children}
      </button>
    )
  }

  return (
    <Link href={href} className="group block w-full">
      {children}
    </Link>
  )
}

function ProductCard({
  product,
  preview,
  onPreviewNavigate,
}: {
  product: ResolvedCollectionTab['products'][number]
  preview?: boolean
  onPreviewNavigate?: (path: string) => void
}) {
  return (
    <ProductLink href={product.href} preview={preview} onPreviewNavigate={onPreviewNavigate}>
      <div className="overflow-hidden rounded-md bg-gray-50 ring-1 ring-gray-200 transition group-hover:ring-primary-400 dark:bg-gray-800 dark:ring-gray-700">
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-900">
          {product.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={product.imageUrl}
              alt={product.imageAlt}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-2 text-center text-xs text-gray-400">
              No image
            </div>
          )}
        </div>
        <div className="space-y-1 p-2.5">
          <p className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-primary-600 dark:text-gray-100">
            {product.title}
          </p>
          {product.price ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">{product.price}</p>
          ) : null}
        </div>
      </div>
    </ProductLink>
  )
}

export default function CollectionTabsView({
  config,
  tabs,
  preview = false,
  onPreviewNavigate,
}: CollectionTabsViewProps) {
  const visibleTabs = useMemo(() => tabs.filter((tab) => tab.title && tab.href), [tabs])
  const [activeTabId, setActiveTabId] = useState<string>('')

  useEffect(() => {
    if (!visibleTabs.length) {
      setActiveTabId('')
      return
    }
    if (!visibleTabs.some((tab) => tab.id === activeTabId)) {
      setActiveTabId(visibleTabs[0].id)
    }
  }, [visibleTabs, activeTabId])

  if (!config.enabled) return null

  if (!preview && !visibleTabs.length) return null

  const activeTab = visibleTabs.find((tab) => tab.id === activeTabId) ?? visibleTabs[0]

  return (
    <section className="w-full px-[5px] py-2" aria-label="Collection tabs">
      {visibleTabs.length ? (
        <>
          <div className="mb-4 w-full border-b border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
              <div
                className="mx-auto flex w-max min-w-full justify-center gap-1"
                role="tablist"
              >
                {visibleTabs.map((tab) => {
                  const isActive = tab.id === activeTab?.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveTabId(tab.id)}
                      className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? 'border-primary-600 text-primary-700 dark:text-primary-400'
                          : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      {tab.title}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {activeTab ? (
            <div role="tabpanel" className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {activeTab.products.length ? (
                activeTab.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    preview={preview}
                    onPreviewNavigate={onPreviewNavigate}
                  />
                ))
              ) : (
                <p className="col-span-full py-8 text-center text-sm text-gray-500">
                  No products in this collection yet.
                </p>
              )}
            </div>
          ) : null}
        </>
      ) : preview ? (
        <p className="py-8 text-center text-sm text-gray-400">Add collection tabs in the theme editor.</p>
      ) : null}
    </section>
  )
}
