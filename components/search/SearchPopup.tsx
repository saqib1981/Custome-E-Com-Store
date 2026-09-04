'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Loader2, Search, X } from 'lucide-react'
import {
  DEFAULT_SEARCH,
  buildSearchPath,
  normalizeSearchConfig,
  type SearchConfig,
  type SearchProductHit,
} from '@/lib/search'
import { fetchStoreSearchSettings } from '@/lib/search-client'

type SearchPopupProps = {
  open: boolean
  onClose: () => void
  configOverride?: SearchConfig
  preview?: boolean
  onPreviewNavigate?: (path: string) => void
  /** Admin preview uses /api/admin/search */
  searchApiBase?: '/api/store/search' | '/api/admin/search'
}

export default function SearchPopup({
  open,
  onClose,
  configOverride,
  preview = false,
  onPreviewNavigate,
  searchApiBase = '/api/store/search',
}: SearchPopupProps) {
  const titleId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [config, setConfig] = useState<SearchConfig>(
    () => configOverride ?? DEFAULT_SEARCH
  )
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchProductHit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFailed, setImageFailed] = useState<Record<string, boolean>>({})

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
    if (!open) {
      setQuery('')
      setResults([])
      setError(null)
      setLoading(false)
      setImageFailed({})
      return
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 40)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open || !config.enabled) return

    const trimmed = query.trim()
    if (trimmed.length < config.minQueryLength) {
      setResults([])
      setError(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(() => {
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
    }, 280)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [open, query, config.enabled, config.minQueryLength, searchApiBase])

  if (!open) return null

  const goToSearchPage = () => {
    const trimmed = query.trim()
    if (trimmed.length < config.minQueryLength) return
    const path = buildSearchPath(trimmed)
    if (preview && onPreviewNavigate) {
      onPreviewNavigate(path)
      onClose()
      return
    }
    window.location.href = path
    onClose()
  }

  const goToProduct = (handle: string) => {
    const path = `/products/${encodeURIComponent(handle)}`
    if (preview && onPreviewNavigate) {
      onPreviewNavigate(path)
      onClose()
      return
    }
    window.location.href = path
  }

  const trimmed = query.trim()
  const showEmptyHint = trimmed.length < config.minQueryLength
  const showNoResults =
    !loading && !showEmptyHint && results.length === 0 && !error

  return (
    <div className="absolute inset-0 z-[60] flex items-start justify-center p-3 sm:p-6" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Close search"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[61] mt-8 w-full max-w-xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl sm:mt-16"
      >
        <form
          className="flex items-center gap-2 border-b border-gray-200 px-3 py-2.5"
          onSubmit={(e) => {
            e.preventDefault()
            goToSearchPage()
          }}
        >
          <Search className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
          <input
            ref={inputRef}
            id={titleId}
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
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </form>

        {!config.enabled ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500">Search is disabled</p>
        ) : (
          <div className="max-h-[min(28rem,55vh)] overflow-y-auto">
            {showEmptyHint ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">{config.emptyHintText}</p>
            ) : null}
            {error ? (
              <p className="px-4 py-8 text-center text-sm text-red-600">{error}</p>
            ) : null}
            {showNoResults ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">{config.noResultsText}</p>
            ) : null}
            {results.length > 0 ? (
              <ul className="divide-y divide-gray-100 py-1">
                {results.map((hit) => {
                  const failed = imageFailed[hit.id]
                  return (
                    <li key={hit.id}>
                      <button
                        type="button"
                        onClick={() => goToProduct(hit.handle)}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                      >
                        {config.showProductImages ? (
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-gray-100">
                            {hit.imageUrl && !failed ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={hit.imageUrl}
                                alt={hit.imageAlt}
                                className="h-full w-full object-cover"
                                onError={() =>
                                  setImageFailed((prev) => ({ ...prev, [hit.id]: true }))
                                }
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] leading-tight text-gray-500">
                                {hit.imageAlt || hit.title}
                              </span>
                            )}
                          </span>
                        ) : null}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-gray-900">
                            {hit.title}
                          </span>
                          {config.showPrices && hit.price ? (
                            <span className="mt-0.5 flex items-center gap-2 text-xs text-gray-600">
                              <span
                                className={
                                  hit.compareAtPrice ? 'font-medium text-red-600' : 'text-gray-700'
                                }
                              >
                                {hit.price}
                              </span>
                              {hit.compareAtPrice ? (
                                <span className="text-gray-400 line-through">
                                  {hit.compareAtPrice}
                                </span>
                              ) : null}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  )
                })}
                <li>
                  <button
                    type="button"
                    onClick={goToSearchPage}
                    className="w-full px-3 py-2.5 text-left text-sm font-medium text-primary-600 hover:bg-gray-50"
                  >
                    View all results for “{trimmed}”
                  </button>
                </li>
              </ul>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
