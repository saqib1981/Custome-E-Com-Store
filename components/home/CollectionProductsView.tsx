'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ArrowUpDown, Filter, LayoutGrid, Rows3, X } from 'lucide-react'
import StoreProductCard from '@/components/products/StoreProductCard'
import { STORE_SECTION_EDGE_CLASS } from '@/lib/breakpoints'
import {
  COLLECTION_PRODUCTS_SORT_OPTIONS,
  type CollectionProductCard,
  type CollectionProductsColumns,
  type CollectionProductsPaginationMode,
  type CollectionProductsSort,
  type CollectionProductCardAspect,
} from '@/lib/collection-products'
import type { PreviewViewport } from '@/lib/preview-viewport'

type AvailabilityFilter = 'all' | 'in-stock' | 'out-of-stock'

type CollectionProductsViewProps = {
  title: string
  productCount: number
  products: CollectionProductCard[]
  sort: CollectionProductsSort
  onSortChange: (sort: CollectionProductsSort) => void
  columns: CollectionProductsColumns
  onColumnsChange: (columns: CollectionProductsColumns) => void
  paginationMode: CollectionProductsPaginationMode
  hasMore: boolean
  onLoadMore: () => void
  onNextPage?: () => void
  onPrevPage?: () => void
  canPrevPage?: boolean
  loadMoreLoading?: boolean
  loading?: boolean
  error?: string | null
  showSaleBadge?: boolean
  showNewBadge?: boolean
  showCustomBadge?: boolean
  customBadgeBackgroundColor?: string
  customBadgeTextColor?: string
  imageAspect?: CollectionProductCardAspect
  preview?: boolean
  previewViewport?: PreviewViewport
  onPreviewNavigate?: (path: string) => void
}

function resolveGridClass(
  columns: CollectionProductsColumns,
  preview: boolean,
  previewViewport?: PreviewViewport
): string {
  if (preview && previewViewport) {
    if (previewViewport === 'mobile') return 'grid grid-cols-2 gap-2'
    if (previewViewport === 'tablet') {
      return columns >= 3 ? 'grid grid-cols-3 gap-3' : 'grid grid-cols-2 gap-3'
    }
    if (columns === 2) return 'grid grid-cols-2 gap-4'
    if (columns === 3) return 'grid grid-cols-3 gap-4'
    return 'grid grid-cols-4 gap-4'
  }

  if (columns === 2) return 'grid grid-cols-2 gap-2 sm:gap-4'
  if (columns === 3) return 'grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4'
  return 'grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 sm:gap-4'
}

function isCompactToolbar(preview: boolean, previewViewport?: PreviewViewport): boolean {
  return Boolean(preview && previewViewport === 'mobile')
}

function ColumnButton({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border text-sm transition ${
        active
          ? 'border-gray-900 bg-gray-900 text-white'
          : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  )
}

function resolveResultsLabel(options: {
  loading: boolean
  productCount: number
  productsLength: number
  hasMore: boolean
  filtered: boolean
}): string {
  if (options.loading && !options.productsLength) return 'Loading products…'
  if (options.filtered) {
    return `${options.productsLength} ${options.productsLength === 1 ? 'result' : 'results'}`
  }
  if (options.productCount > 0) {
    return `There ${options.productCount === 1 ? 'is' : 'are'} ${options.productCount} ${
      options.productCount === 1 ? 'result' : 'results'
    } in total`
  }
  if (options.productsLength) {
    return `${options.productsLength}${options.hasMore ? '+' : ''} product${
      options.productsLength === 1 ? '' : 's'
    }`
  }
  return 'No products found'
}

function useDismissible(open: boolean, onClose: () => void, rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onClose()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose, rootRef])
}

function SortByControl({
  sort,
  onSortChange,
  compact,
}: {
  sort: CollectionProductsSort
  onSortChange: (sort: CollectionProductsSort) => void
  compact: boolean
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const activeLabel =
    COLLECTION_PRODUCTS_SORT_OPTIONS.find((option) => option.value === sort)?.label ?? 'Sort'

  useDismissible(open, () => setOpen(false), rootRef)

  if (!compact) {
    return (
      <label className="hidden min-w-0 items-center gap-2 justify-self-end text-sm text-gray-600 sm:flex dark:text-gray-300">
        <span className="shrink-0">Sort by:</span>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as CollectionProductsSort)}
          className="max-w-[14rem] rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 outline-none focus:border-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
        >
          {COLLECTION_PRODUCTS_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    )
  }

  return (
    <div ref={rootRef} className="relative z-30 justify-self-end">
      <button
        type="button"
        aria-label={`Sort by: ${activeLabel}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition ${
          open
            ? 'border-gray-900 bg-gray-900 text-white'
            : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300'
        }`}
      >
        <ArrowUpDown className="h-4 w-4" aria-hidden />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Sort products"
          className="absolute right-0 z-40 mt-2 max-h-72 w-56 overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {COLLECTION_PRODUCTS_SORT_OPTIONS.map((option) => {
            const selected = option.value === sort
            return (
              <li key={option.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onSortChange(option.value)
                    setOpen(false)
                  }}
                  className={`flex w-full px-3 py-2 text-left text-sm transition ${
                    selected
                      ? 'bg-gray-100 font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  {option.label}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

function FilterControl({
  availability,
  onAvailabilityChange,
  onSaleOnly,
  onOnSaleOnlyChange,
  inStockCount,
  outOfStockCount,
  onSaleCount,
  onClear,
}: {
  availability: AvailabilityFilter
  onAvailabilityChange: (value: AvailabilityFilter) => void
  onSaleOnly: boolean
  onOnSaleOnlyChange: (value: boolean) => void
  inStockCount: number
  outOfStockCount: number
  onSaleCount: number
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const activeCount =
    (availability !== 'all' ? 1 : 0) + (onSaleOnly ? 1 : 0)

  useDismissible(open, () => setOpen(false), rootRef)

  return (
    <div ref={rootRef} className="relative z-30">
      <button
        type="button"
        aria-label="Filter products"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
        className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition ${
          open || activeCount > 0
            ? 'border-gray-900 bg-gray-900 text-white'
            : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300'
        }`}
      >
        <Filter className="h-4 w-4" aria-hidden />
        {activeCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {activeCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Product filters"
          className="absolute left-0 z-40 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Filter</p>
            <button
              type="button"
              aria-label="Close filters"
              onClick={() => setOpen(false)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Availability
              </p>
              <div className="space-y-1.5">
                {(
                  [
                    { value: 'all' as const, label: 'All', count: inStockCount + outOfStockCount },
                    { value: 'in-stock' as const, label: 'In stock', count: inStockCount },
                    {
                      value: 'out-of-stock' as const,
                      label: 'Out of stock',
                      count: outOfStockCount,
                    },
                  ] as const
                ).map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <span className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                      <input
                        type="radio"
                        name="collection-availability"
                        checked={availability === option.value}
                        onChange={() => onAvailabilityChange(option.value)}
                        className="h-4 w-4 border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      {option.label}
                    </span>
                    <span className="text-xs text-gray-400">({option.count})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">
                <span className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <input
                    type="checkbox"
                    checked={onSaleOnly}
                    onChange={(event) => onOnSaleOnlyChange(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  On sale
                </span>
                <span className="text-xs text-gray-400">({onSaleCount})</span>
              </label>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
            <button
              type="button"
              onClick={onClear}
              className="text-sm text-gray-500 underline-offset-2 hover:text-gray-900 hover:underline"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function applyProductFilters(
  products: CollectionProductCard[],
  availability: AvailabilityFilter,
  onSaleOnly: boolean
): CollectionProductCard[] {
  return products.filter((product) => {
    if (availability === 'in-stock' && !product.available) return false
    if (availability === 'out-of-stock' && product.available) return false
    if (onSaleOnly && !product.onSale) return false
    return true
  })
}

export default function CollectionProductsView({
  title,
  productCount,
  products,
  sort,
  onSortChange,
  columns,
  onColumnsChange,
  paginationMode,
  hasMore,
  onLoadMore,
  onNextPage,
  onPrevPage,
  canPrevPage = false,
  loadMoreLoading = false,
  loading = false,
  error = null,
  showSaleBadge = true,
  showNewBadge = true,
  showCustomBadge = true,
  customBadgeBackgroundColor,
  customBadgeTextColor,
  imageAspect = 'square',
  preview = false,
  previewViewport,
  onPreviewNavigate,
}: CollectionProductsViewProps) {
  const [availability, setAvailability] = useState<AvailabilityFilter>('all')
  const [onSaleOnly, setOnSaleOnly] = useState(false)

  const compactToolbar = isCompactToolbar(preview, previewViewport)
  const usePagination = paginationMode === 'pagination'
  const filtersActive = availability !== 'all' || onSaleOnly

  const inStockCount = useMemo(
    () => products.filter((product) => product.available).length,
    [products]
  )
  const outOfStockCount = products.length - inStockCount
  const onSaleCount = useMemo(
    () => products.filter((product) => product.onSale).length,
    [products]
  )

  const visibleProducts = useMemo(
    () => applyProductFilters(products, availability, onSaleOnly),
    [products, availability, onSaleOnly]
  )

  const resultsLabel = resolveResultsLabel({
    loading,
    productCount: filtersActive ? visibleProducts.length : productCount,
    productsLength: visibleProducts.length,
    hasMore: filtersActive ? false : hasMore,
    filtered: filtersActive,
  })

  const clearFilters = () => {
    setAvailability('all')
    setOnSaleOnly(false)
  }

  return (
    <section className={`relative w-full max-w-full ${STORE_SECTION_EDGE_CLASS}`} aria-label={title}>
      <header className={`text-center ${compactToolbar ? 'mb-2' : 'mb-3 sm:mb-6'}`}>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
          {title}
        </h1>
      </header>

      <div className="relative z-20 mb-4 grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-gray-200 pb-3 dark:border-gray-700 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="flex min-w-0 items-center gap-2 justify-self-start">
          <FilterControl
            availability={availability}
            onAvailabilityChange={setAvailability}
            onSaleOnly={onSaleOnly}
            onOnSaleOnlyChange={setOnSaleOnly}
            inStockCount={inStockCount}
            outOfStockCount={outOfStockCount}
            onSaleCount={onSaleCount}
            onClear={clearFilters}
          />
          <p
            className={`min-w-0 text-sm text-gray-500 dark:text-gray-400 ${
              compactToolbar ? 'hidden' : 'hidden sm:block'
            }`}
          >
            {resultsLabel}
          </p>
        </div>

        <div className="flex items-center justify-center gap-1.5 justify-self-center">
          <ColumnButton active={columns === 2} label="2 columns" onClick={() => onColumnsChange(2)}>
            <Rows3 className="h-4 w-4" aria-hidden />
          </ColumnButton>
          <ColumnButton active={columns === 3} label="3 columns" onClick={() => onColumnsChange(3)}>
            <LayoutGrid className="h-4 w-4 scale-90" aria-hidden />
          </ColumnButton>
          <ColumnButton active={columns === 4} label="4 columns" onClick={() => onColumnsChange(4)}>
            <LayoutGrid className="h-4 w-4" aria-hidden />
          </ColumnButton>
        </div>

        {compactToolbar ? (
          <SortByControl sort={sort} onSortChange={onSortChange} compact />
        ) : (
          <>
            <div className="justify-self-end sm:hidden">
              <SortByControl sort={sort} onSortChange={onSortChange} compact />
            </div>
            <SortByControl sort={sort} onSortChange={onSortChange} compact={false} />
          </>
        )}
      </div>

      {error ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {error}
        </p>
      ) : null}

      {loading && !products.length ? (
        <div className={resolveGridClass(columns, preview, previewViewport)} aria-hidden>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-md bg-gray-200" />
          ))}
        </div>
      ) : visibleProducts.length ? (
        <>
          <div
            className={`${resolveGridClass(columns, preview, previewViewport)} items-stretch [&>*]:h-full`}
          >
            {visibleProducts.map((product) => (
              <StoreProductCard
                key={product.id}
                product={product}
                preview={preview}
                onPreviewNavigate={onPreviewNavigate}
                showSaleBadge={showSaleBadge}
                showNewBadge={showNewBadge}
                showCustomBadge={showCustomBadge}
                customBadgeBackgroundColor={customBadgeBackgroundColor}
                customBadgeTextColor={customBadgeTextColor}
                imageAspect={imageAspect}
              />
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 pb-2">
            {!filtersActive && !usePagination && productCount > 0 ? (
              <p className="text-sm text-gray-500">
                You&apos;ve viewed {products.length} of {productCount} result
                {productCount === 1 ? '' : 's'}
              </p>
            ) : null}
            {!filtersActive && !usePagination && !productCount && products.length && hasMore ? (
              <p className="text-sm text-gray-500">You&apos;ve viewed {products.length} products</p>
            ) : null}

            {!filtersActive && usePagination ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onPrevPage}
                  disabled={!canPrevPage || loadMoreLoading}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={onNextPage}
                  disabled={!hasMore || loadMoreLoading}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loadMoreLoading ? 'Loading…' : 'Next'}
                </button>
              </div>
            ) : null}

            {!filtersActive && !usePagination && hasMore ? (
              <button
                type="button"
                onClick={onLoadMore}
                disabled={loadMoreLoading}
                className="min-w-[10rem] rounded-md bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadMoreLoading ? 'Loading…' : 'Load more'}
              </button>
            ) : null}
          </div>
        </>
      ) : !loading && !error ? (
        <p className="py-12 text-center text-sm text-gray-500">
          {filtersActive
            ? 'No products match these filters.'
            : 'No products in this collection yet.'}
        </p>
      ) : null}
    </section>
  )
}
