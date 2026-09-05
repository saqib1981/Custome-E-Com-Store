import { cartSubtotalAmount, type CartLine } from '@/lib/cart'
import type { CheckoutConfig } from '@/lib/checkout'

/** Fallback defaults when checkout settings are missing (also used in DEFAULT_CHECKOUT). */
export const STANDARD_SHIPPING_AMOUNT = 200
export const STANDARD_SHIPPING_TITLE = 'Standard'
export const FREE_SHIPPING_TITLE = 'Free shipping'
export const CHECKOUT_CURRENCY = 'PKR'

export type CheckoutShippingSettings = Pick<
  CheckoutConfig,
  'shippingAmount' | 'shippingTitle' | 'freeShippingEnabled' | 'freeShippingThreshold'
>

export type CheckoutShippingQuote = {
  amount: number
  title: string
  free: boolean
}

export function quoteCheckoutShipping(
  lines: CartLine[],
  shipping: CheckoutShippingSettings
): CheckoutShippingQuote {
  const subtotal = cartSubtotalAmount(lines)
  const amount =
    Number.isFinite(shipping.shippingAmount) && shipping.shippingAmount >= 0
      ? shipping.shippingAmount
      : STANDARD_SHIPPING_AMOUNT
  const title = String(shipping.shippingTitle ?? '').trim() || STANDARD_SHIPPING_TITLE
  const threshold =
    Number.isFinite(shipping.freeShippingThreshold) && shipping.freeShippingThreshold >= 0
      ? shipping.freeShippingThreshold
      : 0

  const free =
    Boolean(shipping.freeShippingEnabled) && threshold > 0 && subtotal >= threshold

  if (free) {
    return { amount: 0, title: FREE_SHIPPING_TITLE, free: true }
  }

  return {
    amount,
    title,
    free: false,
  }
}
