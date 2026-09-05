import { formatMoney } from '@/lib/format-money'
import type { AccountCustomer, AccountAddress, AccountOrder } from '@/lib/account'
import { isShopifyStorefrontConfigured, shopifyStorefrontGraphql } from '@/lib/shopify-storefront'

type UserError = { message?: string | null; field?: string[] | null } | null

function firstUserError(errors: UserError[] | null | undefined): string | null {
  const msg = errors?.map((e) => String(e?.message ?? '').trim()).find(Boolean)
  return msg || null
}

export type CustomerAuthResult = {
  ok: boolean
  accessToken?: string
  expiresAt?: string
  error?: string
  customer?: AccountCustomer | null
}

function mapAddress(node: {
  id?: string
  name?: string | null
  address1?: string | null
  address2?: string | null
  city?: string | null
  province?: string | null
  country?: string | null
  zip?: string | null
  phone?: string | null
} | null): AccountAddress | null {
  if (!node?.id) return null
  return {
    id: node.id,
    name: String(node.name ?? '').trim(),
    address1: String(node.address1 ?? '').trim(),
    address2: String(node.address2 ?? '').trim(),
    city: String(node.city ?? '').trim(),
    province: String(node.province ?? '').trim(),
    country: String(node.country ?? '').trim(),
    zip: String(node.zip ?? '').trim(),
    phone: String(node.phone ?? '').trim(),
  }
}

function mapOrder(node: {
  id?: string
  name?: string | null
  processedAt?: string | null
  financialStatus?: string | null
  fulfillmentStatus?: string | null
  statusUrl?: string | null
  totalPrice?: { amount?: string | null; currencyCode?: string | null } | null
} | null): AccountOrder | null {
  if (!node?.id) return null
  return {
    id: node.id,
    name: String(node.name ?? '').trim() || node.id,
    processedAt: String(node.processedAt ?? '').trim(),
    financialStatus: String(node.financialStatus ?? '').trim(),
    fulfillmentStatus: String(node.fulfillmentStatus ?? '').trim(),
    totalPrice: formatMoney(
      String(node.totalPrice?.amount ?? ''),
      String(node.totalPrice?.currencyCode ?? 'PKR')
    ),
    statusUrl: String(node.statusUrl ?? '').trim(),
  }
}

function mapCustomer(node: {
  id?: string
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phone?: string | null
  displayName?: string | null
  defaultAddress?: Parameters<typeof mapAddress>[0]
  addresses?: { nodes?: Array<Parameters<typeof mapAddress>[0]> | null } | null
  orders?: { nodes?: Array<Parameters<typeof mapOrder>[0]> | null } | null
} | null): AccountCustomer | null {
  if (!node?.id) return null
  const firstName = String(node.firstName ?? '').trim()
  const lastName = String(node.lastName ?? '').trim()
  const displayName =
    String(node.displayName ?? '').trim() ||
    [firstName, lastName].filter(Boolean).join(' ') ||
    String(node.email ?? '').trim()

  const addresses = (node.addresses?.nodes ?? [])
    .map((a) => mapAddress(a))
    .filter((a): a is AccountAddress => Boolean(a))

  if (!addresses.length) {
    const fallback = mapAddress(node.defaultAddress ?? null)
    if (fallback) addresses.push(fallback)
  }

  const orders = (node.orders?.nodes ?? [])
    .map((o) => mapOrder(o))
    .filter((o): o is AccountOrder => Boolean(o))

  return {
    id: node.id,
    firstName,
    lastName,
    email: String(node.email ?? '').trim(),
    phone: String(node.phone ?? '').trim(),
    displayName,
    addresses,
    orders,
  }
}

const CUSTOMER_FIELDS = `
  id
  firstName
  lastName
  email
  phone
  displayName
  defaultAddress {
    id
    name
    address1
    address2
    city
    province
    country
    zip
    phone
  }
  addresses(first: 10) {
    nodes {
      id
      name
      address1
      address2
      city
      province
      country
      zip
      phone
    }
  }
  orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
    nodes {
      id
      name
      processedAt
      financialStatus
      fulfillmentStatus
      statusUrl
      totalPrice {
        amount
        currencyCode
      }
    }
  }
`

export async function customerLogin(
  email: string,
  password: string
): Promise<CustomerAuthResult> {
  if (!isShopifyStorefrontConfigured()) {
    return {
      ok: false,
      error:
        'Customer login is not configured. Ensure Shopify Client ID/Secret work, enable Storefront (unauthenticated) scopes on the Dev Dashboard app, and turn on Classic customer accounts.',
    }
  }

  const safeEmail = String(email ?? '').trim()
  if (!safeEmail || !password) {
    return { ok: false, error: 'Email and password are required.' }
  }

  try {
    type Res = {
      customerAccessTokenCreate: {
        customerAccessToken: { accessToken: string; expiresAt: string } | null
        customerUserErrors: UserError[]
      }
    }

    const data = await shopifyStorefrontGraphql<Res>(
      `
        mutation CustomerLogin($input: CustomerAccessTokenCreateInput!) {
          customerAccessTokenCreate(input: $input) {
            customerAccessToken {
              accessToken
              expiresAt
            }
            customerUserErrors {
              message
              field
            }
          }
        }
      `,
      { input: { email: safeEmail, password } }
    )

    const payload = data.customerAccessTokenCreate
    const err = firstUserError(payload.customerUserErrors)
    if (err || !payload.customerAccessToken?.accessToken) {
      return { ok: false, error: err || 'Invalid email or password.' }
    }

    const customer = await fetchCustomerByAccessToken(payload.customerAccessToken.accessToken)
    return {
      ok: true,
      accessToken: payload.customerAccessToken.accessToken,
      expiresAt: payload.customerAccessToken.expiresAt,
      customer,
    }
  } catch (e) {
    console.error('customerLogin error:', e)
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Login failed.',
    }
  }
}

export async function customerRegister(input: {
  email: string
  password: string
  firstName?: string
  lastName?: string
  phone?: string
  acceptsMarketing?: boolean
}): Promise<CustomerAuthResult> {
  if (!isShopifyStorefrontConfigured()) {
    return {
      ok: false,
      error:
        'Customer registration is not configured. Ensure Shopify Client ID/Secret work, enable Storefront (unauthenticated) scopes on the Dev Dashboard app, and turn on Classic customer accounts.',
    }
  }

  const email = String(input.email ?? '').trim()
  const password = String(input.password ?? '')
  if (!email || !password) {
    return { ok: false, error: 'Email and password are required.' }
  }
  if (password.length < 5) {
    return { ok: false, error: 'Password must be at least 5 characters.' }
  }

  try {
    type Res = {
      customerCreate: {
        customer: { id: string } | null
        customerUserErrors: UserError[]
      }
    }

    const data = await shopifyStorefrontGraphql<Res>(
      `
        mutation CustomerCreate($input: CustomerCreateInput!) {
          customerCreate(input: $input) {
            customer { id }
            customerUserErrors { message field }
          }
        }
      `,
      {
        input: {
          email,
          password,
          firstName: String(input.firstName ?? '').trim() || undefined,
          lastName: String(input.lastName ?? '').trim() || undefined,
          phone: String(input.phone ?? '').trim() || undefined,
          acceptsMarketing: Boolean(input.acceptsMarketing),
        },
      }
    )

    const err = firstUserError(data.customerCreate.customerUserErrors)
    if (err || !data.customerCreate.customer?.id) {
      return { ok: false, error: err || 'Could not create account.' }
    }

    return customerLogin(email, password)
  } catch (e) {
    console.error('customerRegister error:', e)
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Registration failed.',
    }
  }
}

export async function customerRecover(email: string): Promise<{ ok: boolean; error?: string }> {
  if (!isShopifyStorefrontConfigured()) {
    return {
      ok: false,
      error:
        'Password recovery is not configured. Ensure Shopify Client ID/Secret work, enable Storefront (unauthenticated) scopes on the Dev Dashboard app, and turn on Classic customer accounts.',
    }
  }

  const safeEmail = String(email ?? '').trim()
  if (!safeEmail) return { ok: false, error: 'Email is required.' }

  try {
    type Res = {
      customerRecover: {
        customerUserErrors: UserError[]
      }
    }

    const data = await shopifyStorefrontGraphql<Res>(
      `
        mutation CustomerRecover($email: String!) {
          customerRecover(email: $email) {
            customerUserErrors { message field }
          }
        }
      `,
      { email: safeEmail }
    )

    const err = firstUserError(data.customerRecover.customerUserErrors)
    // Shopify often returns success with empty errors even when email unknown (privacy).
    if (err) return { ok: false, error: err }
    return { ok: true }
  } catch (e) {
    console.error('customerRecover error:', e)
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'Could not send reset email.',
    }
  }
}

export async function customerLogout(accessToken: string): Promise<void> {
  if (!accessToken || !isShopifyStorefrontConfigured()) return
  try {
    await shopifyStorefrontGraphql(
      `
        mutation CustomerLogout($customerAccessToken: String!) {
          customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
            deletedAccessToken
            userErrors { message }
          }
        }
      `,
      { customerAccessToken: accessToken }
    )
  } catch (e) {
    console.error('customerLogout error:', e)
  }
}

export async function fetchCustomerByAccessToken(
  accessToken: string
): Promise<AccountCustomer | null> {
  if (!accessToken || !isShopifyStorefrontConfigured()) return null

  type Res = {
    customer: Parameters<typeof mapCustomer>[0]
  }

  const data = await shopifyStorefrontGraphql<Res>(
    `
      query CustomerAccount($customerAccessToken: String!) {
        customer(customerAccessToken: $customerAccessToken) {
          ${CUSTOMER_FIELDS}
        }
      }
    `,
    { customerAccessToken: accessToken }
  )

  return mapCustomer(data.customer)
}
