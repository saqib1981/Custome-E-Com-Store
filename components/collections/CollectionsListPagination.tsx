'use client'

import { STORE_SECTION_EDGE_X_CLASS } from '@/lib/breakpoints'

type CollectionsListPaginationProps = {
  mode: 'pagination' | 'load-more'
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  hasMore: boolean
  onLoadMore: () => void
  loadMoreLoading?: boolean
  preview?: boolean
}

function pageNumbers(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages = new Set<number>([1, total, current, current - 1, current + 1])
  return [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
}

export default function CollectionsListPagination({
  mode,
  page,
  totalPages,
  onPageChange,
  hasMore,
  onLoadMore,
  loadMoreLoading = false,
  preview = false,
}: CollectionsListPaginationProps) {
  if (mode === 'load-more') {
    if (!hasMore) return null

    return (
      <div className={`mt-8 flex justify-center pb-2.5 ${STORE_SECTION_EDGE_X_CLASS}`}>
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loadMoreLoading}
          className="min-w-[10rem] rounded-md bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadMoreLoading ? 'Loading…' : 'Load more'}
        </button>
      </div>
    )
  }

  if (totalPages <= 1) return null

  const numbers = pageNumbers(page, totalPages)

  return (
    <nav
      className={`mt-8 flex flex-wrap items-center justify-center gap-1.5 pb-2.5 ${STORE_SECTION_EDGE_X_CLASS}`}
      aria-label="Collections pagination"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        Previous
      </button>
      {numbers.map((pageNumber, index) => {
        const prev = numbers[index - 1]
        const showEllipsis = prev !== undefined && pageNumber - prev > 1

        return (
          <span key={pageNumber} className="flex items-center gap-1.5">
            {showEllipsis ? (
              <span className="px-1 text-sm text-gray-400" aria-hidden>
                …
              </span>
            ) : null}
            <button
              type="button"
              aria-current={pageNumber === page ? 'page' : undefined}
              onClick={() => onPageChange(pageNumber)}
              className={`min-w-[2.25rem] rounded-md border px-2 py-1.5 text-sm transition ${
                pageNumber === page
                  ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800'
              }`}
            >
              {pageNumber}
            </button>
          </span>
        )
      })}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        Next
      </button>
      {preview ? (
        <span className="sr-only">Pagination preview — page {page} of {totalPages}</span>
      ) : null}
    </nav>
  )
}
