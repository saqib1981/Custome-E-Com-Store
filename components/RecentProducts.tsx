'use client'

import { useEffect, useState } from 'react'
import RelatedProductsView from '@/components/products/RelatedProductsView'
import type { CollectionProductCard } from '@/lib/collection-products'
import type { PreviewViewport } from '@/lib/preview-viewport'
import type { ProductPageContentWidth } from '@/lib/product-page'
import {
  DEFAULT_RECENT_PRODUCTS,
  normalizeRecentProductsConfig,
  type RecentProductsConfig,
} from '@/lib/recent-products'
import { RECENT_PRODUCTS_UPDATED_EVENT } from '@/lib/recent-products-client'
import {
  readRecentlyViewedHandles,
  RECENTLY_VIEWED_UPDATED_EVENT,
} from '@/lib/recently-viewed-products'
import type { BadgesConfig } from '@/lib/badges'
import { useConfigWithBadges } from '@/components/useBadgesConfig'
import { PREVIEW_SECTION_RESOLVE_DEBOUNCE_MS } from '@/lib/store-section-client'

type RecentProductsProps = {
  handle: string
  preview?: boolean
  previewViewport?: PreviewViewport
  configOverride?: RecentProductsConfig
  badgesOverride?: BadgesConfig
  contentWidth?: ProductPageContentWidth
  onPreviewNavigate?: (path: string) => void
}

function resolveProductsApi(preview: boolean): string {
  return preview ? '/api/admin/recent-products' : '/api/store/recent-products'
}

function resolveSettingsApi(preview: boolean): string {
  return preview
    ? '/api/admin/recent-products-settings'
    : '/api/store/recent-products-settings'
}

export default function RecentProducts({
  handle,
  preview = false,
  previewViewport,
  configOverride,
  badgesOverride,
  contentWidth = 'full',
  onPreviewNavigate,
}: RecentProductsProps) {
  const safeHandle = String(handle ?? '').trim() || 'example'
  const [config, setConfig] = useState<RecentProductsConfig>(
    () => configOverride ?? DEFAULT_RECENT_PRODUCTS
  )
  const displayConfig = useConfigWithBadges(config, badgesOverride)
  const [products, setProducts] = useState<CollectionProductCard[]>([])
  const [loading, setLoading] = useState(true)
  const [viewedHandlesKey, setViewedHandlesKey] = useState(0)
  const isPreviewMode = preview || Boolean(configOverride)

  useEffect(() => {
    if (configOverride) setConfig(configOverride)
  }, [configOverride])

  useEffect(() => {
    if (configOverride) return

    let cancelled = false
    void fetch(resolveSettingsApi(preview), { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_RECENT_PRODUCTS))
      .then((data: Partial<RecentProductsConfig>) => {
        if (!cancelled) setConfig(normalizeRecentProductsConfig(data))
      })
      .catch(() => {
        if (!cancelled) setConfig(DEFAULT_RECENT_PRODUCTS)
      })

    return () => {
      cancelled = true
    }
  }, [configOverride, preview])

  useEffect(() => {
    if (configOverride) return

    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<RecentProductsConfig>).detail
      if (!detail) return
      setConfig(normalizeRecentProductsConfig(detail))
    }

    window.addEventListener(RECENT_PRODUCTS_UPDATED_EVENT, onUpdated)
    return () => window.removeEventListener(RECENT_PRODUCTS_UPDATED_EVENT, onUpdated)
  }, [configOverride])

  useEffect(() => {
    const onViewed = () => setViewedHandlesKey((n) => n + 1)
    window.addEventListener(RECENTLY_VIEWED_UPDATED_EVENT, onViewed)
    return () => window.removeEventListener(RECENTLY_VIEWED_UPDATED_EVENT, onViewed)
  }, [])

  useEffect(() => {
    if (!config.enabled && !isPreviewMode) {
      setLoading(false)
      setProducts([])
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      const viewedHandles = readRecentlyViewedHandles({
        exclude: safeHandle,
        limit: config.limit,
      })

      if (!viewedHandles.length) {
        setProducts([])
        setLoading(false)
        return
      }

      setLoading(true)
      const handlesParam = encodeURIComponent(viewedHandles.join(','))
      void fetch(
        `${resolveProductsApi(preview)}?handle=${encodeURIComponent(safeHandle)}&handles=${handlesParam}&limit=${config.limit}`,
        { cache: 'no-store' }
      )
        .then((res) => (res.ok ? res.json() : null))
        .then(
          (
            data: {
              products?: CollectionProductCard[]
              config?: RecentProductsConfig
            } | null
          ) => {
            if (cancelled || !data) return
            if (Array.isArray(data.products)) setProducts(data.products)
            if (!configOverride && data.config) {
              setConfig(normalizeRecentProductsConfig(data.config))
            }
          }
        )
        .catch(() => {
          if (!cancelled) setProducts([])
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, isPreviewMode ? PREVIEW_SECTION_RESOLVE_DEBOUNCE_MS : 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [
    config.enabled,
    config.limit,
    config.columnsDesktop,
    displayConfig.newBadgeDays,
    configOverride,
    isPreviewMode,
    preview,
    safeHandle,
    viewedHandlesKey,
  ])

  if (!config.enabled && !isPreviewMode) return null

  return (
    <RelatedProductsView
      config={displayConfig}
      products={products}
      loading={loading}
      preview={preview}
      previewViewport={previewViewport}
      contentWidth={contentWidth}
      onPreviewNavigate={onPreviewNavigate}
    />
  )
}
