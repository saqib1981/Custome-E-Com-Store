'use client'

import { useEffect, useState } from 'react'
import ProductPageView from '@/components/products/ProductPageView'
import RelatedProducts from '@/components/RelatedProducts'
import HomeDividerAfterProduct from '@/components/HomeDividerAfterProduct'
import {
  DEFAULT_PRODUCT_PAGE,
  normalizeProductPageConfig,
  type ProductPageConfig,
  type ProductPageData,
} from '@/lib/product-page'
import { PRODUCT_PAGE_UPDATED_EVENT } from '@/lib/product-page-client'
import type { PreviewViewport } from '@/lib/preview-viewport'
import { PREVIEW_SECTION_RESOLVE_DEBOUNCE_MS } from '@/lib/store-section-client'
import type { RelatedProductsConfig } from '@/lib/related-products'
import type { HomeDividerConfig } from '@/lib/home-divider'

type ProductPageProps = {
  handle: string
  preview?: boolean
  previewViewport?: PreviewViewport
  configOverride?: ProductPageConfig
  relatedProductsOverride?: RelatedProductsConfig
  dividerAfterProductOverride?: HomeDividerConfig
  onPreviewNavigate?: (path: string) => void
}

function resolveProductApi(preview: boolean): string {
  return preview ? '/api/admin/product' : '/api/store/product'
}

function resolveSettingsApi(preview: boolean): string {
  return preview ? '/api/admin/product-page-settings' : '/api/store/product-page-settings'
}

const EMPTY_PRODUCT: ProductPageData = {
  id: '',
  title: '',
  handle: '',
  descriptionHtml: '',
  images: [],
  options: [],
  variants: [],
  tags: [],
  totalInventory: null,
}

export default function ProductPage({
  handle,
  preview = false,
  previewViewport,
  configOverride,
  relatedProductsOverride,
  dividerAfterProductOverride,
  onPreviewNavigate,
}: ProductPageProps) {
  const safeHandle = String(handle ?? '').trim() || 'example'
  const [config, setConfig] = useState<ProductPageConfig>(() =>
    configOverride ?? DEFAULT_PRODUCT_PAGE
  )
  const [product, setProduct] = useState<ProductPageData>(EMPTY_PRODUCT)
  const [loading, setLoading] = useState(true)

  const isPreviewMode = preview || Boolean(configOverride)

  useEffect(() => {
    if (configOverride) setConfig(configOverride)
  }, [configOverride])

  useEffect(() => {
    if (configOverride) return

    let cancelled = false
    void fetch(resolveSettingsApi(preview), { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : DEFAULT_PRODUCT_PAGE))
      .then((data: Partial<ProductPageConfig>) => {
        if (!cancelled) setConfig(normalizeProductPageConfig(data))
      })
      .catch(() => {
        if (!cancelled) setConfig(DEFAULT_PRODUCT_PAGE)
      })

    return () => {
      cancelled = true
    }
  }, [configOverride, preview])

  useEffect(() => {
    if (configOverride) return

    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<ProductPageConfig>).detail
      if (!detail) return
      setConfig(normalizeProductPageConfig(detail))
    }

    window.addEventListener(PRODUCT_PAGE_UPDATED_EVENT, onUpdated)
    return () => window.removeEventListener(PRODUCT_PAGE_UPDATED_EVENT, onUpdated)
  }, [configOverride])

  useEffect(() => {
    if (!config.enabled && !isPreviewMode) {
      setLoading(false)
      return
    }

    let cancelled = false
    const timer = window.setTimeout(() => {
      setLoading(true)
      void fetch(`${resolveProductApi(preview)}?handle=${encodeURIComponent(safeHandle)}`, {
        cache: 'no-store',
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: { product?: ProductPageData; config?: ProductPageConfig } | null) => {
          if (cancelled || !data) return
          if (data.product) setProduct(data.product)
          if (!configOverride && data.config) {
            setConfig(normalizeProductPageConfig(data.config))
          }
        })
        .catch(() => {
          if (!cancelled) {
            setProduct({
              ...EMPTY_PRODUCT,
              handle: safeHandle,
              error: 'Could not load product.',
            })
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, isPreviewMode ? PREVIEW_SECTION_RESOLVE_DEBOUNCE_MS : 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [config.enabled, configOverride, isPreviewMode, preview, safeHandle])

  if (!config.enabled && !isPreviewMode) return null

  const relatedHandle = product.handle || safeHandle

  return (
    <>
      <ProductPageView
        product={product}
        config={config}
        loading={loading}
        preview={preview}
        previewViewport={previewViewport}
        onPreviewNavigate={onPreviewNavigate}
      />
      <HomeDividerAfterProduct configOverride={dividerAfterProductOverride} />
      <RelatedProducts
        handle={relatedHandle}
        preview={preview}
        previewViewport={previewViewport}
        configOverride={relatedProductsOverride}
        contentWidth={config.contentWidth}
        onPreviewNavigate={onPreviewNavigate}
      />
    </>
  )
}
