'use client'

import { Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SearchPageView from '@/components/search/SearchPageView'
import { buildSearchPath } from '@/lib/search'

function SearchPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''

  const onQueryCommit = useCallback(
    (query: string) => {
      router.replace(buildSearchPath(query))
    },
    [router]
  )

  return <SearchPageView initialQuery={initialQuery} onQueryCommit={onQueryCommit} />
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-16 text-center text-sm text-gray-500 sm:px-6">Loading search…</div>
      }
    >
      <SearchPageInner />
    </Suspense>
  )
}
