export const PRODUCT_PAGE_SETTING_KEY = 'product-page'

/** Desktop content width for the product detail section. */
export type ProductPageContentWidth = 'full' | 'container' | 'stretch'

export const PRODUCT_PAGE_CONTENT_WIDTH_OPTIONS: Array<{
  value: ProductPageContentWidth
  label: string
}> = [
  { value: 'full', label: 'Full width' },
  { value: 'container', label: 'Container width' },
  { value: 'stretch', label: 'Stretch' },
]

export type ProductPageConfig = {
  enabled: boolean
  /** How wide the PDP content sits on desktop (and tablet when container/stretch). */
  contentWidth: ProductPageContentWidth
  showSaleBadge: boolean
  showDeliveryEstimate: boolean
  deliveryEstimateText: string
  showFreeShippingNote: boolean
  freeShippingText: string
  showSku: boolean
  showAvailability: boolean
  showStockUrgency: boolean
  showQuantity: boolean
  showDescription: boolean
  showAskQuestion: boolean
  addToCartLabel: string
  showBuyNow: boolean
  buyNowLabel: string
}

export const DEFAULT_PRODUCT_PAGE: ProductPageConfig = {
  enabled: true,
  contentWidth: 'full',
  showSaleBadge: true,
  showDeliveryEstimate: true,
  deliveryEstimateText: 'Estimate delivery times: 3-5 Working Days.',
  showFreeShippingNote: true,
  freeShippingText: 'Free shipping on orders above PKR 3500 in Pakistan',
  showSku: true,
  showAvailability: true,
  showStockUrgency: true,
  showQuantity: true,
  showDescription: true,
  showAskQuestion: true,
  addToCartLabel: 'Add to Cart',
  showBuyNow: true,
  buyNowLabel: 'Buy Now',
}

export type ProductPageImage = {
  url: string
  alt: string
}

export type ProductPageOption = {
  name: string
  values: string[]
}

export type ProductPageVariant = {
  id: string
  title: string
  sku: string
  available: boolean
  inventoryQuantity: number | null
  selectedOptions: Array<{ name: string; value: string }>
  price: string
  compareAtPrice: string
  imageUrl: string
}

export type ProductPageData = {
  id: string
  title: string
  handle: string
  descriptionHtml: string
  images: ProductPageImage[]
  options: ProductPageOption[]
  variants: ProductPageVariant[]
  tags: string[]
  totalInventory: number | null
  error?: string
}

export function normalizeProductPageConfig(
  input: Partial<ProductPageConfig> | null | undefined
): ProductPageConfig {
  const rawWidth = String(input?.contentWidth ?? DEFAULT_PRODUCT_PAGE.contentWidth)
    .trim()
    .toLowerCase()
  const contentWidth: ProductPageContentWidth =
    rawWidth === 'container' || rawWidth === 'stretch' || rawWidth === 'full'
      ? rawWidth
      : DEFAULT_PRODUCT_PAGE.contentWidth

  return {
    enabled: Boolean(input?.enabled ?? DEFAULT_PRODUCT_PAGE.enabled),
    contentWidth,
    showSaleBadge: Boolean(input?.showSaleBadge ?? DEFAULT_PRODUCT_PAGE.showSaleBadge),
    showDeliveryEstimate: Boolean(
      input?.showDeliveryEstimate ?? DEFAULT_PRODUCT_PAGE.showDeliveryEstimate
    ),
    deliveryEstimateText: String(
      input?.deliveryEstimateText ?? DEFAULT_PRODUCT_PAGE.deliveryEstimateText
    ).trim() || DEFAULT_PRODUCT_PAGE.deliveryEstimateText,
    showFreeShippingNote: Boolean(
      input?.showFreeShippingNote ?? DEFAULT_PRODUCT_PAGE.showFreeShippingNote
    ),
    freeShippingText:
      String(input?.freeShippingText ?? DEFAULT_PRODUCT_PAGE.freeShippingText).trim() ||
      DEFAULT_PRODUCT_PAGE.freeShippingText,
    showSku: Boolean(input?.showSku ?? DEFAULT_PRODUCT_PAGE.showSku),
    showAvailability: Boolean(input?.showAvailability ?? DEFAULT_PRODUCT_PAGE.showAvailability),
    showStockUrgency: Boolean(input?.showStockUrgency ?? DEFAULT_PRODUCT_PAGE.showStockUrgency),
    showQuantity: Boolean(input?.showQuantity ?? DEFAULT_PRODUCT_PAGE.showQuantity),
    showDescription: Boolean(input?.showDescription ?? DEFAULT_PRODUCT_PAGE.showDescription),
    showAskQuestion: Boolean(input?.showAskQuestion ?? DEFAULT_PRODUCT_PAGE.showAskQuestion),
    addToCartLabel:
      String(input?.addToCartLabel ?? DEFAULT_PRODUCT_PAGE.addToCartLabel).trim() ||
      DEFAULT_PRODUCT_PAGE.addToCartLabel,
    showBuyNow: Boolean(input?.showBuyNow ?? DEFAULT_PRODUCT_PAGE.showBuyNow),
    buyNowLabel:
      String(input?.buyNowLabel ?? DEFAULT_PRODUCT_PAGE.buyNowLabel).trim() ||
      DEFAULT_PRODUCT_PAGE.buyNowLabel,
  }
}

export function productPageConfigsEqual(a: ProductPageConfig, b: ProductPageConfig): boolean {
  return (
    a.enabled === b.enabled &&
    a.contentWidth === b.contentWidth &&
    a.showDeliveryEstimate === b.showDeliveryEstimate &&
    a.deliveryEstimateText === b.deliveryEstimateText &&
    a.showFreeShippingNote === b.showFreeShippingNote &&
    a.freeShippingText === b.freeShippingText &&
    a.showSku === b.showSku &&
    a.showAvailability === b.showAvailability &&
    a.showStockUrgency === b.showStockUrgency &&
    a.showQuantity === b.showQuantity &&
    a.showDescription === b.showDescription &&
    a.showAskQuestion === b.showAskQuestion &&
    a.addToCartLabel === b.addToCartLabel &&
    a.showBuyNow === b.showBuyNow &&
    a.buyNowLabel === b.buyNowLabel
  )
}

export function parseProductHandleFromPath(path: string): string | null {
  const normalized = (path.split('?')[0] || '/').replace(/\/+$/, '') || '/'
  const match = normalized.match(/^\/products\/([^/]+)$/i)
  if (!match) return null
  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}

/** Theme editor placeholder handle — resolve first Shopify product. */
export function isProductPagePreviewPlaceholder(handle: string): boolean {
  const safe = String(handle ?? '').trim().toLowerCase()
  return !safe || safe === 'example'
}
