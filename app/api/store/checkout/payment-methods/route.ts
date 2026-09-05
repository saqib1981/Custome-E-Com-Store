import { NextResponse } from 'next/server'
import { DEFAULT_CHECKOUT_PAYMENT_METHODS } from '@/lib/checkout-payment-methods'
import { readCheckoutConfig } from '@/lib/checkout-settings-server'

export const dynamic = 'force-dynamic'

/**
 * Payment methods + instructions come from store checkout settings
 * (Admin → Checkout). Shopify does not expose manual payment notes via API.
 */
export async function GET() {
  try {
    const config = await readCheckoutConfig()
    const methods =
      config.paymentMethods?.length > 0
        ? config.paymentMethods
        : DEFAULT_CHECKOUT_PAYMENT_METHODS
    return NextResponse.json(
      { methods },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (e) {
    console.error('Checkout payment methods GET error:', e)
    return NextResponse.json({
      methods: DEFAULT_CHECKOUT_PAYMENT_METHODS,
    })
  }
}
