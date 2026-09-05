import { shopifyAdminGraphql } from '@/lib/shopify-admin'
import { isShopifyConfigured } from '@/lib/shopify-config'
import {
  getShopifyConnectionStatus,
  isShopifyAccessDeniedError,
} from '@/lib/shopify-connection-server'
import type { CartLine } from '@/lib/cart'
import {
  countryToShopifyCode,
  customerDisplayName,
  type CheckoutCustomerDetails,
} from '@/lib/checkout'

type DraftOrderCreateResponse = {
  draftOrderCreate?: {
    draftOrder?: {
      id?: string | null
      name?: string | null
      invoiceUrl?: string | null
    } | null
    userErrors?: Array<{ field?: string[] | null; message?: string | null }> | null
  } | null
}

type DraftOrderCompleteResponse = {
  draftOrderComplete?: {
    draftOrder?: {
      id?: string | null
      order?: {
        id?: string | null
        name?: string | null
        statusPageUrl?: string | null
      } | null
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

/**
 * Creates a real Shopify Order (Orders page) from custom checkout details.
 * Flow: draftOrderCreate → draftOrderComplete (payment pending / COD-style).
 */
export async function createShopifyOrderFromCheckout(params: {
  lines: CartLine[]
  customer: CheckoutCustomerDetails
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

  const noteParts = [
    params.customer.notes?.trim() ? `Notes: ${params.customer.notes.trim()}` : '',
    params.customer.phone.trim() ? `Phone: ${params.customer.phone.trim()}` : '',
    `Customer: ${customerDisplayName(params.customer)}`,
  ].filter(Boolean)

  const countryCode = countryToShopifyCode(params.customer.country)
  const addressPayload = {
    firstName,
    lastName,
    address1: params.customer.address.trim() || null,
    address2: params.customer.apartment.trim() || null,
    city: params.customer.city.trim() || null,
    zip: params.customer.postalCode.trim() || null,
    countryCode,
    phone: params.customer.phone.trim() || null,
  }

  try {
    const created = await shopifyAdminGraphql<DraftOrderCreateResponse>(
      `
      mutation CreateDraftOrder($input: DraftOrderInput!) {
        draftOrderCreate(input: $input) {
          draftOrder {
            id
            name
            invoiceUrl
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
      {
        input: {
          lineItems,
          email: params.customer.email.trim() || null,
          phone: params.customer.phone.trim() || null,
          note: noteParts.join('\n') || null,
          tags: ['custom-checkout'],
          shippingAddress: addressPayload,
          billingAddress: addressPayload,
        },
      }
    )

    const createErrors =
      created.draftOrderCreate?.userErrors?.filter((e) => e?.message) ?? []
    if (createErrors.length) {
      return {
        ok: false,
        error: createErrors.map((e) => e.message).join('; ') || 'Could not create order',
      }
    }

    const draftId = created.draftOrderCreate?.draftOrder?.id
    if (!draftId) {
      return { ok: false, error: 'Draft order was not created' }
    }

    // Convert draft → real Order (shows under Shopify Admin → Orders).
    // paymentPending: COD / pay-later style unpaid order.
    const completed = await shopifyAdminGraphql<DraftOrderCompleteResponse>(
      `
      mutation CompleteDraftOrder($id: ID!, $paymentPending: Boolean) {
        draftOrderComplete(id: $id, paymentPending: $paymentPending) {
          draftOrder {
            id
            order {
              id
              name
              statusPageUrl
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
      {
        id: draftId,
        paymentPending: true,
      }
    )

    const completeErrors =
      completed.draftOrderComplete?.userErrors?.filter((e) => e?.message) ?? []
    if (completeErrors.length) {
      return {
        ok: false,
        error:
          completeErrors.map((e) => e.message).join('; ') ||
          'Order created as draft but could not be completed',
      }
    }

    const order = completed.draftOrderComplete?.draftOrder?.order
    if (!order?.id) {
      return {
        ok: false,
        error: 'Order was not completed in Shopify Orders',
      }
    }

    return {
      ok: true,
      orderId: order.id,
      orderName: order.name ?? created.draftOrderCreate?.draftOrder?.name ?? undefined,
      statusPageUrl: order.statusPageUrl ?? undefined,
    }
  } catch (e) {
    if (isShopifyAccessDeniedError(e)) {
      const status = await getShopifyConnectionStatus()
      return {
        ok: false,
        error:
          status.message ||
          'Missing Shopify scope write_draft_orders. Enable it on your app, then reinstall.',
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
