'use client'

import { useEffect, useState } from 'react'
import ShopifyPageView from '@/components/pages/ShopifyPageView'
import { STORE_SECTION_EDGE_CLASS } from '@/lib/breakpoints'
import type { ShopifyOnlinePage } from '@/lib/shopify-pages'

type ShopifyPagePreviewProps = {
  handle: string
}

export default function ShopifyPagePreview({ handle }: ShopifyPagePreviewProps) {
  const [page, setPage] = useState<ShopifyOnlinePage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setPage(null)

    void fetch(`/api/store/page?handle=${encodeURIComponent(handle)}`, { cache: 'no-store' })
      .then(async (res) => {
        const data = (await res.json()) as ShopifyOnlinePage & { error?: string }
        if (cancelled) return
        if (!res.ok) {
          setError(data.error || 'Page not found')
          setPage(null)
          return
        }
        setPage(data)
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load page')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [handle])

  if (loading) {
    return (
      <div className={`${STORE_SECTION_EDGE_CLASS} py-10 text-center text-sm text-gray-500`}>
        Loading page…
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className={`${STORE_SECTION_EDGE_CLASS} py-10 text-center text-sm text-gray-500`}>
        {error || 'Page not found'}
      </div>
    )
  }

  return <ShopifyPageView page={page} />
}
