import type { CollectionProductCard } from '@/lib/collection-products'

export const CART_SETTING_KEY = 'cart'
export const CART_STORAGE_KEY = 'store-cart-lines-v1'

export type CartConfig = {
  enabled: boolean
  drawerEnabled: boolean
  cartPageTitle: string
  emptyCartText: string
  continueShoppingLabel: string
  checkoutLabel: string
  showProductImages: boolean
  showPrices: boolean
  showQuantityControls: boolean
  showFreeShippingProgress: boolean
  /** Cart subtotal must reach this amount for free shipping (same currency units as line priceAmount). */
  freeShippingThreshold: number
  freeShippingUnlockedText: string
}

export const DEFAULT_CART: CartConfig = {
  enabled: true,
  drawerEnabled: true,
  cartPageTitle: 'Your cart',
  emptyCartText: 'Your cart is empty',
  continueShoppingLabel: 'Continue shopping',
  checkoutLabel: 'Checkout',
  showProductImages: true,
  showPrices: true,
  showQuantityControls: true,
  showFreeShippingProgress: true,
  freeShippingThreshold: 3500,
  freeShippingUnlockedText: "Congratulations! You've unlocked Free shipping!",
}

export type CartLineOption = {
  name: string
  value: string
}

export type CartLine = {
  /** Shopify ProductVariant GID */
  variantId: string
  productId: string
  handle: string
  title: string
  variantTitle: string
  selectedOptions: CartLineOption[]
  imageUrl: string
  imageAlt: string
  /** Display price string (e.g. PKR 1,200) */
  price: string
  compareAtPrice: string
  /** Numeric amount for subtotal math when parseable; else 0 */
  priceAmount: number
  quantity: number
  available: boolean
}

export function normalizeCartConfig(
  input: Partial<CartConfig> | null | undefined
): CartConfig {
  return {
    enabled: Boolean(input?.enabled ?? DEFAULT_CART.enabled),
    drawerEnabled: Boolean(input?.drawerEnabled ?? DEFAULT_CART.drawerEnabled),
    cartPageTitle:
      String(input?.cartPageTitle ?? DEFAULT_CART.cartPageTitle).trim() ||
      DEFAULT_CART.cartPageTitle,
    emptyCartText:
      String(input?.emptyCartText ?? DEFAULT_CART.emptyCartText).trim() ||
      DEFAULT_CART.emptyCartText,
    continueShoppingLabel:
      String(input?.continueShoppingLabel ?? DEFAULT_CART.continueShoppingLabel).trim() ||
      DEFAULT_CART.continueShoppingLabel,
    checkoutLabel:
      String(input?.checkoutLabel ?? DEFAULT_CART.checkoutLabel).trim() ||
      DEFAULT_CART.checkoutLabel,
    showProductImages: Boolean(
      input?.showProductImages ?? DEFAULT_CART.showProductImages
    ),
    showPrices: Boolean(input?.showPrices ?? DEFAULT_CART.showPrices),
    showQuantityControls: Boolean(
      input?.showQuantityControls ?? DEFAULT_CART.showQuantityControls
    ),
    showFreeShippingProgress: Boolean(
      input?.showFreeShippingProgress ?? DEFAULT_CART.showFreeShippingProgress
    ),
    freeShippingThreshold: (() => {
      const n = Number(input?.freeShippingThreshold)
      if (!Number.isFinite(n) || n < 0) return DEFAULT_CART.freeShippingThreshold
      return Math.round(n * 100) / 100
    })(),
    freeShippingUnlockedText:
      String(
        input?.freeShippingUnlockedText ?? DEFAULT_CART.freeShippingUnlockedText
      ).trim() || DEFAULT_CART.freeShippingUnlockedText,
  }
}

export function cartConfigsEqual(a: CartConfig, b: CartConfig): boolean {
  return (
    a.enabled === b.enabled &&
    a.drawerEnabled === b.drawerEnabled &&
    a.cartPageTitle === b.cartPageTitle &&
    a.emptyCartText === b.emptyCartText &&
    a.continueShoppingLabel === b.continueShoppingLabel &&
    a.checkoutLabel === b.checkoutLabel &&
    a.showProductImages === b.showProductImages &&
    a.showPrices === b.showPrices &&
    a.showQuantityControls === b.showQuantityControls &&
    a.showFreeShippingProgress === b.showFreeShippingProgress &&
    a.freeShippingThreshold === b.freeShippingThreshold &&
    a.freeShippingUnlockedText === b.freeShippingUnlockedText
  )
}

/** Extract numeric id from GID or plain id. */
export function shopifyNumericId(gidOrId: string): string {
  const raw = String(gidOrId ?? '').trim()
  if (!raw) return ''
  const parts = raw.split('/')
  const last = parts[parts.length - 1] || raw
  const match = last.match(/^(\d+)/)
  return match?.[1] ?? ''
}

export function parseDisplayPriceAmount(price: string): number {
  const cleaned = String(price ?? '').replace(/[^0-9.]/g, '')
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}

export function normalizeCartLine(input: Partial<CartLine> | null | undefined): CartLine | null {
  const variantId = String(input?.variantId ?? '').trim()
  if (!variantId) return null
  const quantity = Math.max(1, Math.round(Number(input?.quantity) || 1))
  const price = String(input?.price ?? '').trim()
  return {
    variantId,
    productId: String(input?.productId ?? '').trim(),
    handle: String(input?.handle ?? '').trim(),
    title: String(input?.title ?? '').trim() || 'Product',
    variantTitle: String(input?.variantTitle ?? '').trim(),
    selectedOptions: Array.isArray(input?.selectedOptions)
      ? input!.selectedOptions.map((opt) => ({
          name: String(opt?.name ?? '').trim(),
          value: String(opt?.value ?? '').trim(),
        }))
      : [],
    imageUrl: String(input?.imageUrl ?? '').trim(),
    imageAlt: String(input?.imageAlt ?? '').trim(),
    price,
    compareAtPrice: String(input?.compareAtPrice ?? '').trim(),
    priceAmount:
      typeof input?.priceAmount === 'number' && Number.isFinite(input.priceAmount)
        ? input.priceAmount
        : parseDisplayPriceAmount(price),
    quantity,
    available: input?.available !== false,
  }
}

export function normalizeCartLines(input: unknown): CartLine[] {
  if (!Array.isArray(input)) return []
  const out: CartLine[] = []
  for (const row of input) {
    const line = normalizeCartLine(row as Partial<CartLine>)
    if (line) out.push(line)
  }
  return out
}

export function cartItemCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
}

export function cartSubtotalAmount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.priceAmount * line.quantity, 0)
}

/** Format remaining amount like screenshot: Rs.1,171.00 */
export function formatFreeShippingAmount(amount: number): string {
  const safe = Math.max(0, Number.isFinite(amount) ? amount : 0)
  return `Rs.${safe.toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function getFreeShippingProgress(
  subtotal: number,
  threshold: number
): { percent: number; remaining: number; unlocked: boolean } {
  const goal = Math.max(0, threshold)
  if (goal <= 0) {
    return { percent: 100, remaining: 0, unlocked: true }
  }
  const current = Math.max(0, subtotal)
  const remaining = Math.max(0, goal - current)
  const percent = Math.min(100, Math.round((current / goal) * 1000) / 10)
  return { percent, remaining, unlocked: remaining <= 0 }
}

export function formatCartOptionSummary(line: CartLine): string {
  const opts = line.selectedOptions
    .filter((opt) => opt.name.toLowerCase() !== 'title')
    .map((opt) => opt.value)
    .filter(Boolean)
  if (opts.length) return opts.join(' / ')
  if (line.variantTitle && line.variantTitle.toLowerCase() !== 'default title') {
    return line.variantTitle
  }
  return ''
}

/** Build Shopify cart permalink path segment: id:qty,id:qty */
export function buildShopifyCartPermalinkLines(lines: CartLine[]): string {
  return lines
    .map((line) => {
      const id = shopifyNumericId(line.variantId)
      if (!id) return ''
      return `${id}:${line.quantity}`
    })
    .filter(Boolean)
    .join(',')
}

export function cartLineToPreviewCard(line: CartLine): CollectionProductCard {
  return {
    id: line.variantId,
    title: line.title,
    href: line.handle ? `/products/${encodeURIComponent(line.handle)}` : '/cart',
    imageUrl: line.imageUrl,
    imageAlt: line.imageAlt || line.title,
    price: line.price,
    compareAtPrice: line.compareAtPrice,
    onSale: Boolean(line.compareAtPrice),
    isNew: false,
    createdAt: '',
    hasNewTag: false,
    available: line.available,
    customBadge: '',
  }
}
