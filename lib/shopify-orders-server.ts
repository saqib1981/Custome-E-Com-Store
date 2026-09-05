import { shopifyAdminGraphql } from '@/lib/shopify-admin'
import { isShopifyConfigured } from '@/lib/shopify-config'
import { formatMoney } from '@/lib/format-money'
import {
  normalizeOrderName,
  type PublicOrder,
  type PublicOrderLine,
} from '@/lib/orders'

type MoneyNode = { amount?: string | null; currencyCode?: string | null } | null

type OrderNode = {
  id?: string | null
  name?: string | null
  createdAt?: string | null
  displayFinancialStatus?: string | null
  displayFulfillmentStatus?: string | null
  paymentGatewayNames?: string[] | null
  email?: string | null
  phone?: string | null
  note?: string | null
  currentSubtotalPriceSet?: { shopMoney?: MoneyNode } | null
  currentShippingPriceSet?: { shopMoney?: MoneyNode } | null
  currentTotalPriceSet?: { shopMoney?: MoneyNode } | null
  shippingAddress?: {
    name?: string | null
    address1?: string | null
    address2?: string | null
    city?: string | null
    zip?: string | null
    country?: string | null
    phone?: string | null
  } | null
  lineItems?: {
    nodes?: Array<{
      title?: string | null
      variantTitle?: string | null
      quantity?: number | null
      originalUnitPriceSet?: { shopMoney?: MoneyNode } | null
      image?: { url?: string | null; altText?: string | null } | null
    } | null> | null
  } | null
}

const ORDER_FIELDS = `
  id
  name
  createdAt
  displayFinancialStatus
  displayFulfillmentStatus
  paymentGatewayNames
  email
  phone
  note
  currentSubtotalPriceSet { shopMoney { amount currencyCode } }
  currentShippingPriceSet { shopMoney { amount currencyCode } }
  currentTotalPriceSet { shopMoney { amount currencyCode } }
  shippingAddress {
    name
    address1
    address2
    city
    zip
    country
    phone
  }
  lineItems(first: 50) {
    nodes {
      title
      variantTitle
      quantity
      originalUnitPriceSet { shopMoney { amount currencyCode } }
      image { url altText }
    }
  }
`

function digitsOnly(value: string): string {
  return String(value ?? '').replace(/\D/g, '')
}

function moneyLabel(node: MoneyNode | undefined): string {
  if (!node?.amount) return ''
  return formatMoney(String(node.amount), String(node.currencyCode || 'PKR'))
}

function mapLine(node: NonNullable<NonNullable<OrderNode['lineItems']>['nodes']>[number]): PublicOrderLine | null {
  if (!node) return null
  const money = node.originalUnitPriceSet?.shopMoney
  return {
    title: String(node.title ?? 'Item').trim() || 'Item',
    variantTitle: String(node.variantTitle ?? '').trim(),
    quantity: Math.max(1, Number(node.quantity) || 1),
    price: moneyLabel(money),
    imageUrl: String(node.image?.url ?? '').trim(),
    imageAlt: String(node.image?.altText ?? node.title ?? 'Product').trim(),
  }
}

export function mapShopifyOrder(node: OrderNode | null | undefined): PublicOrder | null {
  if (!node?.id || !node.name) return null
  const currency =
    node.currentTotalPriceSet?.shopMoney?.currencyCode ||
    node.currentSubtotalPriceSet?.shopMoney?.currencyCode ||
    'PKR'
  const lines = (node.lineItems?.nodes ?? [])
    .map(mapLine)
    .filter((l): l is PublicOrderLine => Boolean(l))

  const ship = node.shippingAddress
  return {
    id: node.id,
    name: node.name,
    createdAt: String(node.createdAt ?? ''),
    financialStatus: String(node.displayFinancialStatus ?? 'PENDING').replace(/_/g, ' '),
    fulfillmentStatus: String(node.displayFulfillmentStatus ?? 'UNFULFILLED').replace(/_/g, ' '),
    paymentGatewayNames: Array.isArray(node.paymentGatewayNames)
      ? node.paymentGatewayNames.filter(Boolean).map(String)
      : [],
    email: String(node.email ?? '').trim(),
    phone: String(node.phone ?? ship?.phone ?? '').trim(),
    note: String(node.note ?? '').trim(),
    subtotal: moneyLabel(node.currentSubtotalPriceSet?.shopMoney) || formatMoney('0', currency),
    totalShipping: moneyLabel(node.currentShippingPriceSet?.shopMoney) || formatMoney('0', currency),
    total: moneyLabel(node.currentTotalPriceSet?.shopMoney) || formatMoney('0', currency),
    currencyCode: currency,
    shippingAddress: ship
      ? {
          name: String(ship.name ?? '').trim(),
          address1: String(ship.address1 ?? '').trim(),
          address2: String(ship.address2 ?? '').trim(),
          city: String(ship.city ?? '').trim(),
          zip: String(ship.zip ?? '').trim(),
          country: String(ship.country ?? '').trim(),
          phone: String(ship.phone ?? '').trim(),
        }
      : null,
    lines,
  }
}

/** Guest access: email or phone must match the order. */
export function orderContactMatches(
  order: PublicOrder,
  email: string,
  phone: string
): boolean {
  const e = email.trim().toLowerCase()
  const p = digitsOnly(phone)
  if (e && order.email && order.email.toLowerCase() === e) return true
  if (p.length >= 7) {
    const orderDigits = digitsOnly(order.phone)
    const shipDigits = digitsOnly(order.shippingAddress?.phone ?? '')
    if (orderDigits && (orderDigits.endsWith(p) || p.endsWith(orderDigits))) return true
    if (shipDigits && (shipDigits.endsWith(p) || p.endsWith(shipDigits))) return true
    // Match last 10 digits (common PK mobile)
    const tail = (d: string) => d.slice(-10)
    if (orderDigits && tail(orderDigits) === tail(p)) return true
    if (shipDigits && tail(shipDigits) === tail(p)) return true
  }
  return false
}

type OrdersQueryResponse = {
  orders?: { nodes?: Array<OrderNode | null> | null } | null
}

export async function fetchShopifyOrderByName(orderName: string): Promise<PublicOrder | null> {
  if (!isShopifyConfigured()) return null
  const name = normalizeOrderName(orderName)
  if (!name) return null

  const data = await shopifyAdminGraphql<OrdersQueryResponse>(
    `
    query OrderByName($query: String!) {
      orders(first: 1, query: $query, sortKey: CREATED_AT, reverse: true) {
        nodes {
          ${ORDER_FIELDS}
        }
      }
    }
  `,
    { query: `name:${name}` }
  )

  return mapShopifyOrder(data.orders?.nodes?.[0] ?? null)
}

export async function fetchShopifyOrdersByEmail(email: string): Promise<PublicOrder[]> {
  if (!isShopifyConfigured()) return []
  const e = email.trim().toLowerCase()
  if (!e || !e.includes('@')) return []

  const data = await shopifyAdminGraphql<OrdersQueryResponse>(
    `
    query OrdersByEmail($query: String!) {
      orders(first: 25, query: $query, sortKey: CREATED_AT, reverse: true) {
        nodes {
          ${ORDER_FIELDS}
        }
      }
    }
  `,
    { query: `email:${e}` }
  )

  return (data.orders?.nodes ?? [])
    .map(mapShopifyOrder)
    .filter((o): o is PublicOrder => Boolean(o))
}

export async function fetchShopifyOrdersByPhone(phone: string): Promise<PublicOrder[]> {
  if (!isShopifyConfigured()) return []
  const p = digitsOnly(phone)
  if (p.length < 7) return []

  // Shopify search is imperfect for phones — query a few variants then filter.
  const variants = Array.from(
    new Set([p, p.slice(-10), p.startsWith('92') ? p.slice(2) : `92${p.slice(-10)}`])
  )

  const found = new Map<string, PublicOrder>()
  for (const variant of variants) {
    try {
      const data = await shopifyAdminGraphql<OrdersQueryResponse>(
        `
        query OrdersByPhone($query: String!) {
          orders(first: 25, query: $query, sortKey: CREATED_AT, reverse: true) {
            nodes {
              ${ORDER_FIELDS}
            }
          }
        }
      `,
        { query: `phone:${variant}` }
      )
      for (const node of data.orders?.nodes ?? []) {
        const mapped = mapShopifyOrder(node)
        if (mapped && orderContactMatches(mapped, '', phone)) {
          found.set(mapped.id, mapped)
        }
      }
    } catch {
      // try next variant
    }
  }
  return Array.from(found.values())
}

export async function lookupOrdersByContact(params: {
  email?: string
  phone?: string
}): Promise<PublicOrder[]> {
  const email = String(params.email ?? '').trim()
  const phone = String(params.phone ?? '').trim()
  if (email) {
    const byEmail = await fetchShopifyOrdersByEmail(email)
    if (byEmail.length) return byEmail
  }
  if (phone) {
    return fetchShopifyOrdersByPhone(phone)
  }
  return []
}
