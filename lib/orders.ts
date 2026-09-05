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
  lines: PublicOrderLine[]
}
