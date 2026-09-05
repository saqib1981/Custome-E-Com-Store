export const ORDER_ACCESS_STORAGE_KEY = 'store-order-access-v1'

export type OrderAccessPayload = {
  orderName: string
  email: string
  phone: string
}

/** Normalize "#1001" / "1001" → display "#1001" and query "name:#1001". */
export function normalizeOrderName(input: string): string {
  const raw = String(input ?? '').trim()
  if (!raw) return ''
  const digits = raw.replace(/^#/, '').trim()
  if (!digits) return ''
  return `#${digits}`
}

export function orderNameToPathSegment(orderName: string): string {
  return normalizeOrderName(orderName).replace(/^#/, '')
}

export function writeOrderAccess(payload: OrderAccessPayload): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(
      ORDER_ACCESS_STORAGE_KEY,
      JSON.stringify({
        orderName: normalizeOrderName(payload.orderName),
        email: payload.email.trim(),
        phone: payload.phone.trim(),
      })
    )
  } catch {
    // private mode
  }
}

export function readOrderAccess(): OrderAccessPayload | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(ORDER_ACCESS_STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as Partial<OrderAccessPayload>
    const orderName = normalizeOrderName(String(data.orderName ?? ''))
    if (!orderName) return null
    return {
      orderName,
      email: String(data.email ?? '').trim(),
      phone: String(data.phone ?? '').trim(),
    }
  } catch {
    return null
  }
}

export type PublicOrderLine = {
  title: string
  variantTitle: string
  quantity: number
  price: string
  imageUrl: string
  imageAlt: string
}

export type PublicOrderTracking = {
  company: string
  number: string
  url: string
}

export type PublicOrder = {
  id: string
  name: string
  createdAt: string
  financialStatus: string
  fulfillmentStatus: string
  paymentGatewayNames: string[]
  email: string
  phone: string
  note: string
  subtotal: string
  totalShipping: string
  total: string
  currencyCode: string
  shippingAddress: {
    name: string
    address1: string
    address2: string
    city: string
    zip: string
    country: string
    phone: string
  } | null
  tracking: PublicOrderTracking[]
  lines: PublicOrderLine[]
}

/** Customer-facing payment label (e.g. PENDING → Payment pending). */
export function formatOrderPaymentLabel(status: string): string {
  const key = String(status ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
  const map: Record<string, string> = {
    PENDING: 'Payment pending',
    AUTHORIZED: 'Payment authorized',
    PARTIALLY_PAID: 'Partially paid',
    PARTIALLY_REFUNDED: 'Partially refunded',
    PAID: 'Paid',
    REFUNDED: 'Refunded',
    VOIDED: 'Voided',
    EXPIRED: 'Expired',
  }
  if (map[key]) return map[key]
  const pretty = String(status ?? '')
    .trim()
    .replace(/_/g, ' ')
  if (!pretty) return 'Payment pending'
  if (/^payment\b/i.test(pretty)) return pretty
  return pretty.charAt(0).toUpperCase() + pretty.slice(1).toLowerCase()
}

/** Customer-facing fulfillment label. */
export function formatOrderFulfillmentLabel(status: string): string {
  const key = String(status ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_')
  const map: Record<string, string> = {
    UNFULFILLED: 'Unfulfilled',
    PARTIALLY_FULFILLED: 'Partially fulfilled',
    FULFILLED: 'Fulfilled',
    RESTOCKED: 'Restocked',
    PENDING_FULFILLMENT: 'Pending fulfillment',
    OPEN: 'Open',
    IN_PROGRESS: 'In progress',
    ON_HOLD: 'On hold',
    SCHEDULED: 'Scheduled',
  }
  if (map[key]) return map[key]
  const pretty = String(status ?? '')
    .trim()
    .replace(/_/g, ' ')
  if (!pretty) return 'Unfulfilled'
  return pretty.charAt(0).toUpperCase() + pretty.slice(1).toLowerCase()
}
