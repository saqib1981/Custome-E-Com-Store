import { shopifyAdminGraphql } from '@/lib/shopify-admin'
import { isShopifyConfigured } from '@/lib/shopify-config'
import {
  DEFAULT_CHECKOUT_PAYMENT_METHODS,
  type CheckoutPaymentMethod,
} from '@/lib/checkout-payment-methods'

export type { CheckoutPaymentMethod }
export { DEFAULT_CHECKOUT_PAYMENT_METHODS }

/** Gateway labels that are not real checkout options (Shopify internal / generic). */
const JUNK_GATEWAY_NAMES = new Set([
  'manual',
  'other',
  'gift_card',
  'gift card',
  'shopify_payments',
  'shopify payments',
  'bogus',
  'cash',
  'pending',
  'test',
])

function slugId(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'payment'
  )
}

function descriptionForMethod(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('cash on delivery') || n.includes('(cod)') || n === 'cod') {
    return 'Pay with cash when your order is delivered.'
  }
  if (n.includes('bank') || n.includes('deposit') || n.includes('transfer')) {
    return 'Pay via bank deposit / transfer. We will share account details after you place the order.'
  }
  if (n.includes('money order')) {
    return 'Pay by money order.'
  }
  return 'Complete payment using this method after placing your order.'
}

function isUsablePaymentMethodName(name: string): boolean {
  const trimmed = name.trim()
  if (!trimmed || trimmed.length < 2) return false
  if (JUNK_GATEWAY_NAMES.has(trimmed.toLowerCase())) return false
  // Reject pure internal codes like "manual_payment"
  if (/^manual([_\s-]?payment)?$/i.test(trimmed)) return false
  return true
}

function toMethod(
  name: string,
  opts?: { id?: string | null; description?: string | null; manual?: boolean }
): CheckoutPaymentMethod | null {
  const trimmed = name.trim()
  if (!isUsablePaymentMethodName(trimmed)) return null
  return {
    id: opts?.id?.trim() || slugId(trimmed),
    name: trimmed,
    description: opts?.description?.trim() || descriptionForMethod(trimmed),
    manual:
      opts?.manual ??
      /cash on delivery|cod|bank|deposit|money order|manual/i.test(trimmed),
  }
}

function dedupeMethods(methods: CheckoutPaymentMethod[]): CheckoutPaymentMethod[] {
  const seen = new Set<string>()
  const out: CheckoutPaymentMethod[] = []
  for (const m of methods) {
    const key = m.name.trim().toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(m)
  }
  return out
}

type ManualPaymentMethodsResponse = {
  manualPaymentMethods?:
    | Array<{
        id?: string | null
        name?: string | null
        paymentInstructions?: string | null
      } | null>
    | {
        nodes?: Array<{
          id?: string | null
          name?: string | null
          paymentInstructions?: string | null
        } | null> | null
      }
    | null
}

async function fetchManualPaymentMethodsQuery(): Promise<CheckoutPaymentMethod[]> {
  // Shape A: connection with nodes (may not exist on all API versions)
  try {
    const data = await shopifyAdminGraphql<ManualPaymentMethodsResponse>(`
      query ManualPaymentMethodsConnection {
        manualPaymentMethods(first: 25) {
          nodes {
            id
            name
            paymentInstructions
          }
        }
      }
    `)
    const nodes =
      data.manualPaymentMethods &&
      typeof data.manualPaymentMethods === 'object' &&
      'nodes' in data.manualPaymentMethods
        ? data.manualPaymentMethods.nodes ?? []
        : []
    return (nodes || [])
      .map((n) =>
        n?.name
          ? toMethod(n.name, {
              id: n.id,
              description: n.paymentInstructions,
              manual: true,
            })
          : null
      )
      .filter((m): m is CheckoutPaymentMethod => Boolean(m))
  } catch {
    // try list shape
  }

  try {
    const data = await shopifyAdminGraphql<ManualPaymentMethodsResponse>(`
      query ManualPaymentMethodsList {
        manualPaymentMethods {
          id
          name
          paymentInstructions
        }
      }
    `)
    const list = Array.isArray(data.manualPaymentMethods) ? data.manualPaymentMethods : []
    return list
      .map((n) =>
        n?.name
          ? toMethod(n.name, {
              id: n.id,
              description: n.paymentInstructions,
              manual: true,
            })
          : null
      )
      .filter((m): m is CheckoutPaymentMethod => Boolean(m))
  } catch {
    return []
  }
}

type OrdersGatewaysResponse = {
  orders?: {
    nodes?: Array<{
      paymentGatewayNames?: string[] | null
    } | null> | null
  } | null
}

async function fetchPaymentMethodsFromOrders(): Promise<CheckoutPaymentMethod[]> {
  try {
    const data = await shopifyAdminGraphql<OrdersGatewaysResponse>(`
      query RecentOrderPaymentGateways {
        orders(first: 50, sortKey: CREATED_AT, reverse: true) {
          nodes {
            paymentGatewayNames
          }
        }
      }
    `)
    const names = new Set<string>()
    for (const order of data.orders?.nodes ?? []) {
      for (const name of order?.paymentGatewayNames ?? []) {
        const trimmed = String(name || '').trim()
        if (trimmed) names.add(trimmed)
      }
    }
    return Array.from(names)
      .map((name) => toMethod(name))
      .filter((m): m is CheckoutPaymentMethod => Boolean(m))
  } catch {
    return []
  }
}

/**
 * Payment methods for custom checkout.
 * Shopify has no reliable Admin API for configured manual methods, so we:
 * 1) try undocumented / version-specific queries
 * 2) infer usable names from recent orders
 * 3) always fall back to Bank Deposit + COD (matches typical Shopify manual setup)
 */
export async function fetchShopifyCheckoutPaymentMethods(): Promise<CheckoutPaymentMethod[]> {
  if (!isShopifyConfigured()) {
    return DEFAULT_CHECKOUT_PAYMENT_METHODS
  }

  try {
    const manual = await fetchManualPaymentMethodsQuery()
    const usableManual = dedupeMethods(manual)
    if (usableManual.length) return usableManual

    const fromOrders = await fetchPaymentMethodsFromOrders()
    const manuals = fromOrders.filter((m) => m.manual)
    const usable = dedupeMethods(manuals.length ? manuals : fromOrders)
    if (usable.length) return usable

    return DEFAULT_CHECKOUT_PAYMENT_METHODS
  } catch (e) {
    console.error('fetchShopifyCheckoutPaymentMethods error:', e)
    return DEFAULT_CHECKOUT_PAYMENT_METHODS
  }
}
