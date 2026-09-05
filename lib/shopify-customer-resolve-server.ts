import { shopifyAdminGraphql } from '@/lib/shopify-admin'
import { isShopifyConfigured } from '@/lib/shopify-config'

type CustomerNode = { id?: string | null; email?: string | null; phone?: string | null }

type ByIdentifierResponse = {
  customer?: CustomerNode | null
}

type CustomersSearchResponse = {
  customers?: { nodes?: Array<CustomerNode | null> | null } | null
}

function digitsOnly(value: string): string {
  return String(value || '').replace(/\D/g, '')
}

/** Normalize to E.164-ish for Shopify customer phone lookups. */
export function normalizeShopifyCustomerPhone(phone: string): string {
  const raw = String(phone || '').trim()
  if (!raw) return ''
  if (raw.startsWith('+')) {
    const digits = digitsOnly(raw)
    return digits ? `+${digits}` : ''
  }
  const digits = digitsOnly(raw)
  if (!digits) return ''
  // Common PK local mobiles: 03xxxxxxxxx → +923xxxxxxxxx
  if (digits.startsWith('03') && digits.length === 11) return `+92${digits.slice(1)}`
  if (digits.startsWith('92') && digits.length >= 12) return `+${digits}`
  if (digits.length === 10) return `+92${digits}`
  return `+${digits}`
}

async function customerByIdentifier(
  identifier: { email?: string } | { phoneNumber?: string }
): Promise<CustomerNode | null> {
  try {
    const data = await shopifyAdminGraphql<ByIdentifierResponse>(
      `
      query CustomerByIdentifier($identifier: CustomerIdentifierInput!) {
        customer: customerByIdentifier(identifier: $identifier) {
          id
          email
          phone
        }
      }
    `,
      { identifier }
    )
    return data.customer?.id ? data.customer : null
  } catch {
    return null
  }
}

async function customerBySearch(query: string): Promise<CustomerNode | null> {
  try {
    const data = await shopifyAdminGraphql<CustomersSearchResponse>(
      `
      query CustomersSearch($query: String!) {
        customers(first: 5, query: $query) {
          nodes {
            id
            email
            phone
          }
        }
      }
    `,
      { query }
    )
    const nodes = (data.customers?.nodes ?? []).filter((n): n is CustomerNode => Boolean(n?.id))
    return nodes[0] ?? null
  } catch {
    return null
  }
}

export async function findShopifyCustomerByEmail(email: string): Promise<CustomerNode | null> {
  if (!isShopifyConfigured()) return null
  const e = email.trim().toLowerCase()
  if (!e) return null

  const byId = await customerByIdentifier({ email: e })
  if (byId) return byId

  return customerBySearch(`email:${e}`)
}

export async function findShopifyCustomerByPhone(phone: string): Promise<CustomerNode | null> {
  if (!isShopifyConfigured()) return null
  const e164 = normalizeShopifyCustomerPhone(phone)
  const digits = digitsOnly(phone)
  if (!e164 && digits.length < 7) return null

  if (e164) {
    const byId = await customerByIdentifier({ phoneNumber: e164 })
    if (byId) return byId
  }

  const variants = Array.from(
    new Set(
      [e164, digits, digits.slice(-10), digits.startsWith('92') ? `+${digits}` : `+92${digits.slice(-10)}`]
        .map((v) => String(v || '').trim())
        .filter(Boolean)
    )
  )

  for (const variant of variants) {
    const found = await customerBySearch(`phone:${variant}`)
    if (found) return found
  }
  return null
}

export type CheckoutCustomerLink =
  | { mode: 'associate'; id: string }
  | {
      mode: 'upsert'
      email?: string
      phone?: string
      firstName: string
      lastName: string
    }

/**
 * Resolve how to attach a customer on orderCreate without
 * "phone/email has already been taken" conflicts.
 */
export async function resolveCheckoutCustomerLink(params: {
  email: string
  phone: string
  firstName: string
  lastName: string
}): Promise<CheckoutCustomerLink | null> {
  const email = params.email.trim()
  const phone = params.phone.trim()
  if (!email && !phone) return null

  const e164 = phone ? normalizeShopifyCustomerPhone(phone) : ''
  const byEmail = email ? await findShopifyCustomerByEmail(email) : null
  const byPhone = phone ? await findShopifyCustomerByPhone(phone) : null

  // Prefer existing email match; avoid assigning a phone owned by someone else.
  if (byEmail?.id) {
    return { mode: 'associate', id: byEmail.id }
  }
  if (byPhone?.id) {
    return { mode: 'associate', id: byPhone.id }
  }

  return {
    mode: 'upsert',
    ...(email ? { email } : {}),
    ...(e164 || phone ? { phone: e164 || phone } : {}),
    firstName: params.firstName,
    lastName: params.lastName,
  }
}

export function customerLinkToOrderInput(link: CheckoutCustomerLink | null): Record<string, unknown> {
  if (!link) return {}
  if (link.mode === 'associate') {
    return { customer: { toAssociate: { id: link.id } } }
  }
  return {
    customer: {
      toUpsert: {
        ...(link.email ? { email: link.email } : {}),
        ...(link.phone ? { phone: link.phone } : {}),
        firstName: link.firstName,
        lastName: link.lastName,
      },
    },
  }
}

export function isCustomerPhoneTakenError(message: string): boolean {
  return /phone.*(already been taken|taken)/i.test(message)
}

export function isCustomerEmailTakenError(message: string): boolean {
  return /email.*(already been taken|taken)/i.test(message)
}
