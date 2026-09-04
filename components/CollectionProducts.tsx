'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CollectionProductsView from '@/components/home/CollectionProductsView'
import {
  DEFAULT_COLLECTION_PRODUCTS,
  normalizeCollectionProductsConfig,
  normalizeCollectionProductsSort,
  resolveProductIsNew,
  type CollectionProductCard,
  type CollectionProductsConfig,
  type CollectionProductsPage,
  type CollectionProductsSort,
} from '@/lib/collection-products'
import {
  COLLECTION_PRODUCTS_UPDATED_EVENT,
} from '@/lib/collection-products-client'
import type { PreviewViewport } from '@/lib/preview-viewport'
import { PREVIEW_SECTION_RESOLVE_DEBOUNCE_MS } from '@/lib/store-section-client'

type CollectionProductsProps = {
  handle: string
  preview?: boolean
  previewViewport?: PreviewViewport
  configOverride?: CollectionProductsConfig
  onPreviewNavigate?: (path: string) => void
}

function resolveProductsApi(preview: boolean): string {
  return preview ? '/api/admin/collection-products' : '/api/store/collection-products'
}

function resolveSettingsApi(preview: boolean): string {
  return preview
    ? '/api/admin/collection-products-settings'
    : '/api/store/collection-products-settings'
}

function withResolvedNewBadges(
  products: CollectionProductCard[],
  newBadgeDays: number
): CollectionProductCard[] {
  return products.map((product) => {
    const isNew = resolveProductIsNew({
      createdAt: product.createdAt,
      hasNewTag: product.hasNewTag,
      newBadgeDays,
    })
    return product.isNew === isNew ? product : { ...product, isNew }
  })
}

export default function CollectionProducts({
  handle,
  preview = false,
  previewViewport,
  configOverride,
  onPreviewNavigate,
}: CollectionProductsProps) {
  const safeHandle = String(handle ?? '').trim() || 'all'
  const [config, setConfig] = useState<CollectionProductsConfig>(() =>
    configOverride ?? DEFAULT_COLLECTION_PRODUCTS
  )
  const [title, setTitle] = useState(safeHandle === 'all' ? 'All products' : safeHandle)
  const [productCount, setProductCount] = useState(0)
  const [products, setProducts] = useState<CollectionProductCard[]>([])
  const [sort, setSort] = useState<CollectionProductsSort>('manual')
  const [endCursor, setEndCursor] = useState<string | null>(null)
  const [cursorStack, setCursorStack] = useState<Array<string | null>>([null])
  const [pageIndex, setPageIndex] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadMoreLoading, setLoadMoreLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sortRef = useRef<CollectionProductsSort | 'shopify'>('shopify')
  const pageSizeRef = useRef(config.pageSize)
  sortRef.current = sort
  pageSizeRef.current = config.pageSize

  const isPreviewMode = preview || Boolean(configOverride)

  useEffect(() => {
    if (configOverride) {
      setConfig(configOverride)
    }
  }, [configOverride])

  useEffect(() => {
    if (configOverride) return

    let cancelled = false
    void fetch(resolveSettingsApi(preview), { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_COLLECTION_PRODUCTS))
      .then((data: Partial<CollectionProductsConfig>) => {
        if (cancelled) return
        const next = normalizeCollectionProductsConfig(data)
        setConfig(next)
      })
      .catch(() => {
        if (!cancelled) setConfig(DEFAULT_COLLECTION_PRODUCTS)
      })

    return () => {
      cancelled = true
    }
  }, [configOverride, preview])

  useEffect(() => {
    if (configOverride) return

    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<CollectionProductsConfig>).detail
      if (!detail) return
      setConfig(normalizeCollectionProductsConfig(detail))
    }

    window.addEventListener(COLLECTION_PRODUCTS_UPDATED_EVENT, onUpdated)
    return () => window.removeEventListener(COLLECTION_PRODUCTS_UPDATED_EVENT, onUpdated)
  }, [configOverride])

  const applyPage = useCallback(
    (data: CollectionProductsPage, append: boolean, newBadgeDays: number) => {
      setTitle(data.title || (safeHandle === 'all' ? 'All products' : safeHandle))
      if (typeof data.productCount === 'number' && data.productCount > 0) {
        setProductCount(data.productCount)
      } else if (!append) {
        setProductCount(0)
      }
      const mapped = withResolvedNewBadges(
        Array.isArray(data.products) ? data.products : [],
        newBadgeDays
      )
      setProducts((prev) => (append ? [...prev, ...mapped] : mapped))
      setEndCursor(data.pageInfo?.endCursor ?? null)
      setHasMore(Boolean(data.pageInfo?.hasNextPage))
      const nextSort = normalizeCollectionProductsSort(data.sort)
      setSort(nextSort)
      sortRef.current = nextSort
      setError(data.error ?? null)
    },
    [safeHandle]
  )

  const fetchPage = useCallback(
    async (options: {
      after?: string | null
      sortValue?: CollectionProductsSort | 'shopify'
      first?: number
    }) => {
      const params = new URLSearchParams({
        handle: safeHandle,
        sort: options.sortValue ?? sortRef.current,
        first: String(options.first ?? pageSizeRef.current),
      })
      if (options.after) params.set('after', options.after)

      const res = await fetch(`${resolveProductsApi(preview)}?${params.toString()}`, {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('Failed to load products')
      return (await res.json()) as CollectionProductsPage
    },
    [preview, safeHandle]
  )

  useEffect(() => {
    if (!config.enabled) {
      setProducts([])
      setProductCount(0)
      setHasMore(false)
      setEndCursor(null)
      setCursorStack([null])
      setPageIndex(0)
      setLoading(false)
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      setLoading(true)
      setError(null)
      setCursorStack([null])
      setPageIndex(0)
      sortRef.current = 'shopify'
      void fetchPage({ sortValue: 'shopify', after: null })
        .then((data) => {
          if (!cancelled) applyPage(data, false, config.newBadgeDays)
        })
        .catch(() => {
          if (cancelled) return
          setProducts([])
          setProductCount(0)
          setHasMore(false)
          setEndCursor(null)
          setError('Could not load products for this collection.')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, isPreviewMode ? PREVIEW_SECTION_RESOLVE_DEBOUNCE_MS : 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [applyPage, config.enabled, config.pageSize, fetchPage, isPreviewMode, safeHandle])

  const displayProducts = useMemo(
    () => withResolvedNewBadges(products, config.newBadgeDays),
    [products, config.newBadgeDays]
  )

  const handleSortChange = (nextSort: CollectionProductsSort) => {
    setSort(nextSort)
    sortRef.current = nextSort
    setLoading(true)
    setError(null)
    setCursorStack([null])
    setPageIndex(0)
    void fetchPage({ sortValue: nextSort, after: null })
      .then((data) => applyPage(data, false, config.newBadgeDays))
      .catch(() => setError('Could not sort products.'))
      .finally(() => setLoading(false))
  }

  const handleLoadMore = () => {
    if (!hasMore || !endCursor || loadMoreLoading) return
    setLoadMoreLoading(true)
    void fetchPage({ after: endCursor })
      .then((data) => applyPage(data, true, config.newBadgeDays))
      .catch(() => setError('Could not load more products.'))
      .finally(() => setLoadMoreLoading(false))
  }

  const handleNextPage = () => {
    if (!hasMore || !endCursor || loadMoreLoading) return
    setLoadMoreLoading(true)
    const nextAfter = endCursor
    void fetchPage({ after: nextAfter })
      .then((data) => {
        applyPage(data, false, config.newBadgeDays)
        setCursorStack((prev) => [...prev.slice(0, pageIndex + 1), nextAfter])
        setPageIndex((prev) => prev + 1)
      })
      .catch(() => setError('Could not load next page.'))
      .finally(() => setLoadMoreLoading(false))
  }

  const handlePrevPage = () => {
    if (pageIndex <= 0 || loadMoreLoading) return
    const prevIndex = pageIndex - 1
    const after = cursorStack[prevIndex] ?? null
    setLoadMoreLoading(true)
    void fetchPage({ after })
      .then((data) => {
        applyPage(data, false, config.newBadgeDays)
        setPageIndex(prevIndex)
      })
      .catch(() => setError('Could not load previous page.'))
      .finally(() => setLoadMoreLoading(false))
  }

  if (!config.enabled && !isPreviewMode) return null

  return (
    <CollectionProductsView
      title={title}
      productCount={productCount}
      products={displayProducts}
      sort={sort}
      onSortChange={handleSortChange}
      columns={config.columnsDesktop}
      onColumnsChange={(columnsDesktop) => setConfig((prev) => ({ ...prev, columnsDesktop }))}
      paginationMode={config.paginationMode}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
      onNextPage={handleNextPage}
      onPrevPage={handlePrevPage}
      canPrevPage={pageIndex > 0}
      loadMoreLoading={loadMoreLoading}
      loading={loading}
      error={
        !config.enabled
          ? 'Products section is hidden. Enable it in Collection → Products.'
          : error
      }
      showSaleBadge={config.showSaleBadge}
      showNewBadge={config.showNewBadge}
      imageAspect={config.cardImageAspect}
      preview={preview}
      previewViewport={previewViewport}
      onPreviewNavigate={onPreviewNavigate}
    />
  )
}
