'use client'

import StoreProductCard from '@/components/products/StoreProductCard'
import { STORE_SECTION_EDGE_CLASS } from '@/lib/breakpoints'
import type { CollectionProductCard } from '@/lib/collection-products'
import type { PreviewViewport } from '@/lib/preview-viewport'
import type { ProductPageContentWidth } from '@/lib/product-page'
import type { RelatedProductsConfig } from '@/lib/related-products'
import { isPreviewMobileLayout } from '@/lib/preview-viewport'

type RelatedProductsViewProps = {
  config: RelatedProductsConfig
  products: CollectionProductCard[]
  loading?: boolean
  preview?: boolean
  previewViewport?: PreviewViewport
  contentWidth?: ProductPageContentWidth
  onPreviewNavigate?: (path: string) => void
}

function widthClass(
  contentWidth: ProductPageContentWidth | undefined,
  preview: boolean,
  previewViewport?: PreviewViewport
): string {
  const mode = contentWidth ?? 'full'
  if (mode === 'full') return 'w-full max-w-full'

  if (preview && previewViewport) {
    if (isPreviewMobileLayout(previewViewport)) return 'w-full max-w-full'
    if (previewViewport === 'tablet') {
      return mode === 'stretch'
        ? 'mx-auto w-full max-w-full'
        : 'mx-auto w-full max-w-container-md'
    }
    return mode === 'stretch'
      ? 'mx-auto w-full max-w-[1400px]'
      : 'mx-auto w-full max-w-container-xl'
  }

  if (mode === 'stretch') return 'mx-auto w-full max-w-[1400px]'
  return 'mx-auto w-full sm:max-w-container-sm md:max-w-container-md lg:max-w-container-lg xl:max-w-container-xl xxl:max-w-container-xxl'
}

function gridClass(
  columns: RelatedProductsConfig['columnsDesktop'],
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

export default function RelatedProductsView({
  config,
  products,
  loading = false,
  preview = false,
  previewViewport,
  contentWidth = 'full',
  onPreviewNavigate,
}: RelatedProductsViewProps) {
  if (!config.enabled) return null

  const innerWidth = widthClass(contentWidth, preview, previewViewport)
  const grid = gridClass(config.columnsDesktop, preview, previewViewport)

  if (loading) {
    return (
      <section
        className={`relative w-full max-w-full overflow-x-clip ${STORE_SECTION_EDGE_CLASS}`}
        aria-label={config.heading}
      >
        <div className={innerWidth}>
          <div className="mb-4 h-6 w-40 animate-pulse rounded bg-gray-200" />
          <div className={`${grid} items-stretch`}>
            {Array.from({ length: Math.min(config.limit, 4) }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-md ring-1 ring-gray-200">
                <div className="aspect-square animate-pulse bg-gray-200" />
                <div className="space-y-2 p-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!products.length) return null

  return (
    <section
      className={`relative w-full max-w-full overflow-x-clip ${STORE_SECTION_EDGE_CLASS}`}
      aria-label={config.heading}
    >
      <div className={innerWidth}>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">{config.heading}</h2>
        <div className={`${grid} items-stretch [&>*]:h-full`}>
          {products.map((product) => (
            <StoreProductCard
              key={product.id}
              product={product}
              preview={preview}
              onPreviewNavigate={onPreviewNavigate}
              showSaleBadge={config.showSaleBadge}
              showNewBadge={config.showNewBadge}
              imageAspect={config.cardImageAspect}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
