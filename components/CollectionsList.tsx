'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import CollectionCardsView from '@/components/home/CollectionCardsView'
import CollectionsListPagination from '@/components/collections/CollectionsListPagination'
import {
  collectionsListBootstrapRowClass,
  COLLECTIONS_LIST_EDGE_PADDING_CLASS,
  collectionsListPageCount,
  DEFAULT_COLLECTIONS_LIST,
  sliceCollectionsListPage,
  type CollectionsListConfig,
} from '@/lib/collections-list'
import type { ResolvedCollectionCard } from '@/lib/collection-cards'
import type { PreviewViewport } from '@/lib/preview-viewport'
import { previewCollectionsBootstrapRowClass } from '@/lib/preview-viewport'
import {
  PREVIEW_SECTION_RESOLVE_DEBOUNCE_MS,
  STORE_SECTION_FOCUS_REFRESH_MS,
} from '@/lib/store-section-client'

type CollectionsListProps = {
  preview?: boolean
  previewViewport?: PreviewViewport
  configOverride?: CollectionsListConfig
  onPreviewNavigate?: (path: string) => void
}

function mergeConfigFromApi(
  prev: CollectionsListConfig,
  data: Partial<CollectionsListConfig>
): CollectionsListConfig {
  return {
    enabled: Boolean(data.enabled ?? prev.enabled),
    titlePosition: data.titlePosition === 'below' ? 'below' : 'overlay',
    pageTitle: String(data.pageTitle ?? prev.pageTitle).trim(),
    columnsDesktop:
      data.columnsDesktop === 2 || data.columnsDesktop === 3 || data.columnsDesktop === 4
        ? data.columnsDesktop
        : prev.columnsDesktop,
    pageSize:
      typeof data.pageSize === 'number' && data.pageSize > 0 ? data.pageSize : prev.pageSize,
    paginationMode: data.paginationMode === 'load-more' ? 'load-more' : 'pagination',
  }
}

export default function CollectionsList({
  preview = false,
  previewViewport,
  configOverride,
  onPreviewNavigate,
}: CollectionsListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [config, setConfig] = useState<CollectionsListConfig>(
    configOverride ?? DEFAULT_COLLECTIONS_LIST
  )
  const [allCards, setAllCards] = useState<ResolvedCollectionCard[]>([])
  const [previewPage, setPreviewPage] = useState(1)
  const [visibleCount, setVisibleCount] = useState(config.pageSize)
  const [loadMoreLoading, setLoadMoreLoading] = useState(false)

  const isPreviewMode = preview || Boolean(configOverride)

  useEffect(() => {
    if (configOverride) {
      setConfig(configOverride)
    }
  }, [configOverride])

  useEffect(() => {
    setVisibleCount(config.pageSize)
    setPreviewPage(1)
  }, [config.pageSize, config.paginationMode, allCards.length])

  useEffect(() => {
    if (!isPreviewMode) return

    if (!config.enabled) {
      setAllCards([])
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      void fetch('/api/admin/collections-list', {
        method: 'POST',
        cache: 'no-store',
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { cards?: ResolvedCollectionCard[] } | null) => {
          if (!cancelled) setAllCards(Array.isArray(data?.cards) ? data.cards : [])
        })
        .catch(() => {
          if (!cancelled) setAllCards([])
        })
    }, PREVIEW_SECTION_RESOLVE_DEBOUNCE_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [isPreviewMode, configOverride, config.enabled])

  useEffect(() => {
    if (isPreviewMode) return

    let cancelled = false
    let lastFocusAt = 0

    const load = () => {
      void fetch('/api/store/collections-list', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then(
          (data: {
            enabled?: boolean
            titlePosition?: CollectionsListConfig['titlePosition']
            pageTitle?: string
            columnsDesktop?: CollectionsListConfig['columnsDesktop']
            pageSize?: number
            paginationMode?: CollectionsListConfig['paginationMode']
            cards?: ResolvedCollectionCard[]
          } | null) => {
            if (cancelled || !data) return

            setConfig((prev) => {
              const next = mergeConfigFromApi(prev, data)
              if (JSON.stringify(prev) === JSON.stringify(next)) return prev
              return next
            })

            const nextCards = Array.isArray(data.cards) ? data.cards : []
            setAllCards((prev) =>
              JSON.stringify(prev) === JSON.stringify(nextCards) ? prev : nextCards
            )
          }
        )
        .catch(() => {
          if (!cancelled) setAllCards([])
        })
    }

    load()

    const onFocus = () => {
      const now = Date.now()
      if (now - lastFocusAt < STORE_SECTION_FOCUS_REFRESH_MS) return
      lastFocusAt = now
      load()
    }

    window.addEventListener('focus', onFocus)
    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
    }
  }, [isPreviewMode])

  const urlPage = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1)
  const totalPages = collectionsListPageCount(allCards.length, config.pageSize)
  const currentPage = isPreviewMode ? Math.min(previewPage, totalPages) : Math.min(urlPage, totalPages)

  const displayedCards = useMemo(() => {
    if (config.paginationMode === 'load-more') {
      return allCards.slice(0, visibleCount)
    }
    return sliceCollectionsListPage(allCards, currentPage, config.pageSize)
  }, [allCards, config.paginationMode, config.pageSize, currentPage, visibleCount])

  const hasMore = visibleCount < allCards.length

  const goToPage = useCallback(
    (nextPage: number) => {
      const safePage = Math.min(totalPages, Math.max(1, nextPage))

      if (isPreviewMode) {
        setPreviewPage(safePage)
        return
      }

      const params = new URLSearchParams(searchParams.toString())
      if (safePage <= 1) params.delete('page')
      else params.set('page', String(safePage))

      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: true })
    },
    [isPreviewMode, pathname, router, searchParams, totalPages]
  )

  const handleLoadMore = useCallback(() => {
    setLoadMoreLoading(true)
    window.setTimeout(() => {
      setVisibleCount((prev) => Math.min(allCards.length, prev + config.pageSize))
      setLoadMoreLoading(false)
    }, 200)
  }, [allCards.length, config.pageSize])

  return (
    <>
      <CollectionCardsView
        config={config}
        cards={displayedCards}
        preview={preview}
        previewViewport={previewViewport}
        onPreviewNavigate={onPreviewNavigate}
        pageTitle={config.pageTitle}
        bootstrapRowClassName={
          preview && previewViewport
            ? previewCollectionsBootstrapRowClass(previewViewport, config.columnsDesktop)
            : collectionsListBootstrapRowClass(config.columnsDesktop)
        }
        sectionClassName={COLLECTIONS_LIST_EDGE_PADDING_CLASS}
        showProductCountBadge
      />
      <CollectionsListPagination
        mode={config.paginationMode}
        page={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        loadMoreLoading={loadMoreLoading}
        preview={preview}
      />
    </>
  )
}
