'use client'

import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, Minus, Plus } from 'lucide-react'
import {
  type ProductPageConfig,
  type ProductPageData,
  type ProductPageVariant,
} from '@/lib/product-page'
import { parseDisplayPriceAmount } from '@/lib/cart'
import { STORE_SECTION_EDGE_CLASS } from '@/lib/breakpoints'
import type { PreviewViewport } from '@/lib/preview-viewport'
import {
  previewProductPageGridClass,
  storefrontProductPageGridClass,
} from '@/lib/preview-viewport'
import { useCartOptional } from '@/context/CartContext'

type ProductPageViewProps = {
  product: ProductPageData
  config: ProductPageConfig
  loading?: boolean
  preview?: boolean
  previewViewport?: PreviewViewport
  onPreviewNavigate?: (path: string) => void
}

function findVariant(
  variants: ProductPageVariant[],
  selected: Record<string, string>
): ProductPageVariant | null {
  if (!variants.length) return null
  const match = variants.find((variant) =>
    variant.selectedOptions.every((opt) => selected[opt.name] === opt.value)
  )
  return match ?? variants[0] ?? null
}

/** Shopify’s placeholder when a product has no real options (Color/Size/etc.). */
function isDefaultTitleOption(option: { name: string; values: string[] }): boolean {
  return (
    option.name.toLowerCase() === 'title' &&
    option.values.length === 1 &&
    option.values[0]?.toLowerCase() === 'default title'
  )
}

export default function ProductPageView({
  product,
  config,
  loading = false,
  preview = false,
  previewViewport,
  onPreviewNavigate,
}: ProductPageViewProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [askOpen, setAskOpen] = useState(false)
  const [descriptionOpen, setDescriptionOpen] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const [addedNote, setAddedNote] = useState(false)
  const cart = useCartOptional()

  useEffect(() => {
    const initial: Record<string, string> = {}
    for (const option of product.options) {
      if (option.values[0]) initial[option.name] = option.values[0]
    }
    setSelectedOptions(initial)
    setActiveImageIndex(0)
    setQuantity(1)
    setImageFailed(false)
    setAskOpen(false)
    setDescriptionOpen(false)
    setAddedNote(false)
  }, [product.id, product.options])

  const selectedVariant = useMemo(
    () => findVariant(product.variants, selectedOptions),
    [product.variants, selectedOptions]
  )

  const images = useMemo(() => {
    const list = [...product.images]
    if (selectedVariant?.imageUrl && !list.some((img) => img.url === selectedVariant.imageUrl)) {
      list.unshift({ url: selectedVariant.imageUrl, alt: product.title })
    }
    return list
  }, [product.images, product.title, selectedVariant?.imageUrl])

  const activeImage = images[activeImageIndex] ?? images[0] ?? null
  const onSale = Boolean(selectedVariant?.compareAtPrice)
  const inventory =
    selectedVariant?.inventoryQuantity ?? product.totalInventory ?? null
  const inStock = selectedVariant ? selectedVariant.available : false

  const handleBack = () => {
    if (preview && onPreviewNavigate) {
      onPreviewNavigate('/collections/all')
      return
    }
    if (typeof window !== 'undefined') window.history.back()
  }

  const handleAddToCart = () => {
    if (!inStock || !selectedVariant) return

    cart?.addToCart(
      {
        variantId: selectedVariant.id,
        productId: product.id,
        handle: product.handle,
        title: product.title,
        variantTitle: selectedVariant.title,
        selectedOptions: selectedVariant.selectedOptions,
        imageUrl: selectedVariant.imageUrl || product.images[0]?.url || '',
        imageAlt: product.images[0]?.alt || product.title,
        price: selectedVariant.price,
        compareAtPrice: selectedVariant.compareAtPrice,
        priceAmount: parseDisplayPriceAmount(selectedVariant.price),
        available: selectedVariant.available,
        quantity,
      },
      { openDrawer: true }
    )

    setAddedNote(true)
    window.setTimeout(() => setAddedNote(false), 2200)
  }

  const handleBuyNow = () => {
    if (!inStock || !selectedVariant) return

    const line = {
      variantId: selectedVariant.id,
      productId: product.id,
      handle: product.handle,
      title: product.title,
      variantTitle: selectedVariant.title,
      selectedOptions: selectedVariant.selectedOptions,
      imageUrl: selectedVariant.imageUrl || product.images[0]?.url || '',
      imageAlt: product.images[0]?.alt || product.title,
      price: selectedVariant.price,
      compareAtPrice: selectedVariant.compareAtPrice,
      priceAmount: parseDisplayPriceAmount(selectedVariant.price),
      available: selectedVariant.available,
      quantity,
    }

    cart?.addToCart(line, { openDrawer: false })

    if (preview && onPreviewNavigate) {
      onPreviewNavigate('/checkout')
      return
    }
    window.location.href = '/checkout'
  }

  if (loading) {
    return (
      <section className={`relative w-full max-w-full overflow-x-clip ${STORE_SECTION_EDGE_CLASS}`}>
        <div
          className={
            preview
              ? previewProductPageGridClass(previewViewport)
              : storefrontProductPageGridClass()
          }
        >
          <div className="aspect-square min-w-0 animate-pulse rounded-md bg-gray-200" />
          <div className="min-w-0 space-y-3">
            <div className="h-7 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-1/3 animate-pulse rounded bg-gray-200" />
            <div className="h-24 w-full animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </section>
    )
  }

  if (product.error && !product.id) {
    return (
      <section className={`relative w-full max-w-full overflow-x-clip ${STORE_SECTION_EDGE_CLASS}`}>
        <p className="py-10 text-center text-sm text-gray-500">{product.error}</p>
      </section>
    )
  }

  const layoutClass = preview
    ? previewProductPageGridClass(previewViewport)
    : storefrontProductPageGridClass()

  return (
    <section className={`relative w-full max-w-full overflow-x-clip ${STORE_SECTION_EDGE_CLASS}`}>
      <button
        type="button"
        onClick={handleBack}
        className="mb-4 text-sm text-gray-500 transition hover:text-gray-900"
      >
        ← Back to products
      </button>

      <div className={layoutClass}>
        <div className="min-w-0 max-w-full">
          <div className="relative aspect-square w-full max-w-full overflow-hidden rounded-md bg-gray-100">
            {activeImage && !imageFailed ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={activeImage.url}
                src={activeImage.url}
                alt={activeImage.alt || product.title}
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-gray-400">
                {activeImage?.alt || product.title || 'No image'}
              </div>
            )}
            {config.showSaleBadge && onSale ? (
              <span className="absolute left-3 top-3 rounded bg-red-600 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                Sale
              </span>
            ) : null}
          </div>

          {images.length > 1 ? (
            <div className="mt-3 flex max-w-full gap-2 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={`${image.url}-${index}`}
                  type="button"
                  onClick={() => {
                    setActiveImageIndex(index)
                    setImageFailed(false)
                  }}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded border ${
                    index === activeImageIndex
                      ? 'border-gray-900 ring-1 ring-gray-900'
                      : 'border-gray-200'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.alt || product.title}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="min-w-0 max-w-full overflow-x-clip">
          <h1 className="text-xl font-semibold leading-snug text-gray-900 sm:text-2xl">
            {product.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            {selectedVariant?.price ? (
              <p
                className={`text-lg font-semibold ${
                  selectedVariant.compareAtPrice ? 'text-red-600' : 'text-gray-900'
                }`}
              >
                {selectedVariant.price}
              </p>
            ) : null}
            {selectedVariant?.compareAtPrice ? (
              <p className="text-base text-gray-400 line-through">{selectedVariant.compareAtPrice}</p>
            ) : null}
          </div>

          {config.showDeliveryEstimate ? (
            <p className="mt-3 text-sm text-gray-600">
              {config.deliveryEstimateText.includes(':') ? (
                <>
                  {config.deliveryEstimateText.split(':')[0]}:{' '}
                  <strong className="font-semibold text-gray-900">
                    {config.deliveryEstimateText.split(':').slice(1).join(':').trim()}
                  </strong>
                </>
              ) : (
                config.deliveryEstimateText
              )}
            </p>
          ) : null}

          {config.showFreeShippingNote ? (
            <p className="mt-1 text-sm text-gray-600">{config.freeShippingText}</p>
          ) : null}

          {product.options
            .filter((option) => !isDefaultTitleOption(option))
            .map((option) => (
              <div key={option.name} className="mt-3">
                <p className="mb-2 text-sm font-medium text-gray-800">
                  {option.name}
                  {selectedOptions[option.name] ? (
                    <span className="font-normal text-gray-500">
                      {' '}
                      — {selectedOptions[option.name]}
                    </span>
                  ) : null}
                </p>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => {
                    const active = selectedOptions[option.name] === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setSelectedOptions((prev) => ({ ...prev, [option.name]: value }))
                        }
                        className={`rounded-md border px-3 py-1.5 text-sm transition ${
                          active
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-300 bg-white text-gray-800 hover:border-gray-500'
                        }`}
                      >
                        {value}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

          {(config.showSku || config.showAvailability) && selectedVariant ? (
            <ul className="mt-4 space-y-1 text-sm text-gray-600">
              {config.showSku && selectedVariant.sku ? (
                <li>
                  Sku: <span className="text-gray-900">{selectedVariant.sku}</span>
                </li>
              ) : null}
              {config.showAvailability ? (
                <li>
                  Available:{' '}
                  <span className="text-gray-900">{inStock ? 'Instock' : 'Out of stock'}</span>
                </li>
              ) : null}
            </ul>
          ) : null}

          {config.showAskQuestion ? (
            <div className="mt-2.5 border-t border-gray-200 pt-2.5">
              <button
                type="button"
                onClick={() => setAskOpen((open) => !open)}
                className="text-sm font-medium text-gray-900 underline-offset-2 hover:underline"
              >
                Ask a question
              </button>
              {askOpen ? (
                <form
                  className="mt-3 space-y-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    setAskOpen(false)
                  }}
                >
                  <input
                    required
                    placeholder="Your name*"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  <input
                    placeholder="Your phone number"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your email *"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  <textarea
                    required
                    rows={3}
                    placeholder="Your message*"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
                  >
                    Send Your Message
                  </button>
                </form>
              ) : null}
            </div>
          ) : null}

          {config.showStockUrgency && inStock && typeof inventory === 'number' && inventory > 0 ? (
            inventory > 10 ? (
              <p className="mt-2.5 flex items-center gap-2 text-sm text-gray-900">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                In stock, ready to ship
              </p>
            ) : inventory > 3 ? (
              <p className="mt-2.5 flex items-center gap-2 text-sm text-gray-900">
                <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-40" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500" />
                </span>
                Low stock - {inventory} item{inventory === 1 ? '' : 's'} left
              </p>
            ) : (
              <p className="mt-2.5 text-sm font-medium text-red-600">
                Hurry up! Only {inventory} item(s) left in stock
              </p>
            )
          ) : null}

          <div className="mt-2.5 flex min-w-0 max-w-full flex-wrap items-center gap-3">
            {config.showQuantity ? (
              <div className="inline-flex h-11 shrink-0 items-stretch overflow-hidden rounded-md border border-gray-300">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex w-8 items-center justify-center text-gray-700 hover:bg-gray-50"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="flex min-w-[1.75rem] items-center justify-center text-sm font-medium tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex w-8 items-center justify-center text-gray-700 hover:bg-gray-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}

            <button
              type="button"
              disabled={!inStock}
              onClick={handleAddToCart}
              className="h-11 min-w-0 flex-1 rounded-md bg-gray-900 px-5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 sm:min-w-[10rem]"
            >
              {config.addToCartLabel}
            </button>
          </div>
          {config.showBuyNow ? (
            <button
              type="button"
              disabled={!inStock}
              onClick={handleBuyNow}
              className="mt-2.5 h-11 w-full rounded-md border-2 border-gray-900 bg-white px-5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
            >
              {config.buyNowLabel}
            </button>
          ) : null}
          {addedNote ? (
            <p className="mt-2 text-sm text-green-700">Added to cart (preview)</p>
          ) : null}

          {config.showDescription && product.descriptionHtml ? (
            <div className="mt-2.5 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setDescriptionOpen((open) => !open)}
                aria-expanded={descriptionOpen}
                className="flex w-full items-center justify-between gap-3 py-2.5 text-left"
              >
                <span className="text-base font-semibold text-gray-900">Description</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 ${
                    descriptionOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden
                />
              </button>
              {descriptionOpen ? (
                <div
                  className="product-description border-t border-gray-100 pb-1 pt-3 text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
