'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import StoreProductCard from '@/components/products/StoreProductCard'
import {
  DEFAULT_SEARCH,
  normalizeSearchConfig,
  searchHitToProductCard,
  type SearchConfig,
  type SearchProductHit,
} from '@/lib/search'
import { fetchStoreSearchSettings } from '@/lib/search-client'
import { STORE_SECTION_EDGE_CLASS } from '@/lib/breakpoints'
import type { PreviewViewport } from '@/lib/preview-viewport'

type SearchPageViewProps = {
  initialQuery?: string
  configOverride?: SearchConfig
  preview?: boolean
  previewViewport?: PreviewViewport
  onPreviewNavigate?: (path: string) => void
  searchApiBase?: '/api/store/search' | '/api/admin/search'
  onQueryCommit?: (query: string) => void
}

function resolveSearchGridClass(preview?: boolean, previewViewport?: PreviewViewport): string {
  if (preview) {
    if (previewViewport === 'mobile') return 'grid grid-cols-2 gap-2'
    if (previewViewport === 'tablet') return 'grid grid-cols-3 gap-3'
    return 'grid grid-cols-4 gap-4'
  }
  return 'grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 md:grid-cols-4'
}

export default function SearchPageView({
  initialQuery = '',
  configOverride,
  preview = false,
  previewViewport,
  onPreviewNavigate,
  searchApiBase = '/api/store/search',
  onQueryCommit,
}: SearchPageViewProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [config, setConfig] = useState<SearchConfig>(
    () => configOverride ?? DEFAULT_SEARCH
  )
  const [query, setQuery] = useState(initialQuery)
  const [committedQuery, setCommittedQuery] = useState(initialQuery.trim())
  const [results, setResults] = useState<SearchProductHit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setQuery(initialQuery)
    setCommittedQuery(initialQuery.trim())
  }, [initialQuery])

  useEffect(() => {
    if (configOverride) {
      setConfig(normalizeSearchConfig(configOverride))
      return
    }
    let cancelled = false
    void fetchStoreSearchSettings()
      .then((data) => {
        if (!cancelled) setConfig(data)
      })
      .catch(() => {
        if (!cancelled) setConfig(DEFAULT_SEARCH)
      })
    return () => {
      cancelled = true
    }
  }, [configOverride])

  useEffect(() => {
    if (!config.enabled) {
      setResults([])
      setLoading(false)
      return
    }

    const trimmed = committedQuery.trim()
    if (trimmed.length < config.minQueryLength) {
      setResults([])
      setError(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)

    void fetch(`${searchApiBase}?q=${encodeURIComponent(trimmed)}`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = (await res.json()) as {
          products?: SearchProductHit[]
          error?: string
        }
        if (!res.ok) throw new Error(data.error || 'Search failed')
        setResults(Array.isArray(data.products) ? data.products : [])
        if (data.error) setError(data.error)
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return
        setResults([])
        setError(e instanceof Error ? e.message : 'Search failed')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [committedQuery, config.enabled, config.minQueryLength, searchApiBase])

  const cards = useMemo(
    () =>
      results.map((hit) =>
        searchHitToProductCard(hit, {
          showImages: config.showProductImages,
          showPrices: config.showPrices,
        })
      ),
    [results, config.showProductImages, config.showPrices]
  )

  const commitSearch = (raw: string) => {
    const next = raw.trim()
    setCommittedQuery(next)
    onQueryCommit?.(next)
  }

  const showEmptyHint = committedQuery.trim().length < config.minQueryLength
  const showNoResults =
    !loading && !showEmptyHint && results.length === 0 && !error
  const gridClass = resolveSearchGridClass(preview, previewViewport)

  return (
    <section className={`relative w-full max-w-full ${STORE_SECTION_EDGE_CLASS}`}>
      <form
        className="mx-auto flex w-full max-w-2xl items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2.5 shadow-sm"
        onSubmit={(e) => {
          e.preventDefault()
          commitSearch(query)
        }}
      >
        <Search className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={config.placeholder}
          disabled={!config.enabled}
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
          autoComplete="off"
          spellCheck={false}
        />
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-400" aria-hidden />
        ) : null}
        <button
          type="submit"
          disabled={!config.enabled}
          className="shrink-0 rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-300"
        >
          Search
        </button>
      </form>

      <div className="mt-6 w-full">
        {!config.enabled ? (
          <p className="py-10 text-center text-sm text-gray-500">Search is disabled</p>
        ) : showEmptyHint ? (
          <p className="py-10 text-center text-sm text-gray-500">{config.emptyHintText}</p>
        ) : error ? (
          <p className="py-10 text-center text-sm text-red-600">{error}</p>
        ) : showNoResults ? (
          <p className="py-10 text-center text-sm text-gray-500">{config.noResultsText}</p>
        ) : null}

        {committedQuery.trim().length >= config.minQueryLength && cards.length > 0 ? (
          <p className="mb-4 text-sm text-gray-500">
            {cards.length} result{cards.length === 1 ? '' : 's'} for “{committedQuery.trim()}”
          </p>
        ) : null}

        {loading && !cards.length && !showEmptyHint ? (
          <div className={gridClass} aria-hidden>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="aspect-square animate-pulse rounded-md bg-gray-200" />
            ))}
          </div>
        ) : null}

        {cards.length > 0 ? (
          <div className={`${gridClass} items-stretch [&>*]:h-full`}>
            {cards.map((product) => (
              <StoreProductCard
                key={product.id}
                product={product}
                preview={preview}
                onPreviewNavigate={onPreviewNavigate}
                showSaleBadge={config.showPrices}
                showNewBadge={false}
                imageAspect="square"
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
