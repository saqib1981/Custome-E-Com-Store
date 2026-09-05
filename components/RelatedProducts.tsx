'use client'

import { useEffect, useState } from 'react'
import RelatedProductsView from '@/components/products/RelatedProductsView'
import type { CollectionProductCard } from '@/lib/collection-products'
import type { PreviewViewport } from '@/lib/preview-viewport'
import type { ProductPageContentWidth } from '@/lib/product-page'
import {
  DEFAULT_RELATED_PRODUCTS,
  normalizeRelatedProductsConfig,
  type RelatedProductsConfig,
} from '@/lib/related-products'
import { RELATED_PRODUCTS_UPDATED_EVENT } from '@/lib/related-products-client'
import { PREVIEW_SECTION_RESOLVE_DEBOUNCE_MS } from '@/lib/store-section-client'

type RelatedProductsProps = {
  handle: string
  preview?: boolean
  previewViewport?: PreviewViewport
  configOverride?: RelatedProductsConfig
  contentWidth?: ProductPageContentWidth
  onPreviewNavigate?: (path: string) => void
}

function resolveProductsApi(preview: boolean): string {
  return preview ? '/api/admin/related-products' : '/api/store/related-products'
}

function resolveSettingsApi(preview: boolean): string {
  return preview
    ? '/api/admin/related-products-settings'
    : '/api/store/related-products-settings'
}

export default function RelatedProducts({
  handle,
  preview = false,
  previewViewport,
  configOverride,
  contentWidth = 'full',
  onPreviewNavigate,
}: RelatedProductsProps) {
  const safeHandle = String(handle ?? '').trim() || 'example'
  const [config, setConfig] = useState<RelatedProductsConfig>(
    () => configOverride ?? DEFAULT_RELATED_PRODUCTS
  )
  const [products, setProducts] = useState<CollectionProductCard[]>([])
  const [loading, setLoading] = useState(true)
  const isPreviewMode = preview || Boolean(configOverride)

  useEffect(() => {
    if (configOverride) setConfig(configOverride)
  }, [configOverride])

  useEffect(() => {
    if (configOverride) return

    let cancelled = false
    void fetch(resolveSettingsApi(preview), { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_RELATED_PRODUCTS))
      .then((data: Partial<RelatedProductsConfig>) => {
        if (!cancelled) setConfig(normalizeRelatedProductsConfig(data))
      })
      .catch(() => {
        if (!cancelled) setConfig(DEFAULT_RELATED_PRODUCTS)
      })

    return () => {
      cancelled = true
    }
  }, [configOverride, preview])

  useEffect(() => {
    if (configOverride) return

    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<RelatedProductsConfig>).detail
      if (!detail) return
      setConfig(normalizeRelatedProductsConfig(detail))
    }

    window.addEventListener(RELATED_PRODUCTS_UPDATED_EVENT, onUpdated)
    return () => window.removeEventListener(RELATED_PRODUCTS_UPDATED_EVENT, onUpdated)
  }, [configOverride])

  useEffect(() => {
    if (!config.enabled && !isPreviewMode) {
      setLoading(false)
      setProducts([])
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      setLoading(true)
      void fetch(
        `${resolveProductsApi(preview)}?handle=${encodeURIComponent(safeHandle)}&limit=${config.limit}`,
        { cache: 'no-store' }
      )
        .then((res) => (res.ok ? res.json() : null))
        .then(
          (
            data: {
              products?: CollectionProductCard[]
              config?: RelatedProductsConfig
            } | null
          ) => {
            if (cancelled || !data) return
            if (Array.isArray(data.products)) setProducts(data.products)
            if (!configOverride && data.config) {
              setConfig(normalizeRelatedProductsConfig(data.config))
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
    configOverride,
    isPreviewMode,
    preview,
    safeHandle,
  ])

  if (!config.enabled && !isPreviewMode) return null

  return (
    <RelatedProductsView
      config={config}
      products={products}
      loading={loading}
      preview={preview}
      previewViewport={previewViewport}
      contentWidth={contentWidth}
      onPreviewNavigate={onPreviewNavigate}
    />
  )
}
