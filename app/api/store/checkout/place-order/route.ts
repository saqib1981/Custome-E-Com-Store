import { NextRequest, NextResponse } from 'next/server'
import { normalizeCartLines, type CartLine } from '@/lib/cart'
import { readCheckoutConfig } from '@/lib/checkout-settings-server'
import {
  EMPTY_CHECKOUT_CUSTOMER,
  type CheckoutCustomerDetails,
} from '@/lib/checkout'
import { createShopifyOrderFromCheckout } from '@/lib/shopify-draft-order-server'
import { validateCheckoutPhone } from '@/lib/phone-dial-codes'

export const dynamic = 'force-dynamic'

function validateCustomer(
  customer: CheckoutCustomerDetails,
  config: Awaited<ReturnType<typeof readCheckoutConfig>>
): string | null {
  if (!customer.firstName.trim()) return 'First name is required'

  const email = customer.email.trim()
  const phone = customer.phone.trim()
  const hasEmail = Boolean(email)
  const hasPhone = Boolean(phone)

  if ((config.requireEmail || config.requirePhone) && !hasEmail && !hasPhone) {
    return 'Enter an email or mobile phone number'
  }
  if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Enter a valid email'
  }
  if (config.requirePhone && !hasPhone) {
    return 'Phone is required'
  }
  if (hasPhone) {
    const phoneError = validateCheckoutPhone(customer.country, phone)
    if (phoneError) return phoneError
  }
  if (config.requireAddress && !customer.address.trim()) return 'Address is required'
  if (config.requireCity && !customer.city.trim()) return 'City is required'
  return null
}

function parseCustomer(body: unknown): CheckoutCustomerDetails {
  const raw = (body ?? {}) as Partial<CheckoutCustomerDetails> & { fullName?: string }
  // Backward compat: old clients may send fullName only
  let firstName = String(raw.firstName ?? '')
  let lastName = String(raw.lastName ?? '')
  if (!firstName.trim() && raw.fullName) {
    const parts = String(raw.fullName)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
    firstName = parts[0] || ''
    lastName = parts.slice(1).join(' ')
  }

  return {
    ...EMPTY_CHECKOUT_CUSTOMER,
    email: String(raw.email ?? ''),
    phone: String(raw.phone ?? ''),
    firstName,
    lastName,
    country: String(raw.country ?? EMPTY_CHECKOUT_CUSTOMER.country) || 'PK',
    address: String(raw.address ?? ''),
    apartment: String(raw.apartment ?? ''),
    city: String(raw.city ?? ''),
    postalCode: String(raw.postalCode ?? ''),
    notes: String(raw.notes ?? ''),
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      lines?: CartLine[]
      customer?: unknown
    }
    const config = await readCheckoutConfig()
    if (!config.enabled) {
      return NextResponse.json({ error: 'Checkout is disabled' }, { status: 403 })
    }

    const lines = normalizeCartLines(body.lines)
    if (!lines.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const customer = parseCustomer(body.customer)
    const validationError = validateCustomer(customer, config)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const result = await createShopifyOrderFromCheckout({ lines, customer })
    if (!result.ok) {
      return NextResponse.json({ error: result.error || 'Failed to place order' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      orderName: result.orderName,
      orderId: result.orderId,
      statusPageUrl: result.statusPageUrl,
    })
  } catch (e) {
    console.error('Place order error:', e)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }
}
