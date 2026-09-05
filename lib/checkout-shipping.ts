import { cartSubtotalAmount, type CartConfig, type CartLine } from '@/lib/cart'

/** Standard shipping charge shown at checkout (PKR). */
export const STANDARD_SHIPPING_AMOUNT = 200
export const STANDARD_SHIPPING_TITLE = 'Standard'
export const FREE_SHIPPING_TITLE = 'Free shipping'
export const CHECKOUT_CURRENCY = 'PKR'

export type CheckoutShippingQuote = {
  amount: number
  title: string
  free: boolean
}

export function quoteCheckoutShipping(
  lines: CartLine[],
  cartConfig: Pick<CartConfig, 'showFreeShippingProgress' | 'freeShippingThreshold'>
): CheckoutShippingQuote {
  const subtotal = cartSubtotalAmount(lines)
  const free =
    cartConfig.showFreeShippingProgress &&
    cartConfig.freeShippingThreshold > 0 &&
    subtotal >= cartConfig.freeShippingThreshold

  if (free) {
    return { amount: 0, title: FREE_SHIPPING_TITLE, free: true }
  }

  return {
    amount: STANDARD_SHIPPING_AMOUNT,
    title: STANDARD_SHIPPING_TITLE,
    free: false,
  }
}
