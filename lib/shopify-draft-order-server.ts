import { shopifyAdminGraphql } from '@/lib/shopify-admin'
import { isShopifyConfigured } from '@/lib/shopify-config'
import {
  getShopifyConnectionStatus,
  isShopifyAccessDeniedError,
} from '@/lib/shopify-connection-server'
import { type CartLine } from '@/lib/cart'
import {
  countryToShopifyCode,
  customerDisplayName,
  type CheckoutCustomerDetails,
} from '@/lib/checkout'
import {
  CHECKOUT_CURRENCY,
  quoteCheckoutShipping,
  type CheckoutShippingQuote,
} from '@/lib/checkout-shipping'
import { readCartConfig } from '@/lib/cart-settings-server'
import {
  subscribeCustomerEmailMarketing,
  subscribeCustomerSmsMarketing,
} from '@/lib/shopify-customer-marketing-server'
import {
  customerLinkToOrderInput,
  isCustomerEmailTakenError,
  isCustomerPhoneTakenError,
  normalizeShopifyCustomerPhone,
  resolveCheckoutCustomerLink,
  type CheckoutCustomerLink,
} from '@/lib/shopify-customer-resolve-server'

type OrderCreateResponse = {
  orderCreate?: {
    order?: {
      id?: string | null
      name?: string | null
      statusPageUrl?: string | null
      customer?: { id?: string | null } | null
    } | null
    userErrors?: Array<{ field?: string[] | null; message?: string | null }> | null
  } | null
}

export type PlaceOrderResult = {
  ok: boolean
  orderName?: string
  orderId?: string
  statusPageUrl?: string
  error?: string
}

async function runOrderCreate(variables: {
  order: Record<string, unknown>
  options: Record<string, unknown>
}): Promise<OrderCreateResponse> {
  return shopifyAdminGraphql<OrderCreateResponse>(
    `
    mutation CreateOrder($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
      orderCreate(order: $order, options: $options) {
        order {
          id
          name
          statusPageUrl
          customer {
            id
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `,
    variables
  )
}

/**
 * Creates a real Shopify Order directly (no draft) via orderCreate.
 * Payment stays PENDING for manual methods (COD / Bank Deposit).
 * When emailOffers is checked, marks the customer as marketing subscribed.
 */
export async function createShopifyOrderFromCheckout(params: {
  lines: CartLine[]
  customer: CheckoutCustomerDetails
  shipping?: CheckoutShippingQuote
}): Promise<PlaceOrderResult> {
  if (!isShopifyConfigured()) {
    return { ok: false, error: 'Shopify is not configured' }
  }

  const firstName = params.customer.firstName.trim() || 'Customer'
  const lastName = params.customer.lastName.trim() || firstName
  const lineItems = params.lines
    .filter((line) => line.variantId && line.quantity > 0)
    .map((line) => ({
      variantId: line.variantId,
      quantity: line.quantity,
    }))

  if (!lineItems.length) {
    return { ok: false, error: 'Cart is empty' }
  }

  const cartConfig = await readCartConfig()
  const shipping = params.shipping ?? quoteCheckoutShipping(params.lines, cartConfig)
  const gateway =
    params.customer.paymentMethod?.trim() || 'Cash on Delivery (COD)'

  const noteParts = [
    params.customer.notes?.trim() ? `Notes: ${params.customer.notes.trim()}` : '',
    params.customer.phone.trim() ? `Phone: ${params.customer.phone.trim()}` : '',
    `Payment method: ${gateway}`,
    `Shipping: ${shipping.title} (${shipping.amount.toFixed(2)} ${CHECKOUT_CURRENCY})`,
    `Customer: ${customerDisplayName(params.customer)}`,
    params.customer.emailOffers ? 'Marketing opt-in: yes' : '',
  ].filter(Boolean)

  const countryCode = countryToShopifyCode(params.customer.country)
  const phoneRaw = params.customer.phone.trim()
  const phoneE164 = phoneRaw ? normalizeShopifyCustomerPhone(phoneRaw) : ''
  const phoneForShopify = phoneE164 || phoneRaw || null

  const addressPayload = {
    firstName,
    lastName,
    address1: params.customer.address.trim() || null,
    address2: params.customer.apartment.trim() || null,
    city: params.customer.city.trim() || null,
    zip: params.customer.postalCode.trim() || null,
    countryCode,
    phone: phoneForShopify,
  }

  const email = params.customer.email.trim()
  const emailOffers = Boolean(params.customer.emailOffers)

  let customerLink: CheckoutCustomerLink | null = await resolveCheckoutCustomerLink({
    email,
    phone: phoneRaw,
    firstName,
    lastName,
  })

  const options = {
    inventoryBehaviour: 'DECREMENT_OBEYING_POLICY',
    // Order confirmation email (Shopify → Settings → Notifications must be on)
    sendReceipt: Boolean(email),
    sendFulfillmentReceipt: false,
  }

  const buildOrder = (link: CheckoutCustomerLink | null): Record<string, unknown> => ({
    lineItems,
    email: email || null,
    phone: phoneForShopify,
    note: noteParts.join('\n') || null,
    tags: ['custom-checkout', `pay:${gateway.slice(0, 40)}`],
    // Unpaid manual method (COD / Bank Deposit) — do NOT add a PENDING SALE
    // transaction, or Shopify shows “Bank Deposit is still processing…”.
    financialStatus: 'PENDING',
    buyerAcceptsMarketing: emailOffers,
    customAttributes: [
      { key: 'Payment method', value: gateway },
    ],
    shippingAddress: addressPayload,
    billingAddress: addressPayload,
    shippingLines: [
      {
        title: shipping.title,
        priceSet: {
          shopMoney: {
            amount: shipping.amount.toFixed(2),
            currencyCode: CHECKOUT_CURRENCY,
          },
        },
      },
    ],
    ...customerLinkToOrderInput(link),
  })

  try {
    let data = await runOrderCreate({ order: buildOrder(customerLink), options })
    let errors = data.orderCreate?.userErrors?.filter((e) => e?.message) ?? []
    let errorText = errors.map((e) => e.message).join('; ')

    // Phone owned by another customer while creating/updating by email — drop phone from customer upsert.
    if (
      errors.length &&
      customerLink?.mode === 'upsert' &&
      isCustomerPhoneTakenError(errorText)
    ) {
      customerLink = {
        ...customerLink,
        phone: undefined,
      }
      // If upsert has neither email nor phone left, skip customer block (order still has phone/email).
      if (!customerLink.email && !customerLink.phone) {
        customerLink = null
      }
      data = await runOrderCreate({ order: buildOrder(customerLink), options })
      errors = data.orderCreate?.userErrors?.filter((e) => e?.message) ?? []
      errorText = errors.map((e) => e.message).join('; ')
    }

    // Email conflict while phone-only upsert — retry without email (should be rare).
    if (
      errors.length &&
      customerLink?.mode === 'upsert' &&
      isCustomerEmailTakenError(errorText)
    ) {
      customerLink = {
        ...customerLink,
        email: undefined,
      }
      if (!customerLink.email && !customerLink.phone) {
        customerLink = null
      }
      data = await runOrderCreate({ order: buildOrder(customerLink), options })
      errors = data.orderCreate?.userErrors?.filter((e) => e?.message) ?? []
      errorText = errors.map((e) => e.message).join('; ')
    }

    // Last resort: place order without customer upsert/associate (still has shipping phone/email).
    if (
      errors.length &&
      (isCustomerPhoneTakenError(errorText) || isCustomerEmailTakenError(errorText))
    ) {
      data = await runOrderCreate({ order: buildOrder(null), options })
      errors = data.orderCreate?.userErrors?.filter((e) => e?.message) ?? []
      errorText = errors.map((e) => e.message).join('; ')
    }

    if (errors.length) {
      return {
        ok: false,
        error: errorText || 'Could not create order',
      }
    }

    const order = data.orderCreate?.order
    if (!order?.id) {
      return { ok: false, error: 'Order was not created in Shopify' }
    }

    const customerId =
      order.customer?.id?.trim() ||
      (customerLink?.mode === 'associate' ? customerLink.id : '') ||
      ''
    if (emailOffers && customerId) {
      if (email) {
        await subscribeCustomerEmailMarketing(customerId)
      } else if (phoneRaw) {
        await subscribeCustomerSmsMarketing(customerId)
      }
    }

    return {
      ok: true,
      orderId: order.id,
      orderName: order.name ?? undefined,
      statusPageUrl: order.statusPageUrl ?? undefined,
    }
  } catch (e) {
    if (isShopifyAccessDeniedError(e)) {
      const status = await getShopifyConnectionStatus()
      return {
        ok: false,
        error:
          status.message ||
          'Missing Shopify scope write_orders / read_customers. Enable them, then reinstall.',
      }
    }
    console.error('createShopifyOrderFromCheckout error:', e)
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Failed to place order',
    }
  }
}

/** @deprecated Use createShopifyOrderFromCheckout */
export const createShopifyDraftOrder = createShopifyOrderFromCheckout
